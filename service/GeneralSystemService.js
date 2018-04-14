import httpService from './HttpService.js';
import {SYSTEM_AUTHENTICATE_TOKEN, SYSTEM_AUTHENTICATE_KEY} from '../constants.js';
import sensorMonitorService from '../service/SensorMonitorService.js';
import datastore from '../database/Datastore.js';
import requestInService from '../service/RequestInService.js';
import requestOutService from '../service/RequestOutService.js';
import Kernel from '../service/KernelService.js';

var output = require('../src/util/Output.js');

let initSystemDate = new Date().getTime();

class GeneralSystemSerice {

  constructor(){
  }

  initSystem(){
    datastore.start();
    this.getCredentials().then((credential)=>{
      if (credential.status == 200){
        global.SYSTEM_GLOBAL_CONFIGURATION = credential.data;
        console.log(SYSTEM_AUTHENTICATE_TOKEN)
        httpService.isAuthenticate(SYSTEM_AUTHENTICATE_TOKEN).then((result)=>{
          if(result.status == 200){
            output.sys("STATUS: " + result.status, "OK" );
            sensorMonitorService.syncSensorsCloud().then((newSensors)=>{
              sensorMonitorService.initializeMonitor();
              sensorMonitorService.addCache().then(()=>{
                sensorMonitorService.print();
                requestInService.initListeningPackageIn(initSystemDate);
                requestOutService.initListeningPackageOut();
              });

            })
          }else if(result.status == 401){
            output.sys("STATUS: " + result.status + " - NOT AUTORIZED", "ERROR");
          }
        });
      }else if(credential.status == 409){
        output.sys("CREDENTIALS NOT FOUNDED, PLEASE RESET THE HUB", "ERROR")
      }else{
        output.sys(credential, "ERROR")
        output.sys("THE HUB KERNEL IS CRASHED, PLEASE RESET TO DEFAULT CONFIGURATIONS", "ERROR")
      }
    })
  }

  getCredentials(){
    return new Promise((resolve)=>{
      datastore.getCredentials(SYSTEM_AUTHENTICATE_KEY).then((result)=>{
        return resolve(result);
      })
    })
  }

}

export default new GeneralSystemSerice();
