'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// let map, mapEvent; // global variable so the form below can use this data

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; //
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    // this.type = "running"
    this.calcPace();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 37, 95, 523);
// console.log(run1, cycling1);

//////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition(); // method gets called immediately bc object gets created on page load and so the constructor gets called

    form.addEventListener('submit', this._newWorkout.bind(this)); // set this keyword to app object using bind bc otherwise this is set to the DOM element the event handler is attached to

    inputType.addEventListener('change', this._toggleElevationField.bind(this));
  }

  _getPosition() {
    // Check if the browser has the Geolocation API (aka it's not an old browser)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // Succes Function
        this._loadMap.bind(this), // set the this keyword using bind method which returns a function, otherwise the function only returns undefined
        // Error Function
        function () {
          alert('Could not get your position');
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords; // same as position.coords.latitude;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`);

    const coords = [latitude, longitude];

    console.log(this);

    // Leaflet Library
    this.#map = L.map('map').setView(coords, 13); // 13 is the zoom #

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // map is a special object created by the Leaflet library, therfore it has some special methods
    // .on will be our "addeventlistener" to get data from the library
    // Click handling
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE; // set global var to equal this event so it can be used in the form outside of this function
    form.classList.remove('hidden');
    inputDistance.focus(); // set mouse to focus on this input. good for UX
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault(); // stop page from reloading

    const validInputs = (
      ...inputs // takes arbitruary amount of inputs
    ) => inputs.every(inp => Number.isFinite(inp)); // returns true if every value of the inputs array is true

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    // A. Get data from form
    const type = inputType.value; // "running" or "cycling" values from html
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout; // define workout outside of if block so that it can be used outside of the if block

    // B. If workout is Running, create Running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // Check if data is valid
      if (
        //   !Number.isFinite(distance) ||
        //   !Number.isFinite(duration) ||
        //   !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs need to be positive numbers :)');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // C. If workout is Cycling, create Cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      // Check if data is valid
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      ) {
        return alert('Inputs need to be positive numbers :)');
      }

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // E. Add new object to Workout array
    this.#workouts.push(workout); // push new running object to workout array that was defined as a class field
    console.log(workout);

    // F. Render workout on map with marker
    this.renderWorkoutMarker(workout);

    // G. Render workout on list

    // H. Hide form + clear input fields

    // Clear input fields
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
      '';
  }

  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      // 2. Add marker to map
      .addTo(this.#map)
      // 3. Bind pop up to the marker
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      ) // 4. Set pop up text
      .setPopupContent('workout')
      .openPopup();
  }
}

// Create new object from App class
const app = new App();
// app._getPostion(); // gets called immediately. but there is an alternative way to get the function be called upon page loading. see constructor method
