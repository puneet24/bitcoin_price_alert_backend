var express = require('express');
var request = require('request');
var fs = require('fs');
var app = express();
var nodemailer = require("nodemailer");
var Appbase = require('appbase-js');
var sgTransport = require('nodemailer-sendgrid-transport');
var config = require('./config.json')

/*
  Initialize user and pass with any correct credentials in order to send mail.
*/
var credentials = {
  auth: {
    api_user: 'appbase',
    api_key: 'appbase12'
  }
}

var transporter = nodemailer.createTransport(sgTransport(credentials));

function send_mail(price,email_address)
{
    var mail = {
        /*
          Here change the from field and set it to some valid account.
        */
        from: "Appbase.io",
        to: email_address,
        subject: "Alert!! - Bitcoin Price changed",
        text: "Current Bitcoin Price in USD :- "+price,
        html: "<b>Current Bitcoin Price in USD :- "+price+"</b>"
    }
    console.log(mail);
    transporter.sendMail(mail, function(error, info){
      if(error){
        return console.log(error);
      }
      console.log('Message sent: ' + info.response);
    });
}

/* This is to access any file withn folder, no routing required for these files. */
app.use('/', express.static(__dirname + '/'));

/* Price alert routing. The Client side makes the ajax call to this route with 
   params [alert_price,email] and as soon as the price gets equal to the 
   alert_price then this routes sends the email. 
*/
app.get('/alerting', function (req, res) {
  var app_base = new Appbase(config.appbase);
  app_base.streamSearch({
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
  }).on('data', function(response) {
    if(response.hits == undefined || response.hits.total == 1){
        send_mail(response.hits.hits[0]._source.last,req.param('email'));
        this.stop();
    }
  }).on('error', function(error) {
    console.log(error)
  })
});

/* It will start the server. */
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Bitcoin Price Alert app listening at http://%s:%s', host, port);
});
