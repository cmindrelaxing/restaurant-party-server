const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
// app.use(cors());
// app.use(express.json());

app.use(express.json());
const corsConfig = {
  origin: [
    "*",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};
app.use(cors(corsConfig));

// =================================================================

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ejkwftr.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // =================================================================
    const partyCollection = client.db("partyDB").collection("foods");
    // =================================================================

    // =============================== codes add start ==================================

    // find all party items
    app.get('/foods', async(req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);

      console.log(page, size);

      console.log('Pagination query', req.query);
      const result = await partyCollection.find()
      .skip(page * size)
      .limit(size)
      .toArray();
      console.log(result);
      res.send(result);
    });

    // add a new party item by from
    app.post('/foods', async(req, res) => {
      const newItem = req.body;
      console.log(newItem);
      const result = await partyCollection.insertOne(newItem);
      res.send(result);
    });

    // find specific item by _id
    app.get('/foods/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = {_id: new ObjectId(id)};
      const result = await partyCollection.findOne(query);
      res.send(result);
    });

    // delete specific item by _id
    app.delete('/foods/:id', async(req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = {_id: new ObjectId(id)};
      const result = await partyCollection.deleteOne(query);
      res.send(result);
    });

    // update one food by _id
    app.put('/foods/:id', async(req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = {_id: new ObjectId(id)};
      const options = { upsert: true };
      const updateFood = req.body;
      const food = {
        $set: {
          name: updateFood.name,
          price: updateFood.price,
          image: updateFood.image,
          category: updateFood.category,
          description: updateFood.description,
          made: updateFood.made,
          country: updateFood.country,
          rating: updateFood.rating,
        },
      };

      const result = await partyCollection.updateOne(filter, food, options);
      res.send(result);
    });

    // pagination for codes
    app.get('/foodsCount', async(req, res) => {
      const count = await partyCollection.estimatedDocumentCount();
      res.send({count});
    });

    // =============================== codes add end.. ==================================

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// =================================================================

app.get("/", (req, res) => {
  res.send("Welcome restaurant party!");
});

app.listen(port, () => {
  console.log(`Restaurant running server listening on port ${port}`);
});
