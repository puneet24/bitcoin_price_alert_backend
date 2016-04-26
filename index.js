var express = require('express');
var request = require('request');
var fs = require('fs');
var app = express();
var Appbase = require('appbase-js');
var config = require('./config.json')


/* This is to access any file withn folder, no routing required for these files. */
app.use('/', express.static(__dirname + '/'));

/* Price alert routing. The Client side makes the ajax call to this route with 
   params [alert_price,email] and as soon as the price gets equal to the 
   alert_price then this routes sends the email. 
*/

app.get('/alerting', function (req, res) {
  mail_subject = "Current Bitcoin Price in USD :- {{{last}}}"
  mail_text_content = "Current Bitcoin Price in USD :- {{{last}}}"
  mail_html_content = "<b>Current Bitcoin Price in USD :- {{{last}}}</b>"
  mail_body_content = 'to='+req.param('email')+'&amp;toname=Yash&amp;subject='+mail_subject
                        +'&amp;html=' + mail_html_content+'&amp;text='+mail_text_content
                        +'&amp;from=Appbase.io&amp;api_user=' + config.sendgrid.api_user
                        +'&amp;api_key='+config.sendgrid.api_key
  var appbaseRef = new Appbase(config.appbase);
  appbaseRef.searchStreamToURL({
    type: 'bitcoin_price',
    body:{
      "query":{
        "range" : {
          "last" : {
            "gte" : parseFloat(req.param('lowerprice')),
            "lte" : parseFloat(req.param('upperprice'))
          }
        }
      }
    }
  },{
    'method': 'POST',
    'url': 'https://api.sendgrid.com/api/mail.send.json',
    'headers': {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    "count":1,
    'body': mail_body_content
  }).on('data', function(response) {
      console.log("Webhook has been configured : ", response);
  }).on('error', function(error) {
      console.log("searchStreamToURL() failed with: ", error)
  })
});

/* It will start the server. */
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Bitcoin Price Alert app listening at http://%s:%s', host, port);
});
