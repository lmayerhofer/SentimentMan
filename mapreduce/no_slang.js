conn = new Mongo();
db = conn.getDB('twitter');


var slangHash = {};

var getSlangHash = function() {
  db.slang_dictionary.find().forEach(function(item) {
    slangHash[item.slang_phrase] = item.full_phrase;
  });
}

getSlangHash();


var mapFunction = function() {
  emit(
    this._id,
    this.text
  );
};

var reduceFunction = function(key, values) {
  // wird nicht benötigt
};

var finalizeFunction = function(tweet_id, tweet_text) {
  var words = tweet_text.split(" ");

  for(var i = 0; i < words.length; i++) {
    if(slangHash[words[i]]) {
      words[i] = slangHash[words[i]];
    }
  }
  tweet_text = words.join(' ');
  
  return {tweet_id: tweet_id, tweet_text: tweet_text};
};


// MapReduce
db.tweets.mapReduce(
  mapFunction,
  reduceFunction,
  {
    scope: {
      slangHash: slangHash
    },
    out: "tweets_no_slang",
    finalize: finalizeFunction
  }
)