/**
 * Created by Rina on 9/22/16.
 */


var tagDao = require('../dao/TagDao.js');
var prodDao = require('../dao/ProdDao.js');
var prodTypeDao = require('../dao/ProdTypeDao.js');
var prodCommentDao = require('../dao/ProdCommentDao.js');
var prodImageDao = require('../dao/ProdImageDao.js');
var prodTypeImageDao = require('../dao/ProdTypeImageDao.js');
var commonUtil=require('mp-common-util');
var ReturnType = commonUtil.ReturnType;
var sysMsg = commonUtil.systemMsg; //this follows common checkout's order.js
var responseUtil = commonUtil.responseUtil;
var sysError = commonUtil.systemError;
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ProdTypeImage.js');
var Seq = require('seq');

//prodTypeImage
function getProdTypeImage(req, res, next){
    var biz_id=req.params.bizId;
    var type_id=req.params.typeId;
    var tenant=req.params.tenant;
    var start=req.params.start;
    var size=req.params.size;
    var result = {};
    prodTypeImageDao.getProdTypeImage({biz_id:biz_id,type_id:type_id,tenant:tenant,start:start,size:size},function(error,rows){
        if(error){
            logger.error(' getProdTypeImage ' + error.message);
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

function _addAProdTypeImage(tenant,bizId,params,callback){
    var typeId=params.typeId;
    var imgUrl = params.imgUrl;
    var description = params.description;
    var imgId=params.imgId;
    var active = params.active;
    var primaryFlag=params.primaryFlag;

    if (typeId==null){
        return callback(new ReturnType(false,"type id is missing"));
    }
    if (imgUrl==null){
        return callback(new ReturnType(false,"imgUrl is missing"));
    }
    var prodTypeImage = {
        tenant: tenant,
        bizId: bizId,
        typeId: typeId,
        imgId:imgId,
        imgUrl: imgUrl,
        description: description,
        active: active
    };
    prodTypeImageDao.addProdTypeImage(prodTypeImage, function (error, result) {
        if (error) {
            logger.error(' addAProdTypeImage ' + error.message);
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
                logger.error(' addProdTypeImage ' + error.message);
                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });
}

function addProdTypeImage(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var bizId = params.bizId;


    var result=[];
    var prodTypeImages = params.prodTypeImages;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (prodTypeImages == null) {
        return next(sysError.MissingParameterError("images are missing", "images are missing"));
    }
    Seq(prodTypeImages).seqEach(function(prodTypeImage,i){
        var that=this;
        _addAProdTypeImage(tenant,bizId,prodTypeImage,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function delProdTypeImage(req, res , next){
    var params=req.params;
  //  var tenant = params.tenant;
    //var bizId = params.bizId;


    //var result=[];
    //var prodTypeImages = params.prodTypeImages;

    prodTypeImageDao.delProdTypeImage(params, function(error , result){
        if(error){
            logger.error(' delProdTypeImage ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        }
        if(result.affectedRows<=0){
            logger.error(' delProdTypeImage ' + 'failure');
            return responseUtil.resInternalError(error,res,next);
        }else{
            logger.error(' delProdTypeImage ' + ' success');
           // res.send(200,{success:true});
            responseUtil.resetSuccessRes(res)
            next();
        }
    });

}

function updateProdTypeImage(req, res, next) {
    var params=req.params;


    prodTypeImageDao.updateProdTypeImage(params.bizId,params, function (error, rows) {
        if (error) {
            logger.error(' updateProdTypeImage ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        } else {
            logger.info(' updateProdTypeImage ' + ' sucess ');
           // res.send(200,  {succeed:true});
            responseUtil.resetSuccessRes(res);
            next();
        }
    });
}


module.exports = {
    getProdTypeImage: getProdTypeImage,
    addProdTypeImage: addProdTypeImage,
    delProdTypeImage: delProdTypeImage,
    updateProdTypeImage:updateProdTypeImage
};