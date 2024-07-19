/*
Project Name: EndoSens
File Name: home.js
Team Members: Jasmine Guo, Pramya Surapaneni, Kriti Srivastava, Edith Domanski
Date: June 3, 2024
Description: This file provides the JS for the graph generation (seconds, 1 min average, 5 min average)
and the start/stop data collection. It also provides code for the name display
*/

// ----------------- Firebase Setup & Initialization ------------------------//
import {initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"; 
import {getAuth} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";  
import {getDatabase, ref, set, update, child, get, remove} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfRNxccRTpZnXqHEVpkdFb5uWGZGsS_JU",
  authDomain: "sensor3-fb-rtd.firebaseapp.com",
  databaseURL: "https://sensor3-fb-rtd-default-rtdb.firebaseio.com",
  projectId: "sensor3-fb-rtd",
  storageBucket: "sensor3-fb-rtd.appspot.com",
  messagingSenderId: "197359259025",
  appId: "1:197359259025:web:4e65a4a1e79e32ac1e1e30"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//Initialize Firebase Authentication
const auth = getAuth(app)

// Returns instace of your app's FRD
const db = getDatabase(app)

// --------------------- Get reference values -----------------------------

let userLink = document.getElementById("userLink") // username for the navbar
let signOutLink = document.getElementById("signOut") //sign out link
let welcome = document.getElementById("welcome") // welcome header
let status = document.getElementById("collectionStatus")
let currentUser = null // initialize currentUser to null

// ----------------------- Get User's Name'Name ------------------------------
function getUsername(){
  // Grab value for the "keep logged in" switch
  let keepLoggedIn = localStorage.getItem("keepLoggedIn")
  if(keepLoggedIn == "yes"){
    currentUser = JSON.parse(localStorage.getItem("user"))
    console.log(currentUser)
  }
  else{
    currentUser = JSON.parse(sessionStorage.getItem("user"))
    console.log(currentUser)
  }
}

// ---------------------------Get a month's data set --------------------------
// Must be an async function because you need to get all the data from FRD
// before you can process it for a table or graph
async function getDataSet(userID, year, month, day, dataType) {
 
  const seconds = []
  const crampVal = []
 
  const dbref = ref(db)

  // Wait for data to be pulled from FRD using the formatted date
  await get(child(dbref, 'users/' + userID + '/data/' + year + "/" + month + "/" + day))
  .then((snapshot) => {
    if(snapshot.exists()){
      snapshot.forEach(child => {
        seconds.push(child.key)
        crampVal.push(child.val());
      })
      createLineChart(seconds, crampVal, day, dataType)
    }
    else {
      alert('No Data Found')
    }
  })
    .catch((error) => {
      alert("Unsuccessful, error: " + error)
  })
  }

  function processDataByMinute(seconds, crampVal) {
    const minuteData = {};
  
    for (let i = 0; i < seconds.length; i++) {
      const minute = Math.floor(seconds[i] / 60);
      if (!minuteData[minute]) {
        minuteData[minute] = [];
      }
      minuteData[minute].push(crampVal[i]);
    }
  
    const minuteLabels = Object.keys(minuteData);
    const minuteValues = Object.values(minuteData).map(values => {
      // Find the maximum value for this minute
      return Math.max(...values);
    });
  
    return { labels: minuteLabels, data: minuteValues };
  }

  function processDataByFiveMinutes(seconds, crampVal) {
    const fiveMinuteData = {};
  
    for (let i = 0; i < seconds.length; i++) {
      const fiveMinuteInterval = Math.floor(seconds[i] / 300); // Calculate the 5-minute interval (300 seconds = 5 minutes)
      if (!fiveMinuteData[fiveMinuteInterval]) {
        fiveMinuteData[fiveMinuteInterval] = [];
      }
      fiveMinuteData[fiveMinuteInterval].push(crampVal[i]);
    }
  
    const fiveMinuteLabels = Object.keys(fiveMinuteData);
    const fiveMinuteValues = Object.values(fiveMinuteData).map(values => {
      return Math.max(...values); // Find the maximum value for this 5-minute interval
    });
  
    return { labels: fiveMinuteLabels, data: fiveMinuteValues };
  }
  
function createLineChart(seconds, crampVal, day, dataType) {

   // Get the canvas element
   const ctx = document.getElementById("myChart")

   // Get the existing chart instance
   const existingChart = Chart.getChart(ctx);
 
   // Destroy the existing chart if it exists
   if (existingChart) {
     existingChart.destroy();
   }

   // Create the chart
   if (dataType === 'per-second'){
    let myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: seconds, //Chart days for x axis labels
        datasets: [
            {
                label: `Muscle Value Per Second`,
                data: crampVal,                          //Using data from the points for activities
                fill: false,
                backgroundColor: 'rgba(0, 0, 0, 1)',
                borderColor: 'rgba(0, 0, 0, 1)',
                borderWidth: 1
            },
        ]
    },
    options: {
        responsive: true,       // Re-size based on screen size
        scales: {                // Display options for x & y axes
            x: {
                title: {
                    display: true,
                    text: 'Seconds',       //x-axis title
                    font: {             // font properties
                        size: 20
                    },
                },
                ticks: {
                    font: {
                        size: 16
                    }
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Muscle Intensity Value',   //Y-axis title
                    font: {
                        size: 20
                    },
                },
                ticks: {
                    font: {
                        size: 12
                    }
                }
            }
        },
        plugins: {          // Display options
            title: {
                display: true,
                text: `Muscle Sensor Values Per Second`,     //Chart title
                font: {
                    size: 24
                },
                padding: {
                    top: 10,
                    bottom: 30
                }
            },
            //Legend options
            legend: {
                align: 'start',
                position: 'bottom'
            }
        }
    }
})
   }
   else if (dataType === 'per-minute'){
    const processedData = processDataByMinute(seconds, crampVal);
    let myChart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: processedData.labels, //Chart days for x axis labels
          datasets: [
              {
                  label: `Muscle Value Per Minute`,
                  data: processedData.data,                          //Using data from the points for activities
                  fill: false,
                  backgroundColor: 'rgba(0, 0, 0, 1)',
                  borderColor: 'rgba(0, 0, 0, 1)',
                  borderWidth: 1
              },
          ]
      },
      options: {
          responsive: true,       // Re-size based on screen size
          scales: {                // Display options for x & y axes
              x: {
                  title: {
                      display: true,
                      text: 'Minutes',       //x-axis title
                      font: {             // font properties
                          size: 20
                      },
                  },
                  ticks: {
                      font: {
                          size: 16
                      }
                  },
              },
              y: {
                  title: {
                      display: true,
                      text: 'Muscle Intensity Value',   //Y-axis title
                      font: {
                          size: 20
                      },
                  },
                  ticks: {
                      font: {
                          size: 12
                      }
                  }
              }
          },
          plugins: {          // Display options
              title: {
                  display: true,
                  text: `Muscle Sensor Values Per Minute`,     //Chart title
                  font: {
                      size: 24
                  },
                  padding: {
                      top: 10,
                      bottom: 30
                  }
              },
              //Legend options
              legend: {
                  align: 'start',
                  position: 'bottom'
              }
          }
      }
  })
   }
   else if (dataType === 'every-five-minutes'){
    const processedData = processDataByFiveMinutes(seconds, crampVal);
    let myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: processedData.labels, // Labels for 5-minute intervals
        datasets: [
          {
            label: `Muscle Value (Max Value per 5 minutes)`,
            data: processedData.data, // Average values for each 5-minute interval
            fill: false,
            backgroundColor: 'rgba(0, 0, 0, 1)',
            borderColor: 'rgba(0, 0, 0, 1)',
            borderWidth: 1
          },
        ]
      },
      options: {
        responsive: true, // Re-size based on screen size
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time (5-minute intervals)', // x-axis title
              font: {
                size: 20
              },
            },
            ticks: {
              font: {
                size: 16
              }
            },
          },
          y: {
            title: {
              display: true,
              text: 'Muscle Intensity Value (Max)', // Y-axis title
              font: {
                size: 20
              },
            },
            ticks: {
              font: {
                size: 12
              }
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: `Muscle Sensor Values (Max per 5 minutes)`, // Chart title
            font: {
              size: 24
            },
            padding: {
              top: 10,
              bottom: 30
            }
          },
          legend: {
            align: 'start',
            position: 'bottom'
          }
        }
      }
    });
  }
}

// Sign-out function that will remove user info from local/session storage and
// sign-out from FRD
function SignOutUser(){
  // Clear storages
  sessionStorage.removeItem("user")
  localStorage.removeItem("user")
  localStorage.removeItem("keepLoggedIn")

  signOutLink(auth).then(() => {
    //Sign out successful
  }).catch((err) => {
    //error occured
  })
  
  window.location = "index"
}

// -------------------------Start/Stop data collection ---------------------

document.getElementById("startCollection").addEventListener("click", startDataCollection);
document.getElementById("endCollection").addEventListener("click", endDataCollection);

function startDataCollection() {
  console.log('start data collecton')
  // fetch to the .py server 
  fetch("http://192.168.68.127:5001/start")
  status.innerText = "Data is collecting";
}

function endDataCollection() {
  fetch("http://192.168.68.127:5001/end")
  status.innerText = "Data is not collecting";
}

// --------------------------- Home Page Loading -----------------------------
window.onload = function(){

    // ------------------------- Set Welcome Message -------------------------
    getUsername()
    if(currentUser == null){
      signOutLink.innerText = "Sign In"
      signOutLink.classList.replace("nav-link", "btn")
      signOutLink.classList.add("btn-success")
    }
    else{
      welcome.innerText = currentUser.firstName;
      signOutLink.innerText = "Sign Out";
      signOutLink.classList.replace("btn", "nav-link");
      signOutLink.classList.add("btn-success");
      document.getElementById("signOut").onclick = function(){
        SignOutUser()
      }
    }
  }
  
  // Get a data set function call
  document.getElementById("getDataSet").onclick = function() {
    const year = document.getElementById("getSetYear").value
    const month = document.getElementById("getSetMonth").value
    const day = document.getElementById("getSetDay").value
    const userID = currentUser.uid

    const dataType = 'per-second';
  
    getDataSet(userID, year, month, day, dataType)

    const tabContainer = document.querySelector('.tab-container');
    tabContainer.style.display = 'block';
  }

  document.getElementById('per-second-tab').addEventListener('click', () => {
    const year = document.getElementById("getSetYear").value;
    const month = document.getElementById("getSetMonth").value;
    const day = document.getElementById("getSetDay").value;
    const userID = currentUser.uid;
  
    getDataSet(userID, year, month, day, 'per-second');
  });
  
  document.getElementById('per-minute-tab').addEventListener('click', () => {
    const year = document.getElementById("getSetYear").value;
    const month = document.getElementById("getSetMonth").value;
    const day = document.getElementById("getSetDay").value;
    const userID = currentUser.uid;
  
    getDataSet(userID, year, month, day, 'per-minute');
  });

  document.getElementById('every-five-minutes-tab').addEventListener('click', () => {
    const year = document.getElementById("getSetYear").value;
    const month = document.getElementById("getSetMonth").value;
    const day = document.getElementById("getSetDay").value;
    const userID = currentUser.uid;
  
    getDataSet(userID, year, month, day, "every-five-minutes");
  });
  
  