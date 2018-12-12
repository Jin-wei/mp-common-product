/**
 * Created by xinxie on 11/17/16.
 */


var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ProdTagDao.js');

function addProdTag(params , callback){
    var query = "insert into prod_tag (tenant,biz_id,prod_id,tag_id,active) values(?,?,?,?,?)";
    var paramArr = [], i = 0;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.prodId;
    paramArr[i++] = params.tagId;
    paramArr[i++] = params.active;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addProductTag ')
        return callback(error,rows);
    });

}
function delProdTag(params , callback){

    var query='delete FROM prod_tag where tenant=? and tag_id=? and prod_id=?'

    var paramArr = [] , i = 0;

    paramArr[i++] = params.tenant;
    paramArr[i++] = params.tagId;
    paramArr[i++] = params.prodId;

    if (params.bizId !=null && params.bizId>0){
        query+=" and biz_id=?"
        paramArr[i++] = Number(params.bizId);
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delProdTag ')
        return callback(error,rows);
    })
}

module.exports = {
    addProdTag: addProdTag,
    delProdTag:delProdTag
};