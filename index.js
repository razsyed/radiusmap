'use strict'

var requestify = require('requestify');
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const clarifai = require('clarifai')
var clarifaiApp = new clarifai.App(
  '7pI2M-zjtBOFl7d0gw3TnFnQ6ZuMH09SGhYyki-b',
  'OKo5kGECgxrWhMn6LUp3ykQGmaRXcQLrl1veq4sl'
)

app.set('port', (process.env.PORT || 5000))

// Process application/json
app.use(bodyParser.json())

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}))

// Index route
app.get('/', function (req, res) {
  res.send('Hello world, I am a chat bot')
})

const baseUrl = "https://api.nutritionix.com/v1_1/search/"

app.post('/webhook/', function (req, res) {
  let messaging_events = req.body.entry[0].messaging
  //    console.log(messaging_events[0].message.attachments.length)
  //    console.log("Length: ", req.body.entry.length)
  for (let i = 0; i < messaging_events.length; i++) {
    let event = req.body.entry[0].messaging[i]
    let sender = event.sender.id
    if (event.message && event.message.text) {
      let text = event.message.text
      var str = encodeURIComponent(text)
      var url = baseUrl + str + "?appId=f5c5e7fa&appKey=935aec3005dba2beb008966bdedcbe2b"
      console.log(url)
      requestify.get(url)
      .then(function(response) {
        // Get the response body (JSON parsed or jQuery object for XMLs)
        console.log(response.getBody());
      })

      .catch(function () {
        console.log("FUCK THIS");
      })
      sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
    }
    res.sendStatus(200)
  })

  const token = "EAAQqEd0gfagBAEnQFPEaUJCmHkENsWWiYds73n3JkSwlnSsxbi3Syi4vMy0KB4Sejg39FahW7CBzSAxuOlfBjvM7ZBB8csEFhJTSmZCZCO9IToBSst416b38ccVnERPS5iIua4pcNoWl7gcvuG77pRqksJD9ZBX1GyM7NM8ZBrQZDZD"

  function sendTextMessage(sender, text) {
    let messageData = { text:text }
    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token:token},
      method: 'POST',
      json: {
        recipient: {id:sender},
        message: messageData,
      }
    }, function(error, response, body) {
      if (error) {
        console.log('Error sending messages: ', error)
      } else if (response.body.error) {
        console.log('Error: ', response.body.error)
      }
    })
  }

  // Spin up the server
  app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
  })
