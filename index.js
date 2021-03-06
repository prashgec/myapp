'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// indexfdsfsd
app.get('/', function (req, res) {
	res.send('hello world i am a secret bot.')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'token') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

// to post data
app.post('/webhook/', function (req, res) {


	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		       console.log("Dumpping messaging field");
		       console.log(event);
		       console.log(event.message);

		let sender = event.sender.id
		let page_id = event.recipient.id
		if (event.message && event.message.text) {
			//sendTextMessage(sender, page_id, "senderId: "+ sender + " page id  " + page_id);
			let text = event.message.text.toLowerCase();
			var url_data = getURL(text)
			if (url_data != null) {
			        sendTextMessage(sender, page_id, "url is " + url_data)
				uploadnandsendmedia(url_data, sender, page_id);
				
			}
			
			if (text === 'generic') {
				sendGenericMessage(sender, page_id)
				continue
			}

			if (text==="linkaccnt") {
		          sendAccountLinkMessage(sender, page_id)
			  continue
			}
			
			if (text==="linkaccnt2") {
		          sendAccountLinkMessage2(sender, page_id)
			  continue
			}

			if (text==="linkaccntnakuma") {
		          sendAccountLinkMessageNakuma(sender, page_id)
			  continue
			}


			if (text==="unlinkaccnt") {
			  sendAccountUnLinkMessage(sender, page_id);
			  continue;
			}

			if (text === "sharecta") {
			 	sendsharecta(sender, page_id);
				continue;
			}

			if (text == "previewsharecta") {
			 	sendsharectapreview(sender, page_id);
				continue;

			}

			if (text == "configpreviewshare") {
				sendconfigsharecta(sender, page_id);
				continue;
			}
			
			if (text == "webview") {
				sendwebview(sender, page_id);
				continue;
			}


			if (text == "media") {
				sendmediacta(sender, page_id);
				continue;
			}

			if (text == "userinfo") {
				senduserinfo(sender, page_id);
				continue;
			}

			if (text == "nakuma") {
			       sendconfigsharenakumacta(sender, page_id);
				continue;
			}

			if (text == "fbintern") {
			       sendconfigsharefbinterncta(sender, page_id);
				continue;
			}

			if (text == "button") {
			       sendbutton(sender, page_id);
			       continue;
			}

			if (text == "buttonc") {
			       sendbuttonc(sender, page_id);
			       continue;
			}

			if (text == "internalteam") {
				sendbuttoninternal(sender, page_id);
			  continue;
			}

			if (text == "gk") {
				sendbuttongk(sender, page_id);
			  continue;
			}

			if (text == "help") {
		    let texttosend = "I can respond to following commands:"
			  texttosend = "webview, generic, mediaapi,linkaccnt, unlinkaccnt, sharecta, previewsharecta, configpreviewshare,  media, mediaattachment"
			  sendTextMessage(sender, page_id, texttosend)
				continue;
			}

			if (text == "mediaattachment") {
				sendquickreply(sender, page_id);
				continue;
			}
			
			if (text == "mediaapi") {
				sendquickreply(sender, page_id);
				continue;
			}

			if (text == "rate") {
			 	sendrate(sender, page_id);
				continue;
			}
		}

		if (event.message && event.message.quick_reply) {
			handlequickreply(sender, page_id, event.message.quick_reply.payload);
			continue;
		}

		if (event.postback) {
			sendTextMessage(sender, page_id, "senderId: "+ sender);
			let text = JSON.stringify(event.postback)
			sendTextMessage(sender, page_id, "Postback received: "+text.substring(0, 200))
			continue
		}
		
		if (event.checkout_update) {
			console.log("checkout received");
		}

    if (event.referral) {
            let text = JSON.stringify(event.referral)
            sendTextMessage(sender, page_id, "Referral event received: "+text.substring(0, 200))
            continue
    }

		if (event.attachments) {
      let text = JSON.stringify(event.attachments)
      sendTextMessage(sender, page_id, "Attachments received: "+text.substring(0, 200))
      continue
   }

  if (event.account_linking) {
          let text = JSON.stringify(event)
          sendTextMessage(sender, page_id, "Account Linking event data at webhook: "+text.substring(0, 200))
          continue
  }
	}
	res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.PAGE_ACCESS_TOKEN
const token = "EAALsKrSyf2MBAO4E3fAyQuVVIgLhsrBNLKZBKce7DAGkvLYZAhHAlPU7u1hXaEjZCX7v2l8DvPHksHrMI6l1NjscQfNaJssZBpQsaoNbEXn7BGpOynU7TZAmZCsv6xmxdbIZB10gNBdZCpNUk9oRmB7AXSZB9MoVpqb5ZCuYPG2yirkgZDZD";
const token2 = "EAALsKrSyf2MBAKJ0tPOmslV6TDT5WEMqpm3LfsIcC7QUjyw3dpXsijypZAZCUnURvreW5Ow88BeY0ZAf6FXvHlZAQ7ZAdAJ1X4xgZBOGXzH9elSNSZAALqDWDZBBgpPErrNLoMPjvohvWxEJXcNJVxO2EeYe2DfjPGQPTwBM0eVvEgZDZD";
//const token = "EAALsKrSyf2MBAHaqfZAvV9JmUaw6meqXJ8bpWF2ZCWPSOkDXm7pJUb3JGGZCy1mSvhg82cj9E8JRYbwUvpqzP2m8fZAn9edXZA5LPasfl0P9rCb8WNg989FI5HLJj7WG3tQtFc8ecYYjT2q6aLMI7O4B1HZCVZCF4HzIuI5DWy34AZDZD"
const token3 = "EAALsKrSyf2MBAMWHiUvelYwEZAmDSfdMlHfgx8vEtI1okELItV3Fkv12R9iBt7cVO32wKxKTXoZAuvG2YXEzq2opfzhfhtOb6Az1GVKS6nB4RGPZCrgtAfQX0WYZCApPbRZCPc7pISDzHy2wW1NgNWdII78drWeUL0HAEmqTe7QZDZD";
const token4 = "EAACMbNwv3J4BANZB9YZCi5IFhwRJHe7BZALRsPEqOs5Gl5FBzpP4IwZAvRBlmURydqhObNVULVALS5UJqcEOHpg7VPsNCm4rQw9XeXTSP26U97SbkMBToGELhszn4JDTb7mTEzAXq8HVVVJISG1mHPG8V9ms3ql5jBs64KCbUAZDZD"
const token5 = "EAALsKrSyf2MBABuGePNZCOyaOAOlwg3kb0K1IsTrqm7Wy3I4elZC58EaFtEypFJs17PWKM4ms2ZCC5K3T1Bk11VZBkPTzszkyDBe95LesUYZAgwOS8AOVc7YChJG6CldnsttZA1X9XbtZBKDOEoYk0VodWrfjrzJxEliU4Bplwp5wZDZD";

function gettoken(page_id) {
	if (page_id == "122194738430561") {
		 return token3;
	}
	
	if (page_id == "161581587887637") {
		return token5;
	}
	
	if (page_id == "") {
		return token5;
	}
	
	return page_id == "1535203003449978" ? token: token2;
}

function sendquickreply(sender, pageid) {
	let token_val = gettoken(pageid)
	let messageData = {
		"text": "please select media attachment send",
    "quick_replies":[
      {
        "content_type":"text",
        "title":"image_attachment",
        "payload":"IMG_ATTACHMENT"
      },
      {
        "content_type":"text",
        "title":"gif_attachment",
        "payload":"GIF_ATTACHMENT"
      },
      {
        "content_type":"text",
        "title":"video_attachment",
        "payload":"VID_ATTACHMENT"
      },
      {
        "content_type":"text",
        "title":"FB image",
        "payload":"IMG_FB"
      },
      {
        "content_type":"text",
        "title":"FB  gif",
        "payload":"GIF_FB"
      },
      {
        "content_type":"text",
        "title":"FB video",
        "payload":"VIDEO_FB"
      }	    
    ]
  }
	sendCall(sender, pageid, messageData);
}

function senduserinfo(sender, pageid) {
	let token_val = gettoken(pageid)
	let messageData = {
		"text": "This is for quick reply test. user info",
    "quick_replies":[
      {
        "content_type":"user_email",
      },
      {
        "content_type":"user_phone_number",
      },
    ]
  }
	sendCall(sender, pageid, messageData);
}

function handlequickreply(sender, page_id, payload) {
	sendTextMessage(sender, page_id, "Payload = " + payload);
	
	if (payload == "IMG_FB" || payload == "GIF_FB" || payload == "VIDEO_FB") {
		handlequickreplyfb(sender, page_id, payload);
		return;
	}
	let attachment_id = 123047711678597;
	let media_type = "image";
	if (payload ==  "VID_ATTACHMENT") {
		media_type = "video";
		attachment_id = "123047561678612";
	}

	if (payload ==  "GIF_ATTACHMENT") {
		attachment_id = "123047615011940";
	}
	
	sendMediaMessage(media_type, attachment_id, sender, page_id);
}

function sendMediaMessage(media_type, attachment_id, sender, page_id) {
	let messageData = {
		"attachment":{
	    "type":"template",
	    "payload":{
		     "template_type":"media",
		      "elements":[{
						 "media_type": media_type,
						  "attachment_id":  attachment_id,
				     "buttons":[{"title":"Intern", "type":"web_url", "webview_height_ratio": "full", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webview.html?env=intern"}, {"title":"Prod", "type":"web_url", "webview_height_ratio": "tall", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webview.html"}]
			    }]
	          }
            }
         }
	sendCall(sender, page_id, messageData);	
}


function handlequickreplyfb(sender, page_id, payload) {
	let media_type = "image";
	let url = "";
	
	if (payload ==  "IMG_FB") {
		media_type = "image";
		url = "https://www.facebook.com/cnn/photos/a.369810096508.159795.5550296508/10157205144416509/?type=3&theater";
	}

	if (payload ==  "GIF_FB" || payload == "VIDEO_FB") {
		media_type = "video";
		url = "https://www.facebook.com/cnn/videos/10157205975831509";
	}

	let messageData = {
		"attachment":{
	    "type":"template",
	    "payload":{
		     "template_type":"media",
		      "elements":[{
						 "media_type": media_type,
						  "url":  url,
				     "buttons":[{"title":"Intern", "type":"web_url", "webview_height_ratio": "full", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webview.html?env=intern"}, {"title":"Prod", "type":"web_url", "webview_height_ratio": "tall", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webview.html"}]
			    }]
	    }
    }
  }
	sendCall(sender, page_id, messageData);
}



function sendconfigsharecta(sender, pageid) {
	let token_val = gettoken(pageid)
	let messageData = {
		//"attachment":{"type":"template","payload":{"template_type":"button","text":"Extension test","buttons":[{"title":"full intern", "type":"web_url", "webview_height_ratio": "full", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webview.html?env=intern"}, {"title":"tall prod", "type":"web_url", "webview_height_ratio": "tall", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webview.html"}]}}
		    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Welcome to Peter\'s Hats",
            "image_url":"https://petersfancybrownhats.com/company_image.png",
            "subtitle":"We\'ve got the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://tbd-agent.herokuapp.com/webviewmedia.html?env=intern",
              "messenger_extensions": true,
              "webview_height_ratio": "tall",
              "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
            },
            "buttons":[{"title":"Intern", "type":"web_url", "webview_height_ratio": "full", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webview.html?env=intern"}, {"title":"Prod", "type":"web_url", "webview_height_ratio": "tall", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webview.html"},
		       {
			                   "type": "web_url",
            "title": "nakuma.sb",
            "url": "https://tbd-agent.herokuapp.com/webview.html?env=nakuma.sb",
            "webview_height_ratio": "tall",
            "webview_share_button": "hide",
            "messenger_extensions": true
		       }]
          }
        ]
      }
    }
	}
	sendCall(sender, pageid, messageData);
}


function sendwebview(sender, pageid) {
	let token_val = gettoken(pageid)
	let messageData = {		    
		"attachment":{
      			"type":"template",
      			"payload":{
        		"template_type":"generic",
        		"elements":[
				{
            			"title":"Welcome to Peter\'s Hats",
            			"image_url":"https://petersfancybrownhats.com/company_image.png",
            			"subtitle":"We have got the right hat for everyone.",
            			"buttons":[{"title":"Full", "type":"web_url", "webview_height_ratio": "full", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webview.html"}]
          		        },
				{
            			"title":"Welcome to Peter\'s Hats",
            			"image_url":"https://petersfancybrownhats.com/company_image.png",
            			"subtitle":"We have got the right hat for everyone.",
            			"buttons":[{"title":"Tall", "type":"web_url", "webview_height_ratio": "tall", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webview.html"}]
          		        },
				{
            			"title":"Webview close",
            			"image_url":"https://www.messenger.com/closeWindow/",
            			"subtitle":"We have got the right hat for everyone.",
            			"buttons":[{"title":"Compact", "type":"web_url", "webview_height_ratio": "compact",  "url":"https://www.messenger.com/closeWindow/"}]
          		        }
				
		       ]
      		}
    	     }
	}
	sendCall(sender, pageid, messageData);
}

function sendrate(sender, pageid) {
	let token_val = gettoken(pageid)
	let messageData = {		    
		"attachment":{
      			"type":"template",
      			"payload":{
        		"template_type":"generic",
        		"elements":[
				{
            			"title":"Welcome to Peter\'s Hats",
            			"image_url":"https://petersfancybrownhats.com/company_image.png",
            			"subtitle":"We have got the right hat for everyone.",
            			"buttons":[{"title":"Messenger Small SB", "type":"web_url", "webview_height_ratio": "compact",  "url":"https://www.hdragomir.sb.messenger.com/marketplace_rating/popover/", "webview_share_button": "hide"},
					  {"title":"Messenger Small Intern", "type":"web_url", "webview_height_ratio": "compact",  "url":"https://www.intern.messenger.com/marketplace_rating/popover/", "webview_share_button": "hide"},
					   {"title":"Messenger Small PROD", "type":"web_url", "webview_height_ratio": "compact",  "url":"https://www.messenger.com/marketplace_rating/popover/", "webview_share_button": "hide"}
					  ]
          		        },
								{
            			"title":"Welcome to Peter\'s Hats",
            			"image_url":"https://petersfancybrownhats.com/company_image.png",
            			"subtitle":"We have got the right hat for everyone.",
            			"buttons":[{"title":"Small FB SB", "type":"web_url", "webview_height_ratio": "compact",  "url":"https://www.hdragomir.sb.facebook.com/marketplace_rating/popover/", "webview_share_button": "hide"},
					  {"title":"Small FB Intern", "type":"web_url", "webview_height_ratio": "compact",  "url":"https://www.intern.facebook.com/marketplace_rating/popover/", "webview_share_button": "hide"},
					   {"title":"Small FB PROD", "type":"web_url", "webview_height_ratio": "compact",  "url":"https://www.facebook.com/marketplace_rating/popover/", "webview_share_button": "hide"}
					  ]
          		        }
		       ]
      		}
    	     }
	}
	sendCall(sender, pageid, messageData);
}


function sendbutton(sender, pageid) {
	let token_val = gettoken(pageid)
	let messageData = {
		"attachment": {
  "type": "template",
  "payload": {
    "template_type": "generic",
    "elements": [
      {
        "title": "Customize a new message to share?",
        "buttons": [
          {
            "type": "web_url",
            "title": "Yes, please!",
            "url": "https:\/\/exporter-staging.getscribblechat.com",
            "webview_height_ratio": "tall",
            "webview_share_button": "hide",
            "messenger_extensions": true
          },
          {
            "type": "postback",
            "title": "Not right now.",
            "payload": "stop"
          }
        ]
      }
    ]
  }
}

	}
	sendCall(sender, pageid, messageData);
}

function sendbuttongk(sender, pageid) {
	let token_val = gettoken(pageid)
	let messageData = {
		"attachment": {
  "type": "template",
  "payload": {
    "template_type": "generic",
    "elements": [
      {
        "title": "Debug the gkx",
        "buttons": [
          {
            "type": "web_url",
            "title": "Click here",
            "url": "https://tbd-agent.herokuapp.com/webview.html?env=colep.sb",
            "webview_height_ratio": "tall",
            "webview_share_button": "hide",
            "messenger_extensions": true
          },
          {
            "type": "postback",
            "title": "Not right now.",
            "payload": "stop"
          }
        ]
      }
    ]
  }
}

	}
	sendCall(sender, pageid, messageData);
}



function sendbuttoninternal(sender, pageid) {
	let token_val = gettoken(pageid)
	let messageData = {
		"attachment": {
  "type": "template",
  "payload": {
    "template_type": "generic",
    "elements": [
      {
        "title": "Customize a new message to share?",
        "buttons": [
          {
            "type": "web_url",
            "title": "Yes, please!",
            "url": "https://www.nakuma.sb.facebook.com/commerce/extension/example/",
            "webview_height_ratio": "tall",
            "webview_share_button": "hide",
            "messenger_extensions": true
          },
          {
            "type": "web_url",
            "title": "Yes, please!",
            "url": "https://www.facebook.com/commerce/update/",
            "webview_height_ratio": "tall",
            "webview_share_button": "hide",
            "messenger_extensions": true
          },
        ]
      }
    ]
  }
}

	}

	sendCall(sender, pageid, messageData);
}

function sendbuttonc(sender, pageid) {
	let token_val = gettoken(pageid)
	let messageData = {
		"attachment": {
  "type": "template",
  "payload": {
    "template_type": "generic",
    "elements": [
      {
        "title": "Customize a new message to share?",
        "buttons": [
          {
            "type": "web_url",
            "title": "button getcontext",
            "url": "https://tbd-agent.herokuapp.com/webview.html?env=nakuma.sb",
            "webview_height_ratio": "tall",
            "webview_share_button": "hide",
            "messenger_extensions": true
          },
          {
            "type": "postback",
            "title": "Not right now.",
            "payload": "stop"
          }
        ]
      }
    ]
  }
}

	}
	sendCall(sender, pageid, messageData);
}


function sendmediacta(sender, pageid) {
	let token_val = gettoken(pageid)
	let messageData = {
		    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
           {
            "title":"Media testting",
            "image_url":"https://petersfancybrownhats.com/company_image.png",
            "subtitle":"We\'ve got the right hat for everyone.",
            "default_action": {
              "type": "web_url",
              "url": "https://tbd-agent.herokuapp.com/webviewmedia.html",
              "messenger_extensions": true,
              "webview_height_ratio": "tall",
              "fallback_url": "https://peterssendreceiveapp.ngrok.io/"
            },
            "buttons":[{"title":"media webview", "type":"web_url", "webview_height_ratio": "full", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webviewmedia.html"}, {"title":"nakuma.sb.", "type":"web_url", "webview_height_ratio": "tall", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webviewmedia.html?env=nakuma.sb"}, {"type":"element_share"}]
          }
        ]
      }
    }
	}
	sendCall(sender, pageid, messageData);
}


function sendconfigsharenakumacta(sender, pageid) {
	let messageData = {
		"attachment":{"type":"template","payload":{"template_type":"button","text":"Extension test","buttons":[{"title":"full intern", "type":"web_url", "webview_height_ratio": "full", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webview.html?env=intern"}, {"title":"tall prod", "type":"web_url", "webview_height_ratio": "tall", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webview.html"}, {"title":"tall sb", "type":"web_url", "webview_height_ratio": "tall", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webview.html?env=nakuma.sb"}]}}
	}
	sendCall(sender, pageid, messageData);
}

function sendconfigsharefbinterncta(sender, pageid) {
	let messageData = {
		"attachment":{"type":"template","payload":{"template_type":"button","text":"Extension test","buttons":[{"title":"full intern", "type":"web_url", "webview_height_ratio": "full", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webviewappleapi.html?env=intern"}, {"title":"nakuma.sb.", "type":"web_url", "webview_height_ratio": "tall", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webviewappleapi.html?env=nakuma.sb"}, {"title":"PROD", "type":"web_url", "webview_height_ratio": "tall", "messenger_extensions": true, "url":"https://tbd-agent.herokuapp.com/webviewappleapi.html"}]}}
	}
	sendCall(sender, pageid, messageData);
}

function sendTextMessage(sender, pageid, text) {
	let messageData = { text:text }
	let token_val = gettoken(pageid)
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token: token_val},
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





function sendGenericMessage(sender, pageid) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "First card",
					"subtitle": "Element #1 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
					"buttons": [{
						"type": "web_url",
						"url": "https://www.messenger.com",
						"title": "web url"
					}, {
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for first element in a generic bubble",
					}],
				}, {
					"title": "Second card",
					"subtitle": "Element #2 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
					"buttons": [{
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for second element in a generic bubble",
					}],
				}]
			}
		}
	}
        sendCall(sender, pageid, messageData);
}


function sendsharecta(sender, pageid) {
	let messageData = {

  "attachment": {
    "type": "template",
    "payload": {
      "template_type": "generic",
      "elements": [
        {
          "title": "Welcome to Peter",
          "image_url": "https://tctechcrunch2011.files.wordpress.com/2016/04/facebook-chatbot-alt.png?w=738",
          "subtitle": "We have got the right hat for everyone.",
          "default_action": {
            "type": "web_url",
            "url": "https://www.google.com"
          },
          "buttons": [
          {
            "type": "element_share"
          }
        ]
      }
    ]
  }
}
	}
  sendCall(sender, pageid, messageData);

}




function sendsharectapreview(sender, pageid) {
	let messageData = {

  "attachment": {
    "type": "template",
    "payload": {
      "template_type": "generic",
      "elements": [
        {
          "title": "Welcome to Peter",
          "image_url": "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg",
          "subtitle": "We have got the right hat for everyone.",
          "default_action": {
            "type": "web_url",
            "url": "https://www.google.com"
          },
          "buttons": [
          {
            "type": "element_share",
            "share_contents": {
              "attachment": {
                "type": "template",
                "payload": {
                  "template_type": "generic",
                  "elements": [
                    {
                      "title": "In Preview Welcome to Peter",
                      "image_url": "https://tctechcrunch2011.files.wordpress.com/2016/04/facebook-chatbot-alt.png?w=738",
                      "subtitle": "We have got the right hat for everyone.",
                      "default_action": {
                        "type": "web_url",
                        "url": "https://www.fb.com"
                      },
                      "buttons": [
                        {
                          "type": "web_url",
                          "url": "https://www.google.com",
                          "title": "Search in Google"
                        }
                      ]
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    ]
  }
}
}
  sendCall(sender, pageid, messageData);
}


function sendAccountLinkMessage(sender, pageid) {
  let messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Welcome to M-Bank",
          "image_url": "http://www.example.com/images/m-bank.png",
          "buttons": [{
            "type": "account_link",
            "url": "https://our.intern.facebook.com/intern/messaging/account_linking_tool"
          }]
        }]
      }
    }
  }
  sendCall(sender, pageid, messageData);
}

function sendAccountLinkMessage2(sender, pageid) {
  let messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Welcome to M-Bank",
          "image_url": "http://www.example.com/images/m-bank.png",
          "buttons": [{
            "type": "account_link",
            "url": "https://www.web.com/#/login"
          }]
        }]
      }
    }
  }
  sendCall(sender, pageid, messageData);
}



function sendAccountLinkMessageNakuma(sender, pageid) {
  let messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Welcome to M-Bank",
          "image_url": "http://www.example.com/images/m-bank.png",
          "buttons": [{
            "type": "account_link",
            "url": "https://wwww.facebook.com"
          }]
        }]
      }
    }
  }
  sendCall(sender, pageid, messageData);
}


function sendCall(sender, pageid, messageData) {
 request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:gettoken(pageid)},
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


function sendAccountUnLinkMessage(sender, pageid) {
  let messageData = {
     "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Welcome to M-Bank Logout flow",
          "image_url": "http://www.example.com/images/m-bank.png",
          "buttons": [{
            "type": "account_unlink"
          }]
        }]
      }
    }
  }
  sendCall(sender, pageid, messageData);
}

function getURL(text) {
  let command = text.split(' ')
  if(command.length == 2 && (command[0] == "image" || command[0] == "video"
)) {
	 return command[1];  
  }
	
  return null;	
}

function getMediaType(text) {
  let command = text.split(' ')
  if(command.length == 2) {
	 return command[0];  
  }
	
  return null;	
}

function uploadnandsendmedia(url, sender, pageid) {
  var get_media_type = getMediaType(url)	
  let messageData = {
     "attachment": {
      "type": get_media_type, 
      "payload":{
        "is_reusable": true,
        "url": url
      }
    }
  }
  
  return uploadCall(sender, pageid, messageData, get_media_type)	
}

function uploadCall(sender, pageid, messageData, get_media_type) {
 request({
    url: 'https://graph.facebook.com/v2.6/me/message_attachments',
    qs: {access_token:gettoken(pageid)},
    method: 'POST',
    json: {
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    } else {
	 console.log('Error: ', response.body)
	 var att_id = response.body['attachment_id']
	 sendMediaMessage(get_media_type, att_id, sender, pageid);
    }
	return null	 
  })
}

// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
