/**
 * Created by Rina on 9/21/16.
 */

/**
 * PROD IMAGE
 */

//prod
var PERMISSION_CREATE_PRODS="addProds";
var PERMISSION_UPDATE_PRODS="updateProds";
var PERMISSION_DEL_PRODS="deleteProds";
var PERMISSION_GET_PRODEXTRA="getProdsExtra"

//prodType
var PERMISSION_CREATE_PRODTYPES="addProdTypes";
var PERMISSION_UPDATE_PRODTYPES="updateProdTypes";
var PERMISSION_UPDATE_DISPLAYORDERS="updateDisplayOrders";
var PERMISSION_DEL_PRODTYPES="deleteProdTypes";

//prodComment
var PERMISSION_CREATE_PRODCOMMENTS="addProdComments";
var PERMISSION_DEL_PRODCOMMENTS="deleteProdComments";
var PERMISSION_DEL_PRODCOMMENT_BY_USERS="deleteProdCommentByUsers";

//prodImage
var PERMISSION_CREATE_PRODIMAGES="addProdImages";
var PERMISSION_DEL_PRODIMAGES="deleteProdImages";
var PERMISSION_UPDATE_PRODIMAGES="updateProdImages";

//prodTypeImage
var PERMISSION_CREATE_PRODTYPEIMAGES="addProdTypeImages";
var PERMISSION_DEL_PRODTYPEIMAGES="deleteProdTypeImages";
var PERMISSION_UPDATE_PRODTYPEIMAGES="updateProdTypeImages";

//prodSearch
var PERMISSION_CREATE_PRODSEARCHINDEX="addProdSearchIndex";

//prodTag
var PERMISSION_CREATE_PRODTAGS="addProdTags";
var PERMISSION_DEL_PRODTAGS="deleteProdTags";

//prodTypeTag
var PERMISSION_CREATE_PRODTYPETAGS="addProdTypeTags";
var PERMISSION_DEL_PRODTYPETAGS="deleteProdTypeTags";

//tags
var PERMISSION_CREATE_TAGS="addTags";
var PERMISSION_DEL_TAGS="deleteTags";

//biz inventories
var PERMISSION_GET_BIZINVENTORIES="getBizInventories";
var PERMISSION_CREATE_BIZINVENTORIES="addBizInventories";
var PERMISSION_DEL_BIZINVENTORIES="deleteBizInventories";
var PERMISSION_UPDATE_BIZINVENTORIES="updateBizInventories";

module.exports = {
    PERMISSION_CREATE_PRODS: PERMISSION_CREATE_PRODS,
    PERMISSION_UPDATE_PRODS: PERMISSION_UPDATE_PRODS,
    PERMISSION_DEL_PRODS: PERMISSION_DEL_PRODS,
    PERMISSION_GET_PRODEXTRA:PERMISSION_GET_PRODEXTRA,

    PERMISSION_CREATE_PRODTYPES: PERMISSION_CREATE_PRODTYPES,
    PERMISSION_UPDATE_PRODTYPES: PERMISSION_UPDATE_PRODTYPES,
    PERMISSION_UPDATE_DISPLAYORDERS: PERMISSION_UPDATE_DISPLAYORDERS,
    PERMISSION_DEL_PRODTYPES: PERMISSION_DEL_PRODTYPES,

    PERMISSION_CREATE_PRODCOMMENTS: PERMISSION_CREATE_PRODCOMMENTS,
    PERMISSION_DEL_PRODCOMMENTS: PERMISSION_DEL_PRODCOMMENTS,
    PERMISSION_DEL_PRODCOMMENT_BY_USERS: PERMISSION_DEL_PRODCOMMENT_BY_USERS,

    PERMISSION_CREATE_PRODIMAGES: PERMISSION_CREATE_PRODIMAGES,
    PERMISSION_DEL_PRODIMAGES: PERMISSION_DEL_PRODIMAGES,
    PERMISSION_UPDATE_PRODIMAGES:PERMISSION_UPDATE_PRODIMAGES,

    PERMISSION_CREATE_PRODTYPEIMAGES: PERMISSION_CREATE_PRODTYPEIMAGES,
    PERMISSION_DEL_PRODTYPEIMAGES: PERMISSION_DEL_PRODTYPEIMAGES,
    PERMISSION_UPDATE_PRODTYPEIMAGES:PERMISSION_UPDATE_PRODTYPEIMAGES,

    PERMISSION_CREATE_PRODSEARCHINDEX: PERMISSION_CREATE_PRODSEARCHINDEX,

    PERMISSION_CREATE_PRODTAGS:PERMISSION_CREATE_PRODTAGS,
    PERMISSION_DEL_PRODTAGS:PERMISSION_DEL_PRODTAGS,

    PERMISSION_CREATE_TAGS:PERMISSION_CREATE_TAGS,
    PERMISSION_DEL_TAGS:PERMISSION_DEL_TAGS,

    PERMISSION_GET_BIZINVENTORIES:PERMISSION_GET_BIZINVENTORIES,
    PERMISSION_CREATE_BIZINVENTORIES:PERMISSION_CREATE_BIZINVENTORIES,
    PERMISSION_UPDATE_BIZINVENTORIES:PERMISSION_UPDATE_BIZINVENTORIES,
    PERMISSION_DEL_BIZINVENTORIES:PERMISSION_DEL_BIZINVENTORIES,

    PERMISSION_CREATE_PRODTYPETAGS:PERMISSION_CREATE_PRODTYPETAGS,
    PERMISSION_DEL_PRODTYPETAGS:PERMISSION_DEL_PRODTYPETAGS
};