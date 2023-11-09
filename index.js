const express = require("express");
const cors = require("cors");
var jwt = require("jsonwebtoken");
var cookieParser = require("cookie-parser");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
// app.use(cors());
// app.use(express.json());

app.use(express.json());
const corsConfig = {
  // origin: [
  //   "*",
  //   "http://localhost:5173",
  //   "http://localhost:5174",
  //   "http://localhost:5175",
  //   "http://localhost:5176",
  //   "http://localhost:5177",
  // ],
  
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};
app.use(cors(corsConfig));
app.use(cookieParser());



// our middlewares
const logger = async(req, res, next) => {
  console.log('calling middleware', req.host, req.originalUrl);
  next();
};

const verifyToken = async(req, res, next) => {
  const token = req.cookies?.token;
  console.log('value of token in middleware', token);
  if(!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    // error
    if (err) {
      console.log(err);
      return res.status(401).send({message: 'Unauthorized access denied'});
    }

    // decoded
    console.log('value in the token', decoded);
    req.user = decoded;
    next();
  });
};

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
    const orderFoodCollection = client.db("partyDB").collection("bookings");
    // =================================================================

    // =============================== codes add start ==================================

    // auth api jwt
    app.post("/jwt", logger, async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true, 
          sameSite: "none",
        })
        .send({ success: true });
    });





    // order confirm
    app.get("/bookings", verifyToken, async (req, res) => {
      // console.log(req.query.email);
      console.log('User visited in the validation process token', req.user);
      console.log('token comming', req.cookies.token);

      let query = {};
      if (req.query?.email) {
        query = { email: req.query?.email };
      }
      const result = await orderFoodCollection.find(query).toArray();
      res.send(result);
    });

    // order a food item
    app.post("/bookings", async (req, res) => {
      const newOrder = req.body;
      console.log(newOrder);
      const result = await orderFoodCollection.insertOne(newOrder);
      res.send(result);
    });

    // find specific item by _id
    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await orderFoodCollection.findOne(query);
      res.send(result);
    });

    // delete specific item by _id
    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await orderFoodCollection.deleteOne(query);
      res.send(result);
    });

    // services api
    // find all party items
    app.get("/foods", async (req, res) => {
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);

      console.log(page, size);

      console.log("Pagination query", req.query);
      const result = await partyCollection
        .find()
        .skip(page * size)
        .limit(size)
        .toArray();
      console.log(result);
      res.send(result);
    });

    // add a new party item by from
    app.post("/foods", async (req, res) => {
      const newItem = req.body;
      console.log(newItem);
      const result = await partyCollection.insertOne(newItem);
      res.send(result);
    });

    // find specific item by _id
    app.get("/foods/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await partyCollection.findOne(query);
      res.send(result);
    });

    // delete specific item by _id
    app.delete("/foods/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await partyCollection.deleteOne(query);
      res.send(result);
    });

    // update one food by _id
    app.put("/foods/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
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
    app.get("/foodsCount", async (req, res) => {
      const count = await partyCollection.estimatedDocumentCount();
      res.send({ count });
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
