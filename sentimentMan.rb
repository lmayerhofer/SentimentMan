require 'sinatra'
require 'twitter'
require 'json'
require 'mongo'

include Mongo

set :server, 'webrick'

connection = MongoClient.new('localhost', 27017)
db = connection.db('twitter')
collection = db.collection('tweets')

get '/' do
  erb :tweets
end

get '/tweets.json' do
  content_type :json
  collection.find().to_a.to_json
end

get '/crawler' do
  client = Twitter::Streaming::Client.new do |config|
    config.consumer_key = 'nUUmL1R8yrgZ7SJLMIj7sg'
    config.consumer_secret = 'emjaM3vJLkAWE9jRDhVDWqVhRfYjbrZsAUnEVu1gXI'
    config.access_token = '2262883531-djVfolBeMaDlynskMPs6yuZYeHD7PYgU6q4KtM6'
    config.access_token_secret = 'WukdnVNSkOdrIDzruyIBWzsseJZOjlJVG85x0b4COU4kG'
  end

  tweets = []
  id = 0
  client.filter(language: 'en', locations: '-180, -90, 180, 90') do |tweet|
    id = id + 1

    tweets << tweet.attrs

    break if id == 1000
  end

  File.open("tweets.json","w") do |f|
    f.write(tweets.to_json)
  end

  puts "Finished: Stream"
end

