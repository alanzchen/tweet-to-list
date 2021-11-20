# Tweet To List

Monitor tweets with specified criteria to add the authors to a Twitter list automatically.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://cli.heroku.com/) installed.

You need to obtain the following credentials and variables from Twitter and export them as environment variables:

 - `RULE`: the criteria by which you want to monitor tweets. For example, if you want to monitor all tweets with the tag `#ISTwitter`, then `RULE` should be `#ISTwitter`. See [Twitter Doc](https://developer.twitter.com/en/docs/twitter-api/tweets/filtered-stream/integrate/build-a-rule) for advanced usage of the rule.
 - `list_id`: a numerical ID of the list that you want to operate on. For example, if the list is https://twitter.com/i/lists/1461893404531515394, then this variable should be `1461893404531515394`.
 - `apiKey`: The API Key of your Twitter API.
 - `apiSecret`: The API Secret of your Twitter API.
 - `bearer`: The bearer token of your Twitter API.
 - `accessToken`: The access token of the list owner's account (authorized with the above API).
 - `accessTokenSecret`: The access token secret of the list owner's account (authorized with the above API).

Once all the above environment variables are set, you may run it locally for testing:

```sh
$ git clone https://github.com/alanzchen/tweet-to-list.git # or clone your own fork
$ cd tweet-to-list
$ npm install
$ npm run build
$ npm start
```

## Deploying to Heroku

If it runs fine locally, you can deploy it easily to Heroku. 

```
$ heroku create
$ git push heroku main
$ heroku open
```
or

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)