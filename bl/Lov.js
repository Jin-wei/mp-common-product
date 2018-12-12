/**
 * Created by Rina on 9/13/16.
 */
var commonUtil=require('mp-common-util');
var lovDao = require('../dao/LovDao.js');
var responseUtil = commonUtil.responseUtil;
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('Lov.js');

//tag
function getTimestampVal(param,callback) {
    if (param.tenant==null){
        callback(new Error("tenant can not be null"),null)
    }
    if (param.key==null){
        callback(new Error("name can not be null"),null)
    }

    lovDao.searchLov(param, function (error, rows) {
        if (error) {
            logger.error(' getLov ' + error.message);
            callback(error,null);
        } else {
            logger.debug(' getLov ' + ' success ');
            if (rows && rows.length > 0) {
                //logger.debug("timestamp value",rows);
                callback(null,rows[0].timestampVal);
            } else {
                callback(null,null);
            }
        }
    });
}

function updateTimestampVal(param,callback) {
    if (param.tenant==null){
        callback(new Error("tenant can not be null"),null)
    }
    if (param.key==null){
        callback(new Error("key can not be null"),null)
    }
    if (param.timestampVal==null){
        callback(new Error("timestampVal can not be null"),null)
    }

    lovDao.updateLov(param, function (error, result) {
        if (error) {
            logger.error(' updateLov ' + error.message);
            callback(error,null);
        } else {
            if (result.affectedRows>0) {
                logger.debug(' updateLov ' + ' success ');
                callback();
            }else{
                logger.error(' updateLov: no row is updated');
                callback(new Error("no row is updated"));
            }
        }
    });
}


module.exports = {
    getTimestampVal: getTimestampVal,
    updateTimestampVal:updateTimestampVal
};