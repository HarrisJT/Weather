/*
 needed for codepen:

 $(document).ready(function() {
 if (document.location.protocol == "http:") {
 $('#welcome').html('Please use a
 <a href="https://codepen.io/mattgaskey/full/amybBb/" target="_blank" class="secure">secure
 connection</a> to access the weather.');
 } else if (document.location.protocol == "https:") {
 weather();
 }
 });  */

function weather(units) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      let darkskyRequest = new XMLHttpRequest();
      darkskyRequest.open('GET', `https://api.darksky.net/forecast/f9597e8f28be3e2b4cd4cd9172f382b3/${lat},${lon}?exclude=minutely,alerts&units=${units}`, true);
      darkskyRequest.setRequestHeader('Accept', 'application/json');
      darkskyRequest.onload = function () {
        if (this.status >= 200 && this.status < 400) {
          const resp = JSON.parse(this.response);
          const icon = resp.currently.icon;
          const temp = document.querySelector('.weather-current__temp');
          const summary = document.querySelector('.weather-current__summary');
          const wind = document.querySelector('.weather-current__wind');
          const feel = document.querySelector('.weather-current__feel');
          const updateTimeElement = document.querySelector('.weather-current__update-time');

          // Return celsius or fahrenheit based on
          const degreeUnits = (function (u) {
            switch (u) {
              case 'us':
                return 'F';
                break;
              case 'uk2':
              case 'ca':
              case 'si':
                return 'C';
                break;
            }
          })(resp.flags.units);

          // Return the wind speed unit from unit response
          const speedUnits = (function (unitFlag) {
            switch (unitFlag) {
              case 'uk2':
              case 'us':
                return 'mph';
                break;
              case 'si':
                return 'm/s';
                break;
              case 'ca':
                return 'km/h';
                break;
            }
          })(resp.flags.units);

          //DAILY

          // Update the weather-current__wind text
          wind.innerHTML = updateWind(resp.currently.windSpeed, speedUnits,
              resp.currently.windBearing);

          // Update the weather-current__update-time element with formatted time
          updateTimeElement.innerHTML = `(Updated ${updateTime(resp.currently.time,
              resp.flags.units)})`;

          temp.innerHTML = `${Math.round(resp.currently.temperature)}&deg;${degreeUnits}`;
          summary.innerHTML = `${resp.currently.summary}.`;
          feel.innerHTML = `Feels like ${Math.round(resp.currently.apparentTemperature)}&deg;
          ${degreeUnits}`;

          //HOURLY

          const todaySummary = document.querySelector('.weather-today__summary');
          const todayHigh = document.querySelector('.weather-today__high');
          const todayLow = document.querySelector('.weather-today__low');
          const hourlyInfo = document.querySelectorAll('.hour__info');
          const hourlyTemp = document.querySelectorAll('.hour__temp');
          const hourlySummary = document.querySelectorAll('.hour__summary');

          // Adding the info to hourly
          todaySummary.innerHTML = resp.hourly.summary;
          todayHigh.innerHTML = `High ${Math.round(resp.daily.data[0].temperatureMax)}&deg;`;
          todayLow.innerHTML = `Low ${Math.round(resp.daily.data[0].temperatureMin)}&deg;`;


          // Update all the weather-hourly__item elements in the hourly list
          for (let i = 0; i <= 8; i++) {
            // Get the full update time, regex the first number(hour)
            // and the last two letters (am/pm) and joins them with no space
            hourlyInfo[i].innerHTML = `${updateTime(resp.hourly.data[i + 1].time, resp.flags.units)
                .match(/^\d*|[a-z]{2}.*$/g).join('')}`;
            hourlyTemp[i].innerHTML = `${Math.round(resp.hourly.data[i + 1].temperature)}&deg;`;
            hourlySummary[i].innerHTML = `${resp.hourly.data[i + 1].summary} feels like
            ${Math.round(resp.hourly.data[i + 1].apparentTemperature)}&deg; with 
            ${updateWind(resp.hourly.data[i + 1].windSpeed, speedUnits, resp.hourly.data[i + 1].windBearing)
                .split(' coming').shift()}`;
          }

        } else {
          console.log('test1');
        }
      };

      darkskyRequest.onerror = function () {
        console.log('test2');
      };

      darkskyRequest.send();

      let googleRequest = new XMLHttpRequest();
      googleRequest.open('GET', `https://maps.googleapis.com/maps/api/geocode/json?result_type=locality|country&latlng=${lat},${lon}&key=AIzaSyAzEv9zvjg8QDMstcTU-p2zSJPMZG7wrxI`, true);
      googleRequest.setRequestHeader('Accept', 'application/json');
      googleRequest.onload = function () {
        const location = document.querySelector('.location__current');
        if (this.status >= 200 && this.status < 400) {
          const resp = JSON.parse(this.response);
          const city = resp.results[0].formatted_address.split(/\d+/g).shift();
          location.innerHTML = `Weather For: ${city}`;
        } else {
          console.log('test3');
        }
      };

      googleRequest.onerror = function () {
        console.log('test4');
      };

      googleRequest.send();
    });
  }
}

// Format and update the weather-current__wind-time
function updateWind(windSpeed, speedUnits, windBearing) {
  let windScale;

  function isWindSpeedBelowMph(mphValue) {
    if (speedUnits === 'm/s' && windSpeed < mphValue * 0.447) {
      return true;
    }

    if (speedUnits === 'km/h' && windSpeed < mphValue * 1.609) {
      return true;
    }

    return speedUnits === 'mph' && windSpeed < mphValue;
  }

  // set the windScale based on the Beaufort Scale
  if (isWindSpeedBelowMph(2)) {
    windScale = 'calm air';
  } else if (isWindSpeedBelowMph(7)) {
    windScale = 'light breeze';
  } else if (isWindSpeedBelowMph(12)) {
    windScale = 'breeze';
  } else if (isWindSpeedBelowMph(25)) {
    windScale = 'wind';
  } else if (isWindSpeedBelowMph(38)) {
    windScale = 'high wind';
  } else if (isWindSpeedBelowMph(46)) {
    windScale = 'gale';
  } else if (isWindSpeedBelowMph(54)) {
    windScale = 'strong gale';
  } else if (isWindSpeedBelowMph(63)) {
    windScale = 'storm';
  } else if (isWindSpeedBelowMph(72)) {
    windScale = 'violent storm';
  } else {
    windScale = 'hurricane force';
  }

  const arr = ['North', '<abbr title="North-Northeast">NNE</abbr>', '<abbr title="Northeast">NE</abbr>',
    '<abbr title="East-Northeast">ENE</abbr>', 'East', '<abbr title="East-Southeast">ESE</abbr>',
    '<abbr title="Southeast">SE</abbr>', '<abbr title="South-Southeast">SSE</abbr>', 'South',
    '<abbr title="South-Southwest">SSW</abbr>', '<abbr title="Southwest">SW</abbr>',
    '<abbr title="West-Southwest">WSW</abbr>', 'West', '<abbr title="West-Northwest">WNW</abbr>',
    '<abbr title="NorthWest">NW</abbr>', '<abbr title="North-Northwest">NNW</abbr>',];
  const windBearingDirection = arr[(Math.floor((windBearing / 22.5) + 0.5) % 16)];

  return `a ${Math.round(windSpeed)} ${speedUnits} ${windScale} coming from the <a href="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Compass_Rose_English_North.svg/1000px-Compass_Rose_English_North.svg.png" target="_blank">${windBearingDirection}</a>`;
}

// Format and update the weather-current__update-time from the UNIX time response
function updateTime(time, units) {
  const date = new Date(time * 1000);
  let dd = '';
  let hour = date.getHours();

  // If UK/US/CA then use the 12hour clock format
  if (units === 'us' || units === 'uk2' ||
      units === 'ca') {
    dd = 'am';
    if (hour >= 12) {
      hour = hour - 12;
      dd = 'pm';
    }

    if (hour == 0) {
      hour = 12;
    }
  }

  const minutes = '0' + date.getMinutes();
  const seconds = '0' + date.getSeconds();
  return `${hour}:${minutes.substr(-2)}:${seconds.substr(-2)}${dd}`;
}

window.onload = function () {
  weather('auto');
  document.querySelector('.weather-unit__si').addEventListener('click', function () {
    weather('si');
  }, false);

  document.querySelector('.weather-unit__us').addEventListener('click', function () {
    weather('us');
  }, false);

  document.querySelector('.weather-unit__ca').addEventListener('click', function () {
    weather('ca');
  }, false);

  document.querySelector('.weather-unit__uk').addEventListener('click', function () {
    weather('uk2');
  }, false);
};
