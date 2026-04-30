import json
from datetime import datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from database.db import get_db
from database.models import Analysis
from model.predict import model_service
from utils.helper import aggregate_predictions, enrich_prediction
from utils.preprocess import preprocess_image

router = APIRouter(prefix="/api", tags=["prediction"])
IMAGE_POSITIONS = ["Front", "Bottom", "Left", "Right"]


@router.post("/predict")
async def predict_images(
    images: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    if len(images) < 1 or len(images) > 4:
        raise HTTPException(status_code=400, detail="Upload between 1 and 4 images.")

    if not model_service.ready:
        raise HTTPException(
            status_code=503,
            detail="Model weights missing. Train the model first to generate model.pth.",
        )

    predictions = []
    image_names = [None, None, None, None]

    for idx, upload in enumerate(images):
        image_names[idx] = upload.filename
        image_bytes = await upload.read()

        try:
            _, tensor = preprocess_image(image_bytes)
            label, confidence = model_service.predict_tensor(tensor)
            prediction = enrich_prediction(label, confidence)
            prediction["image_name"] = upload.filename
            prediction["position"] = IMAGE_POSITIONS[idx]
            predictions.append(prediction)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Invalid image {upload.filename}: {exc}")

    payload = aggregate_predictions(predictions)

    if payload["type"] == "single":
        primary = payload["final_result"]
        result_text = primary["label"]
        confidence = primary["confidence"]
        category = "single"
    else:
        first = payload["results"][0]
        result_text = first["label"]
        confidence = first["confidence"]
        category = "multiple"
        primary = first

    record = Analysis(
        timestamp=datetime.utcnow().isoformat(),
        image1=image_names[0],
        image2=image_names[1],
        image3=image_names[2],
        image4=image_names[3],
        result=result_text,
        confidence=confidence,
        category=category,
        shelf_life=primary.get("shelf_life"),
        nutrition=primary.get("nutrition"),
        storage_tip=primary.get("storage_tip"),
        health_tip=primary.get("health_tip"),
        raw_json=json.dumps(payload),
    )

    db.add(record)
    db.commit()

    return payload
