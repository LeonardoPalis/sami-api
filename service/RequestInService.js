import {REQUEST_PACKAGE, LENGTH_PACKAGE_REQUES_IN,
        SENSOR_SUPER_PERMISSION, SENSOR_NORMAL_PERMISSION,
        SYSTEM_AUTHENTICATE_TOKEN, SYSTEM_AUTHENTICATE_KEY } from '../constants.js';
import datastore from '../database/Datastore.js';
var system = require('../src/util/System.js');
var output = require('../src/util/Output.js');
import httpService from './HttpService.js';
import Kernel from './KernelService.js';
import requestInService from '../service/RequestInService.js';

let overTimeToQueue;

class RequestInService extends Kernel{

  constructor(){
    super(RequestInService);
    var cacheSensors = {};
    this.requestIn = [];
    this.package = [];
    var countRequestsBySensor = {};
    this.seasonsStarted = 0;
  }

  initListeningPackageIn(initSystemDate) {
    let loadInterval = initSystemDate;
    global.requestIn = setInterval(()=>{
      overTimeToQueue = this._expireTimeToQueue(loadInterval)
      if((global.NUMBER_OF_NEW_REQUESTS_IN >= LENGTH_PACKAGE_REQUES_IN) || overTimeToQueue){
        this.seasonsStarted += 1;
        datastore.deleteSyncronizedRequestsIn(this.seasonsStarted, global.LOCAL_NUMBER_OF_NEW_REQUESTS_IN).then((deletedSynconized)=>{
          if(deletedSynconized == true){
            global.LOCAL_NUMBER_OF_NEW_REQUESTS_IN = 0;
            this.seasonsStarted = 0;
          }
          datastore.listNotSynconizedRequestIn().then((result)=>{
            global.NUMBER_OF_NEW_REQUESTS_IN = 0;
            this.package = result.results;
            loadInterval = system.getTimestampFormatNumericSystem();
            httpService.sendRequestInPack(SYSTEM_AUTHENTICATE_KEY, SYSTEM_AUTHENTICATE_TOKEN, this.package).then((result)=>{
              datastore.setSyncronizedRequests().then((syncronized)=>{
                console.log("REQUEST SEND");
              })
            }).catch((err)=>{
              console.log("ERROR")
            })
          })
        })
      }
    }, TIME_INTERVAL_LOAD_LISTENING)
  };

  sendRequestBySuperSensor(sensorId, data){
    return new Promise((resolve)=>{
      var request = [];
      data["sensor_id"] = sensorId;
      data["created_at"] = system.getTimestampSystem();
      request.push(data);
      httpService.sendRequestInPack(SYSTEM_AUTHENTICATE_KEY, SYSTEM_AUTHENTICATE_TOKEN, request).then((result)=>{
        resolve({status: result.status, message: result.message + " - SUPER SENSOR"})
      }).catch((err)=>{
        resolve({status: 500, message: "Something is wrong"})
      })
    })
  }

  insertPackToQueue(request){
    if (cacheSensors[request.sensor_id].role == SENSOR_NORMAL_PERMISSION){
      this.requestIn.push(request);
      _countRequest(request.sensor_id);
    }else if(cacheSensors[request.sensor_id] == SENSOR_SUPER_PERMISSION){
      //CALL HTTP SERVICE
    }else{
      output.sys("SENSOR PERMISSION DENIED", "IGNORED");
    }
  }

  _expireTimeToQueue(initSystemDate){
    return (new Date().getTime() - initSystemDate) >= TIME_INTERVAL_END_QUEUE;
  }

  _reloadTimeStartSystem(){
    return new Date().getTime();
  }

  _requestOutput(){
    console.log("REQUEST OUT");
  }

  _sendPackOfRequests(pack){

  }

  _countRequest(sensor_id){
    if(countRequestsBySensor[sensor_id] == null){
      countRequestsBySensor.push(sensor_id: {count: 1})
    }else{
      countRequestsBySensor[sensor_id].count += 1;
    }
  }

  _getCountRequest(sensor_id){
    return countRequestsBySensor[sensor_id].count;
  }

  _scheduling(request){
    let currentDate = new Date().getTime();
    if((currentDate - request.created_at) >= DEFAULT_TIME_ENCREASE_JOB){
      //....
    }
  }

}

export default new RequestInService();
