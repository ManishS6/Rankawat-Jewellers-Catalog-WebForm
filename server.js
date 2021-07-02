const express = require("express");
const app = express();
const cors = require("cors");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");

const serviceAccount = require("./confidential.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const user = admin.auth().currentUser;
if (user != null) {
  // The user object has basic properties such as display name, email, etc.
  const displayName = user.displayName;
  const email = user.email;
  const photoURL = user.photoURL;
  const emailVerified = user.emailVerified;

  // The user's ID, unique to the Firebase project. Do NOT use
  // this value to authenticate with your backend server, if
  // you have one. Use User.getToken() instead.
  const uid = user.uid;
} else{
  console.log("Currently User is not signed in");
}

console.log("Trying to retrieve data from firestore");

const db = admin.firestore()

// One-Time update

var docRef = db.collection("Rankawat").doc("Data");
docRef.get().then((doc) => {
    if (doc.exists) {
        console.log("Document data:", doc.data());
    } else {
        console.log("No such document!");
    }
}).catch((error) => {
    console.log("Error getting document:", error);
});

// Realtime-Updates from the firestore

// db.collection("Rankawat").doc("Data")
//     .onSnapshot((doc) => {
//         console.log("Current data: ", doc.data());
//     });