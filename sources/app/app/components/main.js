import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MainComponent extends Component {
  @tracked myLocation = null;
  @tracked isTracking = false;
  @tracked canConnectToApi = false;

  @tracked displayGeoLocationRequestButton = false; //some browsers support requesting location permissions explicitly.
  @tracked lat = 0;
  @tracked lon = 0;
  @tracked lastMessages = [];
  @tracked typedMessage = '';
  @tracked isShowingModal = false;
  @tracked statusMessage = '';
  @tracked bigStatus = 'please wait a few seconds while i fetch your location!';
isRequestPending = false;
serverRetries = 1;

get isAppReady()
{
  return this.isTracking & this.canConnectToApi;
}


async fetchWithTimeout(resource, options = {}) {
  const { timeout = 8000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, {
    ...options,
    signal: controller.signal  
  });
  clearTimeout(id);
  return response;
}


  @action async retrieveMessage() {
    try {
      
      this.setStatusMessage('asking server for messages');
      let data = { lat: this.lat, lon: this.lon };
      // await fetch(
      //   '/geofinger/api/messages?lat=' + this.lat + '&lon=' + this.lon,
      //   {
      //     method: 'GET',
      //     headers: { 'Content-Type': 'application/json' },
      //   }
      // )

      await this.fetchWithTimeout(
        '/geofinger/api/messages?lat=' + this.lat + '&lon=' + this.lon,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          timeout: 8000 ,
        }
      )
        .then((res) => res.json())
        .then((data) => {
          this.setStatusMessage(data);
          this.lastMessages = [];
          for (let i = 0; i < data.length; i++) {
            this.setStatusMessage('msg: ' + data[i]);
            this.setStatusMessage(this.lastMessages);
            this.lastMessages.push(data[i]);
            this.lastMessages = this.lastMessages;
          }
          this.canConnectToApi = true;
        });
    } catch (reason) {
      this.setStatusMessage('server was not available or could not be reached: ' + reason);
      this.bigStatus = 'server connection failed, retrying (' + this.serverRetries + '/4)';
      this.serverRetries++;
      if(this.serverRetries >= 6)
      {
        this.bigStatus = 'server connection cannot be established, please come back later';
        this.serverRetries = 1;
        this.setStatusMessage('maybe try refreshing this window?');
        return;
      }
      this.retrieveMessage();
    }
    this.isRequestPending = false;
  }

  @action toggleModal()
  {
    this.isShowingModal = !this.isShowingModal;
  }

  @action reloadWindow()
  {
    window.location.reload();
  }

  @action async leaveMessage() {
    try {
      this.setStatusMessage('sending messsage');
      let data = { message: this.typedMessage, lat: this.lat, lon: this.lon };

      await fetch('/geofinger/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((res) => {
        this.setStatusMessage('request complete! response:', res);
        this.typedMessage = '';
        
        this.retrieveMessage();
      });
    } catch (reason) {
      this.setStatusMessage(reason);
    }
  }

  @action async setUserLocation() {
    let ready = await this.handlePermission();
    if (ready == true) {
      //handle requesting permissions
      this.isTracking = true;
      this.performInfinite();
    }
  }

  retrieveLocation = () => {
    this.isRequestPending = true;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this.showPosition,
        this.showError,
        { maximumAge: 2000, timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      this.setStatusMessage('geolocation is not supported by this browser.');
    }
  };

  //this kind of function header will preserve the this context
  showPosition = (position) => {
    this.setStatusMessage(position.coords);
    let latcut = position.coords.latitude;
    let loncut = position.coords.longitude;
    this.myLocation = 'LAT: ' + latcut + ' LONG: ' + loncut;
    this.lat = latcut;
    this.lon = loncut;

    this.bigStatus = 'found you! establishing connection to server...';
    this.retrieveMessage();
  };

  showError(error) {

    switch (error.code) {
      case error.PERMISSION_DENIED:
        this.setStatusMessage('user denied the request for geolocation.');
        break;
      case error.POSITION_UNAVAILABLE:
        this.setStatusMessage('location information is unavailable.');
        break;
      case error.TIMEOUT:
        this.setStatusMessage('the request to get user location timed out.');
        break;
      case error.UNKNOWN_ERROR:
        this.setStatusMessage('an unknown error occurred.');
        break;
    }

    this.isRequestPending = false;
  }

  setStatusMessage(msg)
  {
this.statusMessage = msg;
  }

  performInfinite() {
    if(this.isRequestPending) return;
    setTimeout(
      function (that) {
        that.retrieveLocation();
        that.performInfinite();
      },
      2000,
      this
    );
  }

  async handlePermission() {
    //return true if permissions are in order
    await navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        if (result.state == 'granted') {
          this.setStatusMessage('geolocation-permission: ' + result.state);
          this.displayGeoLocationRequestButton = false;
        } else if (result.state == 'prompt') {
          this.setStatusMessage('geolocation-permission: ' + result.state);
          this.displayGeoLocationRequestButton = false;
        } else if (result.state == 'denied') {
          this.setStatusMessage('geolocation-permission: ' + result.state);
          this.displayGeoLocationRequestButton = true;
        }
        result.addEventListener('change', function () {
          this.setStatusMessage('geolocation-permission: ' + result.state);
        });
      });
    return !this.displayGeoLocationRequestButton;
  }


  @action showHowToRequestGeoLocationPermission() {
    this.toggleModal();
  }
}
