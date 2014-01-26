conn = new Mongo();
db = conn.getDB("twitter");


var mapFunction = function(item) {
  emit("cnt", 1);
};

var reduceFunction = function(key, values) {
  var sum = 0;

  values.forEach(function(value) {
    sum += value;
  });

  return sum;
};


// MapReduce
db.tweets.mapReduce(
  mapFunction,
  reduceFunction,
  {
    out: "tweets_count"
  }
)