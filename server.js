const express = require("express");
const app = express();
const cors = require("cors");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const port = process.env.PORT || 8000;
const { RSA_NO_PADDING } = require('constants');
const saltedMd5=require('salted-md5');
const path=require('path');
const multer=require('multer')
const upload=multer({storage: multer.memoryStorage()})
require('dotenv').config()
app.use(express.urlencoded())
// app.use(compression())
app.use(cors());
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

const serviceAccount = require("./confidential.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.BUCKET_URL
});
app.locals.bucket = admin.storage().bucket()

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

// Realtime-Updates from the firestore

// db.collection("Rankawat").doc("Data")
//     .onSnapshot((doc) => {
//         console.log("Current data: ", doc.data());
//     });
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
});
app.get('/all',async (req,res)=>{
// fetches the data once from firestore 
  await db.collection("Rankawat").doc("Stock").get().then((doc) => {
      if (doc.exists) {
        res.json({
          FireStore: doc.data()
        })
          // console.log("Document data:", doc.data());
      } else {
          console.log("No such document!");
      }
  }).catch((error) => {
      console.log("Error getting document:", error);
  });
});

app.post('/upload',upload.single('upfile'),async(req,res)=>{
  const name = saltedMd5(req.file.originalname, 'SUPER-S@LT!')
  const fileName = name + path.extname(req.file.originalname)
  await app.locals.bucket.file(fileName).createWriteStream().end(req.file.buffer)
  const price = parseInt(req.body.price);
  let docRef=db.collection("Rankawat").doc("Stock").collection(req.body.Category).doc(req.body.tag)
  await docRef.set({
    Desc: req.body.desc,
    Gold:req.body.Gtype,
    Diamond:req.body.dtype,
    Tag: req.body.tag,
    Category: req.body.Category,
    Price: price,
    Img: fileName
  });

  res.json({
    FBStorageURL: fileName,
    status: "done"
  });
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});