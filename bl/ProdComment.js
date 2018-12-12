/**
 * Created by Rina on 9/8/16.
 */
var tagDao = require('../dao/TagDao.js');
var prodDao = require('../dao/ProdDao.js');
var prodTypeDao = require('../dao/ProdTypeDao.js');
var prodCommentDao = require('../dao/ProdCommentDao.js');
var prodImageDao = require('../dao/ProdImageDao.js');
var commonUtil=require('mp-common-util');
var ReturnType = commonUtil.ReturnType;
var sysMsg = commonUtil.systemMsg; //this follows common checkout's order.js
var responseUtil = commonUtil.responseUtil;
var sysError = commonUtil.systemError;
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ProdComment.js');
var Seq = require('seq');

//prodComment
function getProdComment(req, res , next){
    var result = {};
    prodCommentDao.getProdComment(req.params,function(error,rows){
        if(error){
            logger.error(' getProdComment ' + error.message);
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

function getProdRating(req, res , next){

    var params=req.params;
    var biz_id=params.bizId;
    var prod_id=params.prodId;
    var tenant=params.tenant;

    var result = {};
    prodCommentDao.getProdRating({biz_id:biz_id,prod_id:prod_id,tenant:tenant},function(error,rows){
        if(error){
            logger.error(' getProdRating ' + error.message);
            responseUtil.resInternalError(error,res,next);
        } else {
            logger.info(' getProdRating ' + ' success ');
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

function _addAProdComment(tenant,bizId,userId,params,callback){
    var prodId=params.prodId;
    var comment= params.comment;
    var rating = params.rating;
    var userName = params.userName;
    var city = params.city;
    var active = params.active;

    if (prodId==null){
        return callback(new ReturnType(false,"prod id is missing"));
    }
    if (comment==null){
        return callback(new ReturnType(false,"comment is missing"));
    }
    var prodComment = {
        tenant: tenant,
        bizId: bizId,
        prodId: prodId,
        comment: comment,
        rating: rating,
        userId: userId,
        userName: userName,
        city: city,
        active: active
    };
    prodCommentDao.addProdComment(prodComment, function (error, result) {
        if (error) {
            logger.error(' addAProdComment ' + error.message);
            if (error.message !=null && error.message.indexOf("ER_DUP_ENTRY")>-1){
                return callback(new ReturnType(false,"Comment exists already"));
            }else{
                return callback(new ReturnType(false,error.message));
            }
        } else {
            if (result && result.insertId) {
                commentId = result.insertId;
                return callback(new ReturnType(true,null,commentId));
            } else {
                logger.error(' addUser ' + error.message);
                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });
}

function addProdComment(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var bizId = params.bizId;
    var authUser=params.authUser;

    var result=[];
    var prodComments = params.prodComments;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (prodComments == null) {
        return next(sysError.MissingParameterError("comments are missing", "comments are missing"));
    }
    Seq(prodComments).seqEach(function(prodComment,i){
        var that=this;
        _addAProdComment(tenant,bizId,authUser.userId,prodComment,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function delProdComment(req, res , next){
    var params=req.params;
    
    prodCommentDao.delProdComment(req.params, function(error , result){
        if(error){
            logger.error(' delProdComment ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        }
        if(result.affectedRows<=0){
            logger.error(' delProdComment ' + 'failure');
            return responseUtil.resInternalError(error,res,next);
        }else{
            logger.error(' delProdComment ' + ' success');
            res.send(200,{success:true});
            next();
        }
    });

}

function delProdCommentByUser(req, res , next){
    var params=req.params;
    var userId=params.userId;
    var authUser=params.authUser;

    if(userId != authUser.userId){
        return responseUtil.resNoAuthorizedError(null,res,next);
    }

    prodCommentDao.delProdCommentByUser(authUser.userId,req.params, function(error , result){
        if(error){
            logger.error(' delProdCommentByUser ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        }
        if(result.affectedRows<=0){
            logger.error(' delProdCommentByUser ' + 'failure');
            return responseUtil.resInternalError(error,res,next);
        }else{
            logger.error(' delProdCommentByUser ' + ' success');
            res.send(200,{success:true});
            next();
        }
    });

}

module.exports = {
    getProdComment: getProdComment,
    getProdRating: getProdRating,
    addProdComment: addProdComment,
    delProdComment: delProdComment,
    delProdCommentByUser: delProdCommentByUser
};
