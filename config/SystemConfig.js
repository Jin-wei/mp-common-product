/**
 * Created by ling xue  on 15-8-28.
 */

var mysqlConnectOptions ={
    user: 'root',
    password: '123456',
    database:'common_product',
    host: '127.0.0.1' ,
    charset : 'utf8mb4'
    //,dateStrings : 'DATETIME'
};

var loggerConfig = {
    level : 'DEBUG',
    config : {
        appenders: [
            { type: 'console' },
            {
                "type": "file",
                "filename": "../common-product.log",
                "maxLogSize": 2048000,
            "backups": 10
}
]
}
};

var indexProductTenants=['jjc','hd','nca'];

var elasticSearchOption ={
    host: '127.0.0.1:9200',
    log: 'trace'
};

var loginModuleUrl = {protocol:"http",host:"localhost", port:8091};
var checkoutModuleUrl = {protocol:"http",host:"localhost", port:8080};


var auth={
    tenant:   "jjc",
    userName:"jjcadmin",
    password:"jjcadmin"
};


function getMysqlConnectOptions (){
    return mysqlConnectOptions;
}

function getElasticSearchOption(){
    return elasticSearchOption;
}
var ncaApiUrl="http://localhost:9090";

var maxAge=0;

module.exports = {
    getMysqlConnectOptions : getMysqlConnectOptions,
    loggerConfig : loggerConfig,
    getElasticSearchOption: getElasticSearchOption,
    loginModuleUrl:loginModuleUrl,
    checkoutModuleUrl:checkoutModuleUrl,
    auth:auth,
    indexProductTenants:indexProductTenants,
    ncaApiUrl:ncaApiUrl,
    maxAge:maxAge
}