const BetweenDates = (date1, date2) => {
  let cDate = Date.now()
  if(date1 <= cDate && cDate >= date2){
    //console.log(date1, "is larger than", date2);
    return true;
  }
  //console.log(date1, "is NOT? larger than", date2);
  return false;
};



module.exports.BetweenDates = BetweenDates