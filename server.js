// Copyright (c) 2012 Mark Cavage. All rights reserved.

var path = require('path');
var util = require('util');

var commonUtil = require('mp-common-util');
var authHeaderParser = commonUtil.authHeaderParser;
var authCheck = commonUtil.authCheck;
var restify = require('restify');
var sysConfig = require('./config/SystemConfig.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('Server.js');
var listOfValue = require('./util/ListOfValue.js');


var prod=require('./bl/Prod.js');
var prodType=require('./bl/ProdType.js');
var prodComment=require('./bl/ProdComment.js');
var prodImage=require('./bl/ProdImage.js');
var prodTypeImage=require('./bl/ProdTypeImage.js');
var prodInventory=require('./bl/ProdInventory.js');
var search = require('./bl/Search.js');
var tag = require('./bl/Tag.js');
var favoriteProd = require('./bl/FavoriteProd.js');
///--- API

/**
 * Returns a server with all routes defined on it
 */
function createServer() {
    // Create a server with our logger and custom formatter
    // Note that 'version' means all routes will default to
    // 1.0.0
    var server = restify.createServer({
        name: 'Product',
        version: '1.0.0'
    });

    var authUrl=sysConfig.loginModuleUrl.protocol+"://"+sysConfig.loginModuleUrl.host+":"+sysConfig.loginModuleUrl.port+"/api/auth/tokens";
    logger.debug(authUrl);

    // Ensure we don't drop data on uploads
    //server.pre(restify.pre.pause());

    // Clean up sloppy paths like //todo//////1//
    server.pre(restify.pre.sanitizePath());

    // Handles annoying user agents (curl)
    server.pre(restify.pre.userAgentConnection());

    // Set a per request bunyan logger (with requestid filled in)
    //server.use(restify.requestLogger());

    // Allow 50 requests/second by IP, and burst to 100
    server.use(restify.throttle({
        burst: 100,
        rate: 50,
        ip: true
    }));

    restify.CORS.ALLOW_HEADERS.push('auth-token');
    restify.CORS.ALLOW_HEADERS.push('tenant');
    restify.CORS.ALLOW_HEADERS.push('client-id');
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Origin");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Credentials");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods", "GET");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods", "POST");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods", "PUT");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods", "DELETE");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Headers", "accept,api-version, content-length, content-md5,x-requested-with,content-type, date, request-id, response-time");
    server.use(restify.CORS());
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.dateParser());
    server.use(restify.authorizationParser());
    server.use(restify.queryParser());
    server.use(restify.gzipResponse());
    server.use(restify.fullResponse());
    server.use(restify.bodyParser({uploadDir: __dirname + '/uploads/'}));
    server.use(authHeaderParser.authHeaderParser({logger:logger,authUrl:authUrl}));

    // Now our own handlers for authentication/authorization
    // Here we only use basic auth, but really you should look
    // at https://github.com/joyent/node-http-signature

    //server.use(authenticate);

    //server.use(apiUtil.save);

    var STATICS_FILE_RE = /\.(css|js|jpe?g|png|gif|less|eot|svg|bmp|tiff|ttf|otf|woff|pdf|ico|json|wav|ogg|mp3?|xml)$/i;
    var STATICS_HTML = /\.(pdf|json|xml|html)$/i;
    server.get(STATICS_FILE_RE, restify.serveStatic({ directory: './public/web', maxAge: sysConfig.maxAge }));
    server.get(STATICS_HTML, restify.serveStatic({ directory: './public/web', maxAge: 0 }));
    server.get(/\/apidoc\/?.*/, restify.serveStatic({
        directory: './public'
    }));

    /**
     * product tag
     */

    server.get('/api/tags',tag.getTag);
    server.post({path:'/api/tags', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_CREATE_TAGS), tag.addTags);
    server.del('/api/tags', authCheck.authCheck(listOfValue.PERMISSION_DEL_TAGS), tag.deleteTags);

    /**
     * product for customer
     */

    //prod
    server.get('/api/biz/:bizId/prods', prod.listBizProd);
    server.get('/api/biz/:bizId/prods/:prodId', prod.getBizProdDetail);
    server.get('/api/biz/:bizId/prodTypes/:typeId/prods', prod.getBizProdByType);
    server.get('/api/biz/:bizId/prodParentTypes/:typeId/prods', prod.getBizProdByParentType);
    server.get('/api/biz/:bizId/prodsAll', prod.getBizProdByType);
    server.get('/api/biz/:bizId/prodsList', prod.getProdListLike);

    // server.get('/api/prodAll', prod.getBizProdByAll);
    server.get('/api/biz/:bizId/tags/:tagId/prods', prod.getBizProdByTag);
    server.get('/api/tags/:tagId/prods', prod.getBizProdByTag);
    server.del('/api/tags/:tagId/prods', authCheck.authCheck(listOfValue.PERMISSION_DEL_PRODTAGS), prod.deleteTagOnProd);
    server.post({path:'/api/tags/:tagId/prods', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_CREATE_PRODTAGS), prod.postTagOnProd);
    server.get('/api/prods/:prodId', prod.getBizProdDetail);
    server.get('/api/prods', prod.listBizProd);
    server.get('/api/prodsCount', prod.getProdCount);

    server.get('/api/allLabel',prod.getAllLabel);

    /**
     * product for internal user and need permission
     */
    server.post({path:'/api/biz/:bizId/prods', contentType: 'application/json'},  prod.addBizProd);
    server.put({path:'/api/biz/:bizId/prods/:prodId', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_PRODS), prod.updateBizProd);
    server.del('/api/biz/:bizId/prods/:prodId', authCheck.authCheck(listOfValue.PERMISSION_DEL_PRODS), prod.delBizProd);
    server.del('/api/prods/:prodId', authCheck.authCheck(listOfValue.PERMISSION_DEL_PRODS), prod.delBizProd);
    server.put({path:'/api/prods/:prodId', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_PRODS), prod.updateBizProd);
    server.post({path:'/api/prods', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_CREATE_PRODS), prod.addBizProd);
    server.get('/api/prodextras/:prodId', prod.getProdExtension);
    server.get('/api/prodextras', prod.searchProdExtension);




    server.get('/api/prodTypes/:typeId/prods',prod.getBizProdByType);

    //prodType
    server.get('/api/biz/:bizId/prodTypes', prodType.listBizProdType);
    server.get('/api/biz/:bizId/prodTypes/:typeId', prodType.getBizProdTypeDetail);
    server.get('/api/prodTypes/:typeId', prodType.getBizProdTypeDetail);//
    server.put({path:'/api/prodTypes', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_PRODTYPES), prodType.updateBizProdType);

    server.get('/api/biz/:bizId/tags/:tagId/prodTypeProdCount', prodType.getProdCountByProdTypeTag);
    server.get('/api/tags/:tagId/prodTypeProdCount', prodType.getProdCountByProdTypeTag);
    server.get('/api/prodTypesAndProducts', prodType.getProdTypeAndProducts);//


    server.post({path:'/api/biz/:bizId/prodTypes', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_CREATE_PRODTYPES), prodType.addBizProdType);
    server.put({path:'/api/biz/:bizId/prodTypes/:typeId', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_PRODTYPES), prodType.updateBizProdType);
    server.put('/api/biz/:bizId/prodTypes/:typeId/orders/:displayOrder', authCheck.authCheck(listOfValue.PERMISSION_UPDATE_DISPLAYORDERS), prodType.updateProdTypeOrder);
    server.put('/api/prodTypes/:typeId/orders/:displayOrder', authCheck.authCheck(listOfValue.PERMISSION_UPDATE_DISPLAYORDERS), prodType.updateProdTypeOrder);

    server.del('/api/biz/:bizId/prodTypes/:typeId', authCheck.authCheck(listOfValue.PERMISSION_DEL_PRODTYPES), prodType.delBizProdType);
    server.del('/api/prodTypes/:typeId', authCheck.authCheck(listOfValue.PERMISSION_DEL_PRODTYPES), prodType.delBizProdType);


    server.get('/api/prodTypes', prodType.listBizProdType);
    server.post({path:'/api/prodTypes', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_CREATE_PRODTYPES), prodType.addBizProdType);

    server.get('/api/tags/:tagId/prodTypes', prodType.getProdTypeByTag);
    server.del('/api/tags/:tagId/prodTypes', authCheck.authCheck(listOfValue.PERMISSION_DEL_PRODTYPETAGS), prodType.deleteTagOnProdType);
    server.post({path:'/api/tags/:tagId/prodTypes', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_CREATE_PRODTYPETAGS), prodType.postTagOnProdType);


    //prodComment
    server.get('/api/biz/:bizId/prods/:prodId/prodComments', prodComment.getProdComment); //put commentID in the query filter
    server.get('/api/biz/:bizId/prods/:prodId/ratings' ,prodComment.getProdRating);
    server.post({path:'/api/biz/:bizId/prodComments',contentType: 'application/json'}, authCheck.authCheck(), prodComment.addProdComment);
    server.del('/api/biz/:bizId/prods/:prodId/prodComments', authCheck.authCheck(listOfValue.PERMISSION_DEL_PRODCOMMENTS), prodComment.delProdComment);
    server.del('/api/biz/:bizId/prods/:prodId/users/:userId/prodComments', authCheck.authCheck(), prodComment.delProdCommentByUser);

    server.get('/api/prods/:prodId/prodComments', prodComment.getProdComment); //put commentID in the query filter
    server.get('/api/prods/:prodId/ratings' ,prodComment.getProdRating);
    server.post({path:'/api/prodComments',contentType: 'application/json'}, authCheck.authCheck(), prodComment.addProdComment);
    server.del('/api/prods/:prodId/prodComments', authCheck.authCheck(listOfValue.PERMISSION_DEL_PRODCOMMENTS), prodComment.delProdComment);
    server.del('/api/prods/:prodId/users/:userId/prodComments', authCheck.authCheck(), prodComment.delProdCommentByUser);


    //prodImage
    server.get('api/biz/:bizId/prods/:prodId/prodImages', prodImage.getProdImage);
    server.post({path:'/api/biz/:bizId/prodImages', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_CREATE_PRODIMAGES), prodImage.addProdImage);
    server.del('api/biz/:bizId/prods/:prodId/prodImages', authCheck.authCheck(listOfValue.PERMISSION_DEL_PRODIMAGES), prodImage.delProdImage);
    server.put({path:'/api/biz/:bizId/prods/:prodId/prodImages/:imgUrl/primaryImage', contentType: 'application/json'}, authCheck.authCheck(), prodImage.updateBizProdPrimaryImage);
    server.put('api/updateImageDescription', authCheck.authCheck(listOfValue.PERMISSION_DEL_PRODIMAGES), prodImage.updateImageDescription);

    server.get('api/prods/:prodId/prodImages', prodImage.getProdImage);
    server.post({path:'/api/prodImages', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_CREATE_PRODIMAGES), prodImage.addProdImage);
    server.del('api/prods/:prodId/prodImages', authCheck.authCheck(listOfValue.PERMISSION_DEL_PRODIMAGES), prodImage.delProdImage);
    server.put({path:'/api/prods/:prodId/prodImages/:imgUrl/primaryImage', contentType: 'application/json'}, authCheck.authCheck(), prodImage.updateBizProdPrimaryImage);


    // server.put({path:'/api/biz/:bizId/prods/:prodId/prodImages/:imgUrl/primaryImage', contentType: 'application/json'}, prodImage.updateBizProdPrimaryImage);


    //prodTypeImage
    server.get('api/biz/:bizId/prodTypes/:typeId/prodTypeImages', prodTypeImage.getProdTypeImage);
    server.post('api/biz/:bizId/prodTypeImages', authCheck.authCheck(listOfValue.PERMISSION_CREATE_PRODTYPEIMAGES), prodTypeImage.addProdTypeImage);
    server.del('api/prodTypeImages', authCheck.authCheck(listOfValue.PERMISSION_DEL_PRODTYPEIMAGES), prodTypeImage.delProdTypeImage);
    server.post('api/prodTypeImages', authCheck.authCheck(listOfValue.PERMISSION_CREATE_PRODTYPEIMAGES), prodTypeImage.addProdTypeImage);

    ///prodTypeImagesPrimFlag
    server.put('api/prodTypeImagesPrimFlag', authCheck.authCheck(listOfValue.PERMISSION_UPDATE_PRODTYPEIMAGES), prodTypeImage.updateProdTypeImage);


    //prodSearch
    //prod search api, may separate into new service later
    //build product search index
    server.post("/api/prodSearchIndex",authCheck.authCheck(listOfValue.PERMISSION_CREATE_PRODSEARCHINDEX), search.buildProdSearchIndex);
    //search product by index
    server.get("/api/prodSearch/:keyword",search.searchProdByKeyword); //add an authcheck
    server.get("/api/prodSearchNca",prod.searchProdByKeywordNca);

    //favorite products
    server.get('api/favoriteProds', authCheck.authCheck(),favoriteProd.getFavorites);
    server.post('api/favoriteProds', authCheck.authCheck(), favoriteProd.addFavorites);
    server.del('api/favoriteProds', authCheck.authCheck(), favoriteProd.deleteFavorites);

    //for biz product inventory
    server.get('api/biz/:bizId/inventories', authCheck.authCheck(listOfValue.PERMISSION_GET_BIZINVENTORIES),prodInventory.getBizInventories);
    server.del('api/biz/:bizId/inventories', authCheck.authCheck(listOfValue.PERMISSION_DEL_BIZINVENTORIES), prodInventory.deleteBizInventories);
    server.post({path:'/api/biz/:bizId/inventories', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_CREATE_BIZINVENTORIES), prodInventory.addBizInventories);
    server.put({path:'/api/biz/:bizId/inventories', contentType: 'application/json'}, authCheck.authCheck(listOfValue.PERMISSION_UPDATE_BIZINVENTORIES), prodInventory.updateBizInventories);

    server.get('/api/getConnectState',prod.getConnectState);
    //nca
    server.post({path:'/api/sendNca', contentType: 'application/json'}, prod.sendNca);

    //baidu
    server.post({path:'/api/baiduPushLink', contentType: 'application/json'}, prod.baiduPushLink);
    //server.on('after', apiUtil.save);
    return (server);
}

///--- Exports

module.exports = {
    createServer: createServer
};
