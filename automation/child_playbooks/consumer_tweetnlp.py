import tweetnlp
from kafka import KafkaConsumer
import json
import couchdb

# Topics
topics=["democrat", "republican"]

# Create kafka consumer
consumer = KafkaConsumer (
    *topics,  # Unpack the topics list
    bootstrap_servers="129.114.26.50:9092",
    value_deserializer=lambda x: json.loads(x.decode('utf-8'))
)
consumer.subscribe(topics=topics)

# CouchDB setup
couchdb_url = "http://admin:admin@129.114.26.101:5984/"
database = "politics" # existing
couch = couchdb.Server(couchdb_url)
db = couch[database] 

# Load model(s)
sentiment_model = tweetnlp.load_model('sentiment') # positive, negative, neutral
emotion_model = tweetnlp.load_model('emotion')  # for joy, anger, sadness, optimism

# For each message
for msg in consumer:
    # Message = dictionary
    topic = msg.topic 
    message_dict = msg.value

    # Pass the message into model (output similar to {'label': 'positive', 'probability': {'negative': 0.0, 'neutral': 0.1, 'positive': 0.8}})
    sentiment_result = sentiment_model.sentiment(message_dict['comment_body'], return_probability=True)
    emotion_result = emotion_model.emotion(message_dict['comment_body'], return_probability=True)

    message_dict['party'] = topic
    message_dict['type'] = 'raw_data'

    sentiment_result['party'] = topic
    sentiment_result['type'] = 'sentiment_data'
    sentiment_result['timestamp'] = message_dict['timestamp']
    
    emotion_result['party'] = topic
    emotion_result['type'] = 'emotion_data'
    emotion_result['timestamp'] = message_dict['timestamp']
    
    # Dump results into a database
    # First dump raw data, then sentiment, then emotion
    db.save(message_dict)
    db.save(sentiment_result)
    db.save(emotion_result)

    # Print raw data so we know messages are coming through
    print(sentiment_result)

consumer.close()