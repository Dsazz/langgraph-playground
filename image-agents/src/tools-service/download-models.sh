#!/bin/bash

# Check if git-lfs is installed and install it if not
if ! [ -x "$(command -v git-lfs)" ]; then
    echo "Installing git-lfs..."
    curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash
    apt-get install -y git-lfs
    git lfs install
fi

# Clone the model repository from Hugging Face using git-lfs
echo "Downloading blip-image-captioning-large model from Hugging Face..."
git clone https://huggingface.co/Salesforce/blip-image-captioning-large models/blip-image-captioning-large
cd models/blip-image-captioning-large
git lfs pull
cd ../../
