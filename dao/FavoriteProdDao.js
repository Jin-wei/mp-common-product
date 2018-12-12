/**
 * Created by jzou on 7/22/16.
 */

var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('FavoriteProdDao.js');

function searchFavorite(sc,callback){
    var query = " SELECT product.prod_id prodId, product.prod_code prodCode, product.weight, product.measurement, " +
        "product.prod_size prodSize, product.biz_id bizId, product.name as productName, product.description, " +
        "ifNull(prod_type.display_order ,9999) typeOrder," +
        " product.name_lang nameLang,product.description_lang descriptionLang,product.ingredient_lang ingredientLang, " +
        "product.price, product.biz_name bizName, " +
        " product.options,product.type_id typeId, product.price, prod_image.img_url imgUrl, product.note, " +
        " product.created_on createdOn,product.updated_on updatedOn, prod_type.name type, prod_type.name_lang typeLang, " +
        "prod_type.parent_type_id parentTypeId" +
        " FROM favorite_prod f, product left join prod_type on product.type_id=prod_type.type_id " +
        "left join prod_image on (product.prod_id= prod_image.prod_id and prod_image.primary_flag=1)" +
        " where f.prod_id=product.prod_id and " +
        " product.tenant= ? and f.user_id=? and product.active=1 ";

    //Set mysql query parameters array
    var paramArr=[],i=0;
    paramArr[i++] =sc.tenant;
    paramArr[i++] =sc.userId;
    //if bizid is 0 then all biz's product
    if (sc.biz_id !=null && sc.biz_id>0) {
        query += "and product.biz_id=? ";
        paramArr[i++] = Number(sc.biz_id);
    }
    if (sc.prodCode !=null) {
        query += "and product.prod_code=? ";
        paramArr[i++] = sc.prodCode;
    }

    if (sc.parent_type_id){
        query+='and prod_type.parent_type_id=?';
        paramArr[i++] = sc.parent_type_id;
    }
    if (sc.name!=null){
        query+= ' and product.name like ?'
        paramArr[i++] = "%"+sc.name+"%";
    }
    if (sc.prod_id){
        query+= 'and product.prod_id=?'
        paramArr[i++] = sc.prod_id;
    }
    if (sc.type_id){
        query+= " and product.type_id=?"
        paramArr[i++] = sc.type_id;
    }

    query += " order by f.updated_on desc";

    if(sc.start!=null && sc.size !=null){
        paramArr[i++] = Number(sc.start);
        paramArr[i++] = Number(sc.size);
        query = query + " limit ? , ? "
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchBizProd');
        return callback(error,rows);
    })
}

function addFavorite(params,callback){
    var query = "insert into favorite_prod (tenant,prod_id,user_id,created_by) values(?,?,?,?)";
    var paramArr = [], i = 0;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.prodId;
    paramArr[i++] = params.userId;
    paramArr[i++] = params.createdBy;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addFavorite ')
        return callback(error,rows);
    });

}

function deleteFavorite(params ,callback){

    var query='delete FROM favorite_prod where tenant=? and prod_id=? and user_id=?'

    var paramArr = [] , i = 0;

    paramArr[i++] = params.tenant;
    paramArr[i++] = params.prodId;
    paramArr[i++] = params.userId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteFavorite ')
        return callback(error,rows);
    })
}

module.exports = {
    searchFavorite: searchFavorite,
    addFavorite:addFavorite,
    deleteFavorite:deleteFavorite
};