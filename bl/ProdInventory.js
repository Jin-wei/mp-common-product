/**
 * Created by Rina on 9/13/16.
 */

var inventoryDao = require('../dao/ProdInventoryDao.js');
var commonUtil=require('mp-common-util');
var ReturnType = commonUtil.ReturnType;
var sysMsg = commonUtil.systemMsg; //this follows common checkout's order.js
var responseUtil = commonUtil.responseUtil;
var sysError = commonUtil.systemError;
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ProdInventory.js');
var Seq = require('seq');

function getBizInventories(req, res, next) {
    var params = req.params;
    var tenant = params.tenant;
    var bizId=params.bizId,authBiz=params.authUser.bizId;

    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }

    if (bizId ==null){
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    if(authBiz !=bizId){
        return responseUtil.resNoAuthorizedError(null,res,next);
    }

    inventoryDao.searchProdInventoryCount(params,function(error,rows){
        if (error) {
            logger.error(' searchProdInventoryCount ' + error.message);
            return responseUtil.resetFailedRes(res,error.message,next);
        } else {
            if (rows && rows.length > 0){
                total=rows[0].count;
            }
            if (total>0){
                inventoryDao.searchProdInventory(params, function (error, rows) {
                    if (error) {
                        logger.error(' searchProdInventory ' + error.message);
                        return responseUtil.resetFailedRes(res, error.message, next);
                    } else {
                        logger.info(' searchProdInventory ' + ' success ');
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


function _addAInventory(tenant,bizId,authUserId,params,callback){
    var quantity=params.quantity;
    var note=params.note;
    var productId=params.prodId;

    if (quantity==null){
        return callback(new ReturnType(false,"quantity is missing"));
    }

    if (productId==null){
        return callback(new ReturnType(false,"productId is missing"));
    }

    var inventory = {
        tenant:tenant,
        bizId: bizId,
        quantity: quantity,
        note: note,
        authUserId: authUserId,
        prodId: productId
    };
    inventoryDao.addProdInventory(inventory, function (error, result) {
        if (error) {
            logger.error(' addAInventory ' + error.message);
            if (error.message !=null && error.message.indexOf("ER_DUP_ENTRY")>-1){
                return callback(new ReturnType(false,"Product inventory exists already"));
            }else{
                return callback(new ReturnType(false,error.message));
            }
        } else {
            if (result && result.insertId) {
                var tId = result.insertId;
                return callback(new ReturnType(true,null,tId));
            } else {
                logger.error(' addAInventory ' + error.message);
                return callback(new ReturnType(false,error?error.message:null));
            }
        }
    });
}

function addBizInventories(req, res, next) {
    var result=[];
    var params = req.params;
    var tenant = params.tenant;
    var bizId=params.bizId;
    var inventories=params.inventories;
    var authBiz=params.authUser.bizId;
    var authUserId=params.authUser.userId;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }

    if (bizId ==null){
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    if(authBiz !=bizId){
        return responseUtil.resNoAuthorizedError(null,res,next);
    }

    if (inventories == null) {
        return next(sysError.MissingParameterError("inventories are missing", "inventories are missing"));
    }
    Seq(inventories).seqEach(function(inventory,i){
        var that=this;
        _addAInventory(tenant,bizId,authUserId, inventory,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function deleteBizInventories(req, res, next){
    var result=[];
    var params = req.params;
    var tenant = params.tenant;
    var bizId=params.bizId;
    var inventories=params.inventories;
    var authBiz=params.authUser.bizId;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }

    if (bizId ==null){
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    if(authBiz !=bizId){
        return responseUtil.resNoAuthorizedError(null,res,next);
    }

    if (inventories == null) {
        return next(sysError.MissingParameterError("inventories are missing", "inventories are missing"));
    }

    Seq(inventories).seqEach(function (inventory, i) {
        var that = this;
        _deleteAInventory(tenant, bizId,inventory, function (returnResult) {
            result[i] = returnResult;
            that(null, i);
        });
    }).seq(function () {
        responseUtil.resetQueryRes(res, result, null);
        return next();
    })

}

function _deleteAInventory(tenant, bizId,inventory, callback) {
    inventoryDao.deleteProdInventory({tenant: tenant, id:inventory,bizId:bizId}, function (err, result) {
        var msg = null;
        if (err) {
            logger.error("delete inventory failed", err.message);
            msg = err.message;
            return callback(new ReturnType(false, msg));
        } else {
            if (result.affectedRows > 0)
                return callback(new ReturnType(true, null, inventory));
            else
                return callback(new ReturnType(false,"can not delete this inventory"),inventory);
        }
    });
}

function updateBizInventories(req, res, next) {
    var result=[];
    var params = req.params;
    var tenant = params.tenant;
    var bizId=params.bizId;
    var inventories=params.inventories;
    var authBiz=params.authUser.bizId;
    var authUserId=params.authUser.userId;
    if (tenant == null) {
        responseUtil.resTenantNotFoundError(null, res, next);
    }

    if (bizId ==null){
        return next(sysError.MissingParameterError("bizId is missing", "bizId is missing"));
    }
    if(authBiz !=bizId){
        return responseUtil.resNoAuthorizedError(null,res,next);
    }

    if (inventories == null) {
        return next(sysError.MissingParameterError("inventories are missing", "inventories are missing"));
    }
    Seq(inventories).seqEach(function(inventory,i){
        var that=this;
        _updateAInventory(tenant,bizId,authUserId, inventory,function(returnResult){
            result[i]=returnResult;
            that(null,i);
        });
    }).seq(function(){
        responseUtil.resetQueryRes(res,result,null);
        return next();
    })
}

function decrementProdInventories(tenant, authUserId,note,inventoryItem, callback) {
    inventoryDao.decrementProdInventory({tenant:tenant,bizId:inventoryItem.bizId, prodId:inventoryItem.productId,
        quantity:inventoryItem.quantity,note:note,authUserId:authUserId}, function (error, result) {
        if (error) {
            logger.error(' decrementAInventory ',error);
            return callback(new ReturnType(false,error.message));
        } else {
            if (result.affectedRows>0){
                return callback(new ReturnType(true,null,null));
            } else {
                logger.error(' decrementAInventory: no row updated');
                return callback(new ReturnType(false,"no row updated",null));
            }
        }
    });
}

function _updateAInventory(tenant,bizId,authUserId,params,callback){
    var quantity=params.quantity;
    var note=params.note;
    var id=params.id;

    if (quantity==null){
        return callback(new ReturnType(false,"quantity is missing"));
    }

    if (id==null){
        return callback(new ReturnType(false,"inventory id is missing"));
    }
    var inventory = {
        tenant:tenant,
        bizId: bizId,
        quantity: quantity,
        note: note,
        authUserId: authUserId,
        id: id
    };
    inventoryDao.updateProdInventory(inventory, function (error, result) {
        if (error) {
            logger.error(' updateAInventory ' + error.message);
            return callback(new ReturnType(false,error.message));
        } else {
            if (result.affectedRows>0){
                return callback(new ReturnType(true,null,id));
            } else {
                logger.error(' updateAInventory ' + error.message);
                return callback(new ReturnType(false,error?error.message:id));
            }
        }
    });
}

module.exports = {
    getBizInventories:getBizInventories,
    deleteBizInventories:deleteBizInventories,
    addBizInventories:addBizInventories,
    updateBizInventories:updateBizInventories,
    decrementProdInventories:decrementProdInventories
};