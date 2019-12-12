///////////////////////////
//  BOUNDARY CONDITIONS  //
///////////////////////////
const MILD_WEATHER_IDS = [300, 310, 500, 520, 600, 612, 615, 620];
const NUM_MILD_IDS = 8;
const MODERATE_WEATHER_IDS = [210, 301, 311, 313, 501, 521, 601, 621];
const NUM_MODERATE_IDS = 8;
const BAD_WEATHER_IDS = [200, 201, 211, 230, 231, 302, 312, 314, 321, 502, 511, 522, 531, 602, 611, 613, 616];
const NUM_BAD_IDS = 19;
const EXTREME_WEATHER_IDS = [202, 212, 221, 232, 503, 504, 622, 771, 781];
const NUM_EXTREME_IDS = 9;
const BAD_ATMOS_IDS_RHB = [762, 761, 751, 731, 711];
const NUM_BAD_ATMOS_IDS_RHB = 5;
const BAD_ATMOS_IDS_S = [701, 741];
const NUM_BAD_ATMOS_IDS_S = 2;
//temps are in Kelvin
const HOTTEST_TEMP = 327, HOTTER_TEMP = 313, HOT_TEMP = 305;
const COLDEST_TEMP = 247, COLDER_TEMP = 263, COLD_TEMP = 278; 
//wind speed in m/s
const HIGHEST_WIND = 17, HIGHER_WIND = 13.5, HIGH_WIND = 11;

/////////////////
//  VARIABLES  //
/////////////////
var alerts = new Array();
var suggestions = new Array();
var numAlerts = 0, numSuggestions = 0, safetyVal = 100;


////////////////////////
//  HELPER FUNCTIONS  //
////////////////////////

//adds an alert to the list
function addAlert(text) {
  alerts[numAlerts] = text;
  numAlerts++;
}

//adds a suggestion to the list
function addSuggestion(text) {
  suggestions[numSuggestions] = text;
  numSuggestions++;
}

//adjusts temp for wind chill if necessary
function calculateWindChill(speedMS, tempK) {
    console.log("adjusting for wind chill"); //for testing
    //converting temp and speed into fahrenheit and mph
    tempF = (tempK-273.15)*9/5 + 32;
    alert = "Temperature adjusted for wind chill: original temperature: " + tempF;
    speedMPH = speedMS*2.237;
    //calculating windchill using formula
    windChillF = 35.74 + 0.6215*tempF - 35.75*Math.pow(speedMPH, 0.16) + 0.4275*tempF*Math.pow(speedMPH,0.16);
    alert += " degrees, with wind chill: " + windChillF + " degrees."; 
    //converting wind chill back to Kelvin
    windChillK = (windChillF - 32)*5/9 + 273;
    console.log("temp: "+tempK+", speed: "+speedMS+", windChill: "+windChillK); //for testing
    console.log(alert);
    addAlert(alert);
    //alerts[numAlerts] = alert;
    //numAlerts++;
    return windChillK;
}

//checks conditions that immediately make activities dangerous
function checkForImmediateNo(temp, activity, weather_id, weather_descrip, wind, time, sunset, sunrise) {
    //console.log("temp: " + temp+ ", wind_speed: " + wind + ", activity: " + activity + ", weather_id: " + weather_id + ", weather_descrip: " + weather_descrip);
    //temps too cold for swimming
    if(activity == "swim" && temp < COLD_TEMP) {
      console.log("too cold");
      addAlert("Temperatures are too cold to swim");
      return 0;
    }
    //thunderstorms not suitable for swimming
    if(activity == "swim" && Math.floor((weather_id / 100)) == 2) {
        addAlert("Thunderstorms are present. Swimming not recommended.");
        return 10;
    }
    //icy conditions not suitable for biking
    if(activity == "bike" && Math.floor((weather_id / 100)) == 6) {
        addAlert("Snowy conditions may make biking paths slippery.");
        return 10;
    }
    //extreme weather present
    for(i = 0; i < NUM_EXTREME_IDS; i++) {
        if(EXTREME_WEATHER_IDS[i] == weather_id) {
          addAlert("Extreme weather: " + weather_descrip);
          return 5;
        }
    }
    //wind speed too high
    if(wind > HIGHEST_WIND) {
      addAlert("Wind speed is too high.");
      return 5;
    }
    //temp too hot
    if(temp > HOTTEST_TEMP) {
      addAlert("Temperatures are extrememly hot. Going outside may lead to heatstroke.");
      return 0;
    }
    //temp too cold
    if(temp < COLDEST_TEMP) {
      addAlert("Temperatures are extrememly cold. Going outside may lead to frostbite or hypothermia");
      return 0;
    }
    //dark outside
    if(time > sunset || time < sunrise) {
      addAlert("It is dark outside.");
      if(activity == "run") {
          addSuggestion("Wear reflective clothing and/or a headlamp when running in the dark");
          return 70;
      }
      else
          return 5;
    }
    return 100;
}

// adjusts the safety score based on the type of weather 
function adjustForWeather(activity, weather_id, weather_descrip) 
{
    alerts = [];
    suggestions = [];
    numAlerts = 0, numSuggestions = 0;
    //looking at the main weather categories
    main_id = Math.floor(weather_id/100); 
    switch(main_id) {
        case 2: 
            addSuggestion("Stay in a covered area if possible, especially if lightning gets close.");
            addAlert("Thunderstorms present.");
            break;
        case 5:
            addSuggestion("Stay dry and warm with waterproof clothing.");
            break;
        case 6:
            addSuggestion("Stay dry and warm with waterproof clothing.");
            addAlert("Snow present. Slippery conditions may exist");
            break;
        default:
            break;
    }
    //checking for mild weather 
    for(i = 0; i < NUM_MILD_IDS; i++) {
        if(weather_id == MILD_WEATHER_IDS[i]) {
            addAlert("Mild weather: " + weather_descrip);
            return 5;
        }
    }
    //checking for moderate weather
    for(i = 0; i < NUM_MODERATE_IDS; i++) {
        if(weather_id == MODERATE_WEATHER_IDS[i]) {
            addAlert("Moderate weather: " + weather_descrip);
            return 10;
        }
    }
    //checking for bad weather
    for(i = 0; i < NUM_BAD_IDS; i++) {
        if(weather_id == BAD_WEATHER_IDS[i]) {
            addAlert("Bad weather: " + weather_descrip);
            return 20;
        }
    }
    return 0;
}

// adjusts the safety value based on the temperature
function adjustForTemp(activity, temp)
{
    //checking for hot temps
    if(temp < HOTTER_TEMP && temp > HOT_TEMP) {
        addAlert("Temperatures are very hot. Heat exhaustion is likely.");
        addSuggestion("Limit outdoor activities at this temperature.");
        if(activity == "swim") 
            return 50;
        else
            return 70;
    }
    if(temp > HOTTER_TEMP && temp < HOTTEST_TEMP) {
        addAlert("Temperatures are very hot. Heat cramps and exhaustion are possible.");
        addSuggestion("Stay hydrated and limit intense exercise to a short period.");
        if(activity == "swim") 
            return 50;
        else
            return 70;
    }

    //checking for cold temps
    if(temp > COLD_TEMP && temp < COLDER_TEMP) { 
        addAlert("Temperatures are cold.");
        addSuggestion("Wear warm clothing.");
        return 40;
    }
    if(temp > COLDER_TEMP && temp < COLDEST_TEMP) { 
        addAlert("Temperatures are very cold. Frostbite is possible with excess exposure.");
        addSuggestion("Wear warm clothing, including a hat and gloves and limit exposure.");
        return 75;
    }
    return 0;
}

// adjusts the safety value based on the wind speed
function adjustForWind(wind_speed)
{
    if(wind_speed < HIGHER_WIND && wind_speed > HIGH_WIND) {
      addAlert("High winds");
      return 30;
    }
    if(wind_speed > HIGHER_WIND && wind_speed < HIGHEST_WIND) {
      addAlert("Very high winds.");
      return 50;
    }

    return 0;
}

/////////////////////
//  MAIN FUNCTION  //
/////////////////////

function calculateSafety(activity, weather_id, weather_descrip, temp, time, sunset, sunrise, wind_speed) {
    //for testing
    console.log("INITIAL CONDITIONS:");
    console.log("activity: " + activity + ", weather_id: " + weather_id + ", weather_descrip: " + weather_descrip);
    console.log("temp: " + temp + ", time: " + time + ", sunset: " + sunset + ", sunrise: " + sunrise + ", wind_speed: " + wind_speed);
    //checking if wind chill needs to be calculated
    if(temp < 283 && wind_speed > 1.34)
        temp = calculateWindChill(wind_speed, temp);
    //checking for overall bad/dangerous conditions and stopping if anything is found
    safetyVal = checkForImmediateNo(temp, activity, weather_id, weather_descrip, wind_speed);
    if(safetyVal < 50) {
        //printing out alerts -- for testing
        for(i = 0; i < numAlerts; i++)
            console.log(alerts[i]);
        return safetyVal;
    }
    //adjusting the safety value accordingly
    safetyVal -= adjustForWeather(activity, weather_id, weather_descrip);
    safetyVal -= adjustForTemp(activity, temp);
    safetyVal -= adjustForWind(wind_speed);
    if(safetyVal < 0)
        safetyVal = 0;
    return safetyVal;
}