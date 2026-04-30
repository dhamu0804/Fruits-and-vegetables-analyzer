from pathlib import Path

import torch
from torch import nn
from torchvision import models

from utils.helper import normalize_label

MODEL_PATH = Path(__file__).resolve().parent / "model.pth"

DEFAULT_CLASSES = [
    "Fresh_Apple",
    "Fresh_Banana",
    "Fresh_Bellpepper",
    "Fresh_Cucumber",
    "Fresh_Grape",
    "Fresh_Okra",
    "Fresh_Orange",
    "Fresh_Potato",
    "Fresh_Strawberry",
    "Fresh_Tomato",
    "Rotten_Apple",
    "Rotten_Banana",
    "Rotten_Bellpepper",
    "Rotten_Cucumber",
    "Rotten_Grape",
    "Rotten_Okra",
    "Rotten_Orange",
    "Rotten_Potato",
    "Rotten_Strawberry",
    "Rotten_Tomato",
]


class ModelService:
    def __init__(self, model_path: Path = MODEL_PATH):
        self.model_path = model_path
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.class_names = DEFAULT_CLASSES
        self.model = self._build_model(len(self.class_names))
        self.ready = False

        if model_path.exists():
            self._load_weights(model_path)

    @staticmethod
    def _build_model(num_classes: int):
        model = models.mobilenet_v2(weights=None)
        in_features = model.classifier[1].in_features
        model.classifier[1] = nn.Linear(in_features, num_classes)
        return model

    def _load_weights(self, model_path: Path):
        checkpoint = torch.load(model_path, map_location=self.device)
        class_names = checkpoint.get("class_names")

        if class_names:
            self.class_names = class_names
            self.model = self._build_model(len(self.class_names))

        self.model.load_state_dict(checkpoint["model_state_dict"])
        self.model.to(self.device)
        self.model.eval()
        self.ready = True

    def predict_tensor(self, image_tensor):
        if not self.ready:
            raise RuntimeError(
                "Model is not trained yet. Run backend/model/train.py to create model.pth"
            )

        with torch.no_grad():
            image_tensor = image_tensor.to(self.device)
            logits = self.model(image_tensor)
            probs = torch.softmax(logits, dim=1)
            conf, pred_idx = torch.max(probs, dim=1)

        raw_label = self.class_names[pred_idx.item()]
        label = normalize_label(raw_label)
        confidence = conf.item() * 100
        return label, confidence


model_service = ModelService()
