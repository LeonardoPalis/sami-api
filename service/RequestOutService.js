import {REQUEST_PACKAGE, LENGTH_PACKAGE_REQUES_IN,
        SENSOR_SUPER_PERMISSION, SENSOR_NORMAL_PERMISSION,
        SYSTEM_AUTHENTICATE_TOKEN, SYSTEM_AUTHENTICATE_KEY, TIME_INTERVAL_LOAD_LISTENING_SERVER } from '../constants.js';
import datastore from '../database/Datastore.js';
var system = require('../src/util/System.js');
var output = require('../src/util/Output.js');
import httpService from './HttpService.js';
import Kernel from './KernelService.js';
import requestInService from '../service/RequestInService.js';

let overTimeToQueue;

class RequestOutService extends Kernel{

  constructor(){
    super();

  }

  initListeningPackageOut(initSystemDate) {

    this.requestOut = setInterval(()=>{
      httpService.recovererRequestsOut().then((data)=>{
        data = JSON.parse(data);
      //  console.log(data)
        this._callSensorOnline(data.requests);
      })
    }, TIME_INTERVAL_LOAD_LISTENING_SERVER)
  }

  _callSensorOnline(jobs){
    jobs.forEach((job)=>{
      if (global.cacheSensors[job.sensor_id].route != null){
         httpService.delegateJobToSensor(global.cacheSensors[job.sensor_id], job).then((result)=>{
           console.log(result);
         })
      }
    })
  }

}

export default new RequestOutService();
