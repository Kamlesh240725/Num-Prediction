import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 15;
    context.lineCap = 'round';
    context.strokeStyle = 'white';
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    context.lineTo(x, y);
    context.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setPrediction(null);
  };

  const recognizeDigit = async () => {
    const canvas = canvasRef.current;

    // Convert the canvas drawing to a Blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    const formData = new FormData();
    formData.append('file', blob, 'digit.png');
    
    setIsLoading(true);
    
    try {
      // Send to Flask backend for prediction
      const predictionResponse = await fetch(`${import.meta.env.VITE_API_URL}`, {
        method: 'POST',
        body: formData,
      });
      if (!predictionResponse.ok) {
        throw new Error('Prediction service error');
      }

      const predictionData = await predictionResponse.json();
      const predictedDigit = predictionData.prediction;
      setPrediction(predictedDigit);
    } catch (error) {
      console.error('Error:', error);
      setPrediction('Error in recognition');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Handwritten Digit Recognition using AI</h1>
      <h2>Draw any digit in the box below</h2>
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseOut={endDrawing}
          className="drawing-canvas bg-black"
        />
      </div>
      
      <div className="button-group">
        <button onClick={clearCanvas} className="button clear">Delete</button>
        <button onClick={recognizeDigit} disabled={isLoading} className="button submit">
          {isLoading ? 'Processing...' : 'Recognize Digit'}
        </button>
      </div>
      
      {prediction !== null && (
        <div className="prediction-result">
          <h2>Prediction: {prediction}</h2>
        </div>
      )}
    </div>
  );
}

export default App;
