/**
 * Created by Rina on 8/1/16.
 */
var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ProdCommentDao.js');

//prodCommentDao
function getProdComment(params,callback){
    var query = "select tenant,comment_id commentId,prod_id prodId,user_id userId,user_name userName,city,comment,rating,createTime,active from prod_comment pc" +
        " where  pc.tenant= ? and pc.prod_id= ? ";
    
    var paramArr = [], i = 0;

    paramArr[i++] =params.tenant;
    paramArr[i++] = params.prodId;

    if (params.bizId !=null && params.bizId>0){
        query +=" and pc.biz_id = ?";
        paramArr[i++] =Number(params.bizId);
    }

    if(params.commentId){
        query+= ' and pc.comment_id=?'
        paramArr[i++] = params.commentId;
    }

    if (params.active!=null){
        query+= "and pc.active=? ";
        paramArr[i++] = params.active;
    }

    if(params.start!=null && params.size){
        paramArr[i++] = Number(params.start);
        paramArr[i++] = Number(params.size);
        query = query + " limit ? , ? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getProdComment ')
        return callback(error,rows);
    })
}

function getProdRating(sc,callback){
    var query = "select count(*) totalCount,AVG(rating) avgRating from prod_comment pc" +
        " where pc.tenant= ? and pc.prod_id= ? ";

    var paramArr = [], i = 0;
    paramArr[i++] = sc.tenant;
   // paramArr[i++] = sc.prodId;
    paramArr[i++] = sc.prodId;

    if (sc.bizId !=null && sc.bizId>0){
        query +=" and pc.biz_id = ?";
        paramArr[i++] = Number(sc.bizId);
    }

    if (sc.active != null){
        query+= "and pc.active=? ";
        paramArr[i++] = sc.active;
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getProdRating ')
        return callback(error,rows);
    })
}

function addProdComment(params,callback){
    var query = "insert into prod_comment (biz_id,prod_id,tenant,comment,rating,user_id,user_name,city,active) values(?,?,?,?,?,?,?,?,?)";
    var paramArr = [], i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.prodId;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.comment;
    paramArr[i++] = params.rating;
    paramArr[i++] = params.userId;
    paramArr[i++] = params.userName;
    paramArr[i++] = params.city;
    paramArr[i++] = params.active;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addProductComment ')
        return callback(error,rows);
    });
}

function delProdComment(params ,callback){
    var query='delete FROM prod_comment where prod_id=? and tenant=?'
    var paramArr = [] , i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.prodId;
    paramArr[i++] = params.tenant;

    if(params.commentId != null){
        paramArr[i++] = params.commentId;
        query = query + " and comment_id=?  "
    }

    if (params.biz_id !=null && params.biz_id>0){
        query +=" and biz_id = ?";
        paramArr[i++] = Number(params.bizId);
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delProdComment ')
        return callback(error,rows);
    })

}

function delProdCommentByUser(userId,params ,callback){
    var query='delete FROM prod_comment where prod_id=? and tenant=? and user_id=?'
    var paramArr = [] , i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.prodId;
    paramArr[i++] = params.tenant;
    paramArr[i++] = userId;

    if(params.commentId != null){
        paramArr[i++] = params.commentId;
        query = query + " and comment_id=?  "
    }

    if (params.bizId !=null && params.bizId>0) {
        query = query + " and biz_id=?  "
        paramArr[i++] = Number(params.bizId);
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delProdCommentByUser ')
        return callback(error,rows);
    })

}

module.exports = {
    getProdComment: getProdComment,
    getProdRating: getProdRating,
    addProdComment: addProdComment,
    delProdComment: delProdComment,
    delProdCommentByUser: delProdCommentByUser
};