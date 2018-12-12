/**
 * Created by Rina on 9/13/16.
 */

var tagDao = require('../dao/TagDao.js');
var prodDao = require('../dao/ProdDao.js');
var prodTypeDao = require('../dao/ProdTypeDao.js');
var prodCommentDao = require('../dao/ProdCommentDao.js');
var imageDao = require('../dao/ProdImageDao.js');
var commonUtil=require('mp-common-util');
var ReturnType = commonUtil.ReturnType;
var sysMsg = commonUtil.systemMsg; //this follows common checkout's order.js
var responseUtil = commonUtil.responseUtil;
var sysError = commonUtil.systemError;
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('Tag.js');
var Seq = require('seq');

//tag
function getTag(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    tagDao.searchTag(req.params, function (error, rows) {
        if (error) {
            logger.error(' getTag ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        } else {
            return responseUtil.resetQueryRes(res,rows,null,next);
        }
    });
}


function _addATag(tenant,params,callback){
    var name=params.name;
    var nameLang=params.nameLang;
    var description=params.description;
    var active=params.active;
    var displayOrder=params.displayOrder;
    var systemFlag=params.systemFlag;
    var displayFlag=params.displayFlag;

    if (name==null){
        return callback(new ReturnType(false,"tag name is missing"));
    }

    var tags = {
        tenant:tenant,
        name: name,
        nameLang: nameLang,
        description: description,
        active: active,
        displayOrder: displayOrder,
        systemFlag: systemFlag,
        displayFlag: displayFlag
    };
    tagDao.addTag(tags, function (error, result) {
        if (error) {
            logger.error(' addATag ' + error.message);
            if (error.message !=null && error.message.indexOf("ER_DUP_ENTRY")>-1){
                return callback(new ReturnType(false,"Tag is exists already"));
            }else{
                return callback(new ReturnType(false,error.message));
            }
        } else {
            if (result && result.insertId) {
               var tId = result.insertId;
                return callback(new ReturnType(true,null,tId));
            } else {
                logger.error(' addATag ' + error.message);
                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });
}

function addTags(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var name=params.name;
    var nameLang=params.nameLang;
    var description=params.description;
    var active=params.active;
    var displayOrder=params.displayOrder;
    var systemFlag=params.systemFlag;
    var displayFlag=params.displayFlag;

    var result=[];
    var tags = params.tags;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }
    if (tags == null) {
        return next(sysError.MissingParameterError("tags are missing", "tags are missing"));
    }
    Seq(tags).seqEach(function(tags,i){
        var that=this;
        _addATag(tenant,tags,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function deleteTags(req, res, next){

    var params=req.params;

    tagDao.deleteTag(req.params, function(error , result){
        if(error){
            logger.error(' delTag ' + error.message);
            return responseUtil.resInternalError(error,res,next);
        }
        if(result.affectedRows<=0){
            logger.error(' delTag ' + 'failure');
            return responseUtil.resInternalError(error,res,next);
        }
        if(params.id) {
            tagDao.deleteTag(params.id, function (err, value) {
                    if (err) {
                        throw sysError.InternalError(err.message, sysMsg.SYS_INTERNAL_ERROR_MSG);
                    } else {
                        logger.info(' delTag ' + ' success ');
                        res.send(200, {succeed: true});
                        next();
                    }
                }
            )
        }
    });

}


module.exports = {
    getTag: getTag,
    addTags:addTags,
    deleteTags:deleteTags
};