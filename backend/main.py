from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from tensorflow.keras.models import load_model

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # đổi lại domain thật nếu muốn bảo mật
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model
model = load_model("real_model2.h5")
with open('easy2.txt', 'r') as f:
    actions = np.array([line.strip() for line in f if line.strip()])

class SequenceRequest(BaseModel):
    sequence: list

@app.post("/predict")
async def predict_sequence(req: SequenceRequest):
    try:
        # Convert to numpy array
        sequence = np.array(req.sequence)
        print("Raw input shape:", sequence.shape)
        print("Raw input data (first 1-2 elements):", sequence[:2])  # tránh in quá nhiều

        # Expand to batch format
        sequence = np.expand_dims(sequence, axis=0)  # (1, 50, n)
        print("Expanded input shape:", sequence.shape)

        # Predict
        res = model.predict(sequence)[0]
        print("Model output:", res)

        # Lấy top các chỉ số có xác suất cao hơn 0.5
        top_indices = np.argsort(res)[::-1]
        predictions = [
            actions[i]
            for i in top_indices
            if res[i] > 0.5
        ][:5]
        print("Filtered predictions (confidence > 0.5):", predictions) 
        return {"predictions": predictions}
    except Exception as e:
        print("Error encountered:", str(e))
        return {"error": str(e)}


