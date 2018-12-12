/**
 * Created by Rina on 7/11/16.
 */
var tagDao = require('../dao/TagDao.js');
var prodDao = require('../dao/ProdDao.js');
var prodTagDao=require('../dao/ProdTagDao.js');
var prodTypeDao = require('../dao/ProdTypeDao.js');
var prodCommentDao = require('../dao/ProdCommentDao.js');
var prodImageDao = require('../dao/ProdImageDao.js');
var commonUtil=require('mp-common-util');
var ReturnType=commonUtil.ReturnType;
var sysMsg = commonUtil.systemMsg; //this follows common checkout's order.js
var responseUtil = commonUtil.responseUtil;
var sysError = commonUtil.systemError;
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('Prod.js');
var Seq = require('seq');
var http = require('http');
var querystring = require('querystring');
var sysConfig = require('../config/SystemConfig.js');
var request=require('request');
//prod

function listBizProd(req, res, next) {
    var params=req.params;
    var biz_id=params.bizId;
    var prod_id=params.prodId;  //
    var prodCode=params.prodCode;
    var type_id=params.typeId;
    var parent_type_id=params.parentTypeId;
    var name=params.name;
    var tenant=params.tenant;
    var active=params.active;
    var start=params.start;
    var size=params.size;
    var queryParams={biz_id:biz_id,type_id:type_id,prod_id:prod_id,prodCode:prodCode,parent_type_id:parent_type_id,
        name:name,tenant:tenant,active:active};
    var total=0;
    var returnData = [];
    Seq().seq(function(){
        var that = this;

        prodDao.searchProdCount(queryParams,function(error,rows){
            if (error) {
                logger.error(' listBizProd ' + error.message);
                return responseUtil.resetFailedRes(res,error.message,next);
            } else {
                if (rows && rows.length > 0){
                    total=rows[0].count;
                }
                if (total>0){
                    queryParams.size=size;
                    queryParams.start=start;
                    prodDao.searchBizProd(queryParams, function (error, rows) {
                        if (error) {
                            logger.error(' listBizProd ' + error.message);
                            return responseUtil.resetFailedRes(res, error.message, next);
                        } else {
                            logger.info(' listBizProd ' + ' success ');
                            if (rows && rows.length > 0) {
                                //res.send(200, rows);
                                // responseUtil.resetQueryResWithTotal(res, rows, total, next);
                                returnData = rows;
                                that();
                            } else {
                                return responseUtil.resetFailedRes(res, [],0, next);
                            }
                        }
                    });
                }else{
                    responseUtil.resetQueryResWithTotal(res, [],0, next);
                }
            }
        })

    }).seq(function(){
        var that = this;
        Seq(returnData).seqEach(function (item, i) {
            var that = this;
            item.label=[];
            item.prod_label='';
            item.prod_label_lan='';
            prodDao.searchBizProdBaseLabel({prodId:item.prodId}, function (err, rows) {
                if (err) {
                    logger.error(' searchBizProdBaseLabel ' + err.message);
                    throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                } else {
                    for(var k=0;k<rows.length;k++){
                        item.prod_label +=rows[k].label_name +'/';
                        item.prod_label_lan +=rows[k].label_name_lan +'/';
                    }
                    item.label = rows;
                    that(null, i);
                }
            });
        }).seq(function(){
            that()
        })
    }).seq(function(){
        responseUtil.resetQueryResWithTotal(res, returnData,total, next);
    })

}

function getProdCount(req, res, next) {
    var params=req.params;
    var biz_id=params.bizId;
    var prod_id=params.prodId;  //
    var prodCode=params.prodCode;
    var type_id=params.typeId;
    var parent_type_id=params.parentTypeId;
    var name=params.name;
    var tenant=params.tenant;
    var active=params.active;
    prodDao.searchProdCount({biz_id:biz_id,type_id:type_id,prod_id:prod_id,prodCode:prodCode,parent_type_id:parent_type_id,name:name,tenant:tenant,active:active}, function (error, rows) {
        if (error) {
            logger.error(' getProdCount ' + error.message);
            return responseUtil.resetFailedRes(res,error.message,next);
        } else {
            logger.info(' getProdCount ' + ' success ');
            if (rows && rows.length > 0) {
                //res.send(200, rows);
                responseUtil.resetQueryRes(res,rows,null);
                next();
            } else {
                //res.send(200,null);
                responseUtil.resetQueryRes(res,rows,null);
                next();
            }
        }
    });

}

function getBizProdDetail(req, res , next){
    var options={};
    options.biz_id = req.params.bizId;
    options.prod_id = req.params.prodId;
    options.tenant=req.params.tenant;
    var product=null;
    if (options.prod_id==null){
        return next(sysError.MissingParameterError("product id is required.","product id is required."));
    }
    if (options.tenant==null){
        return next(sysError.MissingParameterError("tenant is required.","tenant is required."));
    }
    prodDao.searchBizProd(options,function(error , rows){
        if (error) {
            logger.error(' getBizProdDetail ' + error.message);
            return responseUtil.resetFailedRes(res,error.message,next);
        } else {
            logger.info(' getBizProdDetail ' + ' success ');
            if (rows && rows.length > 0) {
                product=rows[0];
                Seq().par(function() {
                    var that=this;
                    //get all images
                    prodDao.searchBizProdImage(options,function(error,rows){
                        if(error){
                            logger.error(' getBizProdImage ' + error.message);
                            return responseUtil.resetFailedRes(res,error.message,next);
                        }
                        if(rows && rows.length>0){
                            product.images=rows;
                        }
                        that();
                    })
                }).par(function(){
                    var that=this;
                    //get all tags
                    prodDao.searchBizProdTag(options,function(error,rows){
                        if (error) {
                            logger.error(' getBizProdTag ' + error.message);
                            return responseUtil.resetFailedRes(res,error.message,next);
                        }
                        if(rows && rows.length>0){
                            product.tags=rows;
                        }
                        that();
                    })
                }).par(function(){
                    var that = this;
                    product.label=[];
                    prodDao.searchBizProdBaseLabel({prodId:product.prodId}, function (err, rows) {
                        if (err) {
                            logger.error(' searchBizProdBaseLabel ' + err.message);
                            throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                        } else {
                            product.label = rows;
                            that();
                        }
                    });

                }).seq(function(){
                   // res.send(200,product);
                    responseUtil.resetQueryRes(res,product,null);
                    next();
                });

            } else {
                res.send(200,null);
                next();
            }
        }
    });
}

function getProdExtension(req, res , next){
    var prodId = req.params.prodId;
    var tenant=req.params.tenant;
    var product=null;
    if (prodId==null){
        return next(sysError.MissingParameterError("product id is required.","product id is required."));
    }
    if (tenant==null){
        return next(sysError.MissingParameterError("tenant is required.","tenant is required."));
    }
    prodDao.getProdExtension({tenant:tenant,prodId:prodId},function(error , rows){
        if (error) {
            logger.error(' getProdExtension ' + error.message);
            return responseUtil.resetFailedRes(res,error.message,next);
        } else {
            if (rows && rows.length > 0) {
                product=rows[0];
                responseUtil.resetQueryRes(res,product,null);
                next();

            } else {
                res.send(200,null);
                next();
            }
        }
    });
}



function getBizProdByTag(req, res, next) {
    var biz_id=req.params.bizId;
    var tag_id=req.params.tagId;
    var tenant=req.params.tenant;
    prodDao.searchBizProdByTag({biz_id:biz_id,tag_id:tag_id,tenant:tenant}, function (error, rows) {
        if (error) {
            logger.error(' getBizProdByTag ' + error.message);
            return responseUtil.resetFailedRes(res,error.message,next);
        } else {
            logger.info(' getBizProdByTag ' + ' success ');
            if (rows && rows.length > 0) {
               // res.send(200, rows);
                responseUtil.resetQueryRes(res,rows,null);
                next();
            } else {
                //res.send(200,null);
                responseUtil.resetQueryRes(res,rows,null);
                next();
            }
        }
    });
}


function getBizProdByType(req, res, next) {
    var biz_id=req.params.bizId;
    var type_id=req.params.typeId;
    var tenant=req.params.tenant;
    var active=req.params.active;
    var start=req.params.start;
    var size=req.params.size;
    prodDao.searchBizProd({biz_id:biz_id,type_id:type_id,tenant:tenant,active:active,start:start,size:size}, function (error, rows) {
        if (error) {
            logger.error(' getBizProdByType ' + error.message);
            return responseUtil.resetFailedRes(res,error.message,next);
        } else {
            logger.info(' getBizProdByType ' + ' success ');
            if (rows && rows.length > 0) {
                responseUtil.resetQueryRes(res,rows,null);
                return next();
            } else {
                responseUtil.resetQueryRes(res,rows,null);
                return next();
            }
        }
    });
}

// function getBizProdByAll(req, res, next) {
//     var params = req.params;
//     prodDao.searchBizProdAll(params, function (error, rows) {
//         if (error) {
//             logger.error(' searchBizProdAll ' + error.message);
//             return responseUtil.resetFailedRes(res,error.message,next);
//         } else {
//             logger.info(' searchBizProdAll ' + ' success ');
//             if (rows && rows.length > 0) {
//                 responseUtil.resetQueryRes(res,rows,null);
//                 return next();
//             } else {
//                 responseUtil.resetQueryRes(res,rows,null);
//                 return next();
//             }
//         }
//     });
// }
/*function addBizProd(req, res, next) {
    var params=req.params;

    prodDao.addBizProd(req.params, function (error, rows){
        if(error){
            logger.error(' addBizProd ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        }else {
            responseUtil.resetQueryRes(res,rows,{prodId :rows.insertId});
            return next();
        }
    });
}*/

function _addAProd(tenant,bizId,params,callback){
    var typeId=params.typeId;
    var prodCode=params.prodCode;
    var name=params.name;
    var nameLang=params.nameLang;
    var description=params.description;
    var descriptionLang=params.descriptionLang;
    var price=params.price;
    var imgUrl=params.imgUrl;
    var note=params.note;
    var options=params.options;
    var active=params.active;
    var calorie=params.calorie;
    var ingredient=params.ingredient;
    var ingredientLang=params.ingredientLang;
    var externalId=params.externalId;
    var prodSize=params.prodSize;
    var stock=params.stock;
    var bizName=params.bizName;
    var weight=params.weight;
    var unitOfMeasure=params.unitOfMeasure;
    var measurement=params.measurement;
    var floorPrice=params.floorPrice;
    var wholesalePrice=params.wholesalePrice;
    var minPurchaseQuantity = params.minPurchaseQuantity;
    var taxIncluded = params.taxIncluded;
    var tax = params.tax;
    var transportFeePayee = params.transportFeePayee;
    var aProdBizId=bizId;
    if (aProdBizId==null || aProdBizId==0){
        aProdBizId=params.bizId;
    }
    if (prodCode==null){
        return callback(new ReturnType(false,"prod code is missing"));
    }

    var prod = {
        tenant: tenant,
        bizId: aProdBizId ? aProdBizId : 0,
        typeId: typeId ,
        prodCode: prodCode,
        name: name,
        nameLang: nameLang,
        description: description,
        descriptionLang: descriptionLang,
        price: price,
        imgUrl: imgUrl,
        note: note,
        options: options,
        active: active,
        calorie: calorie,
        ingredient: ingredient,
        ingredientLang: ingredientLang,
        externalId: externalId,
        prodSize: prodSize,
        stock: stock,
        bizName: bizName,
        weight: weight,
        unitOfMeasure: unitOfMeasure,
        measurement: measurement,
        floorPrice: floorPrice ? floorPrice : 0,
        wholesalePrice: wholesalePrice ? wholesalePrice : 0,
        minPurchaseQuantity:minPurchaseQuantity ,
        taxIncluded:taxIncluded,
        tax:tax,
        transportFeePayee:transportFeePayee
    };
    prodDao.addBizProd(prod, function (error, result) {
        if (error) {
            logger.error(' addAProd ' + error.message);
            if (error.message !=null && error.message.indexOf("ER_DUP_ENTRY")>-1){
                return callback(new ReturnType(false,"Product exists already"));
            }else{
                return callback(new ReturnType(false,error.message));
            }
        } else {
            if (result && result.insertId) {
                prodId = result.insertId;
                return callback(new ReturnType(true,null,prodId));
            } else {
                logger.error(' addProd ' + error.message);
                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });
}

function addBizProd(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var bizId = params.bizId;
    //var userId = params.authUserId;

    var result=[];
    var prods = params.prods;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (prods == null) {
        return next(sysError.MissingParameterError("prods are missing", "prods are missing"));
    }
    Seq().seq(function(){
        var that = this;
        Seq(prods).seqEach(function(prod,i){
            var that=this;//保存商品
            _addAProd(tenant,bizId,prod,function(returnResult){
                result[i]=returnResult;
                that(null,i);
            });
        }).seq(function(){
            that();
        })
    }).seq(function(){
        var that = this;//判断标签是否存在，如果不存在，则插入标签库
        Seq(params.prods).seqEach(function (prod, i) {
            var that = this;
            Seq(prod.label).seqEach(function(label,j){
                var that = this;
                if(!label.labelId){
                    label.labelKind=1;
                    prodDao.getAllLabel({lableNameEQ:label.labelName},function(err,rows){
                        if (err) {
                            logger.error(' getAllLabel ' + err.message);
                            return responseUtil.resetFailedRes(res,err.message,next);
                        } else {
                            if(rows && rows.length>0){
                                label.labelId=rows[0].id;
                                that(null, j);
                            }else{
                                prodDao.addALlLabel(label,function(err,rows){
                                    if (err) {
                                        logger.error(' addBizProdLabel ' + err.message);
                                        return responseUtil.resetFailedRes(res,err.message,next);
                                    } else {
                                        label.labelId=rows.insertId;
                                        that(null, j);
                                    }
                                })
                            }
                        }
                    });
                }else{
                    that(null, j);
                }
            }).seq(function(){
                that(null, i);
            });
        }).seq(function(){
            that();
        });
    }).seq(function(){
        var that = this;//商品与标签的关联
        Seq(params.prods).seqEach(function (prod, i) {
            var that = this;
            Seq(prod.label).seqEach(function (label, j) {
                var that = this;
                label.prodId=result[i].id;
                prodDao.addBizProdLabel(label, function (err, rows) {
                    if (err) {
                        logger.error(' addBizProdLabel ' + err.message);
                        return responseUtil.resetFailedRes(res,err.message,next);
                    } else {
                        that(null, j);
                    }
                });
            }).seq(function () {
                that(null,i)
            })
        }).seq(function(){
            that();
        })
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function updateBizProd(req, res, next) {
    var params=req.params;
    Seq().seq(function(){
        var that = this;
        prodDao.updateBizProd(req.params.bizId, req.params.prodId, req.params, function (error, rows) {
            if (error) {
                logger.error(' updateBizProd ' + error.message);
                return responseUtil.resetFailedRes(res,error.message,next);
            } else {
                logger.info(' updateBizProd ' + ' sucess ');
                // res.send(200,  {succeed:true});
                // responseUtil.resetSuccessRes(res);
                // next();
                that();
            }
        });
    }).seq(function(){
        var that = this;
        prodDao.deleteBizProdBaseLabel(req.params.prodId,function(error,rows){
            if (error) {
                logger.error(' deleteBizProdBaseLabel ' + error.message);
                throw sysError.InternalError(error.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            }else{
                that()
            }
        })
    }).seq(function(){
        var that = this;//判断标签是否存在，如果不存在，则插入标签库
        Seq(params.label).seqEach(function (item, i) {
            var that = this;
            if(!item.labelId){
                item.labelKind=1;
                prodDao.getAllLabel({lableNameEQ:item.labelName},function(err,rows){
                    if (err) {
                        logger.error(' getAllLabel ' + err.message);
                        return responseUtil.resetFailedRes(res,error.message,next);
                    } else {
                        if(rows && rows.length>0){
                            item.labelId=rows[0].id;
                            that(null, i);
                        }else{
                            prodDao.addALlLabel(item,function(err,rows){
                                if (err) {
                                    logger.error(' addBizProdLabel ' + err.message);
                                    return responseUtil.resetFailedRes(res,error.message,next);
                                } else {
                                    item.labelId=rows.insertId;
                                    that(null, i);
                                }
                            })
                        }
                    }
                });
            }else{
                that(null, i);
            }
        }).seq(function(){
            that();
        });
    }).seq(function(){
        var that = this;//商品与标签的关联
        Seq(params.label).seqEach(function (item, i) {
            var that = this;
            item.prodId=params.prodId;
            prodDao.addBizProdLabel(item, function (err, rows) {
                if (err) {
                    logger.error(' addBizProdLabel ' + err.message);
                    return responseUtil.resetFailedRes(res,err.message,next);
                } else {
                    that(null, i);
                }
            });
        }).seq(function(){
            that();
        })
    }).seq(function(){
        res.send(200,  {succeed:true});
        responseUtil.resetSuccessRes(res);
        next();
    })

}

/*
function addProdTag(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var bizId = params.bizId;
    //var userId = params.authUserId;

    var result=[];
    var prods = params.prods;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (prods == null) {
        return next(sysError.MissingParameterError("prods are missing", "prods are missing"));
    }
    Seq(prods).seqEach(function(prod,i){
        var that=this;
        _addAProd(tenant,bizId,prod,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}*/


function delBizProd(req, res , next){
    var params=req.params;

    prodDao.delBizProd(req.params, function(error , result){
        if(error){
            logger.error(' delBizProd ' + error.message);
            return responseUtil.resetFailedRes(res,error.message,next);
        }
        if(result.affectedRows<=0){
            logger.error(' delBizProd ' + 'failure');
            return responseUtil.resetFailedRes(res,"no product is deleted",next);
        }
        if(params.prodId){
            prodImageDao.delProdImage(params.prodId,function (err,value){
                if (err) {
                    return responseUtil.resetFailedRes(res,err.message,next);
                    }else {
                    logger.info(' delProdImage ' + ' success ');
                  //  res.send(200,  {succeed:true});
                    responseUtil.resetSuccessRes(res);
                    next();
                    }
                });

        } else{
            logger.error(' delBizProd ' + ' success');
           // res.send(200,{success:true});
            responseUtil.resetSuccessRes(res);
            next();
        }
    });

}


function postTagOnProd(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var bizId = params.bizId;
    var tagId = params.tagId;
    var prodId = params.prodId;
    var active=params.active;
 //   var createdBy=params.createdBy;
  //  var createdOn=params.createdOn;
  //  var updatedOn=params.updatedOn;


    var result=[];
    var prodTags = params.prodTags;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (prodTags == null) {
        return next(sysError.MissingParameterError("tags are missing", "tags are missing"));
    }
    Seq(prodTags).seqEach(function(prodTags,i){
        var that=this;
        _addAProdTag(tenant,tagId,prodTags,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function _addAProdTag(tenant,tagId,params,callback){
   // var tenant = params.tenant;
   // var tagId = params.tagId;
    var prodId=params.prodId;
    var active = params.active;

    var bizId = params.bizId;

    if (prodId==null){
        return callback(new ReturnType(false,"prod id is missing"));
    }
    if (tagId==null){
        return callback(new ReturnType(false,"tag id is missing"));
    }
    var prodTags = {
        tenant :tenant,
        prodId:prodId,
        active :active,

        bizId :bizId,
        tagId :tagId,

    //    createdBy:createdBy,
    //    createdOn:createdOn,
    //    updatedOn:updatedOn
    };
    prodTagDao.addProdTag(prodTags, function (error, result) {
        if (error) {
            logger.error(' addAProdTag ' + error.message);
            if (error.message !=null && error.message.indexOf("ER_DUP_ENTRY")>-1){
                return callback(new ReturnType(false,"Tag exists already"));
            }else{
                return callback(new ReturnType(false,error.message));
            }
        } else {
            if (result && result.insertId) {
                tagId = result.insertId;
                return callback(new ReturnType(true,null,tagId));
            } else {
                logger.error(' addProdTag ' + error.message);
                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });
}

function deleteTagOnProd(req, res, next) {
    var params=req.params;

    if (params.tenant==null){
        return responseUtil.resTenantNotFoundError(null,res,next);
    }

    if (params.prodId==null){
        return responseUtil.resetFailedRes(res,"prod id is missing",next);
    }
    if (params.tagId==null){
        return responseUtil.resetFailedRes(res,"tag id is missing",next);
    }

    prodTagDao.delProdTag(req.params, function(error , result){
        if(error){
            logger.error(' delProdTag ' + error.message);
            return responseUtil.resetFailedRes(res,error.message,next);
        }
        if(result.affectedRows<=0){
            logger.error(' delProdTag ' + 'failure');
            return responseUtil.resetFailedRes(res,"no product tag is deleted",next);
        }
        logger.info(' delProdTag ' + ' success ');
        return responseUtil.resetSuccessRes(res,next);
    });
}


function searchProdExtension(req, res, next) {
    var params=req.params;
    var biz_id=params.bizId;
    var prod_id=params.prodId;  //
    var prodCode=params.prodCode;
    var type_id=params.typeId;
    var parent_type_id=params.parentTypeId;
    var name=params.name;
    var tenant=params.tenant;
    var active=params.active;
    var start=params.start;
    var size=params.size;
    var queryParams={biz_id:biz_id,type_id:type_id,prod_id:prod_id,prodCode:prodCode,parent_type_id:parent_type_id,
        name:name,tenant:tenant,active:active};
    var total=0;

    prodDao.searchProdCount(queryParams,function(error,rows){
        if (error) {
            logger.error(' listProdExtensionCount ' + error.message);
            return responseUtil.resetFailedRes(res,error.message,next);
        } else {
            if (rows && rows.length > 0){
                total=rows[0].count;
            }
            if (total>0){
                queryParams.size=size;
                queryParams.start=start;
                prodDao.searchProdExtension(queryParams, function (error, rows) {
                    if (error) {
                        logger.error(' searchProExtension ' + error.message);
                        return responseUtil.resetFailedRes(res, error.message, next);
                    } else {
                        logger.info(' searchProExtension ' + ' success ');
                        if (rows && rows.length > 0) {
                            //res.send(200, rows);
                            responseUtil.resetQueryResWithTotal(res, rows, total, next);
                        } else {
                            return responseUtil.resetFailedRes(res, [],0, next);
                        }
                    }
                });
            }else{
                responseUtil.resetQueryResWithTotal(res, [],0, next);
            }
        }
    })
}


function getProdLabel(req,res,next){
    var params = req.params;
    prodDao.getProdLabel(params,function(err,rows){
        if(err){
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' getProdLabel ' +'success');
            res.send(200,rows);
            next();
        }
    })
}
function getProductWithCommentLabel(req,res,next){
    var params = req.params;
    prodDao.getProductWithCommentLabel(params,function(err,rows){
        if(err){
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' getProductWithCommentLabel ' +'success');
            res.send(200,rows);
            next();
        }
    })
}

function getAllLabel(req,res,next){
    var params = req.params;
    prodDao.getAllLabel(params,function(err,rows){
        if(err){
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' getAllLabel ' +'success');
            res.send(200,rows);
            next();
        }
    })
}
function getProdListLike(req,res,next){
    var params = req.params;
    var returnDate = {};
    Seq().seq(function(){
        var that = this;
        returnDate.prod=[];
        prodDao.searchAllPord(params,function(err,rows){
            if(err){
                throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else{
                logger.info(' searchAllPord ' +'success');
                returnDate.prod=rows;
                that()
            }
        })

    }).seq(function(){
        var that = this;
        returnDate.label=[];
        prodDao.searchAllList(params,function(err,rows){
            if(err){
                throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
            } else{
                logger.info(' searchAllList ' +'success');
                returnDate.label=rows;
                res.send(200,returnDate);
            }
        })
    })

}
function sendNca(req,res,next){
    var options = {
        headers: {"Connection": "close"},
        url: sysConfig.ncaApiUrl + '/api/nca/ordermanage/NCAOrderShopSyncControl?method=sync',
        method: 'POST',
        json:true,
        body: req.params
    };
    function callback(error, response, data) {
        res.send(200,data);
        next()
    }
    request(options, callback);
}
function searchProdByKeywordNca(req,res,next){
    var params = req.params;
    prodDao.searchBizProd(params,function(err,rows){
        if(err){
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' searchBizProd ' +'success');
            responseUtil.resetQueryRes(res,rows,null);
            next();
        }
    })
}

function searchAllList(req,res,next){
    var params = req.params;
    prodDao.searchAllList(params,function(err,rows){
        if(err){
            throw sysError.InternalError(err.message,sysMsg.SYS_INTERNAL_ERROR_MSG);
        } else{
            logger.info(' searchAllList ' +'success');
            responseUtil.resetQueryRes(res,rows,null);
            next();
        }
    })
}
function getConnectState(req,res,next){
    res.send(200,{success: true});
}

//百度链接推送
function baiduPushLink(req, res, next) {
    try{
        var appId = '1612018288230181';
        var token = 'ohOXDgJdq1AQCPWE';
        var type = '';
        if(req.params.type==1){
            type = 'realtime';//新增
        }else if(req.params.type==2){
            type = 'batch';//历史
        }
        var url = 'http://data.zz.baidu.com/urls?appid=' + appId + '&token=' + token + '&type=' + type;
        if(req.params.link){
            var options = {
                headers: {"Connection": "close"},
                url: url,
                method : 'POST',
                body : req.params.link.toString("binary")
            }

            function callback(error, response, data) {
                res.send(200, JSON.parse(data));
                next()
            }

            request(options, callback);

        }else {
            logger.info('baiduPushLink not params url');
            throw sysError.InternalError('', "baiduPushLink not params url");

        }
    }catch (error){
        logger.info('baiduPushLink error');
        throw sysError.InternalError(error.message, "baiduPushLink error");
    }
}


function getBizProdByParentType(req, res, next) {
    var biz_id=req.params.bizId;
    var parent_type_id=req.params.typeId;
    var tenant=req.params.tenant;
    var active=req.params.active;
    var start=req.params.start;
    var size=req.params.size;
    prodDao.searchBizProd({biz_id:biz_id,tenant:tenant,active:active,start:start,size:size,parent_type_id:parent_type_id}, function (error, rows) {
        if (error) {
            logger.error(' getBizProdByType ' + error.message);
            return responseUtil.resetFailedRes(res,error.message,next);
        } else {
            logger.info(' getBizProdByType ' + ' success ');
            if (rows && rows.length > 0) {
                responseUtil.resetQueryRes(res,rows,null);
                return next();
            } else {
                responseUtil.resetQueryRes(res,rows,null);
                return next();
            }
        }
    });
}




module.exports = {
    getConnectState:getConnectState,
    listBizProd : listBizProd,
    getProdExtension:getProdExtension,
    getBizProdDetail: getBizProdDetail,
    getBizProdByTag : getBizProdByTag,
    getBizProdByType : getBizProdByType,
    addBizProd : addBizProd,
    updateBizProd : updateBizProd,
    delBizProd : delBizProd,
    deleteTagOnProd:deleteTagOnProd,
    postTagOnProd:postTagOnProd,
    getProdCount:getProdCount,
    searchProdExtension:searchProdExtension,
    getProdLabel:getProdLabel,
    getProductWithCommentLabel:getProductWithCommentLabel,
    getAllLabel:getAllLabel,
    sendNca:sendNca,
    searchProdByKeywordNca:searchProdByKeywordNca,
    getProdListLike:getProdListLike,
    baiduPushLink:baiduPushLink,
    getBizProdByParentType:getBizProdByParentType
};

