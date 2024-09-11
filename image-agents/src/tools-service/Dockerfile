FROM python:3.8-slim

# Install system dependencies, including Python3, pip, and OpenCV dependencies
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    curl \
    python3 \
    python3-pip \
    libgl1-mesa-glx \
    libglib2.0-0 \
    git \
    && rm -rf /var/lib/apt/lists/* \

# Install Git LFS
RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash && \
    apt-get install -y git-lfs && \
    git lfs install

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install -r requirements.txt

RUN pip3 install watchdog  # Install watchdog for faster reloading

# Copy the application code
COPY . .

EXPOSE 8000
# Use the entrypoint script to handle model downloading and starting the app
ENTRYPOINT ["sh", "entrypoint.sh"]