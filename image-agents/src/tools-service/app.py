import logging
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from io import BytesIO
from pydantic import BaseModel
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image, ImageOps
import torch
import numpy as np

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

BLIP_MODEL_PATH = './models/blip-image-captioning-large'

# Load the BLIP model from local path for image captioning
blip_processor = BlipProcessor.from_pretrained(BLIP_MODEL_PATH, use_fast=True)
blip_model = BlipForConditionalGeneration.from_pretrained(BLIP_MODEL_PATH)
logger.info("BLIP model loaded successfully")

# Model to accept an image path
class ImagePathRequest(BaseModel):
    image_path: str

# Image Captioning endpoint
@app.post("/caption")
async def caption_image(file: UploadFile = File(...)):
    try:
        logger.info("Received request to generate caption for image")

        # Read the image from the buffer
        image_data = await file.read()
        image = Image.open(BytesIO(image_data))

        # Process the image and generate captions using the BLIP model
        logger.info("Processing image and generating caption...")
        inputs = blip_processor(images=image, return_tensors="pt")
        outputs = blip_model.generate(**inputs)

        # Decode the generated caption
        logger.info("Decoding the generated caption...")
        caption = blip_processor.decode(outputs[0], skip_special_tokens=True, clean_up_tokenization_spaces=False)

        logger.info("Caption generated successfully: %s", caption)
        return {"caption": caption}

    except Exception as e:
        logger.error(f"Error generating caption: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating caption: {str(e)}")


# Load YOLOv5 model for person detection
yolo_model = torch.hub.load('ultralytics/yolov5', 'yolov5s', trust_repo=True)  # Small version of YOLOv5
logger.info("YOLOv5 model loaded successfully")

# Endpoint for extracting and centering all people from an image
@app.post("/extract-people")
async def extract_people(file: UploadFile = File(...)):
    try:
        logger.info("Received request to extract and center all people from image")

        # Read the image from the buffer
        image_data = await file.read()
        image = Image.open(BytesIO(image_data))
        image = np.array(image)  # Convert to numpy array for OpenCV processing

        # Get the image dimensions
        img_height, img_width, _ = image.shape

        # Detect people using YOLOv5
        logger.info("Running YOLOv5 detection on the image")
        results = yolo_model(image)
        people = results.pandas().xyxy[0]
        people = people[people['name'] == 'person']  # Filter only person class

        # If no people detected, raise an error
        if people.empty:
            logger.warning("No people detected in the image")
            raise HTTPException(status_code=404, detail="No people detected in the image")

        # Calculate the bounding box around all detected people
        x_min = int(people['xmin'].min())
        y_min = int(people['ymin'].min())
        x_max = int(people['xmax'].max())
        y_max = int(people['ymax'].max())

        # Calculate padding (10% of the bounding box height and width)
        padding_x = int((x_max - x_min) * 0.1)  # 10% of width
        padding_y = int((y_max - y_min) * 0.1)  # 10% of height

        # Ensure padding doesn't go outside the image bounds
        x_min = max(0, x_min - padding_x)
        y_min = max(0, y_min - padding_y)
        x_max = min(img_width, x_max + padding_x)
        y_max = min(img_height, y_max + padding_y)

        # Crop the image around the padded bounding box that contains all people
        cropped_image = image[y_min:y_max, x_min:x_max]

        # Convert the cropped image to an in-memory buffer
        pil_cropped_image = Image.fromarray(cropped_image)
        img_buffer = BytesIO()
        pil_cropped_image.save(img_buffer, format="JPEG")
        img_buffer.seek(0)

        # Return the buffer as a StreamingResponse
        return StreamingResponse(img_buffer, media_type="image/jpeg")

    except Exception as e:
        logger.error(f"Error extracting and centering people: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error extracting and centering people: {str(e)}")