const fs = require('fs');
const { TwitterApi } = require("twitter-api-v2");
const TG = require('telegram-bot-api');
const { createCanvas, loadImage, registerFont } = require('canvas');
const CanvasTextWrapper = require('canvas-text-wrapper').CanvasTextWrapper;
const canvas = createCanvas(680, 680);
const ctx = canvas.getContext('2d');
const express = require('express');
const app = express();
var request = require('request');
const dotenv = require('dotenv');
dotenv.config();

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_TOKEN,
  appSecret: process.env.TWITTER_API_KEY_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  bearerToken: process.env.TWITTER_BEARER_TOKEN,
});

app.get('/generate', async function (req, res) {
  var quote = req.query.quote;
  var author = req.query.author;
  var quoteAuthor = `${quote} \n${author}`;
  downloadImageUrl();
  loadImage('./drive.png').then((image) => {
    ctx.drawImage(image, 0, 0);
    var font = 'Courier New';
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    CanvasTextWrapper(canvas, quoteAuthor, {font: `30px ${font}`, textAlign: 'left', verticalAlign: 'middle', strokeText: true, paddingX: 100});

    var imgBuffer = canvas.toBuffer('image/png');
    fs.writeFileSync('.success.png', imgBuffer);

    const rwClient = twitterClient.readWrite;
    const formatAuthor = `#${author.replace(/[^\w\s]/gi, '').replace(/\s/g, '')}`;
    const hashTag = `${formatAuthor} \n#goodquotesdaily \n#motivationquotes \n@RenaiArt108`;
    const tweet = `📖${quote}\n🖋${author}\n${hashTag}`;

    const mediaTweet = async () => {
    try {
      const mediaId = await twitterClient.v1.uploadMedia('success.png');
      await rwClient.v2.tweet({
        text: `${tweet}`,
        media: { media_ids: [mediaId] },
      });
      console.log("success");
    } catch (error) {
      sendErrorMessageToTelegram(error);
    }
    };
    mediaTweet();
  });
  sendMessageToTelegram(quoteAuthor);
  res.send('Sent imageQuote to Telegram success');
});

app.listen(3000, () => {
  console.log('Listening on port 3000\nCheck code and docs at: https://github.com/dhoangk07/TwitterNodejs');
});

function downloadImageUrl(){
  request(process.env.GOOGLE_DRIVE_IMAGE_URL, { json: true }, (err, res, body) => {
  if (err) { return console.log(err); }
  var fileId = body.split('/')[5];
  const downloadUrl = `https://docs.google.com/uc?export=download&id=${fileId}`;
  const file = fs.createWriteStream('./drive.png');
  request.get(downloadUrl).pipe(file);
 });
}

function sendMessageToTelegram(message){
  const options = {
    method: 'POST',
    url: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: message })
  };
  request(options, function (error, response) {
    if (!error) //throw new Error(error);
      console.log(response.body);
    else sendErrorMessageToTelegram(error);
  });
}

function sendErrorMessageToTelegram(message){
  const options = {
    method: 'POST',
    url: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_ERROR_CHANNEL, text: message })
  };
  request(options, function (error, response) {
    if (!error) //throw new Error(error);
      console.log(response.body);
    else console.log(error);
  });
}

// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }
