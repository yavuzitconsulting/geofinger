import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class MainComponent extends Component {
  @tracked locationDisplay = null;
  @tracked isTracking = false;
  @tracked canConnectToWeb3 = false;

  @tracked displayGeoLocationRequestButton = false; //some browsers support requesting location permissions explicitly.
  @tracked lat = 0;
  @tracked lon = 0;
  @tracked lastMessages = [];
  @tracked enteredMessage =''
  @tracked invalidMessage =""
  @tracked isMinting=false;
  @tracked isShowingModal = false;
  @tracked statusMessage = '';
  @tracked bigStatus = 'please wait a few seconds while i fetch your location!';
  isRequestPending = false;
  blockchainRetries = 1;
  arithmeticLocation = {lat: 0, lon: 0}

  get isAppReady() {
    return this.isTracking & this.canConnectToWeb3;
  }



  getTeasedMessagesForSpot() {

  }

  claimSpot() {

  }

  mintMessageInClaimedSpot() {

  }

  mintMessageInClaimedSpotAutoConvert() {

  }

  @action updateEnteredMessage(e)
  {
    const re = /[^0-9\sa-zA-Z]+/g;
    this.invalidMessage="";
    if(re.test(e.target.value)) {
      this.invalidMessage="The given input is not a valid ascii value";
      return;
    }
    if(e.target.value.length>600) {
      this.invalidMessage="The given input has too many characters. Only max 600 characters allowed.";
      return;
    }
    this.invalidMessage="";
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


  convertFameToMessageCoin() {

  }

  getMessageCoinBalanceForSpot() {

  }

  getFameBalanceForSpot() {

  }
  unlockMessage(messageTokenId) {

  }

  readFullMessage(messageTokenId) {

  }

  upvoteMessage(messageTokenId) {

  }

  @action async retrieveMessages() {


    this.setStatusMessage('asking blockchain for messages');

    this.isRequestPending = false;
  }

  @action toggleModal() {
    this.isShowingModal = !this.isShowingModal;
  }

  @action reloadWindow() {
    window.location.reload();
  }

  @action async leaveMessage() {
    try {
      this.setStatusMessage('sending messsage');
      let data = { message: this.enteredMessage, lat: this.lat, lon: this.lon };

    } catch (reason) {
      this.setStatusMessage(reason);
    }
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
