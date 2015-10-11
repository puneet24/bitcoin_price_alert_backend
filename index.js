var express = require('express');
var request = require('request');
var fs = require('fs');
var app = express();
var nodemailer = require("nodemailer");
var Appbase = require('appbase-js');

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
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'mailnator@gmail.com',
        pass: '**********'
    }
});

function send_mail(mail)
{
    transporter.sendMail(mail, function(error, info){
      if(error){
        return console.log(error);
      }
      console.log('Message sent: ' + info.response);
    });
}

app.use('/', express.static(__dirname + '/'));

app.get('/', function (req, res) {
  fs.readFile('index.html',function (err, data){
        res.writeHead(200, {'Content-Type': 'text/html','Content-Length':data.length});
        res.write(data);
        res.end();
    });
});

app.get('/alerting', function (req, res) {
  console.log(req.param('price'));
  var flag = 1;
  appbase.streamDocument({
    type: 'bitcoin',
    id: '1',
    "match" : {
      "last" : req.param('price')
    }
  }).on('data', function(response) {
    console.log(req.param('email'));
    var mail = {
      /*
        Here change the from field and set it to some valid account.
      */
      from: "mailnator@gmail.com",
      to: req.param('email'),
      subject: "Alert!! - Bitcoin Price changed",
      text: "Current Bitcoin Price in USD :- "+req.param('price'),
      html: "<b>Current Bitcoin Price in USD :- "+req.param('price')+"</b>"
    }
    if(flag == 1){
      send_mail(mail);
      flag = 0;
    }
  }).on('error', function(error) {
    console.log(error)
  })
});

var server = app.listen(3000, function () {
var host = server.address().address;
var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

  (function poll() {
    setTimeout(function() {

        var url = 'http://blockchain.info/ticker';
        request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var data = JSON.parse(body);
          appbase.index({
                  type: 'bitcoin',
                  id: '1',
                  body: data.USD
                }).on('data', function(response) {
                }).on('error', function(error) {
                  console.log(error);
                });
        } else {
          console.log("Got an error: ", error, ", status code: ", response.statusCode);
        }
        poll();
        });
    }, 3000);
  })();

});
