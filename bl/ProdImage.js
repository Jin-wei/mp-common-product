/**
 * Created by Rina on 9/8/16.
 */

var prodImageDao = require('../dao/ProdImageDao.js');
var commonUtil=require('mp-common-util');
var ReturnType = commonUtil.ReturnType;
var responseUtil = commonUtil.responseUtil;
var sysError = commonUtil.systemError;
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ProdImage.js');
var Seq = require('seq');

//prodImage
function getProdImage(req, res , next){
    var biz_id=req.params.bizId;
    var prod_id=req.params.prodId;
    var tenant=req.params.tenant;
    var start=req.params.start;
    var size=req.params.size;
    var result = {};
    prodImageDao.getProdImage({biz_id:biz_id,prod_id:prod_id,tenant:tenant,start:start,size:size},function(error,rows){
        if(error){
            logger.error(' getProdImage ' + error.message);
            responseUtil.resInternalError(error,res,next);
        } else{
            if(rows != null && rows.length>0){
                result = rows;
            }
            responseUtil.resetQueryRes(res,result,null);
            return next();
        }
    });
}

function _updateAProdImage(tenant,bizId,params,callback){
    var prodId=params.prodId;
    var imgUrl = params.imgUrl;
    var description = params.description;
    var active = params.active==null?1:0;
    var imgType = params.imgType;

    if (prodId==null){
        return callback(new ReturnType(false,"prod id is missing"));
    }
    if (imgUrl==null){
        return callback(new ReturnType(false,"imgUrl is missing"));
    }
    var prodImage = {
        tenant: tenant,
        bizId: bizId,
        prodId: prodId,
        imgUrl: imgUrl,
        description: description,
        active: active,
        imgType:imgType
    };
    prodImageDao.updateProdImage(prodImage, function (error, result) {
        if (error) {
            logger.error(' updateAProdImage ' + error.message);
            if (error.message !=null && error.message.indexOf("ER_DUP_ENTRY")>-1){
                return callback(new ReturnType(false,"Image exists already"));
            }else{
                return callback(new ReturnType(false,error.message));
            }
        } else {
            if (result && result.insertId) {
                imgId = result.insertId;
                return callback(new ReturnType(true,null,imgId));
            } else {
                logger.error(' updateProdImage ' + error.message);
                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });
}

function _addAProdImage(tenant,bizId,params,callback){
    var prodId=params.prodId;
    var imgUrl = params.imgUrl;
    var description = params.description;
    var active = params.active==null?1:0;
    var imgType = params.imgType;
    var fileName = params.fileName;

    if (prodId==null){
        return callback(new ReturnType(false,"prod id is missing"));
    }
    if (imgUrl==null){
        return callback(new ReturnType(false,"imgUrl is missing"));
    }
    var prodImage = {
        tenant: tenant,
        bizId: bizId,
        prodId: prodId,
        imgUrl: imgUrl,
        description: description,
        active: active,
        imgType:imgType,
        fileName:fileName
    };

    Seq().seq(function(){
        var that = this;
        if(params.imgType == 'file'){
            prodImageDao.delProdImage({tenant:tenant,bizId:bizId,prodId:prodId,imgType:imgType}, function(error , result){
                if(error){
                    logger.error(' delProdImage ' + error.message);
                    return callback(new ReturnType(false,error.message));
                }else {
                    logger.error(' delProdImage ' + ' success');
                    that()
                }
            });
        }else{
            that()
        }
    }).seq(function(){
        var that = this;
        prodImageDao.addProdImage(prodImage, function (error, result) {
            if (error) {
                logger.error(' addAProdImage ' + error.message);
                if (error.message !=null && error.message.indexOf("ER_DUP_ENTRY")>-1){
                    return callback(new ReturnType(false,"Image exists already"));
                }else{
                    return callback(new ReturnType(false,error.message));
                }
            } else {
                if (result && result.insertId) {
                    imgId = result.insertId;
                    return callback(new ReturnType(true,null,imgId));
                } else {
                    logger.error(' addProdImage ' + error.message);
                    return callback(new ReturnType(false,error?error.message:null));
                }
            }
        });
    })

}

function addProdImage(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var bizId = params.bizId;


    var result=[];
    var prodImages = params.prodImages;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (prodImages == null) {
        return next(sysError.MissingParameterError("images are missing", "images are missing"));
    }

    Seq(prodImages).seqEach(function(prodImage,i){
        var that=this;
        _addAProdImage(tenant,bizId,prodImage,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function updateProdImage(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var bizId = params.bizId;


    var result=[];
    var prodImages = params.prodImages;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (prodImages == null) {
        return next(sysError.MissingParameterError("images are missing", "images are missing"));
    }
    Seq(prodImages).seqEach(function(prodImage,i){
        var that=this;
        _updateAProdImage(tenant,bizId,prodImage,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function delProdImage(req, res , next){
    var params=req.params;

    prodImageDao.delProdImage(req.params, function(error , result){
        if(error){
            logger.error(' delProdImage ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        }
        if(result.affectedRows<=0){
            logger.error(' delProdImage ' + 'failure');
            return responseUtil.resInternalError(error,res,next);
        }else{
            logger.error(' delProdImage ' + ' success');
            res.send(200,{success:true});
            next();
        }
    });

}

function updateBizProdPrimaryImage(req, res, next) {
    var params=req.params;

    prodImageDao.updateBizProdPrimaryImage(req.params.bizId, req.params.prodId, req.params.imgUrl, req.params, function (error, rows) {
        if (error) {
            logger.error(' updateBizProd ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        } else {
            logger.info(' updateBizProd ' + ' sucess ');
            res.send(200,  {succeed:true});
            next();
        }
    });
}


function updateImageDescription(req, res, next) {
    var params = req.params;

    prodImageDao.updateImageDescription(req.params, function (error, rows) {
        if (error) {
            logger.error(' updateDescription ' + error.message);
            return responseUtil.resInternalError(error, res, next);
        } else {
            logger.info(' updateDescription ' + ' sucess ');
            res.send(200, {succeed: true});
            next();
        }
    });
}


module.exports = {
    getProdImage: getProdImage,
    addProdImage: addProdImage,
    delProdImage: delProdImage,
    updateBizProdPrimaryImage: updateBizProdPrimaryImage,
    updateImageDescription: updateImageDescription
};