# Tools Service

This service provides various `Python-based` features that will be used in conjunction with the main application. 
The service is built using `FastAPI` and is deployed as a `Docker` container.
It the models for tasks such as image captioning and automatic cropping image using `YOLOv5` model for person detection.
The models are automatically downloaded from Hugging Face using `Git LFS` during the Docker container setup.

## Usage
The `tools-service` provides backend functionality for agent tools in the main application.
The service can be accessed through the API endpoints.

## Features
* `Image Captioning`: Uses the `blip-image-captioning-large` model from `Hugging Face` for generating captions for images.
* `Automatic Image Cropping`: Uses the `YOLOv5 model` for person detection and automatic cropping of images.

### Project Structure
The project is structured as follows:
```perl
tools-service/
│
├── models/
│   └── blip-image-captioning-large/   # Hugging Face model for image captioning
├── app.py                # Main application script for the tools service
├── Dockerfile            
├── requirements.txt      # Python dependencies
├── download-models.sh    # Shell script for downloading the models
├── entrypoint.sh         # Entry point script for downloading models and running the app
└── .dockerignore         
```

### Models
The models used in this service are automatically downloaded from Hugging Face using Git LFS during the Docker container setup. The models are stored in the `models/` directory.
* `blip-image-captioning-large`: A pre-trained model used for generating captions from images. 
* `YOLOv5`: A model used for person detection and automatic cropping of images.
* Other models can be added as needed.

## Setup Instructions
The setup is fully handled through Docker, including model downloads and environment setup. 
No additional steps are required to set up Python locally.

```bash
docker-compose up --build
```

### This will:
* Build the `Docker` image.
* Automatically download the models using `Git LFS`.
* Start the service on `http://localhost:8000`.

## Dependencies:
* `Docker`: All dependencies are encapsulated in the Docker container.
