# Fire Detection System Using YOLO

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![YOLO v11](https://img.shields.io/badge/YOLO-v11-green.svg)](https://github.com/ultralytics/ultralytics)
[![Flask](https://img.shields.io/badge/Flask-2.0+-red.svg)](https://flask.palletsprojects.com/)
[![Django](https://img.shields.io/badge/Django-4.0+-darkgreen.svg)](https://www.djangoproject.com/)

A real-time fire detection system built with **YOLO v11** for model training, **Flask** for video streaming simulation, **Django & Django REST Framework** for API and WebSocket creation, and **ReactJS** for UI design. The system monitors video feeds from multiple cameras and sends alerts when fire is detected.

## 🔥 Features

- **Real-time Fire Detection**: Uses YOLO v11 model trained specifically for fire detection
- **Multi-Camera Support**: Monitor multiple camera feeds simultaneously
- **Automatic Alerts**: Sends alerts to Django backend when fire is detected
- **Snapshot Capture**: Automatically saves annotated images when fire is detected
- **Video Streaming**: Live video feeds with fire detection overlays
- **Alert Cooldown**: Prevents spam alerts with configurable cooldown periods
- **REST API**: JSON API endpoints for health checks and camera management
- **WebSocket Support**: Real-time notifications through Django Channels
- **React Frontend**: Modern UI for monitoring and managing the system
- **Cross-Origin Support**: CORS enabled for frontend integration

## 🏗️ Architecture

The system consists of four main components:

### 1. Flask Video Streamer (`VideoStreamer/`)
- Processes video feeds using YOLO v11
- Detects fire in real-time
- Streams annotated video feeds
- Captures and saves detection snapshots
- Sends alerts to Django backend

### 2. Django Backend
- Receives fire detection alerts
- Stores detection data and images
- Provides REST API endpoints for alert management
- Handles WebSocket connections for real-time updates

### 3. React Frontend
- Modern web interface for system monitoring
- Real-time camera feed display
- Alert management and history
- Dashboard with analytics

### 4. YOLO v11 Model
- Custom trained fire detection model
- High accuracy fire classification
- Optimized for real-time processing

## 🎯 Detection Capabilities

- **Fire Detection**: Trained to detect fire with high accuracy
- **Confidence Thresholding**: Configurable confidence levels (default: 50%)
- **Frame Processing**: Smart frame skipping for performance optimization
- **Alert Management**: Prevents duplicate alerts with cooldown system

## 📁 Project Structure

```
FireDetectionSystemUsingYolo/
├── VideoStreamer/                 # Flask video processing service
│   ├── app.py                    # Main Flask application
│   ├── best.pt                   # YOLO v11 fire detection model
│   ├── Videos/                   # Sample video files
│   │   ├── video1.mp4           # Kitchen camera feed
│   │   ├── video2.mp4           # Living room camera feed
│   │   └── video3.mp4           # Storage room camera feed
│   └── public/
│       └── snapshots/           # Saved fire detection images
├── backend/                      # Django API backend (if applicable)
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
├── frontend/                     # React frontend (if applicable)
│   ├── package.json
│   ├── src/
│   └── ...
├── docs/                        # Documentation
│   ├── SETUP.md
│   ├── CONTRIBUTING.md
│   ├── CODE_OF_CONDUCT.md
│   └── API_DOCUMENTATION.md
├── requirements.txt             # Python dependencies
├── README.md
└── LICENSE
```

## 🎬 Camera Endpoints

The system provides three camera feeds:

| Camera | Location | Endpoint | Video Source |
|--------|----------|----------|--------------|
| Camera 1 | Kitchen | `/kitchen` | `Videos/video1.mp4` |
| Camera 2 | Living Room | `/livingroom` | `Videos/video2.mp4` |
| Camera 3 | Storage Room | `/storage` | `Videos/video3.mp4` |

## 🔧 API Endpoints

### Health & Status
- `GET /` - System status
- `GET /health` - Detailed health check

### Camera Streams
- `GET /kitchen` - Kitchen camera stream
- `GET /livingroom` - Living room camera stream  
- `GET /storage` - Storage room camera stream

### Snapshots
- `GET /snapshots/<filename>` - Serve saved detection images

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/FireDetectionSystemUsingYolo.git
   cd FireDetectionSystemUsingYolo
   ```

2. **Setup Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Download Model and Videos**
   - Place your trained `best.pt` model in `VideoStreamer/`
   - Add sample videos to `VideoStreamer/Videos/`

4. **Start the Flask Server**
   ```bash
   cd VideoStreamer
   python app.py
   ```

5. **Access the System**
   - Open http://localhost:5000 in your browser
   - Monitor camera feeds and detection alerts

For detailed setup instructions, see [SETUP.md](docs/SETUP.md)

## 📈 Model Information

- **Framework**: YOLO v11 (Ultralytics)
- **Model File**: `best.pt`
- **Classes**: Fire detection (binary classification)
- **Training**: Custom dataset with fire/no-fire samples
- **Input**: Video frames (640x640 recommended)
- **Output**: Bounding boxes with confidence scores

## 🎨 Visual Features

- **Real-time Annotations**: Live bounding boxes and confidence scores
- **Timestamp Overlay**: Current date/time on video feed
- **Location Labels**: Camera location display
- **Color Coding**: Green text for system info, detection boxes for alerts

## 📊 Performance Features

- **Smart Frame Processing**: Skip frames for better performance
- **Proper Frame Rate**: Maintains video playback speed
- **Memory Management**: Efficient video processing
- **Error Handling**: Robust error handling and logging

## 🔗 Integration

### Django Backend Integration
```python
POST http://localhost:8000/api/alerts/
```

**Payload:**
- `camera_ip`: Camera identifier
- `confidence`: Detection confidence score
- `status`: Alert status
- `detected_frame`: Annotated image file

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](docs/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [Setup Guide](docs/SETUP.md)
- 📋 [API Documentation](docs/API_DOCUMENTATION.md)
- 🐛 [Issue Tracker](https://github.com/yourusername/FireDetectionSystemUsingYolo/issues)
- 💬 [Discussions](https://github.com/yourusername/FireDetectionSystemUsingYolo/discussions)

## 🙏 Acknowledgments

- [Ultralytics YOLO](https://github.com/ultralytics/ultralytics) for the detection framework
- [Flask](https://flask.palletsprojects.com/) for the web framework
- [Django](https://www.djangoproject.com/) for the backend API
- [OpenCV](https://opencv.org/) for image processing

---

**⚠️ Note**: This system is designed for demonstration and research purposes. For production fire safety systems, ensure compliance with local fire safety regulations and standards.