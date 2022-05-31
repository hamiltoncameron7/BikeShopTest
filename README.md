# chicago-divvy-bike-rental-platform
This is REST API for the Chicago Divvy Bike Rental platform using the Divvy API and the provided trip data.

# Author: Cameron Hamilton

## Dependencies
* CLI
    * CLI is Command Line Interface otherwise known as Command Prompt, Powershell, Git Bash, Git Shell, Git Terminal
* [Node.js](http://nodejs.org/)
    * Install Node version v12.14.1
        * Visit official website and "Install" (not "Download")
    * Verify
        * Open CLI
        * Run `node -v`
        * Expect a version number
* Dev local setup
    * Install
        * Open CLI as Administrator
        * Change directory to the web site root
        * Run `npm --save i`
    * Verify
        * Open CLI
        * Run `npm start`

## Commands

To run the server navigate into the directory and use,

```shell

node main.js

OR

npm start

```
## General Notes

All new code is in index.js
The functions for Requirements 1, 2 and 3 are outlined with comments

####Find all data
```
findDataFromId(station_id)
``` 
This will search through the station_information.json and return all data in the object with station_id
####Get age groups
```
getAgeGroupsFromEndingIDs([array of Station IDs])
```
This will read through the massive DivvyTrips.csv file and save to/return global object tripsSepByAge, which contains an array for each age group. For example: 
```
tripsSepByAge['0-20'][0] 
```
This would return the first object (trip) in the 0-20 age range array
####Get last twenty rides
```
getLastTwentyRides([array of Station IDs])
```
This will read through the massive DivvyTrips.csv file, save out all trips that end at any of the station IDs provided to their own array housed in the object allAtEndStation[station ID]. Then, this array is sorted by trip end time, and output into lastTwentyRides[station ID]. Finally, these arrays are logged to the console.

I did not get around to checking these for a single day, but if I were to add that, I would pass the day in as an input to the overall function, and use it in an if statement inside the readStream2 in order to only grab trips from that day, something like this: 
```
function(EndIDInputs2, inputDate){

//add variables to store date data

    var dateOfInput = new Date(inputDate);
    var dateOfObj = new Date(tripChunk['01 - Rental Details Local End Time']);


//existing for loop inside readStream2

    for(const EndID2 of EndIDInputs2){

      //added to this IF statement, but have not tested this

      if(tripChunk['02 - Rental End Station ID'] == EndID2 && dateOfObj.getDate() == dateOfInput.getDate() && dateOfObj.getMonth() == dateOfInput.getMonth() && dateOfObj.getFullYear() == dateOfInput.getFullYear()){
        var name = tripChunk['02 - Rental End Station ID'];
        if(name in allAtEndStation == false){
          allAtEndStation[name] = [];
        }
        if(allAtEndStation[name]['01 - Rental Details Local End Time']
        allAtEndStation[name].push(tripChunk);
      }
    }
```
