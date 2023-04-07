import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import environment from "dotenv";

environment.config();

const dbClient = new MongoClient( process.env.MONGODB_CONNECTION_URL );
await dbClient.connect();
const db = dbClient.db( process.env.MONGODB_DATABASE );
const userDocuments = db.collection( process.env.MONGODB_COLLECTION_USER );
const cardDocuments = db.collection( process.env.MONGODB_COLLECTION_USER_CARDS );

const app = express();
const baseUrl = "http://localhost:3000";

app.use(express.json());
app.use(cors());

app.get("/user", async function(_, res){
    const arr = await userDocuments.find({}).toArray()
    res.json(arr.map(processUser))
});

app.get("/user/:id", async function(req, res) {
    const {id,} = req.params;
    if(!id) return res.sendStatus(400);

    const user = await userDocuments.findOne({_id : new ObjectId(id)});
    res.json(processUser(user));
});

app.post("/user", async function(req, res){
    const {name, age, color} = req.body;
    if(!name || !age || !color) return res.sendStatus(400);
    const user = {
        name : name,
        age : age,
        color : color
    }
    const response = await userDocuments.insertOne(user);
    user._id = response.insertedId;
    res.json(processUser(user));
});

app.put("/user", async function(req, res) {
    const {_id, name, age, color} = req.body;
    if(!_id || !name || !age || !color) return res.sendStatus(400);
    const user = {
        _id : new ObjectId(_id),
        name : name,
        age : age,
        color : color
    }
    const response = await userDocuments.updateOne({_id :  user._id}, {$set : user});
    res.json(processUser(user));
});

app.delete("/user/:id", async function(req, res) {
    const {id,} = req.params;
    if(!id) return res.sendStatus(400);
    const response = await userDocuments.deleteOne({_id : new ObjectId(id)});
    if(response.acknowledged && response.deletedCount == 1){
        res.sendStatus(200);
    }else{
        res.sendStatus(404);
    }
});

app.listen(3000, "0.0.0.0", function() {
    console.log("Server gestartet!");
});