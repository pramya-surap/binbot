
// ----------------- Firebase Setup & Initialization ------------------------//
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword }
from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

import { getDatabase, ref, set, update, child, get }
from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

 // Your web app's Firebase configuration
 const firebaseConfig = {
  apiKey: "AIzaSyDmAt4N1GJOjnWbRrMCnTiLV6oYB0H_efw",
  authDomain: "binbot-d9c69.firebaseapp.com",
  databaseURL: "https://binbot-d9c69-default-rtdb.firebaseio.com",
  projectId: "binbot-d9c69",
  storageBucket: "binbot-d9c69.appspot.com",
  messagingSenderId: "224445110708",
  appId: "1:224445110708:web:33ff1915020316074ffae1",
  measurementId: "G-FXQGXQGNPW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//Initialize Firebase Authentication
const auth = getAuth()

// Returns instace of your app's FRD
const db = getDatabase(app)

// ---------------- Register New Uswer --------------------------------//
document.getElementById("submitData").onclick = function(){
  const firstName = document.getElementById("firstName").value
  const lastName = document.getElementById("lastName").value
  const email = document.getElementById("userEmail").value
  const phoneNumber = document.getElementById("userPhone").value

  // Firebase requires a password of at least 6 characters
  const password = document.getElementById("userPass").value

  // Validate the user inputs
  if(!validation(firstName, lastName, email, phoneNumber, password)){
    return
  }

  // Create new app user using email/password auth
  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Create user credential
    const user = userCredential.user

    // Add user account info to the FRD
    // Set function will create a new reference or completely replace an existing one
    // Each new user will be placed under the "users" node
    set(ref(db, "users/" + user.uid + "/accountInfo"), {
      uid: user.uid, // save userId for home.js reference
      email:email,
      password:encryptPass(password),
      firstName:firstName,
      lastName:lastName,
      phoneNumber:phoneNumber
    })
    .then(() => {
      // Data saved successfully
      alert("User created successfully")
    })
    .catch((err) => {
      // The write failed
      alert(err)
    })
  })
  .catch(err => {
    const errorCode = err.errorCode
    const errorMessage = err.messagingSenderId
    alert(errorMessage)
  })
}

// --------------- Check for null, empty ("") or all spaces only ------------//
function isEmptyorSpaces(str){
  return str === null || str.match(/^ *$/) !== null
}

// ---------------------- Validate Registration Data -----------------------//
function validation(firstName, lastName, email, phoneNumber, password){
  let fNameRegex = /^[a-zA-Z]+$/
  let lNameRegex = /^[a-zA-Z]+$/
  let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  let phoneRegex = /^[0-9]{10}$/

  if(isEmptyorSpaces(firstName) || isEmptyorSpaces(lastName) || isEmptyorSpaces(email) || isEmptyorSpaces(phoneNumber) || isEmptyorSpaces(password)){
    alert("Please complete all fields")
    return false
  }

  if(!fNameRegex.test(firstName)){
    alert("The first name should only contain letters")
    return false
  }
  if(!lNameRegex.test(lastName)){
    alert("The last name should only contain letters")
    return false
  }
  if(!emailRegex.test(email)){
    alert("Please enter a valid email")
    return false
  }
  if(!phoneRegex.test(phoneNumber)){
    alert("Please enter a valid phone number")
    return false
  }
  return true
}

// --------------- Password Encryption -------------------------------------//
function encryptPass(password){
  let encrypted = CryptoJS.AES.encrypt(password, password)
  return encrypted.toString()
}
