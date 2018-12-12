/**
 * Created by jzou on 7/22/16.
 */
var dateUtil=require('mp-common-util').dateUtil;
var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('LovDao.js');

function searchLov(sc,callback){
    var query = " SELECT id,name,description,timestamp_val timestampVal, " +
        "created_on createdOn,updated_on updatedOn, created_by createdBy, updated_by updatedBy from lov where tenant= ? and name=? " ;
    //Set mysql query parameters array
    var paramArr=[],i=0;
    paramArr[i++] =sc.tenant;
    paramArr[i++] =sc.key;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchLov ')
        return callback(error,rows);
    })
}

function updateLov(params,callback){
    var query = "update lov set timestamp_val=?, updated_by=? where tenant= ? and name=?";
    var paramArr = [], i = 0;
    //covert javascript time to mysql time
    paramArr[i++] = dateUtil.getDateFormat(params.timestampVal,'yyyy-MM-dd hh:mm:ss');
    paramArr[i++] = params.authUserId;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.key;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addLov ')
        return callback(error,rows);
    });
}

module.exports = {
    searchLov: searchLov,
    updateLov:updateLov
};