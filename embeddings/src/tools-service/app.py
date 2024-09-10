import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

BLIP_MODEL_PATH = './models/blip-image-captioning-large'

# Load the BLIP model from local path for image captioning
blip_processor = BlipProcessor.from_pretrained(BLIP_MODEL_PATH, use_fast=True)
blip_model = BlipForConditionalGeneration.from_pretrained(BLIP_MODEL_PATH)
logger.info("BLIP model loaded successfully")

class ImageCaptionRequest(BaseModel):
    image_path: str

# Image Captioning endpoint
@app.post("/caption")
async def caption_image(request: ImageCaptionRequest):
    try:
        logger.info("Received request to generate caption for image: %s", request.image_path)

        # Open the image from the provided path
        logger.info("Opening image: %s", request.image_path)
        image = Image.open(request.image_path)

        # Process the image and generate captions using the correct variables
        logger.info("Processing image and generating caption...")
        inputs = blip_processor(images=image, return_tensors="pt")
        outputs = blip_model.generate(**inputs)

        # Decode the generated caption
        logger.info("Decoding the generated caption...")
        caption = blip_processor.decode(outputs[0], skip_special_tokens=True, clean_up_tokenization_spaces=False)

        logger.info("Caption generated successfully: %s", caption)
        return {"caption": caption}

    except Exception as e:
        # Log the error to CLI
        logger.error(f"Error generating caption: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating caption: {str(e)}")
