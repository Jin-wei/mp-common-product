var prodInventory=require('../bl/ProdInventory.js');
var apiClient=require('../bl/APIClient.js');
var lov=require('../bl/Lov.js');
var Seq = require('seq');
var dateUtil=require('mp-common-util').dateUtil;
//command line tool to add register user as customer
//todo change this to rabbit mq listener
(function main() {
    //todo support multi-tenant
    var tenant="jjc";
    var key="updateinventory_lastorderitemcreatedate";
    var note="decrement inventory due to new order";
    var token = null,items=null,authUserId=null,total=null,orderItemLastCreateDate,orderItemLastCreateDateStr,newOrderItemLastCreateDateStr;
    Seq().seq(function(){
        var that=this;
        apiClient.getAuthToken(function(error,result){
            if (error){
                console.log("get token failed");
                process.exit(0);
            }else{
                token=result.accessToken;
                authUserId=result.authUserId;
                that();
            }
        })
    }).seq(function(){
        var that=this;
        //get time stamp for latest order item created date
        lov.getTimestampVal({tenant:tenant,key:key},function(error,time){
            if (error){
                console.log("get orderItemLastCreateDate failed");
                process.exit(0);
            }else {
                orderItemLastCreateDate = time;
                orderItemLastCreateDateStr=dateUtil.getDateFormat(orderItemLastCreateDate,"yyyy-MM-dd hh:mm:ss");
                console.log("last inventory update date: "+orderItemLastCreateDateStr);
                that();
            }
        });
    })
        .seq(function(){
        var that=this;


        apiClient.getOrderItemsCreatedAfter("jjc",orderItemLastCreateDateStr,token,function(error,results){
            if (error){
                console.log("fail to get order items",error);
                process.exit(1);
            }else{
                //console.dir(results)
                items=results.result;
                total=results.total;
                if (total>0) {
                    console.log("get order items count:" + total);
                    that();
                }else{
                    console.log("no order items found");
                    process.exit(0);
                }
            }
        });
    }).seq(function() {
        Seq(items).seqEach(function (item, i) {
                var that = this;
                if (newOrderItemLastCreateDateStr == null) {
                    newOrderItemLastCreateDateStr = item.createdOn;
                } else if (new Date(newOrderItemLastCreateDateStr) < new Date(item.createdOn)) {
                    newOrderItemLastCreateDateStr = item.createdOn;
                }

                //skip the canceled one
                if ("canceled" == item.status) {
                    that(null,i);
                } else {
                   // console.dir(item);
                   // console.log("order item created date: " + item.createdOn);
                   // console.log("order item created date: "+new Date(newOrderItemLastCreateDateStr).toString());
                   // console.log("order item created date: "+new Date (newOrderItemLastCreateDateStr).toISOString());

                    prodInventory.decrementProdInventories("jjc", authUserId, note,item, function (error, result) {
                        if (error) {
                            console.log("change product inventory failed:bizId[" + item.bizId + "] prodId[" + item.productId + "]", error);
                        } else {
                            console.log("change product inventory succeed:bizId[" + item.bizId + "] prodId[" + item.productId + "]");
                        }
                        that(null, i);
                    });
                }
            }
        ).seq(function () {
                //persis the last order item created date
                lov.updateTimestampVal({tenant:tenant,key:key,timestampVal:new Date(newOrderItemLastCreateDateStr),authUserId:authUserId},function (error, result){
                    if (error) {
                        console.log("change "+key+":", error);
                    } else {
                        console.log("change "+key+" succeed.");
                    }
                    process.exit(0);
                })
            })
    })
})();