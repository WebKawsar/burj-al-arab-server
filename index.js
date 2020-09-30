const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const admin = require('firebase-admin');
require('dotenv').config()

const app = express();
const port = 8080;
app.use(bodyParser.json())
app.use(cors());

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u2izr.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get('/', (req, res) => {
    res.send('Hello World!')
})



const serviceAccount = require("./configs/burj-al-arab-9d75b-firebase-adminsdk-e7vi7-2c933d651b.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://burj-al-arab-9d75b.firebaseio.com"
});



client.connect(err => {
    const collection = client.db("burjAlArab").collection("bookings");

    app.post("/addBooking", (req, res) => {
        const newBooking = req.body;

        collection.insertOne(newBooking)
            .then(result => {

                res.send(result.insertedCount > 0)
            })

    })

    app.get("/bookings", (req, res) => {

        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith("Bearer ")) {

            const idToken = bearer.split(" ")[1];
            admin.auth().verifyIdToken(idToken)
            .then(function (decodedToken) {

                const tokenEmail = decodedToken.email;
                if(tokenEmail == req.query.email){

                    collection.find({email: req.query.email})
                    .toArray((error, documents) => {
            
                        res.send(documents);
                    })

                }
                else{
                    res.status("401").send("Un Authorized excess")
                }
            }).catch(function (error) {
                res.status("401").send("Un Authorized excess")
            });

        }
        else {
            res.status("401").send("Un Authorized excess")
        }

    })


});



app.listen(port, () => {
    console.log(`Listening at http://localhost:${port}`)
})