/*
 needed for codepen:

 $(document).ready(function() {
 if (document.location.protocol == "http:") {
 $('#welcome').html('Please use a
 <a href="https://codepen.io/mattgaskey/full/amybBb/" target="_blank" class="secure">secure connection</a> to access the weather.');
 } else if (document.location.protocol == "https:") {
 weather();
 }
 });  */

function weather(units) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const darkskyRequest = new XMLHttpRequest();
      darkskyRequest.open('GET', `https://api.darksky.net/forecast/f9597e8f28be3e2b4cd4cd9172f382b3/${lat},${lon}?exclude=minutely,alerts&units=${units}`, true);
      darkskyRequest.setRequestHeader('Accept', 'application/json');
      darkskyRequest.onload = function () {
        if (this.status >= 200 && this.status < 400) {
          const resp = JSON.parse(this.response);
          const icon = resp.currently.icon;
          const temp = document.querySelector('.weather-current__temp');
          const updateTime = document.querySelector('.weather-current__update-time');
          const summary = document.querySelector('.weather-current__summary');
          const feel = document.querySelector('.weather-current__feel');
          const wind = document.querySelector('.weather-current__wind');

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

          // Return the wind speed text based on the Beaufort Scale relevant to units response
          const windScale = (function (windSpeed) {
            isWindSpeedBelowMph = function (mphValue) {
              if (speedUnits === 'm/s' && windSpeed < mphValue * 0.447) {
                return true;
              }

              if (speedUnits === 'km/h' && windSpeed < mphValue * 1.609) {
                return true;
              }

              return speedUnits === 'mph' && windSpeed < mphValue;
            };

            if (isWindSpeedBelowMph(2)) {
              return 'Calm Air';
            } else if (isWindSpeedBelowMph(7)) {
              return 'Light Breeze';
            } else if (isWindSpeedBelowMph(12)) {
              return 'Breeze';
            } else if (isWindSpeedBelowMph(25)) {
              return 'Wind';
            } else if (isWindSpeedBelowMph(38)) {
              return 'High Wind';
            } else if (isWindSpeedBelowMph(46)) {
              return 'Gale';
            } else if (isWindSpeedBelowMph(54)) {
              return 'Strong Gale';
            } else if (isWindSpeedBelowMph(63)) {
              return 'Storm';
            } else if (isWindSpeedBelowMph(72)) {
              return 'Violent Storm';
            } else {
              return 'Hurricane Force';
            }
          })(resp.currently.windSpeed);

          // Return direction of wind from windBearing angle response
          const windDirection = (function degToCompass(windBearing) {
            const arr = ['North', '<abbr title="North-Northeast">NNE</abbr>', '<abbr title="Northeast">NE</abbr>',
              '<abbr title="East-Northeast">ENE</abbr>', 'East', '<abbr title="East-Southeast">ESE</abbr>',
              '<abbr title="Southeast">SE</abbr>', '<abbr title="South-Southeast">SSE</abbr>', 'South',
              '<abbr title="South-Southwest">SSW</abbr>', '<abbr title="Southwest">SW</abbr>',
              '<abbr title="West-Southwest">WSW</abbr>', 'West', '<abbr title="West-Northwest">WNW</abbr>',
              '<abbr title="NorthWest">NW</abbr>', '<abbr title="North-Northwest">NNW</abbr>',];
            return arr[(Math.floor((windBearing / 22.5) + 0.5) % 16)];
          })(resp.currently.windBearing);

          // Update the update-time element from UNIX time response
          (function (time) {
            let dd = '';
            let hour = time.getHours();

            // If UK/US/CA then use the 12hour clock format
            if (resp.flags.units === 'us' || resp.flags.units === 'uk2' ||
                resp.flags.units === 'ca') {
              dd = 'am';
              if (hour >= 12) {
                hour = hour - 12;
                dd = 'pm';
              }

              if (hour == 0) {
                hour = 12;
              }
            }

            const minutes = '0' + time.getMinutes();
            const seconds = '0' + time.getSeconds();
            updateTime.innerHTML = `(Updated ${hour}:${minutes.substr(-2)}:${seconds.substr(-2)}${dd})`;
          })(new Date(resp.currently.time * 1000));
          temp.innerHTML = `${Math.round(resp.currently.temperature)}&deg;`;
          summary.innerHTML = `${resp.currently.summary}.`;
          feel.innerHTML = `Feels like ${Math.round(resp.currently.apparentTemperature)}&deg;`;
          wind.innerHTML = `a ${Math.round(resp.currently.windSpeed)} ${speedUnits} ${windScale} coming from the <a href="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Compass_Rose_English_North.svg/1000px-Compass_Rose_English_North.svg.png" target="_blank">${windDirection}</a>`;
        } else {
          console.log('test1');
        }
      };

      darkskyRequest.onerror = function () {
        console.log('test2');
      };

      darkskyRequest.send();

      const googleRequest = new XMLHttpRequest();
      googleRequest.open('GET', `https://maps.googleapis.com/maps/api/geocode/json?sensor=false&result_type=political&latlng=${lat},${lon}&key=AIzaSyAzEv9zvjg8QDMstcTU-p2zSJPMZG7wrxI`, true);
      googleRequest.setRequestHeader('Accept', 'application/json');
      googleRequest.onload = function () {
        const location = document.querySelector('.location__current');
        if (this.status >= 200 && this.status < 400) {
          const resp = JSON.parse(this.response);
          const city = resp.results[0].formatted_address;
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

window.onload = function () {
  weather('auto');
};

// TODO: buttons call weather with different units, maybe add different units?
