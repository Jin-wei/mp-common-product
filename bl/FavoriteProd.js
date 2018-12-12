/**
 * Created by Rina on 9/13/16.
 */

var fProdDao = require('../dao/FavoriteProdDao.js');
var commonUtil=require('mp-common-util');
var ReturnType = commonUtil.ReturnType;
var responseUtil = commonUtil.responseUtil;
var sysError = commonUtil.systemError;
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('FavoriteProd.js');
var Seq = require('seq');
var extend=require("extend");

//favorite products
function getFavorites(req, res, next) {
    var params= req.params;
    var authUserId= params.authUser.userId;
    var filter= {};
    extend(filter,params);
    filter.userId=authUserId;
    fProdDao.searchFavorite(filter, function (error, rows) {
        if (error) {
            logger.error(' getFavorites ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        } else {
            logger.debug(' getFavorites ' + ' success ');
           return responseUtil.resetQueryRes(res,rows,null,next);
        }
    });
}


function _addAFavorite(params,callback){
    fProdDao.addFavorite(params, function (error, result) {
        if (error) {
            logger.error(' addAFavorite ' + error.message);
            if (error.message !=null && error.message.indexOf("ER_DUP_ENTRY")>-1){
                return callback(new ReturnType(false,"favorite product exists already",params.prodId));
            }else{
                return callback(new ReturnType(false,error.message,params.prodId));
            }
        } else {
            if (result && result.insertId) {
                var tId = result.insertId;
                return callback(new ReturnType(true,null,tId));
            } else {
                logger.error(' addAFavorite ' + error.message);
                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });
}

function addFavorites(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var authUserId=params.authUser.userId;
    var prods = params.prods;

    var result=[];

    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (prods == null) {
        return next(sysError.MissingParameterError("prods are missing", "prods are missing"));
    }
    Seq(prods).seqEach(function(prod,i){
        var that=this;
        _addAFavorite({tenant:tenant,prodId:prod,userId:authUserId,createdBy:authUserId},function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function deleteFavorites(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var authUserId=params.authUser.userId;
    var prods = params.prods;
    var result=[];

    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (prods == null) {
        return next(sysError.MissingParameterError("prods are missing", "prods are missing"));
    }
    Seq(prods).seqEach(function(prod,i){
        var that=this;
        _deleteAFavorite({tenant:tenant,prodId:prod,userId: authUserId},function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function _deleteAFavorite(params,callback){
    fProdDao.deleteFavorite(params, function(error , result){
        if(error){
            logger.error(' delFavorite ' + error.message);
            return callback(new ReturnType(false,error.message,params.prodId));
        }
        if(result.affectedRows<=0){
            logger.error(' delFavorite ' + 'failure');
            return callback(new ReturnType(false,"No favorite product is deleted",params.prodId));
        }
        return callback(new ReturnType(true,null,params.prodId));
    });
}


module.exports = {
    getFavorites: getFavorites,
    addFavorites:addFavorites,
    deleteFavorites:deleteFavorites
};