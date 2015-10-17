/*
	Polling.js - This is the first part of the application i.e converting Bitcoin api
	to streaming api using Appbase.io indexing method and streamDocument. 
	This should be executed seperately in order to have the proper functioning.
*/

var Appbase = require('appbase-js');
var request = require('request');

/*
  Appbase Credentials. Just make new account at appbase and configure it according to your account.
*/
var appbase = new Appbase({
  url: 'https://scalr.api.appbase.io',
  appname: 'testgsoc',
  username: 'JxGrCcfHZ',
  password: '1c46a541-98fa-404c-ad61-d41571a82e14'
});

/*
	Polling within interval of 10 seconds. 
*/
(function poll() {
    setTimeout(function() {

        var url = 'https://api.bitcoinaverage.com/ticker/USD/';
        request(url, function (error, response, body) {
        if (!error && response != undefined && response.statusCode == 200) {
          var data = JSON.parse(body);
          appbase.index({
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