/**
 * Created by Rina on 6/29/16.
 */

var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ProdTypeDao.js');

//prodTypeDao
function searchBizProdType(sc,callback){
    var query = "SELECT prod_type.type_id typeId, prod_type.biz_id bizId, prod_type.name name, prod_type.name_lang nameLang," +
        "prod_type.display_order displayOrder,prod_type.parent_type_id parentTypeId,prod_type_image.img_url imgUrl,prod_type.description " +
        "from prod_type left join prod_type_image on (prod_type.type_id=prod_type_image.type_id and prod_type_image.primary_flag=1) where prod_type.tenant=? " ;

    var paramArr=[],i=0;
    paramArr[i++]=sc.tenant;

    if (sc.bizId !=null && sc.bizId>0){
        query +=" and prod_type.biz_id=?";
        paramArr[i++] =Number(sc.bizId);
    }
    if (sc.name){
        query+=' and prod_type.name=?';
        paramArr[i++] = sc.name;
    }
    if(sc.typeId){
        query+= ' and prod_type.type_id=?'
        paramArr[i++] = sc.typeId;
    }
    query += ' order by prod_type.display_order and prod_type.name ';

    if(sc.start!=null && sc.size){
        paramArr[i++] = Number(sc.start);
        paramArr[i++] = Number(sc.size);
        query = query + " limit ? , ? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchBizProd ')
        return callback(error,rows);
    })
}

function searchBizProdCountByProdTypeTag(sc,callback){
    var query = "SELECT distinct prod_type.type_id typeId, prod_type.biz_id bizId, prod_type.name, prod_type.name_lang nameLang,prod_type.display_order displayOrder,prod_type.parent_type_id parentTypeId,prod_type.description description, " +
        "prod_type_image.img_url imgUrl,count(product.prod_id) prodCount " +
        "from prod_type left join product on (prod_type.type_id=product.type_id) " +
        "left join prod_type_image on (prod_type.type_id=prod_type_image.type_id and prod_type_image.primary_flag=1) ," +
        "prod_type_tag where prod_type.type_id= prod_type_tag.type_id and " +
        "prod_type_tag.tag_id=? and prod_type.tenant=? " ;

    var paramArr=[],i=0;

    paramArr[i++]=Number(sc.tagId);
    paramArr[i++]=sc.tenant;
    if (sc.bizId !=null && sc.bizId>0){
        query +=" and prod_type.biz_id=? "
        paramArr[i++] =Number(sc.bizId);
    }
    query += ' group by prod_type.type_id, prod_type.name, prod_type.name_lang,prod_type.display_order,prod_type.parent_type_id,prod_type_image.img_url ';

    if (sc.bizId !=null && sc.bizId>0){
        query +=",prod_type.biz_id";
    }
    query += 'order by prod_type.display_order,prod_type.name ';

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchBizProd ')
        return callback(error,rows);
    })
}

function searchProdTypeByTagCount(sc,callback){
    var query = "SELECT count(*) count from prod_type," +
        "prod_type_tag where prod_type.type_id= prod_type_tag.type_id and ";
    var paramArr=[];
    var whereClause=_getsearchProdTypeByTagWhereClause(paramArr,sc);
    query += whereClause;
    query += 'order by prod_type.display_order,prod_type.name ';

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchProdTypeByTagCount ')
        return callback(error,rows);
    })

}
function searchProdTypeByTag(sc,callback){
    var query = "SELECT prod_type.type_id typeId, prod_type.biz_id bizId, prod_type.name, prod_type.name_lang nameLang," +
        "prod_type.display_order displayOrder," +
        "prod_type.parent_type_id parentTypeId,prod_type.description description, " +
        "prod_type_image.img_url imgUrl from prod_type left join prod_type_image on " +
        "(prod_type.type_id=prod_type_image.type_id and prod_type_image.primary_flag=1) ," +
        "prod_type_tag where prod_type.type_id= prod_type_tag.type_id and ";
    var paramArr=[];
    var whereClause=_getsearchProdTypeByTagWhereClause(paramArr,sc);
    query += whereClause;
    query += 'order by prod_type.display_order,prod_type.name ';

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchProdTypeByTag ')
        return callback(error,rows);
    })
}

function _getsearchProdTypeByTagWhereClause(paramArr,sc){
    var i=0;
    var query= "prod_type_tag.tag_id=? and prod_type.tenant=? " ;

    paramArr[i++]=Number(sc.tagId);
    paramArr[i++]=sc.tenant;
    if (sc.bizId !=null && sc.bizId>0){
        query +=" and prod_type.biz_id=? "
        paramArr[i++] =Number(sc.bizId);
    }

    if (sc.bizId !=null && sc.bizId>0){
        query +=",prod_type.biz_id";
    }
    return query;
}



function searchBizProdTypeImage(sc,callback) {
    var query = "SELECT type_id typeId,img_url imgUrl,active,primary_flag primaryFlag,description from prod_type_image where type_id=? and tenant=?";
    var paramArr = [], i = 0;
    paramArr[i++] = Number(sc.typeId);
    paramArr[i++] = sc.tenant;

    if (sc.bizId !=null && sc.bizId>0){
        query+=" and biz_id=? ";
        paramArr[i++] = Number(sc.bizId);
    }
    db.dbQuery(query, paramArr, function (error, rows) {
        logger.debug(' searchBizProdTypeImage ')
        return callback(error, rows);
    })
}

function searchBizProdTypeTag(sc,callback) {
    var query = "SELECT pt.type_id typeId,pt.tag_id tagId,t.name,t.system_flag systemFlag,t.active from prod_type_tag pt,tag t where pt.tag_id=t.id " +
        " and pt.type_id=? and pt.tenant=?";
    //Set mysql query parameters array
    var paramArr = [], i = 0;
    paramArr[i++] = Number(sc.typeId);
    paramArr[i++] = sc.tenant;

    if (sc.bizId !=null && sc.bizId>0){
        qery+="and pt.biz_id=?";
        paramArr[i++] = Number(sc.bizId);
    }

    db.dbQuery(query, paramArr, function (error, rows) {
        logger.debug(' searchBizProdTypeTag ')
        return callback(error, rows);
    })
}

function addBizProdType(type,callback){
    var query = "insert into prod_type(biz_id,tenant,name,name_lang,active,display_order,parent_type_id,external_id,description) values(?,?,?,?,?,?,?,?,?)" ;

    //Set mysql query parameters array
    var paramArr = [] , i = 0;
    paramArr[i++] = type.bizId;
    paramArr[i++] = type.tenant;
    paramArr[i++] = type.name;
    paramArr[i++] = type.nameLang;
    paramArr[i++] = type.active;
  //  paramArr[i++] = type.createdBy;
    paramArr[i++] = type.displayOrder;
 //   paramArr[i++] = type.typeCode;
    paramArr[i++] = type.parentTypeId;
    paramArr[i++] = type.externalId;
    paramArr[i++] = type.description;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizProdType ')
        return callback(error,rows);
    })
}

function updateBizProdType(tenant, param, callback) {
    var query = "update prod_type set name = ?,name_lang = ?,description = ?,display_order = ?,parent_type_id=?,external_id=? where type_id=? and tenant=?";

    //Set mysql query parameters array
    var paramArr = [] , i = 0;
    paramArr[i++] = param.name;
    paramArr[i++] = param.nameLang;
    paramArr[i++] = param.description;
    paramArr[i++] = param.displayOrder;
    paramArr[i++] = param.parentTypeId;
    paramArr[i++] = param.externalId;
    paramArr[i++] = param.typeId;
    paramArr[i++] = tenant;
    db.dbQuery(query, paramArr, function (error, rows) {
        logger.debug(' updateBizProdType ')
        return callback(error, rows);
    })
}

function updateTypeOrderById(param ,callback){
    var query = "update prod_type set display_order= ? where type_id =? and tenant = ?";
    var paramArr = [] , i = 0;
    paramArr[i++] = param.displayOrder;
    paramArr[i++] = param.typeId;
    paramArr[i++] = param.tenant;

    if (param.bizId !=null && param.bizId>0){
        query+=" and biz_id = ?";
        paramArr[i++] = Number(param.bizId);
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateTypeOrderById ')
        return callback(error,rows);
    })
}

function delBizProdType(param ,callback){
    var query='delete FROM prod_type where type_id=? and tenant=?;'
    var paramArr = [] , i = 0;

    paramArr[i++] = param.typeId;
    paramArr[i++] = param.tenant;

    if (param.bizId !=null && param.bizId>0){
        query+=" and biz_id=?";
        paramArr[i++] = Number(param.bizId);
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delBizProdType ')
        return callback(error,rows);
    })

}


module.exports = {
    searchBizProdType: searchBizProdType,
    searchBizProdCountByProdTypeTag: searchBizProdCountByProdTypeTag,
    searchBizProdTypeImage: searchBizProdTypeImage,
    searchBizProdTypeTag: searchBizProdTypeTag,
    addBizProdType: addBizProdType,
    updateBizProdType: updateBizProdType,
    updateTypeOrderById: updateTypeOrderById,
    delBizProdType: delBizProdType,
    searchProdTypeByTagCount:searchProdTypeByTagCount,
    searchProdTypeByTag:searchProdTypeByTag
};
