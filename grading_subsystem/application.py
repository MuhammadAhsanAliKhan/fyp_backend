''' Simple flask app to load word2vec google news model from gensim to spacy and have grade api to return 
correctness of student response by comparing similarity of student response to golden answer'''

from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
# from bson import ObjectId
from dotenv import load_dotenv
import os
import spacy
import gensim.downloader as api
import string
import nltk
from nltk.corpus import stopwords


dotenv_path = os.path.join(os.path.dirname(__file__), '../config.env')
load_dotenv(dotenv_path)
print(os.getenv('ATLAS_URI'))

app = Flask(__name__)
app.config['MONGO_URI'] = os.getenv('ATLAS_URI')
mongo = PyMongo(app)

# Load word2vec google news model from gensim to spacy in function
def load_word2vec():
    print('Loading word2vec model from gensim...')
    word2vec_model = api.load('word2vec-google-news-300')

    print('Loading word2vec model to spacy...')
    nlp = spacy.blank('en')
    vocab = nlp.vocab

    # Add vectors to spacy vocab
    for word, vector in zip(word2vec_model.index_to_key[:100000], word2vec_model.vectors[:100000]):
        vocab.set_vector(word, vector)

    print('Model loaded.')

    print('Saving word2vec model to disk...')
    nlp.to_disk('./models/word2vec')
    
    return nlp

def load_saved_word2vec():
    print('Loading word2vec model from disk...')
    nlp = spacy.blank('en')
    nlp.from_disk('./models/word2vec')

    print('Model loaded.')
    
    return nlp

# nlp = load_word2vec()
nlp = load_saved_word2vec()
nltk.download('stopwords')  # Download the stopwords dataset if not already downloaded
stop_words = set(stopwords.words('english'))  # Get the list of English stop words

# Grade test API
@app.route('/test', methods=['POST'])
def grade():
    # Get student response and golden answer from request
    student_response = request.json['student_response']
    golden_answer = request.json['golden_answer']

    # Calculate similarity of student response to golden answer
    similarity = nlp(student_response).similarity(nlp(golden_answer))

    # Return correctness of student response
    if similarity > 0.8:
        return jsonify({'correctness': 'Correct', 'similarity': similarity})
    else:
        return jsonify({'correctness': 'Incorrect', 'similarity': similarity}) 

    
if __name__ == '__main__':
    app.run(host='localhost', port=8000)
    