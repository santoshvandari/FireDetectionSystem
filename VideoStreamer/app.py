from flask import Flask, Response
import cv2
import os
import time

app = Flask(__name__)

# get the videos from the video folder
video_folder = os.path.join(os.path.dirname(__file__), 'Videos')
# get the video sources
video_sources = {}
count = 0
for filename in os.listdir(video_folder):
    if filename.endswith('.mp4') or filename.endswith('.avi'):
        count += 1
        video_sources[str(count)] = "./Videos/" + filename



def generate_frames(source_id):
    cap = cv2.VideoCapture(video_sources[source_id])
    fps = cap.get(cv2.CAP_PROP_FPS) or 25  # Default to 25 if unknown
    frame_delay = 1 / fps

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)  # Loop the video
            continue

        _, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

        time.sleep(frame_delay)  # ⏱️ Add delay to match video FPS


@app.route('/video/<source_id>')
def video_feed(source_id):
    if source_id not in video_sources:
        return "Invalid source ID", 404
    return Response(generate_frames(source_id),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(port=5001, threaded=True)
