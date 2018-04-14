var output = require('../../src/util/Output.js');
var validator = require('../validator.js');
var system = require('../../src/util/System.js');

function saveSensor(con, vId, vName, vRoute, vRole, vType, vConAuthToken){
  return new Promise((resolve, callbackError)=>{
    validator.validatorCreateSensor(con, vId).then((result)=>{
      if(result == 403){
        let sqlTable = "INSERT INTO sensors (id, name, route, role, type, con_auth_token, created_at) VALUES (\'" + vId + "\', \'" + vName + "\' ,\'" + vRoute + "\' ,\'" + vRole + "\' ,\'" + vType + "\' ,\'" + vConAuthToken + "\' ,\'" + system.getTimestampSystem() + "\')";
        con.query(sqlTable, function (err, result) {
          if (err) resolve(404);
          output.db("1 record inserted");
          resolve(200);
        });
      }else{
        resolve(result);
      }
    })
  })
}

function setAddress(con, sensorId, address){
  return new Promise((resolve, callbackError)=>{
    con.query("UPDATE sensors SET route = \'" +address + "\' WHERE id = \'" + sensorId + "\'", function (err, result, fields) {
      if (err) resolve(false);
      console.log(result)
      if(result){
        resolve(true);
      }else{
        resolve(false);
      }
    });
  })
}

function passwordVerification(con, psw){
  return new Promise((resolve)=>{
    con.query("SELECT password FROM config WHERE password =" + psw , function (err, result, fields) {
      if (err) return resolve(false);
      if(result.length > 0){
        return resolve(true);
      }else{
        return resolve(false);
      }

    });
  })
}

function deleteSyncronizedSensors(con){
  return new Promise((resolve)=>{
    let sqlTable = "DELETE FROM sensors WHERE syncronized = 0";
    con.query(sqlTable, function (err, result) {
      if (err) resolve(false);
      resolve(true);
    });
  })
}


function deleteElement(con, column){
  return new Promise((resolve, callbackError)=>{
    let sqlDrop = "DELETE FROM " + "sensors" + " WHERE id = \'" + column + "\'";
    con.query(sqlDrop, function (err, result) {
      if (err) {
        resolve(500);
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

function getAllSensorsInTable(con){
  return new Promise((resolve, callbackError)=>{
    con.query("SELECT * FROM  sensors", function (err, result, fields) {
      if (err) callbackError(err);
      resolve(result);
    });
  })
}

function getNotCachedSensorsInTable(con){
  return new Promise((resolve, callbackError)=>{
    con.query("SELECT * FROM  sensors WHERE cached = '0'", function (err, result, fields) {
      if (err) callbackError(err);
      resolve(result);
    });
  })
}

function setCachedSensorInTable(con){
  return new Promise((resolve, callbackError)=>{
    con.query("UPDATE  sensors SET cached = '1' WHERE cached = '0'", function (err, result, fields) {
      if (err) callbackError(err);
      resolve(result);
    });
  })
}

function setNotCachedSensorInTable(con){
  return new Promise((resolve, callbackError)=>{
    con.query("UPDATE  sensors SET cached = '0' WHERE cached = '1'", function (err, result, fields) {
      if (err) callbackError(err);
      resolve(result);
    });
  })
}
exports.saveSensor = saveSensor;
exports.deleteElement = deleteElement;
exports.getAllSensorsInTable = getAllSensorsInTable;
exports.getNotCachedSensorsInTable = getNotCachedSensorsInTable;
exports.setCachedSensorInTable = setCachedSensorInTable;
exports.setNotCachedSensorInTable = setNotCachedSensorInTable;
exports.passwordVerification = passwordVerification;
exports.deleteSyncronizedSensors = deleteSyncronizedSensors;
exports.setAddress = setAddress;
