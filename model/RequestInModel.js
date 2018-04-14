import {SENSOR_SUPER_PERMISSION, DEFAULT_TIME_ENCREASE_JOB, LENGTH_PACKAGE_REQUES_IN,
        SEASONS_TO_DELETE_SYNCRONIZED_REQUESTIN, SYSTEM_AUTHENTICATE_KEY, SYSTEM_AUTHENTICATE_TOKEN} from "../constants.js"
var system = require('../src/util/System.js');
import httpService from '../service/HttpService';
var validator = require('../database/validator.js');

class RequestInModel{

  constructor({sensor_id, timeout, syncronized, value, role}){
    this.sensor_id = sensor_id;
    this.created_at = system.getTimestampSystem();
    this.timeout = timeout;
    this.syncronized = syncronized;
    this.value = value;
    this.role = role;
    this.weight = 0;
  }

  save(con){
    return new Promise((resolve)=>{
      validator.validatorRequestSensor(con, this.sensor_id).then((validate)=>{
        if(validate == 200){
          let sqlTable = "INSERT INTO request_in (sensor_id, value, role, syncronized, timeout, created_at) VALUES (\'" + this.sensor_id + "\', \'" + this.value + "\' ,\'" + this.role + "\' ,\'" + this.syncronized + "\' ,\'" + this.timeout + "\' ,\'" + this.created_at +"\')";
          con.query(sqlTable, function (err, result) {
            if (err) resolve({status: 500, message: "Something is wrong"});
            resolve({status: 200, message: "Request insery sucessfuly"});
          });
        }else{
          resolve({status: 401, message: "Invalid credentials"});
        }
      })
    })
  }

  static listNotSynconized(con){
    return new Promise((resolve)=>{
      let sqlTable = "SELECT * FROM request_in WHERE syncronized = '0' LIMIT " + LENGTH_PACKAGE_REQUES_IN;
      con.query(sqlTable, function (err, result) {
        if (err) resolve({status: 500, message: "Something is wrong"});
        resolve({status: 200, results: result});
      });
    })
  }

  static setSyncronizedRequests(con){
    return new Promise((resolve)=>{
      let sqlTable = "UPDATE request_in SET syncronized = '1' WHERE syncronized = '0' LIMIT " + LENGTH_PACKAGE_REQUES_IN;
      con.query(sqlTable, function (err, result) {
        if (err) resolve({status: 500, message: "Something is wrong"});
        resolve({status: 200, results: result});
      });
    })
  }

  static deleteSyncronizedRequests(con, seasons, sizeOfPackage){
    return new Promise((resolve)=>{
      if(seasons >= SEASONS_TO_DELETE_SYNCRONIZED_REQUESTIN && sizeOfPackage > LENGTH_PACKAGE_REQUES_IN ){
        let sqlTable = "DELETE FROM request_in WHERE syncronized = '1'";
        con.query(sqlTable, function (err, result) {
          if (err) resolve(false);
          resolve(true);
        });
      }else{
        resolve(false);
      }
    })
  }
}

export default RequestInModel;
