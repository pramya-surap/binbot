
from flask import Flask, render_template, url_for, request, jsonify
from datetime import datetime

# Create a Flask app instance
app = Flask(__name__)

# Initialize Firebase configuration and other global variables
config = {}
key = 0
is_recording = False

# Route for the home page
@app.route("/")
def index():
    return render_template("index.html")

# Route for the 'Register' page
@app.route("/register")
def register():
    return render_template("register.html")

# Route for the 'Sign In' page
@app.route("/signIn")
def signIn():
    return render_template("signIn.html")

# Route for the home page after sign-in
@app.route("/home")
def home():
    return render_template("home.html")

@app.route("/upgrade")
def upgrade():
    return render_template("upgrade.html")

# Route to start recording data
@app.route("/start")
def start():    
    global is_recording
    print("start record")
    is_recording = True
    return "Successful", 200

# Route to end recording data
@app.route("/end")
def end():
    global is_recording
    is_recording = False
    return "Successful", 200

# Route to check if recording is in progress
# The Arduino will ping this route every ~5 ms
@app.route("/is_record") 
def is_record():
    return is_recording
# Entry point of the script
if __name__ == "__main__":
    app.run(debug= True, host='10.103.147.19', port=5001)