
from flask import Flask, render_template, url_for, request, jsonify
from datetime import datetime
import pyrebase

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

# Route for the 'How To' page
@app.route("/howTo")
def howTo():
    return render_template("howTo.html")

# Route for the 'About' page
@app.route("/about")
def about():
    return render_template("about.html")

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

    app.run(debug= True, host='10.103.19.0', port=5001)
