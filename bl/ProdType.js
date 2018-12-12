/**
 * Created by Rina on 9/8/16.
 */

var prodTypeDao = require('../dao/ProdTypeDao.js');
var prodTypeTagDao = require('../dao/ProdTypeTagDao.js');
var prodDao = require('../dao/ProdDao.js');
var commonUtil=require('mp-common-util');
var ReturnType=commonUtil.ReturnType;
var responseUtil = commonUtil.responseUtil;
var sysError = commonUtil.systemError;
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ProdType.js');
var Seq = require('seq');

//prodType
function listBizProdType(req, res , next){
    var params=req.params;
    var tenant=params.tenant;
    if (tenant==null){
        return responseUtil.resTenantNotFoundError(null,res,next);
    }
    prodTypeDao.searchBizProdType(params,function(error , rows){
        if (error) {
            logger.error(' listBizProdType ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        } else {
            logger.info(' listBizProdType ' + ' success ');
            if (rows && rows.length > 0) {
               // res.send(200, rows);
                responseUtil.resetQueryRes(res,rows,null);
                next();
            } else {
              //  res.send(200,null);
                responseUtil.resetQueryRes(res,rows,null);
                next();
            }
        }
    });
}

function getBizProdTypeDetail(req, res , next){
    var options={};
    options.bizId = req.params.bizId;
    options.typeId = req.params.typeId;
    options.tenant=req.params.tenant;
    var productType=null;
    if (options.typeId==null){
        return next(sysError.MissingParameterError("product type id is required.","product type id is required."));
    }
    if (options.tenant==null){
        return next(sysError.MissingParameterError("tenant is required.","tenant is required."));
    }
    prodTypeDao.searchBizProdType(options,function(error , rows){
        if (error) {
            logger.error(' getBizProdTypeDetail ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        } else {
            logger.info(' getBizProdTypeDetail ' + ' success ');
            if (rows && rows.length > 0) {
                productType=rows[0];
                Seq().par(function() {
                    var that=this;
                    //get all images
                    prodTypeDao.searchBizProdTypeImage(options,function(error,rows){
                        if(error){
                            logger.error(' getBizProdTypeImage ' + error.message);
                            return responseUtil.resInternalError(error,res,next);
                        }
                        if(rows && rows.length>0){
                            productType.images=rows;
                        }
                        that();
                    })
                }).par(function(){
                    var that=this;
                    //get all tags
                    prodTypeDao.searchBizProdTypeTag(options,function(error,rows){
                        if (error) {
                            logger.error(' getBizProdTypeTag ' + error.message);
                            return responseUtil.resInternalError(error,res,next);
                        }
                        if(rows && rows.length>0){
                            productType.tags=rows;
                        }
                        that();
                    })
                }).seq(function(){
                    res.send(200,productType);//
                    responseUtil.resetQueryRes(res,productType,null);
                    next();
                });

            } else {
               // res.send(200,null);
                responseUtil.resetQueryRes(res,rows,null);

                next();
            }
        }
    });
}

function getProdCountByProdTypeTag(req,res,next){
    prodTypeDao.searchBizProdCountByProdTypeTag(req.params,function(error , rows){
        if (error) {
            logger.error(' getProdCountByProdTypeTag ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        } else {
            logger.info(' getProdCountByProdTypeTag ' + ' success ');
            if (rows && rows.length > 0) {
              //  res.send(200, rows);
                responseUtil.resetQueryRes(res,rows,null);
                next();
            } else {
              //  res.send(200,null);
                responseUtil.resetQueryRes(res,rows,null);

                next();
            }
        }
    });
}

function _addAProdType(tenant,params,callback){
    var bizId=params.bizId;
    var parentTypeId=params.parentTypeId;
    var name=params.name;
    var nameLang=params.nameLang;
    var active=params.active;
    var externalId=params.externalId;
    var displayOrder=params.displayOrder;
    var createdBy=params.createdBy;
    var description=params.description;


    if (bizId==null){
        bizId=0;
    }

    var prodType = {
        tenant: tenant,
        bizId: bizId,
        parentTypeId: parentTypeId,
        name: name,
        nameLang: nameLang,
        active: active,
        externalId: externalId,
        displayOrder: displayOrder,
        description:description

       // typeCode: typeCode
    };
    prodTypeDao.addBizProdType(prodType,function(error, result) {
        if (error) {
            logger.error(' addAProdType ' + error.message);
            if (error.message !=null && error.message.indexOf("ER_DUP_ENTRY")>-1){
                return callback(new ReturnType(false,"Product type exists already"));
            }else{
                return callback(new ReturnType(false,error.message));
            }
        } else {
            if (result && result.insertId) {
              var  typeId = result.insertId;
                return callback(new ReturnType(true,null,typeId));
            } else {
                logger.error(' addProdType ' + error.message);
                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });
}

function addBizProdType(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var bizId = params.bizId;

    var result=[];
    var prodType = params.prodType;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (prodType == null) {
        return next(sysError.MissingParameterError("prod types are missing", "prod types are missing"));
    }
    Seq(prodType).seqEach(function(prodType,i){
        var that=this;
        _addAProdType(tenant,prodType,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}


function updateBizProdType(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;

    var result=[];
    var prodType = params.prodType;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (prodType == null) {
        return next(sysError.MissingParameterError("prod types are missing", "prod types are missing"));
    }
    Seq(prodType).seqEach(function(prodType,i){
        var that=this;
        _updateAProdType(tenant,prodType,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function _updateAProdType(tenant,prodType,callback){
    prodTypeDao.updateBizProdType(tenant,prodType, function(error , result){
        if(error){
            var msg=error.message;
            logger.error(' updateBizProdType failed:' + msg);
            if (msg!=null && msg.indexOf("ER_DUP_ENTRY:")>-1){
                return callback(new ReturnType(false,"duplicate product type"));
            }else {
                return callback(new ReturnType(false, error.message));
            }
        }
        if(result.affectedRows<=0){
            logger.error(' updateBizProdType: failed');
            return callback(new ReturnType(false,"no product type is updated",prodType.typeId));
        }else{
            logger.info(' updateBizProdType succeed ');
            return callback(new ReturnType(true,null,prodType.typeId));
        }
    });
}

function updateProdTypeOrder(req,res,next){
    var params=req.params;

    prodTypeDao.updateTypeOrderById(req.params,function(error,rows){
        if(error){
            logger.error(' updateProdTypeOrder ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        }
        logger.info(' updateProdTypeOrder ' + 'success');
        res.send(200,rows.affectedRows>0?true:false);//
        next();
    })
}

function delBizProdType(req, res , next){
    var params = req.params;
    var tenant = params.tenant;
    var typeId=params.typeId;
    if (tenant == null) {
        return responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (params.typeId==null || params.typeId==0){
        return next(sysError.MissingParameterError("typeId is missing", "typeId is missing"));
    }

    prodTypeDao.delBizProdType(req.params, function(error , result){
        if(error){
            logger.error(' delBizProdType ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        }
        if(result.affectedRows<=0){
            logger.error(' delBizProdType ' + 'failure');
            return responseUtil.resetFailedRes(res,"no product type is deleted",next);
        }else{
            logger.error(' delBizProdType ' + ' success');
            return responseUtil.resetSuccessRes(res,next);
        }
    });
}

function getProdTypeByTag(req,res,next){
    var params=req.params,tenant = params.tenant,tagId=params.tagId,total=0;
    if (tenant == null) {
        return responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (tagId == null || tagId==0) {
        return next(sysError.MissingParameterError("tagId is required.","tagId is required."));
    }
    prodTypeDao.searchProdTypeByTagCount(params,function(error,rows){
        if (error) {
            logger.error(' searchProdTypeByTagCount ' + error.message);
            return responseUtil.resetFailedRes(res,error.message,next);
        } else {
            if (rows && rows.length > 0){
                total=rows[0].count;
            }
            if (total>0){
                prodTypeDao.searchProdTypeByTag(params, function (error, rows) {
                    if (error) {
                        logger.error(' searchProdTypeByTagCount ' + error.message);
                        return responseUtil.resetFailedRes(res, error.message, next);
                    } else {
                        logger.info(' searchProdTypeByTagCount ' + ' success ');
                        if (rows && rows.length > 0) {
                            //res.send(200, rows);
                            responseUtil.resetQueryResWithTotal(res, rows, total, next);
                        } else {
                            return responseUtil.resetFailedRes(res, [],0, next);
                        }
                    }
                });
            }else{
                return responseUtil.resetQueryResWithTotal(res, [],0, next);
            }
        }
    });
}

function deleteTagOnProdType(req, res, next) {
    var params=req.params,tenant=params.tenant,prodTypes=params.prodTypes,tagId=params.tagId,result=[];
    if (tenant==null){
        return responseUtil.resTenantNotFoundError(null,res,next);
    }

    if (prodTypes==null){
        return next(sysError.MissingParameterError("prodTypes is required.","prodTypes is required."));
    }
    if (tagId==null){
        return next(sysError.MissingParameterError("tagId is required.","tagId is required."));
    }
    Seq(prodTypes).seqEach(function(prodType,i){
        var that=this;
        _deleteAProdTypeTag({tenant:tenant,tagId:tagId,prodTypeId:prodType},function(returnResult){
            result[i]=returnResult;
            that(null,i);
        })
    }).seq(function(){
        return responseUtil.resetQueryRes(res,result,next);
    })
}

function _deleteAProdTypeTag(params,callback){
    prodTypeTagDao.delProdTypeTag(params, function(error , result){
        if(error){
            logger.error(' delProdTypeTag ' + error.message);
            return callback(new ReturnType(false,error.message));
        }
        if(result.affectedRows<=0){
            logger.error(' delProdTypeTag ' + 'failure');
            return callback(new ReturnType(false,"no product type tag is deleted"));
        }
        logger.info(' delProdTypeTag ' + ' success ');
        return callback(new ReturnType(true,null,params.prodTypeId));
    });
}

function postTagOnProdType(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var tagId = params.tagId;

    var result=[];
    var prodTypes = params.prodTypes;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (prodTypes == null) {
        return next(sysError.MissingParameterError("prodTypes are missing", "prodTypes are missing"));
    }
    Seq(prodTypes).seqEach(function(prodType,i){
        var that=this;
        _addAProdTypeTag({tenant:tenant,tagId:tagId,prodTypeId:prodType},function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function _addAProdTypeTag(params,callback){
    var prodTags = {
        tenant :params.tenant,
        prodTypeId:params.prodTypeId,
        active :1,
        bizId :0,
        tagId :params.tagId
    };
    prodTypeTagDao.addProdTypeTag(prodTags, function (error, result) {
        if (error) {
            logger.error(' addAProdTypeTag ' + error.message);
            if (error.message !=null && error.message.indexOf("ER_DUP_ENTRY")>-1){
                return callback(new ReturnType(false,"product type tag exists already"));
            }else{
                return callback(new ReturnType(false,error.message));
            }
        } else {
            if (result && result.insertId) {
                id = result.insertId;
                return callback(new ReturnType(true,null,id));
            } else {
                return callback(new ReturnType(false,"no product type id is added"));
            }
        }
    });
}


//prodType
function getProdTypeAndProducts(req, res , next){
    try {
        var params = req.params;
        var tenant = params.tenant;
        var productTypes = [];
        if (tenant == null) {
            return responseUtil.resTenantNotFoundError(null, res, next);
        }
        //获取大类
        prodTypeDao.searchBizProdType(params, function (error, rows) {
            if (error) {
                logger.error(' getProdTypeAndProducts ' + error.message);
                return responseUtil.resInternalError(error, res, next);
            } else {
                logger.info(' getProdTypeAndProducts ' + ' success ');
                if (rows && rows.length > 0) {
                    Seq(rows).seqEach(function (row, i) {
                        var that = this;
                        if (row.parentTypeId === null) {
                            var type = row;
                            type.product = [];
                            //获取大类的产品
                            prodDao.searchBizProd({
                                biz_id: 0,
                                parent_type_id: row.typeId,
                                tenant: tenant,
                                active: 1,
                                start: 0,
                                size: 8
                            }, function (error, returnResult) {
                                if (error) {
                                    logger.error(' getBizProdByType ' + error.message);
                                    return responseUtil.resetFailedRes(res, error.message, next);
                                } else {
                                    logger.info(' getBizProdByType ' + ' success ');
                                    type.product = returnResult;
                                    productTypes.push(type)
                                    that(null, i);

                                }
                            });
                        }else {
                            that(null, i);
                        }
                    }).seq(function () {
                        responseUtil.resetQueryRes(res, productTypes, null);
                        return next();
                    })

                } else {
                    //  res.send(200,null);
                    responseUtil.resetQueryRes(res, rows, null);
                    next();
                }
            }
        });
    } catch (error) {
        logger.error(' getProdTypeAndProducts ' + error.message);
        return responseUtil.resInternalError(error, res, next);
    }
}


module.exports = {
    listBizProdType: listBizProdType,
    getBizProdTypeDetail: getBizProdTypeDetail,
    getProdCountByProdTypeTag: getProdCountByProdTypeTag,
    addBizProdType: addBizProdType,
    updateBizProdType: updateBizProdType,
    updateProdTypeOrder: updateProdTypeOrder,
    delBizProdType: delBizProdType,
    getProdTypeByTag:getProdTypeByTag,
    deleteTagOnProdType:deleteTagOnProdType,
    postTagOnProdType:postTagOnProdType,
    getProdTypeAndProducts:getProdTypeAndProducts
};