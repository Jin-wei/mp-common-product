/**
 * Created by Rina on 6/29/16.
 */

var db=require('../db/db.js');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('ProdDao.js');

//todo communicate with front end to depericate it
function getProdExtension(sc,callback){
    var query = " SELECT product.prod_id prodId," +
        "product.floor_price AS floorPrice, product.wholesale_price AS wholesalePrice,min_purchase_quantity minPurchaseQuantity, " +
        "tax_included taxIncluded, tax, transport_fee_payee transportFeePayee"+
        " FROM product where product.tenant= ? and product.prod_id=? ";
    var paramArr=[],i=0;
    paramArr[i++] =sc.tenant;
    paramArr[i++] =sc.prodId;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getProdExtensions');
        return callback(error,rows);
    })
}

function searchProdExtension(sc,callback){
    var query = " SELECT product.prod_id prodId, product.prod_code prodCode, product.weight, product.unit_of_measure unitOfMeasure,product.measurement, " +
        " product.prod_size prodSize, product.biz_id bizId, product.name as productName, product.description, ifNull(prod_type.display_order ,9999) typeOrder," +
        " product.name_lang nameLang,product.description_lang descriptionLang,product.ingredient_lang ingredientLang, product.biz_name bizName, " +
        " product.floor_price AS floorPrice, product.wholesale_price AS wholesalePrice,min_purchase_quantity minPurchaseQuantity, " +
        " product.options,product.type_id typeId, product.price, prod_image.img_url imgUrl, product.note,product.active, " +
        " product.created_on createdOn,product.updated_on updatedOn, prod_type.name type, prod_type.name_lang typeLang, prod_type.parent_type_id parentTypeId," +
        " count(prod_comment.comment) commentCount,avg(prod_comment.rating) avgRating " +
        " FROM product " +
        " left join prod_type on product.type_id=prod_type.type_id " +
        " left join prod_image on (product.prod_id= prod_image.prod_id and prod_image.primary_flag=1)" +
        " left join prod_comment on product.prod_id=prod_comment.prod_id " +
        " left join product_label on product.prod_id = product_label.prod_id " +
        " left join all_label on product_label.label_id = all_label.id" +
        " where ";
    //Set mysql query parameters array
    var paramArr=[],i=0;
    query += _getSearchProdWhereClause(paramArr,sc);
    query += " group by product.prod_id, prod_image.img_url";
    query += " order by typeOrder,product.name";
    i=paramArr.length;

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

//prodDao
function searchBizProd(sc,callback){
    var query = " SELECT product.tenant,product.prod_id prodId, product.prod_code prodCode, product.weight, product.unit_of_measure unitOfMeasure,product.measurement, product.prod_size prodSize, product.biz_id bizId, product.name as productName, product.description, ifNull(prod_type.display_order ,9999) typeOrder," +
        " product.name_lang nameLang,product.description_lang descriptionLang,product.ingredient_lang ingredientLang, product.biz_name bizName, " +
        " product.options,product.type_id typeId, product.price, prod_image.img_url imgUrl, product.note,product.active, " +
        " product.created_on createdOn,product.updated_on updatedOn, prod_type.name type, prod_type.name_lang typeLang, prod_type.parent_type_id parentTypeId," +
        " count(prod_comment.comment) commentCount,avg(prod_comment.rating) avgRating " +
        " FROM product " +
        " left join prod_type on product.type_id=prod_type.type_id " +
        " left join prod_image on (product.prod_id= prod_image.prod_id and prod_image.primary_flag=1)" +
        " left join prod_comment on product.prod_id=prod_comment.prod_id " +
        " left join product_label on product.prod_id=product_label.prod_id " +
        " left join all_label on product_label.label_id=all_label.id " +
        " where ";

    //Set mysql query parameters array
    var paramArr=[],i=0;
    query += _getSearchProdWhereClause(paramArr,sc);
    query += " group by product.prod_id, prod_image.img_url";
    query += " order by typeOrder,product.name";
    i=paramArr.length;

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

//prodDao
function searchProdCount(sc,callback){
    var query = " SELECT count(*) count" +
        " FROM product " +
        "left join prod_type on product.type_id=prod_type.type_id " +
        "left join product_label on product.prod_id = product_label.prod_id " +
        "left join all_label on product_label.label_id = all_label.id" +
        " where  ";

    //Set mysql query parameters array
    var paramArr=[];
    var whereClause=_getSearchProdWhereClause(paramArr,sc);

    db.dbQuery(query+whereClause,paramArr,function(error,rows){
        logger.debug('searchProdCount');
        return callback(error,rows);
    })
}

function _getSearchProdWhereClause(paramArr,sc){
    var query="product.tenant= ? ",i=0;
    paramArr[i++] =sc.tenant;
    //if bizid is 0 then all biz's product
    if (sc.biz_id !=null && sc.biz_id>0) {
        query += " and product.biz_id=? ";
        paramArr[i++] = Number(sc.biz_id);
    }
    if (sc.prodCode !=null) {
        query += " and product.prod_code=? ";
        paramArr[i++] = sc.prodCode;
    }

    if (sc.active !=null){
        query+= "and product.active=? ";
        paramArr[i++] = sc.active;
    }

    if (sc.parent_type_id){
        query+=' and prod_type.parent_type_id=?';
        paramArr[i++] = sc.parent_type_id;
    }
    if (sc.name!=null){
        query+= ' and (product.name like ? or all_label.label_name like ?)';
        paramArr[i++] = "%"+sc.name+"%";
        paramArr[i++] = "%"+sc.name+"%";
    }
    if (sc.prod_id){
        query+= ' and product.prod_id=?'
        paramArr[i++] = sc.prod_id;
    }
    if (sc.type_id){
        query+= " and product.type_id=?"
        paramArr[i++] = sc.type_id;
    }
    return query;
}

function searchBizProdByTag(sc,callback){
    var query = "SELECT p.prod_id prodId, p.biz_id bizId, p.name productName,p.name_lang nameLang, p.description,p.type_id typeId,pt.name type,p.prod_code prodCode, p.price,ifNull(pt.display_order ,9999) typeOrder," +
        " img.img_url imgUrl,img.description imgDescription,p.note,p.active, p.created_on createdOn, p.updated_on updatedOn,p.description_lang descriptionLang,p.active,p.calorie,p.ingredient,p.ingredient_lang ingredientLang,pt.parent_type_id parentTypeId " +
        "FROM product p left join prod_type pt on p.type_id = pt.type_id left join prod_tag tag on p.prod_id = tag.prod_id left join prod_image img on " +
        "(p.prod_id = img.prod_id and img.primary_flag=1)" +
        " where tag.tag_id=? and p.tenant= ? " ;

    //Set mysql query parameters array
    var paramArr=[],i=0;
    paramArr[i++] =Number(sc.tag_id);
    paramArr[i++] =sc.tenant;
    if(sc.active != null && sc.active ==1){
        query += " and p.active=1 ";
    }
    if (sc.biz_id !=null && sc.biz_id>0){
        query+=' and p.biz_id=?';
        paramArr[i++] = Number(sc.biz_id);
    }
    if (sc.typeId){
        query+=' and p.type_id=?';
        paramArr[i++] = sc.type_id;
    }
    if (sc.prodId){
        query+= ' and p.prod_id=?';
        paramArr[i++] = sc.prod_id;
    }
    if (sc.name){
        query+=' and p.name=?'
        paramArr[i++]=sc.name;
    }
    query += "  order by typeOrder , p.name";
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchBizProdByTag ')
        return callback(error,rows);
    })
}

function searchBizProdImage(sc,callback) {
    var query = "SELECT prod_id,img_url,active,primary_flag,description,img_type,file_name from prod_image where prod_id=? and tenant=?";  //?

    //Set mysql query parameters array
    var paramArr = [], i = 0;
    paramArr[i++] = Number(sc.prod_id);
    paramArr[i++] = sc.tenant;

    if (sc.biz_id !=null && sc.biz_id>0){
        query+="and biz_id=?";
        paramArr[i++] = Number(sc.biz_id);
    }

    db.dbQuery(query, paramArr, function (error, rows) {
        logger.debug(' searchBizProdImage ')
        return callback(error, rows);
    })
}

function searchBizProdTag(sc,callback) {
    var query = "SELECT pt.prod_id,pt.tag_id,t.name,t.system_flag,t.active from prod_tag pt,tag t where pt.tag_id=t.id " +
        " and pt.prod_id=? and pt.tenant=?";

    //Set mysql query parameters array
    var paramArr = [], i = 0;
    paramArr[i++] = Number(sc.prod_id);
    paramArr[i++] = sc.tenant;
    if (sc.biz_id !=null && sc.biz_id>0){
        query+="and pt.biz_id=? ";
        paramArr[i++] = Number(sc.biz_id);
    }

    db.dbQuery(query, paramArr, function (error, rows) {
        logger.debug(' searchBizProdTag ')
        return callback(error, rows);
    })
}

function listBizProd(params,callback){

    var query = "select product.prod_id,product.biz_id,product.name as productName,product.name_lang,ifNull(prod_type.display_order ,9999) typeOrder, " +
        "product.description, product.description_lang,product.type_id,prod_type.name as typeName,product.price, " +
        "product.img_url,product.updated_on,product.active,product.options,product.calorie,product.ingredient,product.ingredient_lang, " +
        "from product left join prod_type on prod_type.type_id = product.type_id " +
        "where product.tenant = ?" ;

    //Set mysql query parameters array
    var paramArr=[],i=0;
    paramArr[i++] = params.tenant;
    if (params.bizId !=null && params.bizId>0){
        query +=" and product.biz_id = ? ";
        paramArr[i++] = Number(params.bizId);
    }

    if(params.active != null){
        query += " and product.active = ?";
        paramArr[i++]=params.active;
    }
    query += " order by typeOrder, product.name ";
    db.getCon(function(err, con){
        con.query(query,paramArr, function (error, rows, fields) {
            con.release();
            return callback(error,rows);
        });
    })
}

function addBizProd(params,callback){
    var query = "insert into product(biz_id,tenant,name,name_lang,description,description_lang,type_id,price,options,note,calorie," +
        "ingredient,ingredient_lang," +
        "img_url,prod_code,active,external_id,prod_size,stock,biz_name,weight,unit_of_measure,measurement," +
        "floor_price,wholesale_price,min_purchase_quantity,tax_included,tax, transport_fee_payee) " +
        "values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);" ;

    //Set mysql query parameters array
    var paramArr = [] , i = 0;
    paramArr[i++] = params.bizId;
    paramArr[i++] = params.tenant;
    paramArr[i++] = params.name;
    paramArr[i++] = params.nameLang;
    paramArr[i++] = params.description;
    paramArr[i++] = params.descriptionLang;
    paramArr[i++] = params.typeId;
    paramArr[i++] = params.price;
    paramArr[i++] = params.options;
    paramArr[i++] = params.note;
    paramArr[i++] = params.calorie;
    paramArr[i++] = params.ingredient;
    paramArr[i++] = params.ingredientLang;
    paramArr[i++] = params.imgUrl;
    paramArr[i++] = params.prodCode;
    paramArr[i++] = params.active;
    paramArr[i++] = params.externalId;
    paramArr[i++] = params.prodSize;
    paramArr[i++] = params.stock;
    paramArr[i++] = params.bizName;
    paramArr[i++] = params.weight;
    paramArr[i++] = params.unitOfMeasure;
    paramArr[i++] = params.measurement;
    paramArr[i++] = params.floorPrice;
    paramArr[i++] = params.wholesalePrice;
    paramArr[i++] = params.minPurchaseQuantity;
    paramArr[i++] = params.taxIncluded;
    paramArr[i++] = params.tax;
    paramArr[i++] = params.transportFeePayee;


    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizProd ')
        return callback(error,rows);
    })
}


function updateBizProd(bizId, prodId, prod , callback){

    var query='update product set name = ? , name_lang = ? , description = ? , description_lang = ? , price = ? ,img_url = ? , ' +
        'note = ? , type_id = ? , options = ? , calorie = ? , ingredient=? , ingredient_lang = ? , active = ? , prod_size = ? , ' +
        'stock = ? , prod_code = ? , biz_name = ? , weight = ? , unit_of_measure=?, measurement = ? , external_id = ?, floor_price = ? , ' +
        'wholesale_price = ? ,min_purchase_quantity=?,tax_included=?,tax=?, transport_fee_payee=? ' +
        'where tenant=? and prod_id=? '

    //Set mysql query parameters array
    var paramArr = [] , i = 0;
    paramArr[i++] = prod.name;
    paramArr[i++] = prod.nameLang;
    paramArr[i++] = prod.description;
    paramArr[i++] = prod.descriptionLang;

    paramArr[i++] = prod.price;
    paramArr[i++] = prod.imgUrl;
    paramArr[i++] = prod.note;
    paramArr[i++] = prod.typeId;
    paramArr[i++] = prod.options;
    paramArr[i++] = prod.calorie;
    paramArr[i++] = prod.ingredient;
    paramArr[i++] = prod.ingredientLang;
    paramArr[i++] = prod.active;
    paramArr[i++] = prod.prodSize;
    paramArr[i++] = prod.stock;
    paramArr[i++] = prod.prodCode;
    paramArr[i++] = prod.bizName;
    paramArr[i++] = prod.weight;
    paramArr[i++] = prod.unitOfMeasure;
    paramArr[i++] = prod.measurement;
    paramArr[i++] = prod.externalId;
    paramArr[i++] = prod.floorPrice;
    paramArr[i++] = prod.wholesalePrice;
    paramArr[i++] = prod.minPurchaseQuantity;
    paramArr[i++] = prod.taxIncluded;
    paramArr[i++] = prod.tax;
    paramArr[i++] = prod.transportFeePayee;


    paramArr[i++] = prod.tenant;
    paramArr[i++] = prodId;

    if (bizId !=null && bizId>0){
        query+=" and biz_id=? ";
        paramArr[i++] = Number(bizId);
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' updateBizProd ')
        return callback(error,rows);
    })

}

function delBizProd(params , callback){

    var query='delete FROM product where tenant=? and prod_id=?'

    var paramArr = [] , i = 0;

    paramArr[i++] = params.tenant;
    paramArr[i++] = params.prodId;

    if (params.bizId !=null && params.bizId>0){
        query+=" and biz_id=?"
        paramArr[i++] = Number(params.bizId);
    }

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' delBizProd ')
        return callback(error,rows);
    })
}


function addBizProdLabel(params,callback){
    var query = "insert into product_label(prod_id,label_id) " +
        "values(? , ?);" ;
    var paramArr = [] , i = 0;
    paramArr[i++] = params.prodId;
    paramArr[i] = params.labelId;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addBizProdLabel ');
        return callback(error,rows);
    })
}
function deleteBizProdBaseLabel(prodId,callback){

    var query = "delete from product_label where prod_id=?";
    var paramArr=[],i=0;
    paramArr[i] =prodId;
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' deleteBizProdBaseLabel ');
        return callback(error,rows);
    })
}
function searchBizProdBaseLabel(params,callback){
    var query = "select l.id,l.label_name,l.label_name_lan " +
        "from all_label l,product_label p " +
        "where l.id=p.label_id ";
    var paramArr=[],i=0;
    if(params.prodId){
        query+=' and p.prod_id=?';
        paramArr[i] = params.prodId;
    }
    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchBizProdBaseLabel ');
        return callback(error,rows);
    })
}

function getAllLabel(params,callback){
    var query  = " select * from all_label where 1=1";
    var paramArray=[],i=0;
    if(params.lableName){
        query+=' and label_name like ?';
        paramArray[i++] = '%' + params.lableName + '%';
    }
    if(params.lableNameLan){
        query+=' and label_name_lan like ?';
        paramArray[i++] = '%' + params.lableNameLan + '%';
    }

    if(params.lableNameEQ){
        query+=' and label_name = ?';
        paramArray[i++] = params.lableNameEQ;
    }
    if(params.lableNameLanEQ){
        query+=' and label_name_lan = ?';
        paramArray[i++] = params.lableNameLanEQ;
    }


    if(params.start!=null && params.size !=null){
        paramArray[i++] = Number(params.start);
        paramArray[i++] = Number(params.size);
        query = query + " limit ? , ? "
    }
    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' getAllLabel ');
        return callback(error,rows);
    });
}
function getProdLabel(params,callback){
    var query  = " select a.label_name,a.id,a.label_name_lan from all_label a,product_label pl,product p" +
        " where p.active=1 and a.id=pl.label_id and pl.prod_id=p.prod_id and p.biz_id=? group by a.label_name,a.id";
    var paramArray=[],i=0;
    paramArray[i++] = params.bizId;
    db.dbQuery(query, paramArray ,function(error,rows){
        logger.debug(' getAllLabel ');
        return callback(error,rows);
    });
}

function getProductWithCommentLabel(params , callback){
    var query = "select count(pc.comment) as total_count,avg(pc.rating) as avg_rating,p.*,a.id as label_id,a.label_name " +
        " from product p" +
        " left join product_comment pc on p.prod_id = pc.prod_id " +
        " left join product_label pl on (p.prod_id=pl.prod_id)" +
        " left join all_label a on (pl.label_id=a.id) " +
        " where p.biz_id = ? " ;

    var paramArr = [], i = 0;
    paramArr[i++]=params.bizId;
    if(params.active != null && params.active==1){
        query += " and p.active =1 " ;
    }
    query += " group by p.prod_id,a.id,a.label_name order by p.display_order ";

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' getProductWithComment ');
        return callback(error,rows);
    })

}
function addALlLabel(params,callback){

    var query = "insert into all_label(label_name,label_name_lan,key_word,label_kind) " +
        "values(?,?,?,?);" ;

    //Set mysql query parameters array
    var paramArr = [] , i = 0;
    paramArr[i++] = params.labelName;
    paramArr[i++] = params.labelNameLan;
    paramArr[i++] = params.keyWord;
    paramArr[i] = params.labelKind;

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' addALlLabel ');
        return callback(error,rows);
    })
}


function searchAllList(params,callback){
    var query = "select * from all_label where 1=1 ";
    var paramArr=[],i=0;
    if(params.name != null){
        query+=" and label_name like ?";
        paramArr[i] ='%' + params.name + '%';
    }
    query += " order by label_name";

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchAllList');
        return callback(error,rows);
    })
}

function searchAllPord(params,callback){
    var query = "select * from product where tenant=? ";
    var paramArr=[],i=0;
    paramArr[i++]=params.tenant;
    if(params.name != null){
        query+=" and name like ?";
        paramArr[i++] ='%' + params.name + '%';
    }
    if (params.active !=null){
        query+= "and product.active=? ";
        paramArr[i] = params.active;
    }
    query += " order by name";

    db.dbQuery(query,paramArr,function(error,rows){
        logger.debug(' searchAllList');
        return callback(error,rows);
    })
}
module.exports = {
    searchBizProd: searchBizProd,
    searchBizProdByTag: searchBizProdByTag,
    searchBizProdImage: searchBizProdImage,
    searchBizProdTag: searchBizProdTag,
    listBizProd: listBizProd,
    addBizProd: addBizProd,
    updateBizProd: updateBizProd,
    delBizProd: delBizProd,
    getProdExtension:getProdExtension,
    searchProdCount:searchProdCount,
    searchProdExtension:searchProdExtension,

    addBizProdLabel:addBizProdLabel,
    deleteBizProdBaseLabel:deleteBizProdBaseLabel,
    searchBizProdBaseLabel:searchBizProdBaseLabel,
    getAllLabel:getAllLabel,
    getProdLabel:getProdLabel,
    getProductWithCommentLabel:getProductWithCommentLabel,
    addALlLabel:addALlLabel,
    searchAllList:searchAllList,
    searchAllPord:searchAllPord
};