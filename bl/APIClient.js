/**
 * client to call remote api
 * @type {exports}
 */
var sysConfig = require('../config/SystemConfig.js');
var httpreq = require('httpreq');
var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('APIClient.js');
var loginUrl=sysConfig.loginModuleUrl.protocol+"://"+sysConfig.loginModuleUrl.host+":"+sysConfig.loginModuleUrl.port;
var checkoutUrl=sysConfig.checkoutModuleUrl.protocol+"://"+sysConfig.checkoutModuleUrl.host+":"+sysConfig.checkoutModuleUrl.port;
var authUrl=loginUrl+"/api/auth/tokens"
var getOrderItemUrl="/api/orderitems";


var authToken={
    accessToken:null,
    expireAt:null,
    authUserId:null
};

//get auth token of this sevice module
function getAuthToken(callback) {
    if (authToken.accessToken && authToken.expireAt>(new Date()).getTime()) {
        callback(null,authToken);
    }
    //validate the token against server and get user information
    var result,tokenInfo=null;
    httpreq.post(authUrl, {
        body: '{"method": "usernamepassword","userName":"'+sysConfig.auth.userName+ '","password":"'+sysConfig.auth.password+'"}',
        headers:{
            'tenant': sysConfig.auth.tenant,
            'Content-Type': 'application/json'
        }
    }, function (err, res){
        if (err){
            logger.error("get auth token failed",err);
            callback(err,null);
        }else{
            if (res.statusCode==200){
                result=JSON.parse(res.body);
                if (result.success==true){
                    tokenInfo = result.result;
                    if (tokenInfo && tokenInfo.accessToken) {
                        authToken.accessToken = tokenInfo.accessToken;
                        authToken.expireAt =tokenInfo.expireAt;
                        authToken.authUserId=tokenInfo.user.userId;
                        return callback(null,authToken);
                    }
                }
            }
            return callback(new Error("fail to authenticate",500),null);
        }
    });
}

function getOrderItemsCreatedAfter(tenant,createdTime,token,callback){
    httpreq.get(checkoutUrl+getOrderItemUrl+"?startAfterDate="+createdTime, {
        headers:{
            'tenant': tenant,
            'auth-token':token,
            'Content-Type': 'application/json'
        }
    }, function (err, response) {
        if (err) {
            return callback(err);
        } else {
            var resObj = JSON.parse(response.body);
            if (response.statusCode == 200) {
                if (resObj.success == true) {
                    return callback(null,resObj);
                }else{
                    return callback(new Error("failed to get order item"));
                }
            }else{
                return callback(new Error("get order item failed"));
            }
        }
    });
}

module.exports = {
    getOrderItemsCreatedAfter: getOrderItemsCreatedAfter,
    getAuthToken:getAuthToken
}