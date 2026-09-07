from io import BytesIO

import cv2
import numpy as np
from PIL import Image
from torchvision import transforms

IMAGE_SIZE = 224

IMAGE_TRANSFORM = transforms.Compose(
    [
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)


def preprocess_image(image_bytes: bytes):
    try:
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except Exception:
        image_array = np.frombuffer(image_bytes, dtype=np.uint8)
        image_bgr = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if image_bgr is None:
            raise

        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        image = Image.fromarray(image_rgb)

    tensor = IMAGE_TRANSFORM(image).unsqueeze(0)
    return image, tensor
