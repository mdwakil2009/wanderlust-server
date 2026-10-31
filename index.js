import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";
import "dotenv/config";
import { createRemoteJWKSet, jwtVerify } from "jose";
const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URL);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
const mongoClient = await connectToMongoDB();
const db = mongoClient.db("wanderlust");
const destinationcollation = db.collection("destination");
const bookingcollation = db.collection("bookings");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "  Unauthorization!" });
  }
  const token = authHeader.split(" ")[1];

console.log("AUTH HEADER:", authHeader);
console.log("TOKEN RECEIVED:", Boolean(authHeader?.split(" ")[1]));
  const JWKS = createRemoteJWKSet(
    new URL(process.env.CLIENT-URL/api/auth/jwks),
  );
  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log(payload);
    next();
  } catch (error) {
    return res.status(500).send({ message: "Server Error!" });
  }
};

app.post("/add-destination", verifyToken, async (req, res) => {
  const data = req.body;
  const result = await destinationcollation.insertOne(data);
  res.send(result);
});

app.get("/destinations", async (req, res) => {
  const result = await destinationcollation.find().toArray();
  res.send(result);
});

app.get("/destination/:id", async (req, res) => {
  const { id } = req.params;
  const result = await destinationcollation.findOne({ _id: new ObjectId(id) });
  res.send(result);
});

app.patch("/destination/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const update = req.body;
  const result = await destinationcollation.updateOne(
    { _id: new ObjectId(id) },
    { $set: update },
  );

  res.json(result);
});
app.delete("/destination/:id",verifyToken, async (req, res) => {
  const { id } = req.params;
  const result = await destinationcollation.deleteOne({
    _id: new ObjectId(id),
  });
  res.json(result);
});
app.post("/booking",verifyToken, async (req, res) => {
  const data = req.body;
  const result = await bookingcollation.insertOne(data);
  res.send(result);
});
app.get("/my-bookings/:email", async (req, res) => {
  const { email } = req.params;
  const result = await bookingcollation.find({ email: email }).toArray();
  res.send(result);
});
app.get("/featured-destination",async(req,res)=>{
  const result = await destinationcollation.find().limit(6).toArray()
  res.send(result)
})
app.delete("/my-bookings/:id", async (req, res) => {
  const { id } = req.params;
  const result = await bookingcollation.deleteOne({ _id: id });
  res.send(result);
});
app.get("/", (req, res) => {
  res.send({ message: "Server is Running Fine!" });
});
app.listen(PORT, () => {
  console.log(`Server is Running  at Port${PORT}`);
});
