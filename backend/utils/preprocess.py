from io import BytesIO

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
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    tensor = IMAGE_TRANSFORM(image).unsqueeze(0)
    return image, tensor
