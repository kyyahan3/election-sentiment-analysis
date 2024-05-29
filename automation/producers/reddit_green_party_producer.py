# Authorship: Aleks
import os   # need this for popen
import time # for sleep
from kafka import KafkaProducer  # producer of events
import json
from bson import json_util
import praw
from datetime import datetime

producer = KafkaProducer (bootstrap_servers="129.114.26.50:9092", 
                                          acks=1)  # wait for leader to write to log

password = "test123!"
client_id = "LnaRtBluLC8VFzeNefqOkw"
client_secret = "EJ_KmPgqsZiPFQVBJ7nukIXcUIaFVw"
username = "Icy-Equipment-6958"

reddit = praw.Reddit(
    client_id=client_id,
    client_secret=client_secret,
    password=password,
    user_agent="Green Party comments stream by u/Icy-Equipment-6958",
    username=username,
)

# Parse incoming comment
def parse_comments(comment):
    return {
        "comment_author": comment.author.name,
        "comment_body": comment.body,
        "comment_id": comment.id,
        "post_author": comment.submission.author.name,
        "post_id": comment.submission.id,
        "post_title": comment.submission.title,
        "timestamp":datetime.fromtimestamp(comment.created_utc).strftime('%Y-%m-%d %H:%M:%S')
    }

# Get comments in "GreenPartyUSA" subreddit
for comment in reddit.subreddit('GreenPartyUSA').stream.comments():
    comment_json = parse_comments(reddit.comment(str(comment)))
    producer.send("green", json.dumps(comment_json, default=json_util.default).encode('utf-8'))
    producer.flush()

# we are done
producer.close()
