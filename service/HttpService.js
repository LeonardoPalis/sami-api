
import {SYSTEM_AUTHENTICATE_TOKEN, SYSTEM_AUTHENTICATE_KEY} from '../constants.js';
var http = require('http');
var output = require('../src/util/Output.js');
import Kernel from '../service/KernelService.js';
var address = "192.168.15.5";
class HttpService extends Kernel{

  isAuthenticate(auth_token){

    var post_data = JSON.stringify({
       data: {
         auth_token: auth_token
       }
    });
    const header = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Content-Length': post_data.length
    }

    const options = {
      hostname: address, port: 4000, path: '/adminhub', method: 'POST', headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Length': post_data.length
      }
    };

    return new Promise((resolve)=>{
      try{
        const req = http.request(options, (res) => {
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            if(res.statusCode == 200){
              global.HUB_CONFIGURATION = JSON.parse(chunk).results;
              return resolve({status: 200, message: "Hub is authenticate"})
            }else{
              return resolve({status: 401, message: "Hub is not authenticate"})
            }
          });
          res.on('end', () => {
            output.sys("COMMUNICATION WITH SERVER ENDS", "OK");
          });
        });
        req.write(post_data);
        req.end();
      }catch(err){
        resolve({status: 502, error: "Server not connected"})
      }

    })
  }

  recovererAuthToken(authentication_key, psw){

    var post_data = JSON.stringify({
       data: {
         auth_token: auth_token
       }
    });

    const options = {
      hostname: address, port: 4000, path: '/hubtoken', method: 'POST', headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Length': post_data.length
      }
    };

    return new Promise((resolve)=>{
      try{
        const req = http.request(options, (res) => {
          res.setEncoding('utf8');
          res.on('data', (data) => {
            if(res.statusCode == 200){
              return resolve({status: 200, auth_token: data.auth_token})
            }else{
              return resolve({status: 401, message: "Invalid credentials"})
            }
          });
          res.on('end', () => {
            output.sys("COMMUNICATION WITH SERVER ENDS", "OK");
          });
        });
        req.write(post_data);
        req.end();
      }catch(err){
        resolve({status: 502, error: "Server not connected"})
      }

    })

  }

  sendRequestInPack(authentication_key, auth_token, pack){
    var post_data = JSON.stringify({
         authentication_key: authentication_key,
         auth_token: auth_token,
         data: pack

    });
    const options = {
      hostname: address, port: 4000, path: '/requestin', method: 'POST', headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Length': post_data.length
      }
    };

    return new Promise((resolve)=>{
      try{
        const req = http.request(options, (res) => {
          res.setEncoding('utf8');
          res.on('data', (data) => {
            console.log("DAAAAAAAATAAAAAA " + post_data)
            console.log(data)
            if(res.statusCode == 200){
             resolve({status: 200, message: "Send packge of resquests in to server"})
            }else{
             resolve({status: 401, message: JSON.parse(data).result})
            }
          });
          res.on('end', () => {
            output.sys("COMMUNICATION WITH SERVER ENDS", "OK");
          });
          res.on('error', () => {
            output.sys("COMMUNICATION ERRORS WITH SERVER", "ERROR");
          });
        });

        req.on('error', () => {
          output.sys("COMMUNICATION ERRORS WITH SERVER", "ERROR");
        });
        req.write(post_data);
        req.end();
      }catch(err){
        req.on('error', () => {
          output.sys("COMMUNICATION ERRORS WITH SERVER", "ERROR");
        });
        resolve({status: 502, error: "Server not connected"})
        req.end();
      }

    })

  }

  sendSensorToAPI(authentication_key, auth_token, sensorId, sensor){
    var post_data = JSON.stringify({
         authentication_key: authentication_key,
         auth_token: auth_token,
         sensor

    });

    const options = {
      hostname: address, port: 4000, path: '/sensors/' + sensorId, method: 'POST', headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Length': post_data.length
      }
    };

    return new Promise((resolve)=>{
      try{
        const req = http.request(options, (res) => {
          res.setEncoding('utf8');
          res.on('data', (data) => {
            data = JSON.parse(data);
            this.status =  data.status;
            return resolve({status: data.status, message: data.message})
          });
          res.on('end', () => {
            output.sys("COMMUNICATION WITH SERVER ENDS", "OK");
          });
          res.on('error', () => {
            output.sys("COMMUNICATION ERRORS WITH SERVER", "ERROR");
          });
        });

        req.on('error', (err) => {
          req.abort();
          return resolve({status: 502, message: "Server not connected"})
          output.sys("COMMUNICATION ERRORS WITH SERVER - TIMEOUT", "ERROR");
        });
        req.write(post_data);
        req.end();
      }catch(err){
        resolve({status: 502, error: "Server not connected"})
        req.end();
      }

    })

  }

  recovererAllSensors(authentication_key, auth_token){

    var post_data = JSON.stringify({
         authentication_key: authentication_key,
         auth_token: auth_token

    });

    const options = {
      hostname: address, port: 4000, path: '/sensors', method: 'POST', headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Length': post_data.length
      }
    };

    return new Promise((resolve)=>{
      try{
        const req = http.request(options, (res) => {
          res.setEncoding('utf8');
          res.on('data', (data) => {
            if(res.statusCode == 200){
              return resolve({status: 200, results: JSON.parse(data).result})
            }else{
              return resolve({status: 401, message: "Invalid credentials"})
            }
          });
          res.on('end', () => {
            output.sys("COMMUNICATION WITH SERVER ENDS", "OK");
          });
          res.on('error', () => {
            output.sys("COMMUNICATION ERRORS WITH SERVER", "ERROR");
          });
        });
        req.on('error', (err) => {
          req.abort();
          return resolve({status: 502, message: "Server not connected"})
          output.sys("COMMUNICATION ERRORS WITH SERVER - TIMEOUT", "ERROR");
        });
        req.write(post_data);
        req.end();
      }catch(err){
        resolve({status: 502, error: "Server not connected"})
      }

    })

  }

  recovererRequestsOut(authentication_key, psw){

    var post_data = JSON.stringify({

       authentication_key: SYSTEM_AUTHENTICATE_KEY

    });

    const options = {
      hostname: address, port: 4000, path: '/requestout/' + SYSTEM_AUTHENTICATE_KEY, method: 'GET', headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Length': post_data.length,
        'auth_token': SYSTEM_AUTHENTICATE_TOKEN
      }
    };

    return new Promise((resolve)=>{
      try{
        const req = http.request(options, (res) => {
          res.setEncoding('utf8');
          res.on('data', (data) => {
            if(res.statusCode == 200){
              return resolve(data)
            }else{
              return resolve({status: 401, message: "Invalid credentials"})
            }
          });
          res.on('end', () => {
            output.sys("COMMUNICATION WITH SERVER ENDS", "OK");
          });
        });
        req.write(post_data);
        req.end();
      }catch(err){
        resolve({status: 502, error: "Server not connected"})
      }

    })

  }

  delegateJobToSensor(sensor, job){
    var post_data = JSON.stringify({
         value: job.value,
         mode: "rqt"
    });

    const options = {
      hostname: sensor.route, port: 80, path: '/', method: 'POST', headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Length': post_data.length
      }
    };

    return new Promise((resolve)=>{
      try{
        const req = http.request(options, (res) => {
          res.setEncoding('utf8');
          res.on('data', (data) => {
            data = JSON.parse(data);
            this.status =  data.status;
            return resolve({status: data.status, message: data.message})
          });
          res.on('end', (result) => {
            console.log("aa")
            output.sys("COMMUNICATION WITH SERVER ENDS AAAAAAAAAAA", "OK");
          });
          res.on('error', () => {
            output.sys("COMMUNICATION ERRORS WITH SERVER", "ERROR");
          });
        });

        req.on('error', (err) => {
          req.abort();
          return resolve({status: 502, message: "Server not connected"})
          output.sys("COMMUNICATION ERRORS WITH SERVER - TIMEOUT", "ERROR");
        });
        req.write(post_data);
        req.end();
      }catch(err){
        resolve({status: 502, error: "Server not connected"})
        req.end();
      }

    })

  }

}

export default new HttpService();
