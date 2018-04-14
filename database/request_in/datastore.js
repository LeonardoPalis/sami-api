var output = require('../../src/util/Output.js');
var validator = require('../validator.js');

function setRequest(con, id, type, date_request, value){
  return new Promise((resolve, callbackError)=>{
    let sqlTable = "INSERT INTO request_in (id, type, date_request, value) VALUES (\'" + id + "\', \'" + type + "\' ,\'" + date_request + "\' ,\'" + value + "\')";
    validator.validatorRequestSensor(con, id).then((result)=>{
      if(result == 200){
        con.query(sqlTable, function (err, result) {
          if (err) callbackError(err);
          output.db("1 record inserted");
          resolve(200);
        });
      }else{
        resolve(403);
      }
    })
  })
}

function deleteElement(con, column){
  return new Promise((resolve, callbackError)=>{
    let sqlDrop = "DELETE FROM " + "request_in" + " WHERE id = \'" + column + "\'";
    con.query(sqlDrop, function (err, result) {
      if (err) {
        resolve(500);
        console.log(err);
      }else{
        if(result.affectedRows > 0){
          resolve(200);
        }else{
          resolve(403);
        }
      }
    });
  })

}

exports.setRequest = setRequest;
exports.deleteElement = deleteElement;
