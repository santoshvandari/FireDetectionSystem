import datetime
import cv2
import threading
import asyncio
import aiohttp
import aiofiles
from datetime import datetime
from flask import Flask, render_template, Response, jsonify
from ultralytics import YOLO
import os
import time
import requests
from flask_cors import CORS, cross_origin
import json
from flask import send_from_directory
from concurrent.futures import ThreadPoolExecutor
import queue


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

# Thread pool executor for async operations
executor = ThreadPoolExecutor(max_workers=4)

# Frame queues for each camera
camera_frame_queues = {}

# This function sends WebSocket message and saves snapshot to API asynchronously
async def send_fire_alert_async(fire_data, snapshot_path, camera_ip):
    try:
        # Send snapshot and data to Django API
        if os.path.exists(snapshot_path):
            django_api_endpoint = "http://localhost:8000/api/alerts/"
            print(f"Sending fire alert with data: {fire_data}")
            
            # Prepare the data payload matching your Django model
            data = {
                'camera_ip': camera_ip,
                'confidence': fire_data.get('confidence', 0.8),
                'status': 'active'
            }
            
            # Use aiohttp for async HTTP requests
            async with aiohttp.ClientSession() as session:
                async with aiofiles.open(snapshot_path, 'rb') as img_file:
                    file_content = await img_file.read()
                    
                    # Prepare form data
                    form_data = aiohttp.FormData()
                    for key, value in data.items():
                        form_data.add_field(key, str(value))
                    
                    form_data.add_field(
                        'detected_frame',
                        file_content,
                        filename=os.path.basename(snapshot_path),
                        content_type='image/jpeg'
                    )
                    
                    try:
                        # Send POST request to Django API
                        async with session.post(
                            django_api_endpoint, 
                            data=form_data,
                            timeout=aiohttp.ClientTimeout(total=10)
                        ) as api_response:
                            
                            if api_response.status in [200, 201]:
                                response_text = await api_response.text()
                                print("Fire alert and snapshot sent to Django API successfully!")
                                print(f"Django API response: {response_text}")
                            else:
                                response_text = await api_response.text()
                                print(f"Django API alert failed. Status code: {api_response.status}")
                                print(f"Response content: {response_text}")
                                
                    except asyncio.TimeoutError:
                        print("Timeout error sending to Django API")
                    except Exception as e:
                        print(f"Error sending to Django API: {str(e)}")
        else:
            print(f"Snapshot file not found: {snapshot_path}")
        
        return True
        
    except Exception as e:
        print(f"Error sending fire alert: {str(e)}")
        return False

# Wrapper to run async function in thread
def send_fire_alert_threaded(fire_data, snapshot_path, camera_ip):
    """Run the async fire alert function in a separate thread"""
    def run_async():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(send_fire_alert_async(fire_data, snapshot_path, camera_ip))
        finally:
            loop.close()
    
    # Start in a separate thread
    thread = threading.Thread(target=run_async, daemon=True)
    thread.start()

async def annotate_frame_async(frame, camera_location):
    """Async version of frame annotation"""
    now = datetime.now()
    current_time = now.strftime("%Y-%m-%d %H:%M:%S")

    font = cv2.FONT_HERSHEY_SIMPLEX
    # Make both timestamp and location green and small
    cv2.putText(frame, current_time, (10, 30), font, 0.6, (0, 255, 0), 2, cv2.LINE_AA)
    cv2.putText(frame, camera_location, (10, 60), font, 0.6, (0, 255, 0), 2, cv2.LINE_AA)

    # Run model prediction in executor to avoid blocking
    loop = asyncio.get_event_loop()
    results = await loop.run_in_executor(
        executor, 
        lambda: model.predict(frame, classes=[0], conf=0.8)
    )
    
    # Run plotting in executor as well
    annotated_frame = await loop.run_in_executor(
        executor,
        lambda: results[0].plot()
    )

    return annotated_frame, results

def process_camera_frames(video_path, camera_location, camera_ip, camera_id):
    """Process frames for a specific camera in a separate thread"""
    global frame_count, camera_alert_states
    
    # Create event loop for this thread
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        loop.run_until_complete(
            process_camera_frames_async(video_path, camera_location, camera_ip, camera_id)
        )
    finally:
        loop.close()

async def process_camera_frames_async(video_path, camera_location, camera_ip, camera_id):
    """Async processing of camera frames"""
    global camera_alert_states
    
    cap = cv2.VideoCapture(video_path)
    frame_count = 0
    
    # Get video frame rate for normal playback speed
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
    
    # Initialize frame queue for this camera
    if camera_id not in camera_frame_queues:
        camera_frame_queues[camera_id] = queue.Queue(maxsize=10)
    
    alert_state = camera_alert_states[camera_id]

    while True:
        start_time = time.time()
        
        success, frame = cap.read()

        if not success:
            # If video ends, loop back to beginning
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        frame_count += 1
        
        # Initialize annotated_frame with the original frame
        annotated_frame = frame.copy()

        if frame_count % frame_skip == 0:
            # Process frame for fire detection asynchronously
            annotated_frame, results = await annotate_frame_async(frame, camera_location)
            
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
                            
                            # Save the annotated frame asynchronously
                            loop = asyncio.get_event_loop()
                            success = await loop.run_in_executor(
                                executor,
                                lambda: cv2.imwrite(snapshot_filename, annotated_frame)
                            )
                            
                            print(f"success: {success}")
                            if success:
                                print(f"Predicted snapshot saved successfully: {snapshot_filename}")
                            else:
                                print(f"Failed to save predicted snapshot: {snapshot_filename}")
                            
                            alert_state['snapshot_taken'] = True
                            alert_state['last_alert_time'] = current_time
                            
                            # Camera information
                            camera_name = f"Camera {camera_id}"
                            
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
                           
                            # Send fire alert with snapshot asynchronously
                            send_fire_alert_threaded(fire_data, snapshot_filename, camera_ip)
                            
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
            cv2.putText(annotated_frame, current_time, (10, 30), font, 0.6, (0, 255, 0), 2, cv2.LINE_AA)
            cv2.putText(annotated_frame, camera_location, (10, 60), font, 0.6, (0, 255, 0), 2, cv2.LINE_AA)

        # Put frame in queue for streaming
        try:
            if not camera_frame_queues[camera_id].full():
                camera_frame_queues[camera_id].put_nowait(annotated_frame)
        except queue.Full:
            # Skip frame if queue is full
            pass

        # Calculate how long to wait to maintain proper frame rate
        processing_time = time.time() - start_time
        sleep_time = max(0, frame_delay - processing_time)
        
        if sleep_time > 0:
            await asyncio.sleep(sleep_time)

    cap.release()

def generate_frames(video_path, camera_location, camera_ip, camera_id=1):
    """Generator function for streaming frames"""
    # Start the camera processing in a separate thread
    camera_thread = threading.Thread(
        target=process_camera_frames,
        args=(video_path, camera_location, camera_ip, camera_id),
        daemon=True
    )
    camera_thread.start()
    
    # Wait a moment for the queue to be initialized
    time.sleep(1)
    
    while True:
        try:
            # Get frame from queue
            if camera_id in camera_frame_queues and not camera_frame_queues[camera_id].empty():
                frame = camera_frame_queues[camera_id].get(timeout=1)
                
                # Encode frame for streaming
                _, buffer = cv2.imencode('.jpg', frame)
                frame_bytes = buffer.tobytes()

                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            else:
                # If no frame available, wait a bit
                time.sleep(0.033)  # ~30 FPS
                
        except queue.Empty:
            # If queue is empty, wait a bit
            time.sleep(0.033)
        except Exception as e:
            print(f"Error in generate_frames for camera {camera_id}: {e}")
            time.sleep(0.1)

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
    camera_ip = "http://127.0.0.1:5000/kitchen"
    camera_id = 1
    return Response(generate_frames(video_path, camera_location, camera_ip, camera_id), 
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/livingroom')
def livingroom_camera():
    video_path = "./Videos/video2.mp4"
    camera_location = "Living Room"
    camera_ip = "http://127.0.0.1:5000/livingroom"
    camera_id = 2
    return Response(generate_frames(video_path, camera_location, camera_ip, camera_id), 
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/storage')
def storage_camera():
    video_path = "./Videos/video3.mp4"
    camera_location = "Storage Room"
    camera_ip = "http://127.0.0.1:5000/storage"
    camera_id = 3
    return Response(generate_frames(video_path, camera_location, camera_ip, camera_id), 
                   mimetype='multipart/x-mixed-replace; boundary=frame')

# Health check endpoint
@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "snapshot_dir": snapshot_dir,
        "active_cameras": len(camera_alert_states),
        "active_threads": threading.active_count()
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
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
