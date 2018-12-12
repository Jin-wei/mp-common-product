/**
 * Created by xinxie on 11/17/16.
 */


var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ProdTypeTagDao.js');

function addProdTypeTag(params , callback){
    var query = "insert into prod_type_tag (tenant,biz_id,type_id,tag_id,active) values(?,?,?,?,?)";
    var paramArr = [], i = 0;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.bizId==null?0:Number(params.bizId);
    paramArr[i++] = params.prodTypeId;
    paramArr[i++] = params.tagId;
    paramArr[i++] = params.active;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addProductTypeTag ')
        return callback(error,rows);
    });

}
function delProdTypeTag(params , callback){

    var query='delete FROM prod_type_tag where tenant=? and tag_id=? and type_id=?'

    var paramArr = [] , i = 0;

    paramArr[i++] = params.tenant;
    paramArr[i++] = params.tagId;
    paramArr[i++] = params.prodTypeId;

    if (params.bizId !=null && params.bizId>0){
        query+=" and biz_id=?"
        paramArr[i++] = Number(params.bizId);
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delProdTypeTag ')
        return callback(error,rows);
    })
}

module.exports = {
    addProdTypeTag: addProdTypeTag,
    delProdTypeTag:delProdTypeTag
};