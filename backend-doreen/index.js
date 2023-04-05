import express from "express";
import cors from "cors";
import { connect } from "./db.js";
import { ObjectId } from "mongodb";

const [userCollection, cardCollection] = await connect();
const server = express();
const baseUrl = "http://localhost:3000";

server.use(express.json());
server.use(cors());

server.get("/user", async (req, res) => {
    userCollection.find({}).toArray()
        .then(userArr => userArr.map(processUser))
        .then(user => res.json(user));
});

server.get("/user/:id", async (req, res) => {
    const {id,} = req.params;
    if(!id) return res.sendStatus(400);

    userCollection.findOne({_id : new ObjectId(id)})
        .then(processUser)
        .then(user => res.json(user))
});

server.post("/user", async (req, res) => {
    const {name, age, color} = req.body;
    if(!name || !age || !color) return res.sendStatus(400);
    const user = {
        name : name,
        age : age,
        color : color
    }
    userCollection.insertOne(user)
        .then(val => {
            user._id = val.insertedId;
            return user;
        })
        .then(processUser)
        .then(user => res.json(user));
});

server.put("/user", async (req, res) => {
    const {_id, name, age, color} = req.body;
    if(!_id || !name || !age || !color) return res.sendStatus(400);
    const user = {
        _id : new ObjectId(_id),
        name : name,
        age : age,
        color : color
    }
    userCollection.updateOne({_id :  user._id}, {$set : user})
        .then(() => user)
        .then(processUser)
        .then(user => res.json(user));
});

server.delete("/user/:id", (req, res) => {
    const {id,} = req.params;
    if(!id) return res.sendStatus(400);
    userCollection.deleteOne({_id : new ObjectId(id)})
        .then(resp => (resp.acknowledged && resp.deletedCount == 1) ? 200 : 404 )
        .then(code => res.sendStatus(code));
});

server.listen(3000, "0.0.0.0", () => {
    console.log("Server gestartet!");
});