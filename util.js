const { networkInterfaces } = require('os');

function BetweenDates(date1, date2) {
  let cDate = new Date();
  console.log("Current Date", cDate.getDate());
  if(date1 <= cDate && cDate <= date2){
    console.log(date1, "is larger than", date2);
    return true;
  }
  console.log(date1, "is NOT? larger than", date2);
  return false;
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getIPAddress(){
  const nets = networkInterfaces();
  const results = Object.create(null); // Or just '{}', an empty object

  for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
          // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
          // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
          const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
          if (net.family === familyV4Value && !net.internal) {
              if (!results[name]) {
                  results[name] = [];
              }
              results[name].push(net.address);
          }
      }
  }
  return results;
}

function getCentralTime(){
  let time = (new Date().toLocaleTimeString("en-GB", { timeZone: "America/Chicago" }))
  time = time.substring(0, time.indexOf(":"))
  return time;
}

module.exports.BetweenDates = BetweenDates
module.exports.sleep = sleep
module.exports.getIPAddress = getIPAddress;
module.exports.getHour = getCentralTime;