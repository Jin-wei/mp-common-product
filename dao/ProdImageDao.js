/**
 * Created by Rina on 8/31/16.
 */

var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ProdImageDao.js');

//prodImageDao
function getProdImage(params,callback){
    var query = "select pi.* from prod_image pi" +
        " where pi.tenant= ? and pi.prod_id= ? ";
    var paramArr = [], i = 0;
    paramArr[i++] =params.tenant;
    paramArr[i++] = params.prod_id;

    if (params.biz_id !=null && params.biz_id>0){
        query+= " and pi.biz_id = ? "
        paramArr[i++] =Number(params.biz_id);
    }

    if(params.active != null){
        query += " and pi.active = ?";
        paramArr[i++] = Number(params.active);
    }

    if(params.start!=null && params.size){
        paramArr[i++] = Number(params.start);
        paramArr[i++] = Number(params.size);
        query = query + " limit ? , ? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getProdImage ')
        return callback(error,rows);
    })
}

function addProdImage(params,callback){
    var query = "insert into prod_image (biz_id,prod_id,tenant,img_url,description,active,img_type,file_name) values(?,?,?,?,?,?,?,?)";
    var paramArr = [], i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.prodId;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.imgUrl;
    paramArr[i++] = params.description;
    paramArr[i++] = params.active;
    paramArr[i++] = params.imgType;
    paramArr[i++] = params.fileName;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addProductImage ')
        return callback(error,rows);
    });
}

function updateProdImage(params,callback){
    var query = "update prod_image set description=?,active=?,img_type=? where prod_id=? and tenant=? and img_url=?";
    var paramArr = [], i = 0;
    paramArr[i++] = params.description;
    paramArr[i++] = params.active;
    paramArr[i++] = params.imgType;
    paramArr[i++] = params.prodId;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.imgUrl;
    if (param.bizId !=null && param.bizId>0){
        query+=" and biz_id=?"
        paramArr[i++] = Number(param.bizId);
    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateProductImage ')
        return callback(error,rows);
    });
}

function delProdImage(param ,callback){
    var query='delete FROM prod_image where prod_id=? and tenant=? '
    var paramArr = [] , i = 0;
    paramArr[i++] = param.prodId;
    paramArr[i++] = param.tenant;

    if(param.imgUrl != null){
        paramArr[i++] = param.imgUrl;
        query = query + " and img_url=? "
    }
    if(param.imgId != null){
        paramArr[i++] = param.imgId;
        query = query + " and img_id=? "
    }
    if(param.imgType != null){
        paramArr[i++] = param.imgType;
        query = query + " and img_type=? "
    }
    if (param.bizId !=null && param.bizId>0){
        query+=" and biz_id=?"
        paramArr[i++] = Number(param.bizId);
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delProdImage ')
        return callback(error,rows);
    })

}

function updateBizProdPrimaryImage(bizId, prodId, imgUrl, prod , callback){

    var query='UPDATE prod_image SET primary_flag = CASE ' +
        'WHEN prod_id = ? AND img_url = ? THEN 1 ELSE 0 END '+
        'WHERE prod_id=? and tenant=? ';

    //Set mysql query parameters array
    var paramArr = [] , i = 0;
    paramArr[i++] =  Number(prodId);
    paramArr[i++] = imgUrl;
    paramArr[i++] =  Number(prodId);
    paramArr[i++] = prod.tenant;

    if (bizId!=null && bizId>0){
        query+=" and biz_id=?";
        paramArr[i++] = Number(bizId);
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizProdPrimaryImage ')
        return callback(error,rows);
    })

}

function updateImageDescription(param, callback) {
    var query = 'UPDATE prod_image SET description = ? ' +
        'WHERE prod_id=? and img_url = ? and tenant=? ';

    //Set mysql query parameters array
    var paramArr = [], i = 0;
    paramArr[i++] = param.description;
    paramArr[i++] = param.prodId;
    paramArr[i++] = param.imgUrl;
    paramArr[i++] = param.tenant;

    logger.debug('param prodId：'+param.prodId)
    if (param.bizId != null && param.bizId > 0) {
        query += " and biz_id=?";
        paramArr[i++] = param.bizId;
    }

    db.dbQuery(query, paramArr, function (error, rows) {
        logger.debug(' updateImageDescription ')
        return callback(error, rows);
    })
}

module.exports = {
    updateProdImage:updateProdImage,
    getProdImage: getProdImage,
    addProdImage: addProdImage,
    delProdImage: delProdImage,
    updateBizProdPrimaryImage: updateBizProdPrimaryImage,
    updateImageDescription:updateImageDescription
};