const express = require('express')
const app = express()
var request = require('request');
var http = require('http');
var querystring = require('querystring');
let bodyParser = require('body-parser');
let validator = require('../database/validator.js');
import datastore from '../database/Datastore.js';
var mysql = require('mysql');
import {SENSOR_SUPER_PERMISSION} from "../constants.js";
import sensorMonitorService from '../service/SensorMonitorService.js';
import gsService from '../service/GeneralSystemService.js';
import RequestIn from '../model/RequestInModel.js';
import requestInService from '../service/RequestInService';
app.use(function(req, res, next) { res.header('Access-Control-Allow-Origin', '*'); res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); next(); });
app.use(bodyParser.json());
app.use(express.static('build'));

gsService.initSystem();

app.get('/', function (req, res) {
  res.send('Welcome SAMI API')
})

app.get('/sensors/', function (req, res) {
  var list = datastore.getAllInTable("sensors").then(function(result){
    res.send(result);
  }).catch(function(err, result){
    res.status(500);
    res.send(err);
  });
})

app.post('/sensor/auth/ack/:sensorId', function (req, res) {
  let sensorId = req.params["sensorId"];
  sensorMonitorService.setAddress(sensorId, req.body["address"]).then((result)=>{
    res.send({status: result.status, message: result.message});
  })
})

app.post('/sensors/:sensorId', function (req, res) {
  let sensorId = req.params["sensorId"];
  sensorMonitorService.tryRegisterNewSensorAndSave(sensorId ,req.body).then((result)=>{
    res.send({status: result.status, message: result.message});
  })
})

app.post('/hub/:authentication_key', function (req, res) {
  let authentication_key = req.params["authentication_key"];
  datastore.setCredentials(authentication_key, req.body["data"]["name"],
            req.body["data"]["password"], req.body["data"]["role"], req.body["data"]["created_at"]).then((result)=>{
    res.status(result.status);
    res.send({"status": result.status, "message": result.message});
  })
})

app.delete('/sensors/:sensorId', function (req, res) {
  var a = new Date();
  let sensorId = req.params["sensorId"];
  datastore.deleteSensor("sensors", sensorId).then((result)=>{
    res.status(result);
    let response = getResponse(result);
    if(result == 200){
      res.send({"sensorId": sensorId, "result": response});
    }else{
      res.send({"error":response});
    }
  })
})

app.post('/requestin/:sensorId', function (req, res) {
  console.log(req.headers['x-forwarded-for'])
  var sensorId = req.params["sensorId"];
  var value = req.body;
  const requestIn = new RequestIn({sensor_id: sensorId , syncronized: req.body["syncronized"], value: req.body["value"], timeout: req.body["timeout"], role: req.body["role"], created_at: req.body["created_at"] });
  global.NUMBER_OF_NEW_REQUESTS_IN += 1;
  global.LOCAL_NUMBER_OF_NEW_REQUESTS_IN += 1;

  if(requestIn.role == SENSOR_SUPER_PERMISSION){
    requestInService.sendRequestBySuperSensor(sensorId, req.body).then((result)=>{
      res.status(result.status);
      res.send({status: result.status, message: result.message});
    })
  }else{
    datastore.newRequestIn(requestIn).then((request)=>{
      res.status(request.status);
      res.send({status: request.status, message: request.message});
    })
  }
})

app.delete('/requestin/:sensorId', function (req, res) {
  var a = new Date();
  let sensorId = req.params["sensorId"];
  datastore.deleteRequest("sensors", sensorId).then((result)=>{
    res.status(result);
    let response = getResponse(result);
    if(result == 200){
      res.send({"sensorId": sensorId, "result": response});
    }else{
      res.send({"error":response});
    }
  })
})

let port = process.env.PORT || 3000;

app.set('port', port);

app.listen(5000, function () {
  console.log('Listening on port 3000!')
})

function getResponse(code){
  switch (code) {
    case 200:
      return "Ok";
    case 400:
      return "Please, make sure the hours on your device are set up correctly";
    case 403:
      return "This object are not registered";
    case 409:
      return "This id is already registered"
    default:
      return "Somithing is wrong";
  }
}
