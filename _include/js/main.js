function weather(units, lat, lon, countryCode) {
  let request = new XMLHttpRequest();
  request.open('GET', `https://api.darksky.net/forecast/f9597e8f28be3e2b4cd4cd9172f382b3/${lat},${lon}?exclude=minutely,alerts&units=${units}`, true);
  request.setRequestHeader('Accept', 'application/json');
  request.onload = function () {
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

      // DAILY
      document.querySelector('.weather-current__icon').src = `_include/img/icons/${icon}.svg`;

      // Update the weather-current__wind text
      wind.innerHTML = updateWind(resp.currently.windSpeed, speedUnits,
          resp.currently.windBearing);

      // Update the weather-current__update-time element with formatted time
      updateTimeElement.innerHTML = `(Updated ${updateTime(resp.currently.time, countryCode)})`;

      temp.innerHTML = `${Math.round(resp.currently.temperature)}&deg;${degreeUnits}`;
      summary.innerHTML = `${resp.currently.summary}.`;
      feel.innerHTML = `Feels like ${Math.round(resp.currently.apparentTemperature)}&deg;${degreeUnits}`;

      // TODAY & HOURLY

      const todaySummary = document.querySelector('.weather-today__summary');
      const todayHigh = document.querySelector('.weather-today__high');
      const todayLow = document.querySelector('.weather-today__low');
      const hourlyInfo = document.querySelectorAll('.hour__title');
      const hourlyTemp = document.querySelectorAll('.hour__temp');
      const hourlySummary = document.querySelectorAll('.hour__summary');

      // Adding the info to hourly
      todaySummary.innerHTML = resp.hourly.summary;
      todayHigh.innerHTML = `High ${Math.round(resp.daily.data[0].temperatureMax)}&deg; `;
      todayLow.innerHTML = `Low ${Math.round(resp.daily.data[0].temperatureMin)}&deg;`;


      // Update all the weather-hourly__item elements in the hourly list
      for (let i = 0; i <= 8; i++) {
        // Get the full update time, regex the first number(hour)
        // and the last two letters (am/pm) and joins them with no space
        hourlyInfo[i].innerHTML = `${updateTime(resp.hourly.data[i + 1].time, countryCode)}`;
        hourlyTemp[i].innerHTML = `${Math.round(resp.hourly.data[i + 1].temperature)}&deg;`;
        hourlySummary[i].innerHTML = `${resp.hourly.data[i + 1].summary} feels like
            ${Math.round(resp.hourly.data[i + 1].apparentTemperature)}&deg;
            ${updateWind(resp.hourly.data[i + 1].windSpeed, speedUnits, resp.hourly.data[i + 1].windBearing)
            .split(' coming').shift()}`;
      }

      // WEEK & DAILY
      const weekSummary = document.querySelector('.weather-week__summary');
      const dailyIcon = document.querySelectorAll('.day__icon');
      const dailyTitle = document.querySelectorAll('.day__title');
      const dailyHigh = document.querySelectorAll('.day__high');
      const dailyLow = document.querySelectorAll('.day__low');
      const dailySummary = document.querySelectorAll('.day__summary');
      const dailyPrecip = document.querySelectorAll('.day__precip');

      weekSummary.innerHTML = resp.daily.summary;
      const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug ', 'Sept', 'Oct', 'Nov', 'Dec'];

      function ordinalSuffix(i) {
        const j = i % 10;
        const k = i % 100;
        if (j == 1 && k != 11) {
          return i + 'st';
        }

        if (j == 2 && k != 12) {
          return i + 'nd';
        }

        if (j == 3 && k != 13) {
          return i + 'rd';
        }

        return i + 'th';
      }

      function rainChance(type, prob) {
        switch (type) {
          case undefined:
            return '';
            break;
          default:
            return ` Chance of ${type} is ${Math.round(prob * 100)}%`;
            break;
        }
      }

      for (let i = 1; i <= 7; i++) {
        const weekInfo = new Date(resp.daily.data[i].time * 1000);
        dailyIcon[i - 1].src = `_include/img/icons/${resp.daily.data[i].icon}.svg`;
        dailyTitle[i - 1].innerHTML = `${weekDays[weekInfo.getDay()]}, ${months[weekInfo.getMonth()]} ${ordinalSuffix(weekInfo.getDate())}`;
        dailyHigh[i - 1].innerHTML = `High ${Math.round(resp.daily.data[i].temperatureMax)}&deg; `;
        dailyLow[i - 1].innerHTML = `Low ${Math.round(resp.daily.data[i].temperatureMin)}&deg;`;
        dailySummary[i - 1].innerHTML = resp.daily.data[i].summary;
        dailyPrecip[i - 1].innerHTML = `${rainChance(resp.daily.data[i].precipType, resp.daily.data[i].precipProbability)}`;
      }

    } else {
      console.log('test1');
    }
  };

  request.onerror = function () {
    console.log('test2');
  };

  request.send();
  location(new google.maps.Geocoder(), lat, lon);
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

  // Set the windScale based on the Beaufort Scale
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

  return `with a ${Math.round(windSpeed)} ${speedUnits} ${windScale} coming from the <a href="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Compass_Rose_English_North.svg/1000px-Compass_Rose_English_North.svg.png" target="_blank">${windBearingDirection}</a>`;
}

// Format and update the weather-current__update-time from the UNIX time response
function updateTime(time, countryCode) {
  const date = new Date(time * 1000);
  let dd = '';
  let hour = date.getHours();
  const minutes = '0' + date.getMinutes();

  // The common countryCodes for countries that use 12 hour clock
  const twelveFormat = ['AU', 'CA', 'CO', 'EG', 'IN', 'IE', 'MY', 'NZ', 'PH', 'PK', 'SA', 'GB', 'US', 'VN'];
  if (twelveFormat.indexOf(countryCode) > -1) {
    dd = 'am';
    if (hour >= 12) {
      hour = hour - 12;
      dd = 'pm';
    }

    if (hour == 0) {
      hour = 12;
    }

    if (minutes === '00') {
      return `${hour}${dd}`;
    }

    return `${hour}:${minutes.substr(-2)}${dd}`;
  }

  return `${hour}:${minutes.substr(-2)}`;

}

function location(geocoder, lat, lon) {
  const latlng = {lat: parseFloat(lat), lng: parseFloat(lon)};
  const location = document.querySelector('.location__current');
  geocoder.geocode({location: latlng}, function (results, status) {
    if (status === 'OK') {
      for (let i = 0; i < results.length; i++) {
        if (results[i].types[0] === 'locality') {
          const city = results[i].formatted_address.split(/\d+/g).shift();
          location.innerHTML = `Weather For: ${city}`;
          document.getElementById('change-location__input').placeholder = `${city}`;
        }
      }
    } else {
      location.innerHTML = `Failed to get weather, try by input ->`;
    }
  });
}

window.onload = function () {
  let lat;
  let lon;
  let countryCode = 'US';
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      lat = position.coords.latitude;
      lon = position.coords.longitude;
      weather('auto', lat, lon, countryCode);
    });
  } else {
    document.querySelector('.location__current').innerHTML = `Failed to get weather, try by input ->`;
  }

  // FORM
  document.querySelector('.change-location__submit').addEventListener('click', function () {
    geocodeAddress(new google.maps.Geocoder());
  });

  document.getElementById('change-location__input').addEventListener('keyup', function (e) {
    if (e.keyCode == 13) {
      geocodeAddress(new google.maps.Geocoder());
    }
  });

  function geocodeAddress(geocoder) {
    const address = document.getElementById('change-location__input').value;
    geocoder.geocode({address: address}, function (results, status) {
      if (status === 'OK') {
        document.getElementById('change-location__input').style.outline = 'none';
        for (let i = results[0].address_components.length - 1; i >= 0; i--) {
          for (let j = results[0].address_components[i].types.length; j >= 0; j--) {
            if (results[0].address_components[i].types[j] == 'country') {
              countryCode = results[0].address_components[i].short_name;
              break;
            }
          }
        }

        lat = results[0].geometry.location.lat();
        lon = results[0].geometry.location.lng();
        weather('auto', lat, lon, countryCode);
      } else {
        document.getElementById('change-location__input').style.outline = '2px solid red';
      }
    });
  }

  const buttons = document.querySelectorAll('.weather-unit button');

  function activeButton(num) {
    for (let i = 0; i <= 3; i++) {
      buttons[i].classList.remove('weather-unit--selected');
    }

    buttons[num].classList.add('weather-unit--selected');
  }

  buttons[0].addEventListener('click', function () {
    weather('us', lat, lon, countryCode);
    activeButton(0);
  });

  buttons[1].addEventListener('click', function () {
    weather('si', lat, lon, countryCode);
    activeButton(1);
  });

  buttons[2].addEventListener('click', function () {
    weather('uk2', lat, lon, countryCode);
    activeButton(2);
  });

  buttons[3].addEventListener('click', function () {
    weather('ca', lat, lon, countryCode);
    activeButton(3);
  });
};
