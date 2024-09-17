#!/bin/bash

# Clone the model repository from Hugging Face using git-lfs
echo "Downloading blip-image-captioning-large model from Hugging Face..."
git clone https://huggingface.co/Salesforce/blip-image-captioning-large models/blip-image-captioning-large
cd models/blip-image-captioning-large
git lfs pull
cd ../../
