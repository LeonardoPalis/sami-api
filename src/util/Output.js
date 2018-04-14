exports.sys = function(data, status) {
  if (status != "OK" && status != "IGNORED" && status != "ERROR") throw "Output.js: Status type is not a know value";
  console.log(">> " + data + " - " + status);
};

exports.db = function(data) {
  console.log("db: " + data);
};
