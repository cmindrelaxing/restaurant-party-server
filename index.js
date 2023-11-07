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
  origin: "*",
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
      const result = await partyCollection.find().toArray();
      console.log(result);
      res.send(result);
    });

    // add a new party item
    app.post('/foods', async(req, res) => {
      const newItem = req.body;
      console.log(newItem);
      const result = await partyCollection.insertOne(newItem);
      res.send(result);
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
