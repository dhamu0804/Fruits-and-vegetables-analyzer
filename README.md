# Fruit & Vegetable Analyzer

## Overview
This project predicts freshness and class for fruit/vegetable images using MobileNetV2.

- Input: 1 to 4 images (Front, Bottom, Left, Right)
- Output: freshness label, confidence, shelf life, nutrition, storage, health tips
- Backend: FastAPI + PyTorch + SQLite
- Frontend: React (Vite)

## Project Structure
- fruit-analyzer/backend
- fruit-analyzer/frontend
- dataset (20 classes)

## Backend Setup
1. Create and activate a Python environment.
2. Install dependencies:
   pip install -r backend/requirements.txt
3. Train model on GPU only for 55 epochs:
   python backend/model/train.py --data-dir ../dataset --epochs 55
4. Start API server:
   uvicorn main:app --reload --app-dir backend

## Frontend Setup
1. Install dependencies:
   cd frontend
   npm install
2. Start frontend:
   npm run dev

## API
### POST /api/predict
- Content-Type: multipart/form-data
- Field name: images
- Minimum: 1 image
- Maximum: 4 images

Response types:
- type=single: all labels same, returns final aggregated result + per-image results
- type=multiple: labels differ, returns independent result cards

## Notes
- Trained model is saved to backend/model/model.pth
- SQLite database file is backend/analysis.db
