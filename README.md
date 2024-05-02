# Reddit Sentiment Analysis of U.S. 2024 Presidential Elections
We utilize Natural Language Processing (NLP) and Kafka streaming to perform real-time sentiment analysis on posts in four politically-oriented subforums on Reddit: 'Republican', 'Democrat', 'Green Party of the United States', and 'Libertarian'. Our system continuously streams and analyzes real-time discussions, extracting sentiment (positive, negative, neutral) and emotion (anger, joy, sadness, optimism) from user-generated content.
## Features
- **Live Data Streaming**: Utilizes Kafka to fetch real-time data from selected subreddits. Zookeeper and brokers are deployed on a cloud cluster in full automation by Ansible [playbooks](automation).
- **Sentiment and Emotion Analysis**: Applies NLP techniques (tweet-nlp package) to determine the sentiment and emotional tone in the text.
- [**Interactive Dashboard**](app/dashboard): Features a user-friendly interface that displays live updates of sentiment analysis with React, allowing users to visualize and track changes in public opinion.
![Screenshot 2024-05-01 at 11 53 36 PM](https://github.com/kyyahan3/cs4287_final_proj/assets/93264144/9e2926ca-cdc7-450c-8d31-579f7cbb9544)
![Screenshot 2024-05-01 at 11 53 53 PM](https://github.com/kyyahan3/cs4287_final_proj/assets/93264144/23ac0ee2-2016-437b-ab24-8b4d4d79d15d)

- **Comprehensive Coverage**: Aggregates data from diverse political groups to provide a balanced view of the national political landscape. Data Aggregation is done by designing [views](app/view_couchdb.txt) on CouchDB and fetch by Flask APIs.
