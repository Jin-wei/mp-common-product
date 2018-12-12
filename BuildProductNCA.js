
var mysql = require('mysql');
var Seq = require('seq');
var db = require('./db/db.js');
function insertLabel(){
    Seq().seq(function(){
        var that = this;
        var query = "";
        db.dbQuery(query,[],function(error,rows){
            prodArr = rows;
            that()
        })
    }).seq(function(){

    })
}

insertLabel();
