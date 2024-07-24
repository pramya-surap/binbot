import requests
import openai
import os
from picamera2 import Picamera2
from time import sleep

# Function to capture image with autofocus
def capture_image(image_path):
    try:
        # Ensure directory exists
        os.makedirs(os.path.dirname(image_path), exist_ok=True)

        picam2 = Picamera2()
        config = picam2.create_still_configuration(main={"size": picam2.sensor_resolution})
        picam2.configure(config)
        
        # Start the camera to adjust focus
        picam2.start()
        
        # Allow time for the autofocus to adjust
        sleep(2)
        
        # Capture the image
        picam2.capture_file(image_path)
        picam2.stop()
        picam2.close()
        return True
    except Exception as e:
        print("Error: Could not capture image.", e)
        return False

# Function to upload image to Imgur
def upload_image_to_imgur(image_path, client_id):
    headers = {'Authorization': f'Client-ID {client_id}'}
    with open(image_path, 'rb') as img_file:
        response = requests.post(
            'https://api.imgur.com/3/upload',
            headers=headers,
            files={'image': img_file}
        )

    if response.status_code == 200:
        return response.json()['data']['link']
    else:
        return None

# Function to call OpenAI API
def analyze_image(image_url, openai_api_key):
    openai.api_key = openai_api_key

    prompt = (
        f"Analyze the image at this URL: {image_url}.\n\n"
        "This is a simulated task. Based on the content of the image, determine what the object is and if it is recyclable.\n\n"
        "Respond with two lines:\nObject: [description of the object]\nRecycle: [1 for recyclable, 0 for not recyclable]\n"
        "If you are not sure, respond with 'Recycle: 0'."
    )

    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]
    )
    
    if response and 'choices' in response and len(response['choices']) > 0:
        reply = response['choices'][0]['message']['content'].strip()
        object_type = None
        recycle_status = None
        for line in reply.split('\n'):
            if line.startswith("Object:"):
                object_type = line.split("Object:")[1].strip()
            elif line.startswith("Recycle:"):
                recycle_status = line.split("Recycle:")[1].strip()
        if object_type and recycle_status in ['0', '1']:
            return object_type, int(recycle_status)
        else:
            return None, None
    else:
        return None, None

# Main function
def main():
    image_path = "/home/team13/Desktop/image/new_image.jpg"
    imgur_client_id = "b15188eeea78169"
    openai_api_key = "sk-None-t36HYQhky1lyAdpAzZ1cT3BlbkFJEwzvQsYuMexmPHPMubIa"

    if capture_image(image_path):
        image_url = upload_image_to_imgur(image_path, imgur_client_id)
        if image_url:
            print(f"Image URL: {image_url}")  # Output the image URL
            object_type, recycle_status = analyze_image(image_url, openai_api_key)
            if object_type is not None and recycle_status is not None:
                print(f"Object: {object_type}")
                print(f"Recycle: {recycle_status}")
            else:
                print("Error: Could not get a valid response from OpenAI API.")
        else:
            print("Error: Could not upload image.")
    else:
        print("Error: Could not capture image.")

if __name__ == "__main__":
    main()
