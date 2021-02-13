'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// Check if the browser has the Geolocation API (aka it's not an old browser)
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    // Succes Function
    function (position) {
      const { latitude } = position.coords; // same as position.coords.latitude;
      const { longitude } = position.coords;
      console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`);

      const coords = [latitude, longitude];

      // Leaflet Library
      const map = L.map('map').setView(coords, 13); // 13 is the zoom #

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // map is a special object created by the Leaflet library, therfore it has some special methods
      // .on will be our "addeventlistener" to get data from the library
      map.on('click', function (mapEvent) {
        console.log(mapEvent);
        const { lat, lng } = mapEvent.latlng;

        // Create marker
        // 1. Marker created
        L.marker([lat, lng])
          // 2. Add marker to map
          .addTo(map)
          // 3. Bind pop up to the marker
          .bindPopup(
            L.popup({
              maxWidth: 250,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: 'running-popup',
            })
          )
          // 4. Set pop up text
          .setPopupContent('Workout')
          .openPopup();
      });
    },
    // Error Function
    function () {
      alert('Could not get your position');
    }
  );
}
