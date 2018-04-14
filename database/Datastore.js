var mysql = require('mysql');
var output = require('../src/util/Output.js');
var datastoreSensors = require('./sensors/datastore.js');
var datastoreRequestIn = require('./request_in/datastore.js');
var constants = require('../constants.js');
var validator = require('./validator.js');
import RequestIn from '../model/RequestInModel';
const readline = require('readline');
var con;
var rl;
class Datastore{

  start(){

    rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    con = mysql.createConnection({
      host: "localhost",
      user: global.DATABASE_USER,
      password: global.DATABASE_PSW,
      database: global.DATABASE_NAME
    });

    con.connect((err) => {
      try {
        con.query("CREATE DATABASE " + global.DATABASE_NAME, (err, result) => {
          if (err && err.code == "ER_DB_CREATE_EXISTS") {
            con = mysql.createConnection({
              host: "localhost",
              user: global.DATABASE_USER,
              password: global.DATABASE_PSW,
              database: global.DATABASE_NAME
            });
            this.startTables();
          }else if(err){
            console.error(err);
          }else{
            output.sys("DATABASE CREATED", "OK");
            con = mysql.createConnection({
               host: "localhost",
               user: global.DATABASE_USER,
               password: global.DATABASE_PSW,
               database: global.DATABASE_NAME
             });
             this.startTables();
          }
        });
      } catch (err) {
          console.log(err);
      }
    });


  }

  startDatabase(){
    con = mysql.createConnection({
      host: "localhost",
      user: global.DATABASE_USER,
      password: global.DATABASE_PSW,
      database: global.DATABASE_NAME
    });

    con.connect((err) => {
      try {
        con.query("CREATE DATABASE " + global.DATABASE_NAME, (err, result) => {
          if (err && err.code == "ER_DB_CREATE_EXISTS") {
            con = this.setDatatable;
            this.startTables();
            output.sys("DATABASE CREATED", "OK");
            output.sys("DATABASE SET IN " + global.DATABASE_NAME, "OK");
          }else if(err){
            console.error(err);
          }else{
            this.startTables();
            output.sys("DATABASE CREATED", "OK");
          }
        });
      } catch (err) {
          console.log(err);
      }
    });
  }

  setDatatable(){
    return con = mysql.createConnection({
      host: "localhost",
      user: global.DATABASE_USER,
      password: global.DATABASE_PSW,
      database: global.DATABASE_NAME
    });
  }

  startTables(){

      var sensors_sql = "CREATE TABLE sensors (id VARCHAR(255), name VARCHAR(255), route VARCHAR(255), role VARCHAR(255), type VARCHAR(255), cached BOOLEAN DEFAULT 0,  syncronized BOOLEAN DEFAULT 0, con_auth_token VARCHAR(255), created_at DATETIME, deleted_at DATETIME)";
      var online_sensors_sql = "CREATE TABLE online_sensors (id VARCHAR(255), ip VARCHAR(255), status int, type VARCHAR(255)) ";
      var users = "CREATE TABLE users (name VARCHAR(255), email VARCHAR(255)) ";
      var request_in = "CREATE TABLE request_in (sensor_id VARCHAR(255), value INT, role VARCHAR(255), syncronized BOOLEAN DEFAULT 0, timeout VARCHAR(255), created_at DATETIME)  ";
      var request_out = "CREATE TABLE request_out (sensor_id VARCHAR(255), value INT, attempts INT, role VARCHAR(255), syncronized BOOLEAN DEFAULT 0, timeout VARCHAR(255), created_at DATETIME)  ";
      var config = "CREATE TABLE config (name VARCHAR(255), password VARCHAR(255), authentication_key VARCHAR(255), role VARCHAR(255), created_at DATETIME)";
      this.createTable(sensors_sql, "sensors");
      //this.createTable(request_in, "request_in");
      //this.createTable(config, "config");
      //this.createTable(request_out, "request_out");
      // createTable(online_sensors_sql, "online_sensors");
      // createTable(users, "users");
  }

  getCredentials(authentication_key){
    return new Promise((resolve)=>{
      con.query("SELECT name, password, role, created_at FROM config WHERE authentication_key =\'" + authentication_key + "\'", function (err, result, fields) {
        if (err){
          resolve(404);
        }else if(result.length > 0){
          resolve({status: 200, data: result[0]});
        }else{
          resolve({status: 409, message: "Credentials not found"});
        }
      });
    })
  }

 setCredentials(authentication_key, name, password, role, created_at){
    return new Promise((resolve)=>{
      validator.validatorSetConfig(con).then((permission)=>{
        if(permission){
          let sqlTable = "INSERT INTO config (authentication_key, name, password, role, created_at) VALUES (\'" + authentication_key  + "\', \'" + name +  "\', \'" + password +  "\', \'" + role +  "\', \'" + created_at + "\')";
          con.query(sqlTable, function (err, result) {
            if (err){
              resolve({status: 500, message: "Something is wrong"});
            }else{
              resolve({status: 200, message: "Ok"});
            }
          });
        }else{
          resolve({status: 400, message:"The configuration is already set"});
        }
      })
    })
  }

  setSensorAddress(sensorId, address){
    return datastoreSensors.setAddress(con, sensorId, address);
  }

  deleteSensor(tableName, column){
    return datastoreSensors.deleteElement(con, column);
  }

  setCachedSensorInTable(){
    return datastoreSensors.setCachedSensorInTable(con);
  }

  getAllSensorsInTable(){
    return datastoreSensors.getAllSensorsInTable(con);
  }

  setNotCachedSensorsInTable(){
    return datastoreSensors.setNotCachedSensorInTable(con);
  }

  getNotCachedSensorsInTable(){
    return datastoreSensors.getNotCachedSensorsInTable(con);
  }

  saveSensor(vId, vName, vRoute, vRole, vType, vConAuthToken){
    return datastoreSensors.saveSensor(con, vId, vName, vRoute, vRole, vType, vConAuthToken);
  }

  setRequest(id, type, date_request, value){
    return datastoreRequestIn.setRequest(con, id, type, date_request, value);
  }

  deleteSyncronizedSensors(){
    return datastoreSensors.deleteSyncronizedSensors(con);
  }

  deleteRequest(tableName, column){
    return datastoreRequestIn.deleteElement(con, column);
  }

  newRequestIn(request){
    return request.save(con);
  }

  getAllSensorsFromAdminHub(){
    return datastoreSensors.getAllSensorsFromAdminHub(con);
  }

  listNotSynconizedRequestIn(){
    return RequestIn.listNotSynconized(con);
  }

  setSyncronizedRequests(){
    return RequestIn.setSyncronizedRequests(con);
  }

  passwordVerification(psw){
    return datastoreSensors.passwordVerification(con, psw);
  }

  deleteSyncronizedRequestsIn(seasons, sizeOfPackage){
    return RequestIn.deleteSyncronizedRequests(con, seasons, sizeOfPackage);
  }

  createTable(sqlTable, tableName){
    con.query(sqlTable, (err, result)=>{
      if(err){
        output.sys("DATATABLE IS ALREADY EXISTS", "IGNORED");
      }else{
        output.sys("CREATING DATATABLE " + tableName, "OK");
      }
    });
  }

  dropTable(table, update, sqlTable){
    var sql = "DROP TABLE " + table;
    con.query(sql, function (err, result) {
      if (err){
        output.db("Is not possible delete table " + table);
      }else{
        output.db("Table " + table + " deleted");
        if(update){
          createTable(sqlTable, table);
        }
      }
    });
  }

  insertInTable(tableName, sqlTable){
    con.connect(function(err) {
      if (err) throw err;
      con.query(sqlTable, function (err, result) {
        if (err) throw err;
        output.db("1 record inserted");
      });
    });
  }

  getAllInTable(tableName){
    return new Promise((resolve, callbackError)=>{
      con.query("SELECT * FROM " + tableName, function (err, result, fields) {
        if (err) callbackError(err);
        resolve(result);
      });
    })

  }


  existsDatatable(response, table, sqlTable){
    switch (response) {
      case 'Y':
          output.db("Dropping datatable...");
          dropTable(table,true,sqlTable);
        break;
      case 'y':
          output.db("Dropping datatable...");
          dropTable(table,true,sqlTable);
        break;
      case 'yes':
          output.db("Dropping datatable...");
          dropTable(table,true,sqlTable);
        break;
      case 'YES':
          output.db("Dropping datatable...");
          dropTable(table,true,sqlTable);
        break;
      case 'n':
          output.db("Database was not created!");
        break;
      case 'N':
          output.db("Database was not created!");
        break;
      case 'no':
        output.db("Database was not created!");
        break;
      case 'NO':
          output.db("Database was not created!");
        break;
      default:
        output.sys("Command not found", "IGNORED");
      break;
    }
  }
}

export default new Datastore();
