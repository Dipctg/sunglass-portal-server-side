const express = require('express')
const app = express()
const cors = require('cors');
const admin = require("firebase-admin");
require('dotenv').config();
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5000;


const serviceAccount = require('./sunglass-portal-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ielln.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

/* console.log(uri); */

async function run() {
    try {
      // Connect the client to the server
      await client.connect();
      // Establish and verify connection
     /*  console.log("Connected successfully to server"); */
     const database=client.db('sunglass_portal')
     const sunglassColection =database.collection('sunglass');
     const orderColection =database.collection('order');
     const usersCollection =database.collection('users');


     app.get('/products', async(req,res) => {
      const data = sunglassColection.find({});
      const products = await data.toArray();
      res.send(products);
     });
     app.get('/appointments', async(req,res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor =orderColection.find(query);
      const appointments =await cursor.toArray();
      res.json(appointments);
      
     });

     app.post('/appointments', async(req,res)=>{
      const appointment =req.body;
      const result = await orderColection.insertOne(appointment);
      /* console.log(result); */
      res.json(result);
     });

     app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
          isAdmin = true;
      }
      res.json({ admin: isAdmin });
  })
  
     app.post('/users', async(req,res)=>{
      const user =req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
     });
     app.put('/users', async(req,res)=>{
      const user =req.body;
      const filter = {email: user.email};
      const options = {upsert: true};
      const updateDoc ={$set:user};
      const result = await usersCollection.updateOne(filter,updateDoc,options);
      res.json(result);
     });

     app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const requester = req.decodedEmail;
      
      if (requester) {
          const requesterAccount = await usersCollection.findOne({ email: requester });
          if (requesterAccount.role === 'admin') {
              const filter = { email: user.email };
              const updateDoc = { $set: { role: 'admin' } };
              const result = await usersCollection.updateOne(filter, updateDoc);
              res.json(result);
          }
      }
       else {
          res.status(403).json({ message: 'you do not have access to make admin' })
      } 

  })


    }
    
     finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello Sunglasses portal!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})