var commonUtil=require('mp-common-util');
var ESUtil=require('mp-es-util').ESUtil;
var sysMsg = commonUtil.systemMsg; //this follows common checkout's order.js
var responseUtil = commonUtil.responseUtil;
var sysError = commonUtil.systemError;
var Seq = require('seq');
var async = require('async');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('Search.js');
var prodDao = require('../dao/ProdDao.js');

var productIndexAliasSuffix="product_pinmudo";
//alernate between these two
var productIndex1Suffix="prodindex1_pinmudo";
var productIndex2Suffix="prodindex2_pinmudo";
var productIndexType="product";
var defaultPageSize=2000;
var sysConfig = require('../config/SystemConfig.js');

var esUtil=new ESUtil(sysConfig.getElasticSearchOption(),logger);

var productMapping= {
    'product': {
        properties: {
            "tenant": {
                "type": "keyword"
            },
            "productName": {
                "type": "text"
            },
            "productNameRaw": {
                "type": "keyword"
            },
            "nameLang": {
                "type": "text"
            },
            "description": {
                "type": "text"
            },
            "typeRaw": {
                "type": "keyword"
            },
            "type": {
                "type": "text"
            },
            "typeLang": {
                "type": "text"
            },
            "bizName": {
                "type": "text"
            },
            "bizId": {
                "type": "long"
            },
            "typeId": {
                "type": "long"
            },
            "prodId": {
                "type": "long"
            },
            "price": {
                "type": "float"
            },
            "imgUrl": {
                "type": "keyword"
            },
            "prodCode": {
                "type": "keyword"
            },
            "unitOfMeasure": {
                "type": "keyword"
            },
            "commentCount": {
                "type": "integer"
            },
            "avgRating": {
                "type": "float"
            },
            "createdOn":{
                "type": "date"
            },
            "updatedOn":{
                "type": "date"
            }
        }
    }
};


/*function createIndexMapping(index,typeName,mapping,callback){
    //create document type
    sClient.indices.putMapping({
        index:index,
        type : typeName,
        body: mapping
    },function(error,response){
        if (error) {
            callback(error);
        }else{
            callback(null,true);
        }});
}*/

/*function rotateIndex(index1,index2,alias,callback){
    sClient.indices.existsAlias({index:index1,name:alias},function (error,result){
        if (error){
            callback(error);
        }
        if (result) {
            callback(null,{curIndex: index2,oldIndex:index1});
        }else{
            callback(null,{curIndex: index1,oldIndex:index2});
        }
    })
}*/

/*function deleteIndex(index,callback){
    sClient.indices.exists({index:index},function(error, result){
        if (error){
            callback(error);
        }
        if (result){
            sClient.indices.delete({
                index: index
            }, function (error,response) {
                if (error) {
                    callback(error);
                }else{
                    callback(null,true);
                }
            });
        }else{
            callback(null,true);
        }
    })
}*/

/*function createIndex(index, callback){
    //create product index
    sClient.indices.create({
        index: index
    }, function (error,response) {
        if (error) {
            callback(error);
        }else{
            callback(null,true);
        }
    });
}*/

/*
function aliasIndex(index1, index2,alias,callback){
    //rotate alias to this new index
    sClient.indices.deleteAlias(
        { index: index2, name: alias
        }, function (error,result){
            if (error) {
                logger.info("alias not exists [index:"+index2+" alias:"+alias+"]");
            }
            //rotate alias to this new index
            sClient.indices.putAlias(
                { index: index1, name: alias
                }, function (error,result){
                    if (error) {
                        callback(error);
                    }
                    else{
                        callback(null,true);
                    }
                })
        })
}
*/

/*
function indexData(tenant,index,indexType, indexFunction,callback){
    var start= 0,hasNext=true,pageSize=defaultPageSize;
    async.doWhilst(function(cb) {
        indexFunction(index, indexType, tenant, start, pageSize, function (error, hasNextPage) {
            if (error) {
                return callback(error);
            }
            if (hasNextPage) {
                hasNext = true;
                start += pageSize;
                cb();
            } else {
                hasNext = false;
                cb();
            }
        });
    },function(){return hasNext},function(error,result){
        if (error) {
            return callback(error);
        } else {
            return callback(null,true);
        }
    });
}
*/


//todo move it into scheduler job
function buildProdSearchIndex(req, res, next) {
    var params= req.params;
    var tenant = params.tenant;
    if (tenant ==null){
        return next(sysError.MissingParameterError("tenant is required.","tenant is required."));
    }
    doBuildProductIndex2(tenant,function (err){
        if (err){
            responseUtil.resetFailedRes(res, err.message);
            return next();
        }else{
            responseUtil.resetSuccessRes(res);
            return next();
        }
    })
}

function doBuildProductIndex2(tenant,callback){
    var productIndexAlias=tenant+productIndexAliasSuffix;
    var productIndex1=tenant+productIndex1Suffix;
    var productIndex2=tenant+productIndex2Suffix;

    var indexProduct = function(sClient2,index, indexType,start,pageSize,callback){
        prodDao.searchBizProd({tenant:tenant,start:start,size:pageSize}, function (error, rows) {
            if(error){
                return callback(error);
            }else {
                var prodList = rows;
                if (prodList && prodList.length > 0) {
                    Seq(prodList).seqEach(function (prod, i) {
                        var that = this;
                        if (prod.active == 1) {
                            sClient2.create({
                                index: index,
                                type: indexType,
                                id: prod.prodId,
                                body: {
                                    tenant:prod.tenant,
                                    productName: prod.productName,
                                    productNameRaw: prod.productName,
                                    nameLang: prod.nameLang,
                                    type: prod.type,
                                    typeRaw: prod.type,
                                    typeLang: prod.typeLang,
                                    bizId: prod.bizId,
                                    prodId: prod.prodId,
                                    typeId: prod.typeId,
                                    price: prod.price,
                                    imgUrl: prod.imgUrl,
                                    description: prod.description,
                                    bizName: prod.bizName,
                                    prodCode: prod.prodCode,
                                    unitOfMeasure:prod.unitOfMeasure,
                                    commentCount: prod.commentCount,
                                    avgRating: prod.avgRating,
                                    createdOn: prod.createdOn,
                                    updatedOn: prod.updatedOn
                                }
                            }, function (error, data) {
                                //console.log(data);
                                if (error) {
                                    callback(error);
                                } else {
                                    that(null, i);
                                }
                            });
                        } else {
                            that(null, i);
                        }
                    }).seq(function(){
                        return callback(null,true);
                    })
                } else {
                    return callback(null,false);
                }
            }
        });
    }

    return esUtil.doRotateIndex(productIndexType,productMapping,productIndexAlias,productIndex1,productIndex2, indexProduct,defaultPageSize,function(err){
        callback(err);
    })

}

/*function doBuildProductIndex(tenant, callback){
    var productIndexAlias=tenant+productIndexAliasSuffix;
    var productIndex1=tenant+productIndex1Suffix;
    var productIndex2=tenant+productIndex2Suffix;
    var curIndex,oldIndex;

    var prodList  = [];
    Seq().seq(function() {
        var that = this;
        rotateIndex(productIndex1,productIndex2,productIndexAlias,function(error,result){
            if (error) {
                logger.error('rotate index:' + error.message);
                return callback(error);
            }
            curIndex=result.curIndex;
            oldIndex=result.oldIndex;
            that();
        })
    }).seq(function(){
        //Delete this index
        var that = this;
        deleteIndex(curIndex,function(error,result){
            if (error){
                logger.error('delete index:' +curIndex+":"+ error.message);
                return callback(error);
            }else{
                that();
            }
        })

    }).seq(function(){
        var that = this;
        createIndex(curIndex,function(error,result){
            if (error){
                logger.error('create index:' +curIndex+":"+ error.message);
                return callback(error);
            }else{
                that();
            }
        })
    }).seq(function(){
        var that = this;
        createIndexMapping(curIndex,productIndexType,productMapping,function(error,response){
            if (error) {
                logger.error(' createProduct type Mapping ' + error.message);
                return callback(error);
            }else{
                //logger.info(response);
                that();
            }
        })
    }).seq(function(){
        var that = this;
        indexData(tenant,curIndex,productIndexType,indexProduct,function(error,response){
            if (error) {
                logger.error('index product ' + error.message);
                return callback(error);
            }else{
                //logger.info(response);
                that();
            }
        })
    }).seq(function() {
        aliasIndex(curIndex, oldIndex, productIndexAlias, function (error, response) {
                if (error) {
                    logger.error('alias product ' + error.message);
                    return callback(error);
                }else{
                    return callback();
                }
            }
        )
    });
}*/

function searchProdByKeyword(req, res, next) {
    var params= req.params;
    var tenant = params.tenant;
    var from = (params.start==null)?0:params.start;
    var size= (params.size==null)?50:params.size;
    if (tenant ==null){
        return next(sysError.MissingParameterError("tenant is required.","tenant is required."));
    }
    var productIndex=tenant+productIndexAliasSuffix;
    var searchBody={
        query: {
            //FIXME: 此处包括 active=0 的数据，需要过滤掉
            // bool: {
            //     must: {
            //         multi_match : {
            //             query : params.keyword,
            //             fields: [ "productName^100","bizName","type^2","prodCode","description"],
            //             type:   "best_fields",
            //             minimum_should_match: "75%"
            //         }
            //     },
            //     filter: {
            //         term: {
            //             active: 1
            //         }
            //     }
            // }
            multi_match : {
                query : params.keyword,
                fields: [ "productName^100","bizName","type^2","prodCode","description"],
                type:   "best_fields",
                minimum_should_match: "75%"
            }
        },
        from : from,
        size : size
    };
    esUtil.search(productIndex, productIndexType,searchBody
        , function (error,hits) {
            if (error) {
                logger.error(' searchProduct :' + error.message);
                throw sysError.InternalError(error.message, "search product error");
            } else {
                responseUtil.resetQueryRes(res,hits,null);
                next();
            }
        });
}

module.exports = {
    buildProdSearchIndex: buildProdSearchIndex,
    searchProdByKeyword: searchProdByKeyword,
    doBuildProductIndex:doBuildProductIndex2
};