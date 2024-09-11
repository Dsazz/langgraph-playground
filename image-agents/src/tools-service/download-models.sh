#!/bin/bash

# Clone the model repository from Hugging Face using git-lfs
if [ ! -d "./models/blip-image-captioning-large" ]; then
  echo "Downloading blip-image-captioning-large model from Hugging Face..."
  git clone https://huggingface.co/Salesforce/blip-image-captioning-large models/blip-image-captioning-large
  cd models/blip-image-captioning-large
  git lfs pull
  cd ../../
else
  echo "Model already exists, skipping download."
fi
