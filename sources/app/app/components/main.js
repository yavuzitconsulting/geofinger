import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MainComponent extends Component {
  @tracked locationDisplay = null;
  @tracked isTracking = false;
  @tracked displayGeoLocationRequestButton = false; //some browsers support requesting location permissions explicitly.
  @tracked lat = -1;
  @tracked lon = -1;
  @tracked lastMessages = [];
  @tracked enteredMessage =''
  @tracked invalidMessage =""
  @tracked isMinting=false;
  @tracked isShowingEnableGeoLocationModal = false;
  @tracked isShowingErrorModal = false;
  @service web3service;
  
  @tracked statusMessage = '';
  @tracked bigStatus = 'please wait a few seconds while i fetch your location!';
  isRequestPending = false;
  appErrorMessage = '';
  blockchainRetries = 1;
  arithmeticLocation = {lat: 0, lon: 0}

  get isAppReady() {
    return this.isTracking && this.web3service.isConnected && this.lat != -1 && this.lon != -1;
  }



  @action updateEnteredMessage(e)
  {
    this.enteredMessage = e.target.value;
  }

  get hasValueInserted(){
    return this.enteredMessage.length>0;
  }

  get hasValidMessage(){
    return this.invalidMessage.length===0 && this.enteredMessage.length>0;
  }

  get hasMessages(){
    return this.lastMessages.length>0;
  }

  @action clearMessages(){
    this.lastMessages.clear();
  }

  @action clearMessage(){
    this.enteredMessage = '';
  }


  @action async retrieveMessages() {
    try {
      
      this.setStatusMessage('asking blockchain for messages');
      const _tmessages = await this.web3service.getTeasedMessagForSpot(this.arithmeticLocation.lon,this.arithmeticLocation.lat);
      this.lastMessages = _tmessages.map((tm)=>tm.message);


    } catch (reason) {
      this.setStatusMessage('server was not available or could not be reached: ' + reason);
      this.bigStatus = 'server connection failed, retrying (' + this.serverRetries + '/4)';
      this.serverRetries++;
      if(this.serverRetries >= 6)
      {
        this.bigStatus = 'blockchain connection cannot be established, please come back later';
        this.serverRetries = 1;
        this.setStatusMessage('maybe try refreshing this window?');
        return;
      }
      this.retrieveMessages();
    }
    this.isRequestPending = false;
  }

  @action toggleEnableGeoLocationModal() {
    this.isShowingEnableGeoLocationModal = !this.isShowingEnableGeoLocationModal;
  }

  @action toggleIsShowingErrorModal()
  {
    this.isShowingErrorModal = !this.isShowingErrorModal;
  }

  @action reloadWindow() {
    this.toggleEnableGeoLocationModal();
    window.location.reload();
  }

  @action async mintMessage() {
    try {
      this.isMinting = true;
      this.setStatusMessage('sending messsage');
      await this.web3service.mintMessage(this.enteredMessage,this.arithmeticLocation.lon, this.arithmeticLocation.lat, true);
     

    } catch (reason) {
      this.setAppErrorMessage(this.getSolutionForErrorCode(reason.data.reason.match("\\[.*]")));
      this.toggleIsShowingErrorModal();
    } 
    this.isMinting = false;
    this.enteredMessage = '';
  }

  @action async setUserLocation() {
    let ready = await this.handlePermission();
    console.debug('appstate: ' + ready);
    if (ready == true) {
      //handle requesting permissions
      this.isTracking = true;
      this.performInfinite();
    }
  }

  retrieveLocation = () => {
    
console.log('retrievelocation, requestpending: ' + this.isRequestPending);
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
    this.lat = position.coords.latitude;
    this.lon = position.coords.longitude;
    this.locationDisplay = 'LAT: ' + this.lat + ' LONG: ' + this.lon;
    this.setStatusMessage(this.locationDisplay);
    let arithLat = Math.trunc(this.lat * 1000000);
    let arithLon = Math.trunc(this.lon * 1000000);
    this.arithmeticLocation = {lat:arithLat,lon:arithLon};

    this.bigStatus = 'found you! establishing connection to blockchain...';
    this.retrieveMessages();
  };
  
  showError = (error) => {

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

  setStatusMessage(msg) {
    this.statusMessage = msg;
  }

  setAppErrorMessage(msg) {
    this.appErrorMessage = msg;
  }

  performInfinite() {
    setTimeout(
      function (that) {
        if(!this.isRequestPending) that.retrieveLocation();
        that.performInfinite();
      },
      2000,
      this
    );
  }

  async handlePermission() {
    //return true if permissions are in order
    console.log('handlepermission');
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
    this.toggleEnableGeoLocationModal();
  }



  //expects the code without brackets
  getSolutionForErrorCode(code)
  {
    return this._requireSolutions[this._requireSolutions.indexOf(code) + 1];
  }






_requireSolutions =
[
  '[RQ001]', 'Please come back later, if possible, keep up with our social media to stay informed about any issues',
  '[RQ002]', 'Type something into the message field!',
  '[RQ003]', 'You do not have enough fame! Claiming a new location will give you fame, alternatively, wait until some of your messages gather upvotes and earn you fame!',
  '[RQ004]', 'There might have been an error with your location service, refresh the page, if that does not work, restart your device.',
  '[RQ005]', 'You did not unlock this message, this has to be an error in the application, refresh and try again, if that does not work, wait a few minutes and try again.',
  '[RQ006]', 'You do not have enough fame to vote! Claiming a new location will give you fame, alternatively, wait until some of your messages gather upvotes and earn you fame!',        
  '[RQ007]', 'There has been an internal error in the application! Please refresh the page, if the error persists, restart your device!',
  '[RQ008]', 'You do not have enough fame for this action!  Claiming a new location will give you fame, alternatively, wait until some of your messages gather upvotes and earn you fame!',
  '[RQ009]', 'You do not have messagecoins for this spot! You can convert fame into messageCoins and create messages, either do this manually or enable autoConvert!'
]


}
