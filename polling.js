/*
	Polling.js - This is the first part of the application i.e converting Bitcoin api
	to streaming api using Appbase.io indexing method and streamDocument. 
	This should be executed seperately in order to have the proper functioning.
*/

var Appbase = require('appbase-js');
var request = require('request');
var config = require('./config.json')


/*
  Appbase Credentials. Just make new account at appbase and configure it according to your account.
*/
var appbaseRef = new Appbase(config.appbase);


/*
	Polling within interval of 10 seconds. 
*/
(function poll() {
    setTimeout(function() {
        var url = 'https://api.bitcoinaverage.com/ticker/USD/';
        request(url, function (error, response, body) {
        if (!error && response != undefined && response.statusCode == 200) {
          var data = JSON.parse(body);
          appbaseRef.index({
                  type: 'bitcoin_price',
                  id: '1',
                  body: data
                }).on('data', function(response) {
                	console.log(response);
                }).on('error', function(error) {
                  console.log(error);
                });
        } else {
          console.log("Got an error: ", error, ", status code: ", response.statusCode);
        }
        poll();
        });
    }, 10000);
})();