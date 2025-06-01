# Fire Detection System API Documentation

This document provides comprehensive information about the Fire Detection System's REST API endpoints and WebSocket connections.

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Status Codes](#status-codes)
- [Endpoints](#endpoints)
- [WebSocket Events](#websocket-events)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## 🌐 Base URL

```
http://localhost:5000
```

For production deployments, replace with your actual domain.

## 🔐 Authentication

Currently, the API does not require authentication. For production use, consider implementing:
- API Key authentication
- JWT tokens
- OAuth 2.0

## 📝 Response Format

All API responses follow this structure:

```json
{
    "status": "success|error",
    "data": {},
    "message": "Human readable message",
    "timestamp": "2025-06-01T10:30:00Z"
}
```

## 🔢 Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

## 🛠️ Endpoints

### System Endpoints

#### GET /
Get system status and information.

**Response:**
```json
{
    "status": "success",
    "data": {
        "system": "Fire Detection System",
        "version": "1.0.0",
        "model_loaded": true,
        "cameras_active": 3,
        "uptime": "2 hours, 15 minutes"
    },
    "message": "System is running normally"
}
```

#### GET /health
Detailed health check of all system components.

**Response:**
```json
{
    "status": "success",
    "data": {
        "overall_health": "healthy",
        "components": {
            "model": {
                "status": "healthy",
                "model_file": "best.pt",
                "classes": ["fire", "normal"],
                "last_loaded": "2025-06-01T08:00:00Z"
            },
            "cameras": {
                "status": "healthy",
                "active_cameras": 3,
                "camera_list": [
                    {"id": 1, "location": "Kitchen", "status": "active"},
                    {"id": 2, "location": "Living Room", "status": "active"},
                    {"id": 3, "location": "Storage Room", "status": "active"}
                ]
            },
            "storage": {
                "status": "healthy",
                "snapshots_directory": "public/snapshots",
                "available_space": "4.2GB",
                "total_snapshots": 156
            }
        }
    },
    "message": "All systems operational"
}
```

### Camera Stream Endpoints

#### GET /kitchen
Stream from Kitchen camera (Camera 1).

**Response:** Video stream (MJPEG format)

**Headers:**
```
Content-Type: multipart/x-mixed-replace; boundary=frame
```

#### GET /livingroom
Stream from Living Room camera (Camera 2).

**Response:** Video stream (MJPEG format)

#### GET /storage
Stream from Storage Room camera (Camera 3).

**Response:** Video stream (MJPEG format)

### Camera Information Endpoints

#### GET /cameras
Get information about all cameras.

**Response:**
```json
{
    "status": "success",
    "data": {
        "cameras": [
            {
                "id": 1,
                "location": "Kitchen",
                "endpoint": "/kitchen",
                "status": "active",
                "video_source": "Videos/video1.mp4",
                "last_detection": "2025-06-01T10:25:00Z",
                "detection_count": 5
            },
            {
                "id": 2,
                "location": "Living Room",
                "endpoint": "/livingroom",
                "status": "active",
                "video_source": "Videos/video2.mp4",
                "last_detection": null,
                "detection_count": 0
            },
            {
                "id": 3,
                "location": "Storage Room",
                "endpoint": "/storage",
                "status": "active",
                "video_source": "Videos/video3.mp4",
                "last_detection": "2025-06-01T09:15:00Z",
                "detection_count": 2
            }
        ]
    },
    "message": "Camera information retrieved successfully"
}
```

#### GET /cameras/{camera_id}
Get information about a specific camera.

**Parameters:**
- `camera_id` (integer): Camera ID (1, 2, or 3)

**Response:**
```json
{
    "status": "success",
    "data": {
        "camera": {
            "id": 1,
            "location": "Kitchen",
            "endpoint": "/kitchen",
            "status": "active",
            "video_source": "Videos/video1.mp4",
            "last_detection": "2025-06-01T10:25:00Z",
            "detection_count": 5,
            "alert_state": {
                "snapshot_taken": false,
                "last_alert_time": 1717236300,
                "alert_cooldown": 30
            }
        }
    },
    "message": "Camera information retrieved successfully"
}
```

### Snapshot Endpoints

#### GET /snapshots/{filename}
Retrieve a saved detection snapshot.

**Parameters:**
- `filename` (string): Snapshot filename

**Response:** Image file (JPEG format)

**Example:**
```
GET /snapshots/fire_1_1717236300123456.jpg
```

#### GET /snapshots
List all available snapshots.

**Query Parameters:**
- `limit` (integer, optional): Number of snapshots to return (default: 50)
- `offset` (integer, optional): Number of snapshots to skip (default: 0)
- `camera_id` (integer, optional): Filter by camera ID
- `date_from` (string, optional): Filter from date (ISO format)
- `date_to` (string, optional): Filter to date (ISO format)

**Response:**
```json
{
    "status": "success",
    "data": {
        "snapshots": [
            {
                "filename": "fire_1_1717236300123456.jpg",
                "camera_id": 1,
                "camera_location": "Kitchen",
                "timestamp": "2025-06-01T10:25:00Z",
                "confidence": 0.87,
                "file_size": "245KB",
                "url": "/snapshots/fire_1_1717236300123456.jpg"
            }
        ],
        "total_count": 156,
        "page_info": {
            "limit": 50,
            "offset": 0,
            "has_more": true
        }
    },
    "message": "Snapshots retrieved successfully"
}
```

### Detection Statistics Endpoints

#### GET /stats
Get detection statistics.

**Query Parameters:**
- `period` (string, optional): Time period (hour, day, week, month) (default: day)
- `camera_id` (integer, optional): Filter by camera ID

**Response:**
```json
{
    "status": "success",
    "data": {
        "period": "day",
        "stats": {
            "total_detections": 15,
            "cameras": {
                "1": {"location": "Kitchen", "detections": 8},
                "2": {"location": "Living Room", "detections": 2},
                "3": {"location": "Storage Room", "detections": 5}
            },
            "hourly_distribution": [
                {"hour": 8, "detections": 2},
                {"hour": 9, "detections": 5},
                {"hour": 10, "detections": 8}
            ],
            "average_confidence": 0.75,
            "peak_hour": 10
        }
    },
    "message": "Statistics retrieved successfully"
}
```

### Configuration Endpoints

#### GET /config
Get current system configuration.

**Response:**
```json
{
    "status": "success",
    "data": {
        "detection": {
            "confidence_threshold": 0.5,
            "frame_skip": 5,
            "alert_cooldown": 30
        },
        "model": {
            "model_file": "best.pt",
            "classes": ["fire", "normal"]
        },
        "cameras": {
            "total_cameras": 3,
            "active_cameras": 3
        }
    },
    "message": "Configuration retrieved successfully"
}
```

#### PUT /config
Update system configuration.

**Request Body:**
```json
{
    "detection": {
        "confidence_threshold": 0.6,
        "frame_skip": 3,
        "alert_cooldown": 45
    }
}
```

**Response:**
```json
{
    "status": "success",
    "data": {
        "updated_fields": ["confidence_threshold", "frame_skip", "alert_cooldown"],
        "new_config": {
            "detection": {
                "confidence_threshold": 0.6,
                "frame_skip": 3,
                "alert_cooldown": 45
            }
        }
    },
    "message": "Configuration updated successfully"
}
```

## 🔗 WebSocket Events

### Connection
Connect to WebSocket for real-time updates:

```javascript
const socket = new WebSocket('ws://localhost:5000/ws');
```

### Events

#### fire_detected
Sent when fire is detected by any camera.

**Event Data:**
```json
{
    "type": "fire_detected",
    "data": {
        "camera_id": 1,
        "camera_name": "Kitchen Camera",
        "location": "Kitchen",
        "confidence": 0.87,
        "timestamp": "2025-06-01T10:25:00Z",
        "snapshot_url": "/snapshots/fire_1_1717236300123456.jpg",
        "message": "Fire detected with 87.0% confidence!"
    }
}
```

#### camera_status
Sent when camera status changes.

**Event Data:**
```json
{
    "type": "camera_status",
    "data": {
        "camera_id": 2,
        "location": "Living Room",
        "status": "offline",
        "timestamp": "2025-06-01T10:30:00Z",
        "message": "Camera 2 (Living Room) went offline"
    }
}
```

#### system_status
Sent when system status changes.

**Event Data:**
```json
{
    "type": "system_status",
    "data": {
        "status": "healthy",
        "active_cameras": 3,
        "model_loaded": true,
        "timestamp": "2025-06-01T10:00:00Z"
    }
}
```

## ❌ Error Handling

### Error Response Format

```json
{
    "status": "error",
    "error": {
        "code": "CAMERA_NOT_FOUND",
        "message": "Camera with ID 5 not found",
        "details": "Valid camera IDs are 1, 2, and 3"
    },
    "timestamp": "2025-06-01T10:30:00Z"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| CAMERA_NOT_FOUND | Requested camera does not exist |
| SNAPSHOT_NOT_FOUND | Requested snapshot file not found |
| MODEL_NOT_LOADED | YOLO model failed to load |
| INVALID_PARAMETERS | Request parameters are invalid |
| PROCESSING_ERROR | Error during video processing |
| STORAGE_ERROR | Error accessing storage |

## ⏱️ Rate Limiting

Current rate limits:
- General API calls: 100 requests per minute per IP
- Video streams: 1 concurrent connection per camera per IP
- WebSocket connections: 5 concurrent connections per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1717236360
```

## 📚 Examples

### Python Example

```python
import requests
import json

# Get system health
response = requests.get('http://localhost:5000/health')
health_data = response.json()
print(f"System status: {health_data['data']['overall_health']}")

# Get camera information
response = requests.get('http://localhost:5000/cameras')
cameras = response.json()['data']['cameras']
for camera in cameras:
    print(f"Camera {camera['id']}: {camera['location']} - {camera['status']}")

# Get snapshots
response = requests.get('http://localhost:5000/snapshots?limit=10')
snapshots = response.json()['data']['snapshots']
for snapshot in snapshots:
    print(f"Snapshot: {snapshot['filename']} (Confidence: {snapshot['confidence']})")
```

### JavaScript Example

```javascript
// Fetch system status
fetch('http://localhost:5000/')
    .then(response => response.json())
    .then(data => {
        console.log('System status:', data.data.system);
    });

// WebSocket connection
const socket = new WebSocket('ws://localhost:5000/ws');

socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'fire_detected') {
        console.log('Fire detected!', data.data);
        // Handle fire alert
    }
};

// Update configuration
fetch('http://localhost:5000/config', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        detection: {
            confidence_threshold: 0.7
        }
    })
})
.then(response => response.json())
.then(data => {
    console.log('Config updated:', data.message);
});
```

### cURL Examples

```bash
# Get system health
curl -X GET http://localhost:5000/health

# Get camera information
curl -X GET http://localhost:5000/cameras/1

# Download a snapshot
curl -X GET http://localhost:5000/snapshots/fire_1_1717236300123456.jpg -o snapshot.jpg

# Update configuration
curl -X PUT http://localhost:5000/config \
  -H "Content-Type: application/json" \
  -d '{"detection": {"confidence_threshold": 0.6}}'

# Get detection statistics
curl -X GET "http://localhost:5000/stats?period=day&camera_id=1"
```

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Video streams are in MJPEG format
- Snapshot images are in JPEG format
- WebSocket connections support real-time updates
- API responses include proper CORS headers for frontend integration

## 🔄 Versioning

This is version 1.0 of the API. Future versions will maintain backward compatibility where possible.

---

For more information or support, please refer to the main [README.md](../README.md) or contact the development team.