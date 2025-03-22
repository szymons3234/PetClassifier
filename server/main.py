from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
from tensorflow.keras.models import load_model

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"])

MODEL = load_model("model.keras", compile=False)

CLASS_NAMES =['Abyssinian ',
 'Bengal ',
 'Birman ',
 'Bombay ',
 'British Shorthair ',
 'Egyptian Mau ',
 'Maine Coon ',
 'Persian ',
 'Ragdoll ',
 'Russian Blue ',
 'Siamese ',
 'Sphynx ',
 'american bulldog ',
 'american pit bull terrier ',
 'basset hound ',
 'beagle ',
 'boxer ',
 'chihuahua ',
 'english cocker spaniel ',
 'english setter ',
 'german shorthaired ',
 'great pyrenees ',
 'havanese ',
 'japanese chin ',
 'keeshond ',
 'leonberger ',
 'miniature pinscher ',
 'newfoundland ',
 'pomeranian ',
 'pug ',
 'saint bernard ',
 'samoyed ',
 'scottish terrier ',
 'shiba inu ',
 'staffordshire bull terrier ',
 'wheaten terrier ',
 'yorkshire terrier ']


@app.get("/ping")
async def ping():
    return "Hello, I am alive"


def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image


@app.post("/predict")
async def predict(
        file: UploadFile = File(...)
):
    image = read_file_as_image(await file.read())
    img_batch = np.expand_dims(image, 0)

    predictions = MODEL.predict(img_batch)

    pred_class = CLASS_NAMES[np.argmax(predictions[0])]
    confidence = np.max(predictions[0])
    return {
        'class': pred_class,
        'confidence': float(confidence)
    }


if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=8000)
