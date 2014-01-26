conn = new Mongo();
db = conn.getDB('twitter');


var sentimentHash = {};

var getSentiment = function() {
  db.subjectivity_lexicon.find().forEach(function(item) {
    switch (item.polarity) {
      case 'negative':
        sentimentHash[item.word] = -1;
        break;
      case 'positive':
        sentimentHash[item.word] = 1;
        break;
      case 'neutral':
        sentimentHash[item.word] = 0;
        break;
      default:
        sentimentHash[item.word] = 0;
    }
  });
}

getSentiment();


var mapFunction = function() {
  emit(
    this._id,
    this.value.tweet_text
  );
};

var reduceFunction = function(key, values) {
  // wird nicht benötigt
};

var finalizeFunction = function(tweet_id, tweet_text) {
  var words = tweet_text.split(" ");
  var sentiment = 0;

  for(var i = 0; i < words.length; i++) {
    if(sentimentHash[words[i]]) {
      sentiment += sentimentHash[words[i]];
    }
  }
  tweet_text = words.join(' ');
  
  return {tweet_id: tweet_id, tweet_text: tweet_text, tweet_sentiment: sentiment};
};


// MapReduce
db.tweets_no_slang.mapReduce(
  mapFunction,
  reduceFunction,
  {
    scope: {
      slangHash: slangHash,
      sentimentHash: sentimentHash
    },
    out: "tweets_sentiment",
    finalize: finalizeFunction
  }
)