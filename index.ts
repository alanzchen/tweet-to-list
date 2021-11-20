import axios from 'axios';
import addOAuthInterceptor from 'axios-oauth-1.0a';
import request from 'request';

const axios_ = axios.create();
const RULE = process.env.RULE || "";
const list_id = process.env.list_id || "";

const apiKey = process.env.KEY || "";
const apiSecret = process.env.SECRET || "";
const accessToken = process.env.accessToken || "";
const accessTokenSecret = process.env.accessTokenSecret || "";
const bearer = process.env.bearer || "";
let timeout: NodeJS.Timeout;

addOAuthInterceptor(axios_, {
  key: apiKey,
  secret: apiSecret,
  token: accessToken,
  tokenSecret: accessTokenSecret,
  algorithm: 'HMAC-SHA1',
  includeBodyHash: false,
});

async function getMentionStream(): Promise<request.Request> {
  console.log("Fetching Rules...")
  const ids_ = await axios({
    url: 'https://api.twitter.com/2/tweets/search/stream/rules',
    headers: { Authorization: `Bearer ${bearer}` }
  });
  if (ids_.data.data) {
    const ids = ids_.data.data.map((el: any) => el.id);
    await axios({
      method: 'POST',
      url: 'https://api.twitter.com/2/tweets/search/stream/rules',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`
      },
      data: {
        delete: { ids }
      }
    });
    console.log("Resetted rules.")
  }
  const rule = {
    add: [
      {
        value: RULE, 
        tag: 'rule'
      }
    ]
  };
  const rule_resp = await axios({
    method: 'POST',
    url: 'https://api.twitter.com/2/tweets/search/stream/rules',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearer}`
    },
    data: rule
  });
  console.log("Fetching Rules...")
  console.log((await axios({
    url: 'https://api.twitter.com/2/tweets/search/stream/rules',
    headers: { Authorization: `Bearer ${bearer}` }
  })).data);
  if (rule_resp.status != 201) {
    console.error(rule_resp.data);
    throw new Error('fail to set rules.');
  }
  console.log("Rules updated.")
  const streamURL = 'https://api.twitter.com/2/tweets/search/stream';
  const config = {
    url: streamURL,
    auth: {
      bearer: bearer,
    },
    qs: {
      'tweet.fields': 'author_id,conversation_id,created_at,in_reply_to_user_id,referenced_tweets,public_metrics,source',
      'user.fields': 'name,username'
    }
  };
  const stream = request.get(config);
  return stream;
}
  
async function streamMentions(): Promise<void> {
  let stream = await getMentionStream();
  console.log('Bot streaming started...');
  stream
    .on('data', async (data) => {
      try {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
          console.log('Stream timed out. Reconnecting...');
          stream.abort();
          stream = await getMentionStream();
        }, 60000);
        const json = JSON.parse(data.toString());
        if (json.connection_issue) {
          stream.abort();
          stream = await getMentionStream();
        } else {
          if (json.data) {
            // go to tweet handler
            await handleTweet(json.data);
          } else {
            // some error
            console.error(json);
          }
        }
      } catch (e) {
        if (e instanceof SyntaxError) {
        } else {
          console.error(data.toString(), e);
        }
      }
    })
    .on('error', async (error) => {
      // Connection timed out
      // console.error(error);
      stream.abort();
      stream = await getMentionStream();
    });
}

async function AddTwitterIDToList(author_id: string): Promise<void> {
  console.log(`Adding ${author_id}`);
  let resp = await axios_({
    method: 'POST',
    url: 'https://api.twitter.com/1.1/lists/members/create.json',
    params: {
      list_id: list_id,
      user_id: author_id
    }
  });
  console.log(resp.data);
}

async function handleTweet(tweet: any) {
  console.log(tweet);
  if (tweet.author_id) {
    await AddTwitterIDToList(tweet.author_id);
  }
}

streamMentions();