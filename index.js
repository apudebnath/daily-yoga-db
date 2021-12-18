const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const res = require('express/lib/response');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mthak.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db('daily_yoga');
        const usersCollection = database.collection('users');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews')
      // User ui to database
        app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })
      // User update amd insert
        app.put('/users', async(req, res) => {
          const user = req.body;
          const filter =  {email: user.email};
          const options = { upsert: true};
          const updateDoc ={$set: user};
          const result = await usersCollection.updateOne(filter, updateDoc, options);
          res.json(result);
        })
      // Make admin
        app.put('/users/admin', async(req, res) => {
          const user = req.body;
          console.log('put', user);
          const filter =  {email: user.email};
          const updateDoc = {$set: {role: 'admin'}};
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.json(result);
        })
      // Find Admin
        app.get('/users/:email', async(req, res) => {
          const email = req.params.email;
          const query = {email:email};
          const user = await usersCollection.findOne(query);
          let isAdmin = false;
          if(user?.role === 'admin'){
            isAdmin=true;
          }
          res.json({admin: isAdmin});
        })

      //Add product to database
        app.post('/products', async(req, res) => {
          const product = req.body;
          const result = await productsCollection.insertOne(product);
          res.json(result);
        })
      // product database to ui
        app.get('/products', async(req, res) => {
          const cursor = productsCollection.find({});
          const products = await cursor.toArray();
          res.json(products);
      })
      // search and get product by id
        app.get('/products/:id', async(req, res) => {
          const id = req.params.id;
          const query = {_id: ObjectId(id)};
          const result = await productsCollection.findOne(query);
          res.json(result);
        })
      // Order data ui to database
        app.post('/orders', async(req, res) => { 
          const order = req.body;
          const result = await ordersCollection.insertOne(order);
          res.json(result);
        })
      // Order data database to ui
        app.get('/orders', async(req, res) => {
          const cursor = ordersCollection.find({});
          const result = await cursor.toArray();
          res.json(result);
        })
      // Update status Data
      app.put('/statusUpdate/:id', async(req, res) => {
        const id = req.params.id;
        const updatedStatus = req.body.status;
        console.log(updatedStatus)
        const filter = {_id: ObjectId(id)};
        const result = await ordersCollection.updateOne(filter, {
          $set: {status: updatedStatus}
        } )
        res.json(result);
        console.log(result)
      })
    // Delete order
      app.delete('/deleteOrder/:id', async(req, res) => {
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await ordersCollection.deleteOne(query);
        res.json(result);
      })
    // Order data find by query and send db to ui
      app.get('/Orders', async(req, res) => {
        const email = req.query.email;
        const query = {email: email};
        const cursor = ordersCollection.find(query);
        const result = await cursor.toArray();
        res.json(result);
      })
    //Users review ui to database
      app.post('/reviews', async(req, res) => {
        const review = req.body;
        console.log(review);
        const result = await reviewsCollection.insertOne(review)
        res.json(result);
      })
    // Review show in db to ui
      app.get('/reviews', async(req, res) => {
        const cursor = reviewsCollection.find({});
        const result = await cursor.toArray();
        res.json(result);
      })
    }
    finally{
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Yoga server running')
})

app.listen(port, () => {
  console.log(`My Yoga port running on : ${port}`)
})