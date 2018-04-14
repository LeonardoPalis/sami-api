import datastore from '../database/Datastore.js';
var output = require('../src/util/Output.js');
import httpService from './HttpService.js';
import Kernel from '../service/KernelService.js';
import {SYSTEM_AUTHENTICATE_TOKEN, SYSTEM_AUTHENTICATE_KEY } from '../constants.js';
class SensorMonitorService extends Kernel{

  constructor(){
    super();
  }

  initializeMonitor(){
    return new Promise((resolve)=>{
      datastore.setNotCachedSensorsInTable().then((result)=>{
        output.sys("REINITIALIZE ALL CACHED SENSORS", "OK")
      })
    })
  }

  setAddress(sensorId, address){
    return new Promise((resolve)=>{
      datastore.setSensorAddress(sensorId, address).then((result)=>{
        if(result){
          if(global.cacheSensors[sensorId] != null){
            global.cacheSensors[sensorId].route = address;
            console.log(global.cacheSensors[sensorId])
            resolve({status: 200, message: "Success setting sensor address"})
          }else{
            resolve({status: 401, message: "Sensor is not authenticate"})
          }
        }else{
          resolve({status: 401, message: "Sensor is not authenticate"})
        }
      })
    })
  }

  tryRegisterNewSensorAndSave(sensorId, sensor){
    return new Promise((resolve)=>{
      datastore.passwordVerification(sensor.hub_psw).then((key_validation)=>{
        if(key_validation){
          httpService.sendSensorToAPI(SYSTEM_AUTHENTICATE_KEY, SYSTEM_AUTHENTICATE_TOKEN, sensorId, sensor).then((result)=>{
            if(result.status == 200){
              datastore.saveSensor(sensorId ,sensor.name,
                sensor.route, sensor.role,sensor.type).then((resultLocal)=>{
                  if(resultLocal == 200){
                    this.addCache();

                    resolve({status: resultLocal, message: "Sensor registered sucessfuly"});
                  }else{
                    resolve({status: resultLocal, message: "Sensor is already registered"});
                  }
                })
              }else{
                resolve({status: result.status, message: result.message});
              }
            })
        }else{
          resolve({status: 401, message: "Invalid password of hub"});
        }
      })
    })
  }

  syncSensorsCloud(){
    return new Promise((resolve)=>{
      httpService.recovererAllSensors(SYSTEM_AUTHENTICATE_KEY,SYSTEM_AUTHENTICATE_TOKEN).then((sensors)=>{
        if(sensors.status == 200){
          datastore.deleteSyncronizedSensors().then((sensorsDeleted)=>{
            if(sensorsDeleted){
              sensors = sensors.results;
              console.log(sensors)
              sensors.forEach((sensor)=>{
                datastore.saveSensor(sensor.sensor_id, sensor.name, sensor.route, sensor.role, sensor.type, sensor.con_auth_token).then((savedSensor)=>{
                  resolve();
                })
              })
            }
          })
        }else{
          resolve(false)
        }
      })
    })
  }

  addCache(){
    return new Promise((resolve)=>{

      datastore.getNotCachedSensorsInTable().then((result)=>{
        Object.keys(result).forEach((data)=>{
          result[data].route = null;
          result[data].cached = 1;
          console.log(result[data].id)
          global.cacheSensors[result[data].id] = result[data];
        });
        datastore.setCachedSensorInTable().then((result)=>{
          resolve(true);
        })
      })
    })
  }

  print(){
    Object.keys(global.cacheSensors).forEach((e)=>{
      console.log(global.cacheSensors[e]);
    })
  }


}

export default new SensorMonitorService();
