import {SENSOR_SUPER_PERMISSION, DEFAULT_TIME_ENCREASE_JOB, LENGTH_PACKAGE_REQUES_IN,
        SEASONS_TO_DELETE_SYNCRONIZED_REQUESTIN} from "../constants.js"
var system = require('../src/util/System.js');

class SensorModel{

  constructor({sensor_id, timeout, syncronized, value, role}){
    this.sensor_id = sensor_id;
    this.created_at = system.getTimestampSystem();
    this.timeout = timeout;
    this.syncronized = syncronized;
    this.value = value;
    this.role = role;
    this.weight = 0;
  }
  var sensors_sql = "CREATE TABLE sensors (id VARCHAR(255), name VARCHAR(255), route VARCHAR(255), role VARCHAR(255), type VARCHAR(255), cached BOOLEAN DEFAULT 0,  syncronized BOOLEAN DEFAULT 0, syncronized BOOLEAN DEFAULT 0, created_at DATETIME, deleted_at DATETIME)";

  
}

export default SensorModel;
