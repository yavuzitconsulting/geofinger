import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MainComponent extends Component {

  @tracked myLocation = null;
  @tracked isTracking = false;

  @tracked displayGeoLocationRequestButton = false; //some browsers support requesting location permissions explicitly.
  @tracked lat = 0;
  @tracked lon = 0;
  @tracked lastMessages = [];
  @tracked typedMessage = "";

  @action async retrieveMessage() {
    try {
      console.log('asking for messages');
      let data = { lat: this.lat, lon: this.lon };
      await fetch("/geofinger/api/messages?lat=" + this.lat + "&lon=" + this.lon, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json()).then(data => {
        console.log(data);
        this.lastMessages = [];
        for (let i = 0; i < data.length; i++) {
          console.log('msg: ' + data[i]);
          console.log(this.lastMessages);
          this.lastMessages.push(data[i]);
          this.lastMessages = this.lastMessages;
        }
      });
    } catch (reason) {
      window.alert(reason);
    }
  }

  @action async leaveMessage() {
    try {
      console.log('sending messsage');
      let data = { message: this.typedMessage, lat: this.lat, lon: this.lon };

      await fetch("/geofinger/api/messages", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => {
        console.log("Request complete! response:", res);
        this.typedMessage = '';
        this.retrieveMessage();
      });
    } catch (reason) {
      window.alert(reason);
    }
  }

  @action setUserLocation() {
    if (this.handlePermission() == true) //handle requesting permissions
    {
      this.isTracking = true;
      this.performInfinite();
    }
  }

  retrieveLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.showPosition, this.showError, { maximumAge: 2000, timeout: 5000, enableHighAccuracy: true });
    } else {
      window.alert("Geolocation is not supported by this browser.");
    }
  }

  //this kind of function header will preserve the this context
  showPosition = (position) => {
    console.log(position.coords);
    let latcut = position.coords.latitude;
    let loncut = position.coords.longitude;
    this.myLocation = "LAT: " + latcut + " LONG: " + loncut;
    this.lat = latcut;
    this.lon = loncut;

    this.retrieveMessage();
  }

  showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        window.alert("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        window.alert("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        window.alert("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        window.alert("An unknown error occurred.");
        break;
    }
  }

  performInfinite() {
    setTimeout(function (that) { that.retrieveLocation(); that.performInfinite(); }, 2000, this);
  }

  async handlePermission() //return true if permissions are in order
  {
    await navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state == 'granted') {
        this.report(result.state);
        this.displayGeoLocationRequestButton = false;
      } else if (result.state == 'prompt') {
        this.report(result.state);
        this.displayGeoLocationRequestButton = false;
      } else if (result.state == 'denied') {
        this.report(result.state);
        this.displayGeoLocationRequestButton = true;
      }
      result.addEventListener('change', function () {
        this.report(result.state);
      });
    });
    return !this.displayGeoLocationRequestButton;
  }

  report(state) {
    console.log('Permission ' + state);
  }

  @action requestGeoLocationPermission() {
    navigator.permissions.request({ name: 'geolocation' }).then(function (result) {
      this.report(result.state);
    });
    this.setUserLocation();
  }

}
