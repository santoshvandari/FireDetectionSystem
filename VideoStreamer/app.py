import datetime
import cv2
import threading
from datetime import datetime
from flask import Flask, render_template, Response, jsonify
from ultralytics import YOLO
import os
import time
import requests
from flask_cors import CORS, cross_origin
import json
from flask import send_from_directory


app = Flask(__name__)

# Add CORS in app 
CORS(app)
# Enable CORS for all routes
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    return response

# Make a folder named snapshots to save the snap when fire is detected
snapshot_dir = "public/snapshots"
os.makedirs(snapshot_dir, exist_ok=True)

frame_count = 0  # Initialize frame_count outside of any function

# Load the YOLO model for fire detection
model = YOLO("best.pt")  # Make sure this model is trained for fire detection

frame_skip = 5

# Update class names for fire detection - only two classes
classnames = ["fire", "normal"]  # Class 0 is fire, Class 1 is normal

# Global variables to track alert state per camera
camera_alert_states = {}

# This function sends WebSocket message and saves snapshot to API
def send_fire_alert(fire_data, snapshot_path, camera_ip):
    try:
        # Send snapshot and data to Django API
        if os.path.exists(snapshot_path):
            django_api_endpoint = "http://localhost:8000/api/alerts/"
            print(f"Sending fire alert with data: {fire_data}")
            
            # Prepare the data payload matching your Django model
            data = {
                'camera_ip': camera_ip,  # Use the actual camera_ip parameter
                'confidence': fire_data.get('confidence', 0.8),
                'status': 'active'
            }
            
            # Prepare the file payload for detected_frame
            with open(snapshot_path, 'rb') as img_file:
                files = {
                    'detected_frame': (
                        os.path.basename(snapshot_path),  # filename
                        img_file,                         # file object
                        'image/jpeg'                      # content type
                    )
                }
                
                try:
                    # Send POST request to Django API
                    api_response = requests.post(
                        django_api_endpoint, 
                        data=data, 
                        files=files, 
                        timeout=10
                    )
                    
                    if api_response.status_code in [200, 201]:
                        print("Fire alert and snapshot sent to Django API successfully!")
                        print(f"Django API response: {api_response.json()}")
                    else:
                        print(f"Django API alert failed. Status code: {api_response.status_code}")
                        print(f"Response content: {api_response.text}")
                        
                except requests.exceptions.RequestException as e:
                    print(f"Error sending to Django API: {str(e)}")
        else:
            print(f"Snapshot file not found: {snapshot_path}")
        
        return True
        
    except Exception as e:
        print(f"Error sending fire alert: {str(e)}")
        return False

def annotate_frame(frame, camera_location):
    now = datetime.now()
    current_time = now.strftime("%Y-%m-%d %H:%M:%S")

    font = cv2.FONT_HERSHEY_SIMPLEX
    # Make both timestamp and location green and small
    cv2.putText(frame, current_time, (10, 30), font, 0.6, (0, 255, 0), 2, cv2.LINE_AA)
    cv2.putText(frame, camera_location, (10, 60), font, 0.6, (0, 255, 0), 2, cv2.LINE_AA)

    results = model.predict(frame, classes=[0], conf=0.8)  # Only detect fire (class 0)
    annotated_frame = results[0].plot()

    return annotated_frame, results

def generate_frames(video_path, camera_location, camera_ip, camera_id=1):
    global frame_count, camera_alert_states
    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    
    # Get video frame rate for normal playbook speed
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0:
        fps = 30  # Default to 30 fps if unable to get fps
    frame_delay = 1.0 / fps  # Time delay between frames
    
    # Initialize camera alert state if not exists
    if camera_id not in camera_alert_states:
        camera_alert_states[camera_id] = {
            'snapshot_taken': False,
            'last_alert_time': 0,
            'alert_cooldown': 30  # Seconds between alerts for the same camera
        }
    
    alert_state = camera_alert_states[camera_id]

    while True:
        start_time = time.time()  # Track frame processing start time
        
        success, frame = cap.read()

        if not success:
            # If video ends, loop back to beginning
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        frame_count += 1
        
        # Initialize annotated_frame with the original frame
        annotated_frame = frame.copy()

        if frame_count % frame_skip == 0:
            # Process frame for fire detection
            annotated_frame, results = annotate_frame(frame, camera_location)
            
            current_time = time.time()
            # Check if fire is detected and cooldown period has passed
            for r in results:
                if r.boxes is not None and len(r.boxes) > 0:
                    boxes = r.boxes
                    for box in boxes:
                        cls_id = int(box.cls[0])
                        confidence = float(box.conf[0])
                        
                        # Check if it's fire (class 0) with sufficient confidence
                        if (cls_id == 0 and confidence > 0.5 and 
                            not alert_state['snapshot_taken'] and 
                            (current_time - alert_state['last_alert_time'] > alert_state['alert_cooldown'])):
                            
                            # Generate timestamp for unique ID
                            timestamp = datetime.now()
                            unique_id = int(timestamp.timestamp() * 1e6)
                            # Save snapshot - Use annotated_frame instead of original frame
                            snapshot_filename = os.path.join(snapshot_dir, f"fire_{camera_id}_{unique_id}.jpg")
                            
                            # Save the annotated frame (with bounding boxes and predictions) instead of original
                            success = cv2.imwrite(snapshot_filename, annotated_frame)
                            print(f"success: {success}")
                            if success:
                                print(f"Predicted snapshot saved successfully: {snapshot_filename}")
                            else:
                                print(f"Failed to save predicted snapshot: {snapshot_filename}")
                            
                            alert_state['snapshot_taken'] = True
                            alert_state['last_alert_time'] = current_time
                            
                            # Camera information - Generate camera IP based on location
                            camera_name = f"Camera {camera_id}"
                            camera_ip = f"http://127.0.0.1:5000/{camera_location.lower().replace(' ', '')}"
                            
                            # Prepare fire alert data
                            fire_data = {
                                "type": "alert_message",
                                "camera_id": camera_id,
                                "camera_name": camera_name,
                                "location": camera_location,
                                "camera_ip": camera_ip,
                                "message": f"Fire detected with {confidence:.1%} confidence!",
                                "confidence": confidence,
                                "timestamp": timestamp.isoformat(),
                                "image_url": f"/snapshots/fire_{camera_id}_{unique_id}.jpg"
                            }
                           
                            # Send fire alert with snapshot - now passing camera_ip instead of camera_id
                            send_fire_alert(fire_data, snapshot_filename, camera_ip)
                            
                            # Reset snapshot flag after alert cooldown
                            def reset_snapshot():
                                alert_state['snapshot_taken'] = False
                                print(f"Alert cooldown ended for camera {camera_id}")
                            
                            threading.Timer(alert_state['alert_cooldown'], reset_snapshot).start()
                            break
        else:
            # For frames that are skipped, just add timestamp and location annotations
            now = datetime.now()
            current_time = now.strftime("%Y-%m-%d %H:%M:%S")
            font = cv2.FONT_HERSHEY_SIMPLEX
            # Make both timestamp and location green and small (consistent with annotate_frame)
            cv2.putText(annotated_frame, current_time, (10, 30), font, 0.6, (0, 255, 0), 2, cv2.LINE_AA)
            cv2.putText(annotated_frame, camera_location, (10, 60), font, 0.6, (0, 255, 0), 2, cv2.LINE_AA)

        # Encode frame for streaming
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        frame_bytes = buffer.tobytes()

        # Calculate how long to wait to maintain proper frame rate
        processing_time = time.time() - start_time
        sleep_time = max(0, frame_delay - processing_time)
        
        if sleep_time > 0:
            time.sleep(sleep_time)

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

    cap.release()

# API routes
@app.route('/')
def index():
    return jsonify({"message": "Fire Detection System", "status": "online"})

# Serve snapshot images
@app.route('/snapshots/<filename>')
def serve_snapshot(filename):
    return send_from_directory(snapshot_dir, filename)

# Camera streams
@app.route('/kitchen')
def kitchen_camera():
    video_path = "./Videos/video1.mp4"
    camera_location = "Kitchen"
    camera_ip = "http://127.0.0.1:5000/kitchen"  # This matches Django camera_ip
    camera_id = 1
    return Response(generate_frames(video_path, camera_location, camera_ip, camera_id), 
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/livingroom')
def livingroom_camera():
    video_path = "./Videos/video2.mp4"
    camera_location = "Living Room"
    camera_ip = "http://127.0.0.1:5000/livingroom"  # This matches Django camera_ip
    camera_id = 2
    return Response(generate_frames(video_path, camera_location, camera_ip, camera_id), 
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/test')
def storage_camera():
    video_path = "./Videos/video3.mp4"
    camera_location = "test"
    camera_ip = "http://127.0.0.1:5000/test"  # This matches Django camera_ip
    camera_id = 3
    return Response(generate_frames(video_path, camera_location, camera_ip, camera_id), 
                   mimetype='multipart/x-mixed-replace; boundary=frame')

# @app.route('/xyz')
# def storage_camera():
#     video_path = "./Videos/video3.mp4"
#     camera_location = "xyz"
#     camera_ip = "http://127.0.0.1:5000/xyz"  # This matches Django camera_ip
#     camera_id = 3
#     return Response(generate_frames(video_path, camera_location, camera_ip, camera_id), 
#                    mimetype='multipart/x-mixed-replace; boundary=frame')


# Health check endpoint
@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "snapshot_dir": snapshot_dir,
        "active_cameras": len(camera_alert_states)
    })

# Add this check at the start of your app
if not os.path.exists(snapshot_dir):
    os.makedirs(snapshot_dir, exist_ok=True)
    print(f"Created snapshot directory: {snapshot_dir}")

# Check if directory is writable
if not os.access(snapshot_dir, os.W_OK):
    print(f"Warning: Snapshot directory is not writable: {snapshot_dir}")

if __name__ == '__main__':
    print("Starting Fire Detection System...")
    print(f"Model loaded: {model is not None}")
    print(f"Snapshot directory: {snapshot_dir}")
    app.run(host='0.0.0.0', port=5000, debug=False)
