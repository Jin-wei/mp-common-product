/**
 * Created by Rina on 9/22/16.
 */

var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ProdTypeImageDao.js');

//prodTypeImageDao
function getProdTypeImage(params,callback){
    var query = "select pti.* from prod_type_image pti" +
        " where pti.tenant= ? and pti.type_id= ? ";

    var paramArr = [], i = 0;

    paramArr[i++] =params.tenant;
    paramArr[i++] = params.type_id;

    if (params.biz_id !=null && params.biz_id>0){
        query+=" and pti.biz_id = ? ";
        paramArr[i++] =Number(params.biz_id);
    }

    if(params.active != null){
        query += " and pti.active = ?";
        paramArr[i++] = params.active;
    }

    if(params.start!=null && params.size){
        paramArr[i++] = Number(params.start);
        paramArr[i++] = Number(params.size);
        query = query + " limit ? , ? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getProdTypeImage ')
        return callback(error,rows);
    })
}

function addProdTypeImage(params,callback){

  //  _updateProdTypeImageOther(bizId, prodTypeImage , callback);
    var query = "insert into prod_type_image (biz_id,type_id,tenant,img_url,description,active,primary_flag) values(?,?,?,?,?,?,?)";
    var paramArr = [], i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.typeId;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.imgUrl;
    paramArr[i++] = params.description;
    paramArr[i++] = params.active;
    paramArr[i++] = 0;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addProTypeImage ')
        return callback(error,rows);
    });
}

function delProdTypeImage(param ,callback){
    var query='delete FROM prod_type_image where type_id=? and tenant=?'
    var paramArr = [] , i = 0;
    paramArr[i++] = param.typeId;
    paramArr[i++] = param.tenant;

    if(param.imgUrl != null){
        paramArr[i++] = param.imgUrl;
        query = query + " and img_url=? "
    }

    if (param.bizId !=null && param.bizId>0){
        query+=" and biz_id=?";
        paramArr[i++] = Number(param.bizId);
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delProdTypeImage ')
        return callback(error,rows);
    })
}

function updateProdTypeImage(bizId, prodTypeImage , callback){

    _updateProdTypeImageOther(bizId, prodTypeImage , callback);

   var query='update prod_type_image set primary_flag=case when img_url= ?  then 1 else 0 end '+
           'where img_url=? and type_id=? and tenant=?';
    //Set mysql query parameters array
    var paramArr = [] , i = 0;


    paramArr[i++] = prodTypeImage.imgUrl;
    paramArr[i++] = prodTypeImage.imgUrl;
    paramArr[i++] = prodTypeImage.typeId;
    paramArr[i++] = prodTypeImage.tenant;


    if (bizId !=null && bizId>0){
        query+=" and biz_id=? ";
        paramArr[i++] = Number(bizId);
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateProdTypeImage ')
        return callback(error,rows);
    })


}


function _updateProdTypeImageOther(bizId, prodTypeImage , callback){
     var query='update prod_type_image set primary_flag = 0  '

     + 'where tenant=? and type_id=?';

    //Set mysql query parameters array
    var paramArr = [] , i = 0;

    paramArr[i++] = prodTypeImage.tenant;
    paramArr[i++] = prodTypeImage.typeId;


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateProdTypeImage ')
        return callback(error,rows);
    })


}

module.exports = {
    getProdTypeImage: getProdTypeImage,
    addProdTypeImage: addProdTypeImage,
    delProdTypeImage: delProdTypeImage,
    updateProdTypeImage:updateProdTypeImage
};




