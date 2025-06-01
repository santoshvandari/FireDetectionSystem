home/wabisabi/Desktop/FireDetectionSystemUsingYolo/SETUP.md -->
# Fire Detection System Setup Guide

This comprehensive guide will help you set up and run the Fire Detection System on your local machine.

## 📋 Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu 18.04+), macOS (10.14+), or Windows 10+
- **Python**: 3.8 or higher
- **RAM**: Minimum 8GB (16GB recommended for better performance)
- **Storage**: At least 10GB free space
- **GPU**: NVIDIA GPU with CUDA support (optional but recommended for faster processing)

### Required Software
- Python 3.8+
- pip (Python package manager)
- Git
- Node.js 14+ (for React frontend, if applicable)
- PostgreSQL or SQLite (for Django backend, if applicable)

## 🚀 Installation Steps

### 1. Clone the Repository

```bash
cd ~/Desktop
git clone https://github.com/yourusername/FireDetectionSystemUsingYolo.git
cd FireDetectionSystemUsingYolo
```

### 2. Python Environment Setup

#### Create Virtual Environment
```bash
# Create virtual environment
python3 -m venv fire_detection_env

# Activate virtual environment
# On Linux/macOS:
source fire_detection_env/bin/activate

# On Windows:
fire_detection_env\Scripts\activate
```

#### Verify Python Version
```bash
python --version  # Should be 3.8 or higher
```

### 3. Install Python Dependencies

#### Core Dependencies
```bash
# Upgrade pip
pip install --upgrade pip

# Install core packages
pip install ultralytics==8.0.196
pip install flask==2.3.3
pip install flask-cors==4.0.0
pip install opencv-python==4.8.1.78
pip install requests==2.31.0
pip install numpy==1.24.3
pip install Pillow==10.0.1
```

#### Additional Dependencies (Optional)
```bash
# For development
pip install pytest==7.4.2
pip install black==23.7.0
pip install flake8==6.0.0

# For GPU support (if you have NVIDIA GPU)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

#### Install from Requirements File
```bash
# If requirements.txt exists
pip install -r requirements.txt
```

### 4. System Dependencies

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install -y python3-opencv
sudo apt install -y libgl1-mesa-glx
sudo apt install -y libglib2.0-0
sudo apt install -y libsm6
sudo apt install -y libxext6
sudo apt install -y libxrender-dev
sudo apt install -y libgomp1
```

#### macOS
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install opencv
brew install python-tk
```

#### Windows
```bash
# Install Visual C++ Redistributable
# Download from Microsoft website

# OpenCV should work with pip installation
# If issues occur, install via conda:
conda install -c conda-forge opencv
```

### 5. Download and Setup Model

#### YOLO Model Setup
```bash
# Create model directory
mkdir -p VideoStreamer/models

# If you have a pre-trained model, place it in VideoStreamer/
cp /path/to/your/best.pt VideoStreamer/

# If you need to train a model, use:
# yolo train data=fire_dataset.yaml model=yolov8n.pt epochs=100
```

#### Verify Model
```bash
cd VideoStreamer
python -c "
from ultralytics import YOLO
try:
    model = YOLO('best.pt')
    print('Model loaded successfully!')
    print(f'Model classes: {model.names}')
except Exception as e:
    print(f'Error loading model: {e}')
"
```

### 6. Prepare Video Files

#### Create Video Directory
```bash
mkdir -p VideoStreamer/Videos
```

#### Sample Video Setup
```bash
# Option 1: Use your own videos
cp /path/to/your/kitchen_video.mp4 VideoStreamer/Videos/video1.mp4
cp /path/to/your/living_room_video.mp4 VideoStreamer/Videos/video2.mp4
cp /path/to/your/storage_video.mp4 VideoStreamer/Videos/video3.mp4

# Option 2: Download sample videos (if available)
# wget -O VideoStreamer/Videos/video1.mp4 "URL_TO_SAMPLE_VIDEO"

# Option 3: Use webcam (modify app.py to use camera instead of video file)
# Change video_path to 0 for default camera
```

#### Verify Video Files
```bash
ls -la VideoStreamer/Videos/
# Should show video1.mp4, video2.mp4, video3.mp4
```

### 7. Create Required Directories

```bash
# Create snapshots directory
mkdir -p VideoStreamer/public/snapshots
chmod 755 VideoStreamer/public/snapshots

# Create logs directory
mkdir -p logs

# Verify directory structure
tree VideoStreamer/ -L 2
```

### 8. Environment Configuration

#### Create Environment File
```bash
# Create .env file in VideoStreamer directory
cat > VideoStreamer/.env << EOF
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True

# YOLO Configuration
MODEL_PATH=best.pt
CONFIDENCE_THRESHOLD=0.5
FRAME_SKIP=5

# Alert Configuration
ALERT_COOLDOWN=30
SNAPSHOT_DIR=public/snapshots

# Django Backend Configuration (if applicable)
DJANGO_API_URL=http://localhost:8000/api/alerts/
DJANGO_API_TOKEN=your_api_token_here

# Camera Configuration
CAMERA_1_LOCATION=Kitchen
CAMERA_2_LOCATION=Living Room
CAMERA_3_LOCATION=Storage Room
EOF
```

#### Update Configuration in app.py
```python
# Add to the top of VideoStreamer/app.py
import os
from dotenv import load_dotenv

load_dotenv()

# Update configuration variables
CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD', 0.5))
FRAME_SKIP = int(os.getenv('FRAME_SKIP', 5))
ALERT_COOLDOWN = int(os.getenv('ALERT_COOLDOWN', 30))
```

## 🎮 Running the Application

### 1. Start the Flask Server

#### Basic Startup
```bash
cd VideoStreamer
python app.py
```

#### Production Startup
```bash
cd VideoStreamer
gunicorn --bind 0.0.0.0:5000 app:app --workers 4
```

#### Development with Auto-reload
```bash
cd VideoStreamer
FLASK_ENV=development python app.py
```

### 2. Verify Server is Running

```bash
# Check server status
curl http://localhost:5000/health

# Expected output:
# {"status": "healthy", "model_loaded": true, "cameras": 3}
```

### 3. Access Camera Feeds

Open your web browser and navigate to:

- **System Status**: http://localhost:5000/
- **Kitchen Camera**: http://localhost:5000/kitchen
- **Living Room Camera**: http://localhost:5000/livingroom
- **Storage Camera**: http://localhost:5000/storage
- **Health Check**: http://localhost:5000/health

### 4. Test Fire Detection

1. **Monitor Console Output**: Watch for detection logs
2. **Check Snapshots**: Look in `VideoStreamer/public/snapshots/` for saved images
3. **Test API Endpoints**: Use browser or curl to test endpoints

## 🔧 Configuration Options

### Performance Tuning

#### For High Performance
```python
# In app.py
frame_skip = 3  # Process more frames
confidence_threshold = 0.3  # Lower threshold for more detections
```

#### For Low-End Systems
```python
# In app.py
frame_skip = 10  # Process fewer frames
confidence_threshold = 0.7  # Higher threshold for fewer false positives
```

### Video Processing Settings

```python
# Resize frames for faster processing
def resize_frame(frame, scale=0.5):
    width = int(frame.shape[1] * scale)
    height = int(frame.shape[0] * scale)
    return cv2.resize(frame, (width, height))
```

### Camera Configuration

```python
# Use webcam instead of video file
# In generate_frames function:
cap = cv2.VideoCapture(0)  # 0 for default webcam
# cap = cv2.VideoCapture("rtsp://camera_ip/stream")  # For IP cameras
```

## 🧪 Testing the Setup

### 1. Unit Tests
```bash
# Run basic tests
cd VideoStreamer
python -c "
import cv2
import numpy as np
from ultralytics import YOLO

# Test OpenCV
print('Testing OpenCV...')
img = np.zeros((100, 100, 3), dtype=np.uint8)
print(f'OpenCV working: {img.shape}')

# Test YOLO
print('Testing YOLO...')
try:
    model = YOLO('best.pt')
    print('YOLO model loaded successfully!')
except Exception as e:
    print(f'YOLO error: {e}')

print('All tests passed!')
"
```

### 2. API Tests
```bash
# Test all endpoints
curl -s http://localhost:5000/ | grep -q "Fire Detection System" && echo "✓ Home page works"
curl -s http://localhost:5000/health | grep -q "healthy" && echo "✓ Health check works"
```

### 3. Performance Tests
```bash
# Monitor resource usage
htop  # or Task Manager on Windows

# Check memory usage
python -c "
import psutil
import os
process = psutil.Process(os.getpid())
print(f'Memory usage: {process.memory_info().rss / 1024 / 1024:.2f} MB')
"
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Model Loading Error
```bash
# Error: "No such file or directory: 'best.pt'"
# Solution:
ls VideoStreamer/best.pt  # Verify file exists
# If not, download or copy your trained model to this location
```

#### 2. Video File Not Found
```bash
# Error: "Cannot open video file"
# Solution:
ls VideoStreamer/Videos/  # Check video files exist
# Update video paths in app.py if needed
```

#### 3. OpenCV Installation Issues
```bash
# Uninstall and reinstall OpenCV
pip uninstall opencv-python
pip install opencv-python-headless

# For GUI applications:
pip install opencv-python
```

#### 4. Permission Denied for Snapshots
```bash
# Fix permissions
chmod 755 VideoStreamer/public/snapshots
sudo chown -R $USER:$USER VideoStreamer/public/
```

#### 5. Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process or use different port
python app.py --port 5001
```

#### 6. CUDA/GPU Issues
```bash
# Check CUDA installation
nvidia-smi

# Install CPU-only PyTorch if GPU not needed
pip uninstall torch torchvision
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

### Debug Mode

Enable debug mode for detailed error messages:

```python
# In app.py
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

### Logging Configuration

```python
# Add to app.py for better logging
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/fire_detection.log'),
        logging.StreamHandler()
    ]
)
```

## 📊 Performance Monitoring

### Resource Monitoring
```bash
# Monitor CPU and memory
watch -n 1 'ps aux | grep python'

# Monitor GPU usage (if applicable)
watch -n 1 nvidia-smi
```

### Application Metrics
```bash
# Check detection performance
tail -f logs/fire_detection.log | grep "Fire detected"

# Monitor snapshot creation
ls -la VideoStreamer/public/snapshots/ | wc -l
```

## 🔄 Updates and Maintenance

### Updating Dependencies
```bash
# Update all packages
pip list --outdated
pip install --upgrade ultralytics flask opencv-python

# Or update from requirements.txt
pip install -r requirements.txt --upgrade
```

### Model Updates
```bash
# Replace model file
cp /path/to/new/best.pt VideoStreamer/
# Restart the application
```

### Backup Configuration
```bash
# Backup important files
tar -czf fire_detection_backup.tar.gz \
    VideoStreamer/best.pt \
    VideoStreamer/.env \
    VideoStreamer/public/snapshots/
```

## 🆘 Getting Help

If you encounter issues:

1. **Check Logs**: Review console output and log files
2. **Verify Dependencies**: Ensure all packages are correctly installed
3. **Test Components**: Test individual components (model, video, etc.)
4. **Check Documentation**: Review README.md and API documentation
5. **Search Issues**: Look for similar issues on GitHub
6. **Create Issue**: If problem persists, create a new issue with:
   - System information
   - Error messages
   - Steps to reproduce
   - Expected vs actual behavior

## 📞 Support Channels

- 📖 [Documentation](README.md)
- 🐛 [Bug Reports](https://github.com/yourusername/FireDetectionSystemUsingYolo/issues)
- 💬 [Discussions](https://github.com/yourusername/FireDetectionSystemUsingYolo/discussions)
- 📧 Email: [your-email@example.com]

---

**🎉 Congratulations!** You've successfully set up the Fire Detection System. You can now monitor video feeds and detect fire incidents in real-time.

**Next Steps**: 
- Customize camera configurations
- Train your own model with specific datasets
- Integrate with external alert systems
- Deploy to production environment