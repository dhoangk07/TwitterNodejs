const { TwitterApi } = require('twitter-api-v2');
const fetch = require('node-fetch');
const _ = require('lodash');
dotenv.config();

async function postImageToTwitterByBuffer(object){
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_TOKEN,
      appSecret: process.env.TWITTER_API_KEY_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      bearerToken: process.env.TWITTER_BEARER_TOKEN,
    });

    const rwClient = client.readWrite;
    const imageURL = object.imageUrl;
    const response = await fetch(imageURL);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const tweet = 'Test';
    const mediaTweet = async () => {
      try {
        const mediaId = await client.v1.uploadMedia(Buffer.from(arrayBuffer), { mimeType: 'jpeg' });
        await rwClient.v2.tweet({
          text: `${tweet}`,
          media: { media_ids: [mediaId] },
        });
        console.log("Posted Image To Twitter success");
      } catch (error) {
        console.log(error);
        sendErrorMessageToTelegram(error);
      }
    };
    mediaTweet();
  } catch (error) {
    console.log(error);
    sendErrorMessageToTelegram(error);
  }
}
