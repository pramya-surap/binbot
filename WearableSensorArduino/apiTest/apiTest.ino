'''
Project Name: EndoSens
File Name: apiTest.ino
Team Members: Jasmine Guo, Pramya Surapaneni, Kriti Srivastava, Edith Domanski
Date: June 3, 2024
Description: This arduino code allows the arduino nano to read inputs
from the sensor
'''

#include <SPI.h>              // Wireless comms between sensor(s) and Arduino Nano IoT
#include <WiFiNINA.h>         // Used to connect Nano IoT to network
#include <ArduinoJson.h>      // Used for HTTP Request
#include "arduino_secrets.h"  // Used to store private network info

char ssid[] = "pramyas iphone (2)";     // your network SSID (name)
char pass[] = "a1b2c3d4e5";             // your network password

const char* server = "172.20.10.4";    // Flask server IP address
const int serverPort = 5000;          // Flask server port

WiFiClient client;

int sensorPin = A0;

void setup() {
  pinMode(sensorPin, INPUT);

  // Start the serial communication at 9600 baud rate
  Serial.begin(9600);
  Serial.print("program start");

  // Connect to the WiFi network
  connectToWiFi();
}

void loop() {
  // Read the sensor value from the analog pin
  long int sensorValue = analogRead(sensorPin);
  Serial.println(sensorValue);

  // Send the sensor data to the server
  sendSensorData(sensorValue);

  delay(5000); 
}

void connectToWiFi() {
  // Print the WiFi SSID to the serial monitor
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, pass);

  // Wait until the connection is established
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  // Print a message when connected to WiFi
  Serial.println("Connected to WiFi");
}

void sendSensorData(int sensorValue) {
  // Attempt to connect to the server
  if (client.connect(server, serverPort)) {
    // Send the sensor data to the server using an HTTP GET request
    client.print("GET /test?sensorValue=");
    client.print(sensorValue);
    client.println(" HTTP/1.1");
    client.print("Host: ");
    client.println(server);
    client.println("Connection: close");
    client.println();
  } else {
    // Print a message if the connection to the server failed
    Serial.println("Failed to connect to server");
  }
}