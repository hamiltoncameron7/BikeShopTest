/*index.js*/

//import needed modules------------------------------------------------------------

//const express = require('express'); //not needed at the moment
//const path = require('path'); //not needed at the moment
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); //import node-fetch
const fs = require('fs');
const parseCSV = require('csv-parser');

//initialize local server at localhost:3000 using express, not used right now---------------------------
/*
const app = express();
const port = 3000; //port to listen on

//responds with index.html if you go to localhost:3000
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

//start listening for requests to localhost:3000
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});
*/

//fetch json data from a url------------------------------------------------------
async function fetchAsync (url) {
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

//---------------------------------------------------------------------------------------------------------

/*1. Return the information for one station given a station id: a3a99346-a135-11e9-9cda-0a87ae2ba916*/

//initialize bikeStations to store stations array
var bikeStations;

//function will return station data with station_id input
async function findDataFromId(inputId) {
  await fetchAsync("https://gbfs.divvybikes.com/gbfs/en/station_information.json")
  .then(data => {
    //save stations array to global var bikeStations
    bikeStations = data.data.stations;
  })
  .catch(reason => console.log(reason.message))

  //search with for loop
  for(let i = 0;i < bikeStations.length; i++){
    if(inputId == bikeStations[i].station_id){
      return bikeStations[i];
    }
  }

}

//testing to make sure this works, using example station_id: "a3a99346-a135-11e9-9cda-0a87ae2ba916", console.log station info
async function conLogData(){
  console.log("Starting search for object with requested station_id...");
  console.log("Data at requested station_id:\n ", await findDataFromId("a3a99346-a135-11e9-9cda-0a87ae2ba916"));
}
conLogData();

//--------------------------------------------------------------------------------------------------------

/*2. Given one or more stations, return the number of riders in the following age groups, [0-20,21-30,31-40,41-50,51+, unknown], who ended their trip at that station for a given day.*/

var checkForCompletionVar; //dummy var to clear interval for continual update message
var checkForCompletionVar2; //dummy var to clear interval for continual update message
var currentDate = new Date();
var tripsSepByAge = {};
tripsSepByAge['0-20'] = [];
tripsSepByAge['21-30'] = [];
tripsSepByAge['31-40'] = [];
tripsSepByAge['41-50'] = [];
tripsSepByAge['51+'] = [];
tripsSepByAge['unknown'] = [];

//arrays to hold trips in age groups
var zeroToTwenty = [];
var twentyToThirty = [];
var thirtyToForty = [];
var fortyToFifty = [];
var fiftyPlus = [];
var unknownYear = [];

async function getAgeGroupsFromEndingIDs(EndIDInputs){
  var readStream = fs.createReadStream('./public/DivvyTrips.csv')
  .on('error', () => {
    console.log("Error");
  })
  .pipe(parseCSV()) //convert data to object to push
  .on('data', function(tripChunk){
    for(const EndID of EndIDInputs){
      if(tripChunk['02 - Rental End Station ID'] == EndID){
        if(tripChunk['05 - Member Details Member Birthday Year'] != ''){
          const intOfYear = parseInt(tripChunk['05 - Member Details Member Birthday Year']); //parse string year to int
          const diffOfYears = currentDate.getFullYear() - intOfYear; //difference between current year and birth year = age
          if(diffOfYears <= 20){
            zeroToTwenty.push(tripChunk);
          }
          else if(diffOfYears > 20 && diffOfYears <= 30){
            twentyToThirty.push(tripChunk);
          }
          else if(diffOfYears > 30 && diffOfYears <= 40){
            thirtyToForty.push(tripChunk);
          }
          else if(diffOfYears > 40 && diffOfYears <= 50){
            fortyToFifty.push(tripChunk);
          }
          else if(diffOfYears > 50){
            fiftyPlus.push(tripChunk);
          }
          else{
            console.log("Something went wrong");
          }
        }
        else{
          unknownYear.push(tripChunk);
        }
      }
    }
  })
  .on('end', function() {
    console.log("Read stream complete.");
  })

  function checkForCompletion(){
    if(readStream.readableEnded){
      tripsSepByAge['0-20'] = zeroToTwenty;
      tripsSepByAge['21-30'] = twentyToThirty;
      tripsSepByAge['31-40'] = thirtyToForty;
      tripsSepByAge['41-50'] = fortyToFifty;
      tripsSepByAge['51+'] = fiftyPlus;
      tripsSepByAge['unknown'] = unknownYear;
      console.log("Number of trips that ended at the requested station(s), separated by age groups:\n0-20:", zeroToTwenty.length, "\n21-30:", twentyToThirty.length, "\n31-40:", thirtyToForty.length, "\n41-50:", fortyToFifty.length, "\n51+:", fiftyPlus.length, "\nunknown:", unknownYear.length);
      clearInterval(checkForCompletionVar);
    }
    else{
      console.log("Searching for requested data, this could take a while...");
    }
  }
  checkForCompletionVar = setInterval(checkForCompletion, 1000);
  return tripsSepByAge; //returns multidimensional object with arrays as the values. Example: tripsSepByAge['0-20'][0] this would return the first object (trip) in the 0-20 array
}

console.log("Starting read stream");
getAgeGroupsFromEndingIDs(['1', '2', '3', '4']);

//-------------------------------------------------------------------------------------------------------
/*3. Given one or more stations, return the last 20 trips that ended at each station for a single day*/
//this one isnt quite perfect, looks like the lastTwentyRides adds an extra array or something

var allAtEndStation = {};
var lastTwentyRides = {};

async function getLastTwentyRides(EndIDInputs2){
  var EndIDInputsLastTry = EndIDInputs2;
  var readStream2 = fs.createReadStream('./public/DivvyTrips.csv')
  .on('error', () => {
    console.log("Error");
  })
  .pipe(parseCSV()) //convert data to object to push
  .on('data', function(tripChunk){
    for(const EndID2 of EndIDInputs2){
      if(tripChunk['02 - Rental End Station ID'] == EndID2){
        var name = tripChunk['02 - Rental End Station ID'];
        if(name in allAtEndStation == false){
          allAtEndStation[name] = [];
        }
        allAtEndStation[name].push(tripChunk);
      }
    }
  })
  .on('end', function() {
    console.log("Read stream complete.");
  })

  function checkForCompletion2(){
    if(readStream2.readableEnded){
      for(const EndID2 of EndIDInputsLastTry){
          allAtEndStation[EndID2].sort(function(dateOne, dateTwo){
            var keyOne = new Date(dateOne['01 - Rental Details Local End Time']);
            var keyTwo = new Date(dateTwo['01 - Rental Details Local End Time']);
            if(keyOne.getTime()>keyTwo.getTime()){
              return -1;
            }
            else if(keyOne.getTime()<keyTwo.getTime()){
              return 1;
            }
          });
        }
      for(var EndID3 of EndIDInputsLastTry){
        for(var i = 0; i < 20; i++){
          if(typeof allAtEndStation[EndID3][i] != "undefined" && allAtEndStation[EndID3][i] != ''){
            var name2 = allAtEndStation[EndID3][i];
            if(name2 in lastTwentyRides == false){
              lastTwentyRides[name2] = [];
            }
            lastTwentyRides[name2].push(allAtEndStation[EndID3][i]);
          }
        }
        console.log("Last Twenty for ", EndID3, ":", lastTwentyRides[EndID3]);
      }

      clearInterval(checkForCompletionVar2);
    }
    else{
      console.log("Searching for requested data, this could take a while...");
    }
  }
  checkForCompletionVar2 = setInterval(checkForCompletion2, 1000);
}
getLastTwentyRides(['1', '2']);