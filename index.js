import express from "express"
import { MongoClient, ObjectId } from 'mongodb';
import  cors from "cors"
import 'dotenv/config'
const app = express()
const PORT = 8000
 
app.use(cors())
app.use(express.json())


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
const mongoClient= await connectToMongoDB()
const db = mongoClient.db("wanderlust")
const destinationcollation = db.collection("destination")
const bookingcollation = db.collection("bookings")

app.post("/add-destination",async(req,res)=>{
     const data = req.body
     const result = await destinationcollation.insertOne(data)
     console.log(result)
     res.send(result) 
})

app.get('/destinations',async(req,res)=>{
     const result = await destinationcollation.find().toArray()
     res.send(result)
})

app.get("/destination/:id",async(req,res)=>{
     const {id} = req.params
     const result = await destinationcollation.findOne({_id:new ObjectId(id)})
     res.send(result)
})

app.patch("/destination/:id",async(req,res)=>{
     const {id} = req.params
     const update = req.body 
     const result = await destinationcollation.updateOne(
          {_id: new ObjectId(id)},
          {$set: update}
     )

     res.json(result)
})
app.delete("/destination/:id",async(req,res)=>{
     const {id} = req.params 
     const result = await destinationcollation.deleteOne({_id: new ObjectId(id)})
     res.json(result)
})
app.post("/booking",async(req,res)=>{
     const data = req.body
     const result = await bookingcollation.insertOne(data)
     res.send(result)
})
app.get("/my-bookings/:email", async(req,res)=>{
     const {email} = req.params
     const result =  await bookingcollation.find({email:email}).toArray()
     res.send(result)
})
app.delete("/my-bookings/:id",async(req,res)=>{
  const {id} = req.params
  const result = await bookingcollation.deleteOne({_id:id})
  res.send(result)  
})
app.get('/',(req,res)=>{
     res.send({message:"Server is Running Fine!"})

})   
app.listen(PORT,()=>{
     console.log(`Server is Running  at Port${PORT}`)
})