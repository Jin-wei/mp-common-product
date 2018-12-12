/**
 * Created by jzou on 7/22/16.
 */

var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('TagDao.js');

function searchTag(sc,callback){
    var query = " SELECT id,name,name_lang,description,active,display_order,system_flag,display_flag from tag  " +
        "where (tenant= ? OR tenant is null OR tenant='')  " ;

    //Set mysql query parameters array
    var paramArr=[],i=0;
    paramArr[i++] =sc.tenant;
    if(sc.active != null || sc.active ==1){
        query += " and active = 1 ";
    }
    query += " order by display_order";
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchTag ')
        return callback(error,rows);
    })
}

function addTag(params,callback){
    var query = "insert into tag (tenant,name,name_lang,description,active,display_order,system_flag,display_flag) values(?,?,?,?,?,?,?,?)";
    var paramArr = [], i = 0;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.name;
    paramArr[i++] = params.nameLang;
    paramArr[i++] = params.description;
    paramArr[i++] = params.active;
    paramArr[i++] = params.displayOrder;
    paramArr[i++] = params.systemFlag;
    paramArr[i++] = params.displayFlag;


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addTag ')
        return callback(error,rows);
    });

}

function deleteTag(params ,callback){

    var query='delete FROM tag where tenant=? and id=?'

    var paramArr = [] , i = 0;

    paramArr[i++] = params.tenant;
    paramArr[i++] = params.id;
   // paramArr[i++] = params.name;

   if (params.name !=null){
        query+=" and name=?"
        paramArr[i++] = Number(params.name);
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delTag ')
        return callback(error,rows);
    })
}

module.exports = {
    searchTag: searchTag,
    addTag:addTag,
    deleteTag:deleteTag
};