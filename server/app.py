from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.h5')
model = tf.keras.models.load_model(MODEL_PATH)
print("Model loaded successfully!")

@app.route('/')
def home():
    return "Handwritten Digit Recognition API"

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    try:
        # Read the image
        img = Image.open(file).convert('L')
        img = img.resize((28, 28))
        img_array = np.array(img) / 255.0  # Normalize
        img_array = img_array.reshape(1, 28, 28, 1)
        
        # Make prediction
        prediction = model.predict(img_array)
        predicted_digit = np.argmax(prediction)
        
        return jsonify({"prediction": int(predicted_digit)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
