conn = new Mongo();
db = conn.getDB('twitter');

var emoticonHash = {};
var emoticonCnt = {};
var happy = ":-) :) :o) :] :3 :c) :> =] 8) =) :} :^) :っ) :-D :D 8-D 8D x-D xD X-D XD =-D =D =-3 =3 B^D :-)) :'-) :') :* :^* ;-) ;) *-) *) ;-] ;] ;D ;^) :-,".split(' ');
var sad = ">:[ :-( :( :-c :c :-< :っC :< :-[ :[ :{ ;( :-|| :@ >:( :'-( :'( D:< D: D8 D; D= DX v.v D-':".split(' ');

happy.forEach(function(item) {
  emoticonHash[item] = 1;
  emoticonCnt[item] = 0;
});

sad.forEach(function(item) {
  emoticonHash[item] = -1;
  emoticonCnt[item] = 0;
});

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
    // words => sentiment
    if(sentimentHash[words[i]]) {
      sentiment += sentimentHash[words[i]];
    }

    // emoticons => sentiment
    if(emoticonHash[words[i]]) {
      sentiment += emoticonHash[words[i]];
      emoticonCnt[words[i]]++;
    }
  }

  tweet_text = words.join(' ');
  
  return {tweet_id: tweet_id, tweet_text: tweet_text, tweet_sentiment: sentiment, emoticon_statistics: emoticonCnt};
};


// MapReduce
db.tweets_no_slang.mapReduce(
  mapFunction,
  reduceFunction,
  {
    scope: {
      slangHash: slangHash,
      sentimentHash: sentimentHash,
      emoticonHash: emoticonHash,
      emoticonCnt: emoticonCnt
    },
    out: "tweets_sentiment_emoticons",
    finalize: finalizeFunction
  }
)

// Update original tweets with sentiment analyisis
db.tweets_sentiment_emoticons.find().forEach(function(tweet){
  db.tweets.update(
    { _id: tweet.value.tweet_id},
    { '$set': {sentiment: tweet.value.tweet_sentiment}}
    // save sentiment & emoticon-statistics didn't work
    // { '$set': {
    //             sentiment: tweet.value.tweet_sentiment,
    //             emoticons: tweet.value.emoticon_statistics
    //           }
    // }
  );
});