const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5000;

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

     app.get('/products', async(req,res) => {
      const data = sunglassColection.find({});
      const products = await data.toArray();
      res.send(products);
     });

     app.post('/appointments', async(req,res)=>{
      const appointment =req.body;
      const result = await sunglassColection.insertOne(appointment);
      console.log(result);
      res.json(result);
     });

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