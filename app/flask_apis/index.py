# Authorship: Aleks (50), Yahan (50)
from flask import Flask, render_template, Response, jsonify, stream_with_context, make_response
from flask_cors import CORS, cross_origin
import couchdb
import requests
import json
from datetime import datetime, timedelta


app = Flask(__name__)
CORS(app) # for React to access the API

COUCHDB_BASE_URL = "http://admin:admin@129.114.26.101:5984/"
couch = couchdb.Server(COUCHDB_BASE_URL)
# db = couch['election-sentiment']
db = couch['politics']
COUCHDB_CHANGES_FEED_URL = f"{COUCHDB_BASE_URL}politics/_changes?feed=continuous&heartbeat=10000&since=now"
VIEW_BASE_NAME = '/_design/election_analysis/_view'

@app.route('/')
def index():
    return render_template('index.html')

"""
Get stats
"""
# data_type can be 'sentiment_data', 'emotion_data' or 'raw_data'
@app.route('/api/count/<data_type>', methods=['GET'])
def get_counts(data_type):
    params = {'group': 'true'}
    response = requests.get(f'{COUCHDB_BASE_URL}/politics{VIEW_BASE_NAME}/count-by-party-and-type', params=params)
    if response.status_code == 200:
        db_info = response.json()
        # print(db_info)
        stats = {}
        for row in db_info['rows']:
            if data_type in row['key']:
                stats[row['key'][0]] = row['value']
        return jsonify(stats)
    else:
        # Handle the error case
        print(f"Error: {response.status_code}")
        return None

@app.route('/api/user-count', methods=['GET'])
def get_user_count():
    params = {'group': 'true'}
    response = requests.get(f'{COUCHDB_BASE_URL}/politics{VIEW_BASE_NAME}/count-user-by-party', params=params)
    if response.status_code == 200:
        data = response.json()
        # print(data)
        users = {
            'democrat': set(),
            'republican': set(),
            'green': set(),
            'libertarian': set()
        }

        # Process each row in the view output
        for row in data['rows']:
            user, party = row['key']
            if party in users:
                users[party].add(user)

        # Calculate distinct counts
        democrat_count = len(users['democrat'])
        republican_count = len(users['republican'])
        green_count = len(users['green'])
        libertarian_count = len(users['libertarian'])

        # Identify users who posted in both parties
        both_parties = users['democrat'].intersection(users['republican'])
        both_count = len(both_parties)

        # Prepare the result
        result = {
            'democrat_count': democrat_count,
            'republican_count': republican_count,
            'both_parties_count': both_count,
            'green_count': green_count,
            'libertarian_count': libertarian_count,
            'users_in_both_parties': list(both_parties)  # Optionally list users
        }

        return jsonify(result)
    else:
        # Handle the error case
        print(f"Error: {response.status_code}")
        return None

@app.route('/api/user-by-party', methods=['GET'])
def get_user_by_party():
    params = {'group': 'true'}
    response = requests.get(f'{COUCHDB_BASE_URL}/politics{VIEW_BASE_NAME}/count-user-by-party', params=params)
    if response.status_code == 200:
        data = response.json()
        # print(data)
        users = {
            'democrat': set(),
            'republican': set(),
            'green': set(),
            'libertarian': set()
        }

        # Process each row in the view output
        for row in data['rows']:
            user, party = row['key']
            if party in users:
                users[party].add(user)

        serializable_users = {party: list(names) for party, names in users.items()}
        # print(serializable_users)
        return jsonify(serializable_users)

"""
Get aggreated sentiment data (by every 10 minutes)
"""
@app.route('/api/sentiment_trend/<aggregate>', methods=['GET'])
def get_trend(aggregate):
    params = {'group': 'true'}
    response = requests.get(f'{COUCHDB_BASE_URL}/politics{VIEW_BASE_NAME}/sentiment-agg-by-30m', params=params)
    if response.status_code != 200:
        return make_response(jsonify({"error": "Failed to fetch data"}), response.status_code)

    data = response.json()
    processed_data = process_data(data['rows'])

    def parse_time(time_str):
        return datetime.strptime(time_str, "%Y-%m-%d %H:%M")

    def aggregate_data(data, frames_per_aggregation):
        aggregated_data = {'democrat': [], 'republican': [], 'green': [], 'libertarian': []}
        for party in data:
            party_data = data[party]

            if len(party_data) <= 0:
                continue

            # Find min and max dates in the party_data
            min_date = min(parse_time(item['time']) for item in party_data)
            max_date = max(parse_time(item['time']) for item in party_data)

            # Create a list of time slots with 30 minutes interval
            time_slots = [min_date + timedelta(minutes=30 * i) for i in range(0, int((max_date - min_date).total_seconds() / 60 / 30) + 1)]

            # Fill in the missing time slots with 0 in party_data
            time_slot_set = {parse_time(item['time']): item for item in party_data}
            filled_party_data = [{'time': time_slot.strftime("%Y-%m-%d %H:%M"), 'value': time_slot_set.get(time_slot, {'value': 0})['value']} for time_slot in time_slots]

            for i in range(0, len(filled_party_data), frames_per_aggregation):
                frame_slice = filled_party_data[i:i + frames_per_aggregation]
                valid_values = [item['value'] for item in frame_slice if item['value'] is not None]

                if valid_values:
                    avg_value = sum(valid_values) / len(valid_values)
                else:
                    avg_value = None

                aggregated_data[party].append({
                    'time': frame_slice[0]['time'],
                    'value': avg_value
                })

            # Sort the aggregated data by time
            aggregated_data[party].sort(key=lambda x: parse_time(x['time']))
        print(aggregated_data)
        return aggregated_data

    # Map the aggregation interval to the number of frames per aggregation
    aggregation_mapping = {
        '30m': 1,
        '1h': 2,
        '6h': 12,
        '12h': 24,
        '1d': 48
    }

    processed_data = aggregate_data(processed_data, aggregation_mapping.get(aggregate, 1))

    return jsonify(processed_data)

def process_data(rows):
    trends = {'democrat': [], 'republican': [], 'green': [], 'libertarian': []}

    for item in rows:
        key = item['key']
        value = item['value']
        timestamp = f"{key[0]}-{key[1]:02}-{key[2]:02} {key[3]:02}:{key[4]:02}"

        for party in value:
            overall_positive_score = value[party]['positive']['sum'] / value[party]['positive']['count'] if value[party]['positive']['count'] > 0 else 0
            overall_positive_score += (value[party]['neutral']['sum'] / value[party]['neutral']['count'] / 2) if value[party]['neutral']['count'] > 0 else 0
            
            trends[party].append({'time': timestamp, 'value': overall_positive_score})

    return trends


"""
Get emotion scores
"""    
@app.route('/api/overall-emotion', methods=['GET'])
def get_overall_emotion():
    params = {'group': 'true'}
    response = requests.get(f'{COUCHDB_BASE_URL}/politics{VIEW_BASE_NAME}/emotion-sum-score', params=params)
    if response.status_code == 200:
        data = response.json()
        # print(data)
        return jsonify(data)
    else:
        # Handle the error case
        print(f"Error: {response.status_code}")
        return None

"""
listen to couchdb changes
"""
@app.route('/api/changes')
# @cross_origin()
def changes():
    def generate():
        with requests.get(COUCHDB_CHANGES_FEED_URL, stream=True) as r:
            for line in r.iter_lines():
                if line:
                    change = json.loads(line.decode('utf-8'))
                    doc_id = change.get('id')
                    doc_response = requests.get(f"{COUCHDB_BASE_URL}politics/{doc_id}")
                    if doc_response.status_code == 200:
                        doc_data = doc_response.json()
                        # print(doc_data)
                        yield f"data: {json.dumps(doc_data)}\n\n"
    return Response(stream_with_context(generate()), content_type='text/event-stream')

    
if __name__ == '__main__':
    app.run(debug=True)