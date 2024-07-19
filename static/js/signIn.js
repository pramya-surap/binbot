/*
Project Name: EndoSens
File Name: signIn.js
Team Members: Jasmine Guo, Pramya Surapaneni, Kriti Srivastava, Edith Domanski
Date: June 3, 2024
Description: This file provides the JS for signing in an existing user,
requiring them to input their email and password, and giving them an option
to stay logged in
*/

// ----------------- Firebase Setup & Initialization ------------------------//

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {getDatabase, ref, set, update, child, get} 
  from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

const auth = getAuth(); // Firebase authetification

// Return an instance of the database associated with your app
const db = getDatabase(app);

// Import the functions you need from the SDKs you need


// ---------------------- Sign-In User ---------------------------------------//
document.getElementById('signIn').onclick = function(){
    // Get user's email and password for sign in
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    //console.log(email, password);
    // Attempt to sign user in
    signInWithEmailAndPassword(auth, email, password)
    .then((getUserCredential) => {
        // Create user credential and store user ID
        const user = getUserCredential.user;

        // Log sign in date in DB
        // 'Update' function will only add the last login info and won't over
        let logDate = new Date();
        update(ref(db, 'users/' + user.uid + '/accountInfo'), {
            last_login: logDate,
        })
        .then(() => {
            // User signed in successfully
            alert('User signed in successfully!')
            // Get snapshot of all the user info (including uid) that will be passed to the login() function and stored in session or local storage
            get(ref(db, 'users/' + user.uid + '/accountInfo')).then((snapshot) => {
                if (snapshot.exists()){
                    console.log(snapshot.val());
                    logIn(snapshot.val(), firebaseConfig);      
                } else{
                    console.log("User does not exist")
                }
            })
            .catch((error) => {
                console.log(error);
            });
        })
        .catch((error) => {
            // Sign-in failed
            alert(error)
        });
    })
    .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage);
    })
}

// ---------------- Keep User Logged In ----------------------------------//
function logIn(user, fbcfg){
    let keepLoggedIn = document.getElementById('keepLoggedInSwitch').ariaChecked;

    fbcfg.userID = user.uid // Add userID to FB configuration so that it is passed to Flask

    // Session storage is temporary (only while active session)
    // Info. saved as a string (must convert to JS object to string)
    // Session storage will be cleared with a signOut() function in home.js file
    if (!keepLoggedIn){
        sessionStorage.setItem('user', JSON.stringify(user));

        // Send Firebase configuration and unique user ID to app.py using POST method
        fetch('/test', {
            "method": "POST",
            "headers": {"Content-Type": "application/json"},
            "body": JSON.stringify(fbcfg),
        })

        window.location="home"     // Redirect browser to home.html
    }

    // Local storage is permanent (keep user logged in if browser is closed)
    // Local storage will be cleared with signOut() function
    else {
        localStorage.setItem('keepLoggedIn', 'yes');
        localStorage.setItem('user', JSON.stringify(user));

        // Send Firebase configuration and unique user ID to app.py using POST method
        fetch('/test', {
            "method": "POST",
            "headers": {"Content-Type": "application/json"},
            "body": JSON.stringify(fbcfg),
        })

        window.location="home";    // Redirect browser to home.html
    }
}
