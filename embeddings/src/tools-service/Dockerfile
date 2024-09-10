# Use NVIDIA's official CUDA base image (Python 3.8 with CUDA 12.1)
FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu20.04

# Install system dependencies, including Python3 and pip
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    curl \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install NVIDIA Container Toolkit
RUN apt-get update && apt-get install -y \
    nvidia-container-toolkit \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install -r requirements.txt

RUN pip3 install watchdog  # Install watchdog for faster reloading

# Copy the application code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
