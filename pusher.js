var gcm     = require('node-gcm'),
    storage = require('node-persist');

storage.initSync();

module.exports.pushMessage = function(params) {
  /*  How to setup the params object
  params = {
    service : "google",
    data : {
      msg : "message"
    }
  }
  */
  var _params = params || {};

  if (!_params.service) {
    // defaults to sending push to both
    // 1. send to apple
    // 2. send to google
    google.init(_params.data);
  } else if (_params.service === "google") {
    google.init(_params.data); // object of messages in key value 
  } else if (_params.service === "ios") {
    // send to apple only
  }
};

/***************************************************
* Google GCM push wrapper function
*
*/

var google = google || {};

google.init = function(data) {

  /* for a full explanation on gcm params
   * http://developer.android.com/google/gcm/server.html#params 
   */
  var message = new gcm.Message({
    collapseKey: 'demo',
    delayWhileIdle: true,
    timeToLive: 3
  });

  this.message = message;

  Object.keys(data).forEach(function(key) {
    var val = data[key];
    google.message.addDataWithKeyValue(key,val);
    // for backwards compatability
    // google.message.addData(key,val);
  });

  this.send();

};

google.send = function(){
  var sender = new gcm.Sender('AIzaSyBP4Vy5Fq1HFTn_OmP9sbM_7GxiF42Pmpk');

  var registrationIds = storage.getItem('subscribed') || [];

  if (registrationIds.length > 0) {
    sender.sendNoRetry(google.message, registrationIds, function (err, result) {
      console.log(result);
    });
  }
};

google.subscribe = function(id) {
  var _id = id || "";

  if (_id !== "") {
    var subscribedIds = storage.getItem('subscribed');
    subscribedIds.push(_id);
    storage.setItem('subscribed',subscribedIds);
  }
};

google.unsubscribe = function(id) {
  var _id = id || "";

  if (_id !== "") {
    var subscribedIds = storage.getItem('subscribed');
    // find index of id
    var index = subscribedIds.indexOf(_id);
    // if exists, splice it out
    if (index > -1) {
      subscribedIds.splice(index, 1);
      storage.setItem('subscribed',subscribedIds);
    }
  }
};

module.exports.googleSubId = google.subscribe;
module.exports.googleUnsubId = google.unsubscribe;