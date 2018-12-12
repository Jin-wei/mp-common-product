var searchProduct=require('./bl/Search.js');
var Seq = require('seq');
var sysConfig = require('./config/SystemConfig.js');
//commond line tool to build product index
(function main() {
    var tenants=sysConfig.indexProductTenants;
    Seq(tenants).seqEach(function(tenant,i){
        var that=this;
        searchProduct.doBuildProductIndex(tenants[i], function (error) {
            if (error) {
                console.log(tenants[i]+ "index product failed:" + error.message);
                that(null,i);
            } else {
                console.log(tenants[i] +"index product succeed");
                that(null,i);
            }
        });
    }).seq(function(){
        process.exit(0);
    })
})();