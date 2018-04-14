function validatorRequestSensor(con, sensorId){
  return new Promise((resolve)=>{
    con.query("SELECT route FROM sensors WHERE id =\'" + sensorId + "\'", function (err, result, fields) {
      if (err){
        resolve(404);
      }else if(result.length > 0){
        resolve(200);
      }else{
        resolve(403);
      }
    });
  })
}

function validatorCreateSensor(con, sensorId){
  return new Promise((resolve)=>{
    con.query("SELECT route FROM sensors WHERE id =\'" + sensorId + "\'", function (err, result, fields) {
      if (err){
        resolve(404);
      }else if(result.length == 0){
        resolve(403);
      }else{
        resolve(409);
      }
    });
  })
}

function validatorSetConfig(con){
  return new Promise((resolve)=>{
    con.query("SELECT authentication_key FROM config", function (err, result, fields) {
      if (err){
        resolve(false);
      }else if(result.length == 0){
        resolve(true);
      }else{
        resolve(false);
      }
    });
  })
}



exports.validatorRequestSensor = validatorRequestSensor;
exports.validatorCreateSensor = validatorCreateSensor;
exports.validatorSetConfig = validatorSetConfig;
