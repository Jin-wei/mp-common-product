/**
 * Created by jzou on 7/22/16.
 */

var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ProdInventoryDao.js');

function searchProdInventory(sc,callback){
    var query = " SELECT i.id,i.prod_id prodId,i.quantity,i.note,i.biz_id bizId, product.prod_code prodCode, product.weight, " +
        " product.unit_of_measure unitOfMeasure,product.measurement, " +
        " product.prod_size prodSize, product.biz_id supplierId, product.name as productName, product.description, " +
        " ifNull(prod_type.display_order ,9999) typeOrder," +
        " product.name_lang nameLang,product.description_lang descriptionLang,product.ingredient_lang ingredientLang, " +
        " product.biz_name supplierName, " +
        " product.options,product.type_id typeId, product.price, prod_image.img_url imgUrl, product.note productNote,product.active, " +
        " i.created_on createdOn,i.updated_on updatedOn, prod_type.name type, prod_type.name_lang typeLang, " +
        " prod_type.parent_type_id parentTypeId" +
        " FROM prod_inventory i join product on i.prod_id=product.prod_id left join prod_type " +
        " on product.type_id=prod_type.type_id left join prod_image on " +
        " (product.prod_id= prod_image.prod_id and prod_image.primary_flag=1)" +
        " where ";

    //Set mysql query parameters array
    var paramArr=[],i=0;
    query += _getSearchInventoryWhereClause(paramArr,sc);
    query += " group by product.prod_id, prod_image.img_url";
    query += " order by typeOrder,product.name";
    i=paramArr.length;

    if(sc.start!=null && sc.size !=null){
        paramArr[i++] = Number(sc.start);
        paramArr[i++] = Number(sc.size);
        query = query + " limit ? , ? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchProdInventory');
        return callback(error,rows);
    })
}

//prodDao
function searchProdInventoryCount(sc,callback){
    var query = " SELECT count(*) count" +
        " FROM prod_inventory i join product on i.prod_id=product.prod_id left join prod_type on product.type_id=prod_type.type_id" +
        " where  ";

    //Set mysql query parameters array
    var paramArr=[];
    var whereClause=_getSearchInventoryWhereClause(paramArr,sc);

    db.dbQuery(query+whereClause,paramArr,function(error,rows){
        logger.debug('searchProdInventoryCount');
        return callback(error,rows);
    })
}

function _getSearchInventoryWhereClause(paramArr,sc){
    var query="i.tenant= ?",i=0;
    paramArr[i++] =sc.tenant;
    //if bizid is 0 then all biz's product
    if (sc.supplierId !=null && sc.supplierId>0) {
        query += "and product.biz_id=? ";
        paramArr[i++] = Number(sc.supplierId);
    }
    if (sc.prodCode !=null) {
        query += "and product.prod_code=? ";
        paramArr[i++] = sc.prodCode;
    }

    if (sc.parentTypeId){
        query+='and prod_type.parent_type_id=?';
        paramArr[i++] = Number(sc.parentTypeId);
    }
    if (sc.name!=null){
        query+= ' and product.name like ?'
        paramArr[i++] = "%"+sc.name+"%";
    }
    if (sc.prodId){
        query+= 'and product.prod_id=?'
        paramArr[i++] = Number(sc.prodId);
    }
    if (sc.typeId){
        query+= " and product.type_id=?"
        paramArr[i++] = Number(sc.typeId);
    }
    if (sc.bizId){
        query+= " and i.biz_id=?"
        paramArr[i++] = Number(sc.bizId);
    }
    return query;
}

function addProdInventory(params,callback){
    var query = "insert into prod_inventory(tenant,prod_id,biz_id,quantity,note,created_by,updated_by) values(?,?,?,?,?,?,?)";
    var paramArr = [], i = 0;
    paramArr[i++] = params.tenant;
    paramArr[i++] = Number(params.prodId);
    paramArr[i++] = Number(params.bizId);
    paramArr[i++] = params.quantity;
    paramArr[i++] = params.note;
    paramArr[i++] = Number(params.authUserId);
    paramArr[i++] = Number(params.authUserId);

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addProdInventory ')
        return callback(error,rows);
    });

}

function updateProdInventory(params,callback){
    var query = "update prod_inventory set quantity=?,note=?,updated_by=? where tenant=? and id=? and biz_id=?";
    var paramArr = [], i = 0;
    paramArr[i++] = params.quantity;
    paramArr[i++] = params.note;
    paramArr[i++] = Number(params.authUserId);
    paramArr[i++] = params.tenant;
    paramArr[i++] = Number(params.id);
    paramArr[i++] = Number(params.bizId);

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateProdInventory ')
        return callback(error,rows);
    });
}


function decrementProdInventory(params,callback){
    var query = "update prod_inventory set quantity=(quantity-?),note=?,updated_by=? where tenant=? and prod_id=? and biz_id=?";
    var paramArr = [], i = 0;
    paramArr[i++] = params.quantity;
    paramArr[i++] = params.note;
    paramArr[i++] = Number(params.authUserId);
    paramArr[i++] = params.tenant;
    paramArr[i++] = Number(params.prodId);
    paramArr[i++] = Number(params.bizId);

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' decrementProdInventory ')
        return callback(error,rows);
    });
}

function deleteProdInventory(params ,callback){

    var query='delete FROM prod_inventory where tenant=? and id=? and biz_id=?'

    var paramArr = [] , i = 0;

    paramArr[i++] = params.tenant;
    paramArr[i++] = Number(params.id);
    paramArr[i++] = Number(params.bizId);

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteProdInventory ')
        return callback(error,rows);
    })
}

module.exports = {
    searchProdInventory: searchProdInventory,
    searchProdInventoryCount:searchProdInventoryCount,
    addProdInventory:addProdInventory,
    deleteProdInventory:deleteProdInventory,
    updateProdInventory:updateProdInventory,
    decrementProdInventory:decrementProdInventory
};