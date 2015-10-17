var express = require('express');
var request = require('request');
var fs = require('fs');
var app = express();
var nodemailer = require("nodemailer");
var Appbase = require('appbase-js');
var sgTransport = require('nodemailer-sendgrid-transport');

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
  Initialize user and pass with any correct credentials in order to send mail.
*/

var credentials = {
  auth: {
    api_user: 'yashshah',
    api_key: 'appbase12'
  }
}
var transporter = nodemailer.createTransport(sgTransport(credentials));

function send_mail(mail)
{
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
  console.log(req.param('price'));
  var app_base = new Appbase({
    url: 'https://scalr.api.appbase.io',
    appname: 'testgsoc',
    username: 'JxGrCcfHZ',
    password: '1c46a541-98fa-404c-ad61-d41571a82e14'
  });
  var flag = 1;
  app_base.streamSearch({
    type: 'bitcoin_price',
    body:{
      "query":{
        "match" : {
          "last" : parseFloat(req.param('price'))
        }
      }
    }
  }).on('data', function(response) {
    console.log(response);
    console.log(req.param('price'));
    console.log(req.param('email'));
    console.log(flag);
    if(response.hits == undefined || response.hits.total == 1){
      var mail = {
        /*
          Here change the from field and set it to some valid account.
        */
        from: "Appbase.io",
        to: req.param('email'),
        subject: "Alert!! - Bitcoin Price changed",
        text: "Current Bitcoin Price in USD :- "+req.param('price'),
        html: "<b>Current Bitcoin Price in USD :- "+req.param('price')+"</b>"
      }
      if(flag == 1){
        send_mail(mail);
        flag = 0;
      }
    }
  }).on('error', function(error) {
    console.log(error)
  })
});

/* It will start the server. */
var server = app.listen(8080,'104.131.165.92', function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Bitcoin Price Alert app listening at http://%s:%s', host, port);
});
