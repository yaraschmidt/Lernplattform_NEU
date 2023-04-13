import express from "express";
import { ObjectId } from "mongodb";
import { collections } from "./backend.js";

const baseUrl = "https://3000-yaraschmidt-lernplattfo-mt4bz23admg.ws-eu93.gitpod.io";

function insertHateoasLinks(user){
    if(!user) return user;
    user.links = {
        create   : { url : baseUrl + "/user", method : "POST" },
        getAll   : { url : baseUrl + "/user", method : "GET" },
        get      : { url : baseUrl + "/user/" + user._id,                              method : "GET" },
        update   : { url : baseUrl + "/user/" + user._id,                              method : "PUT" },
        delete   : { url : baseUrl + "/user/" + user._id,                              method : "DELETE" },
        nextCard : { url : baseUrl + "/cards/nextForUser/" + user._id, method : "GET" },
    }
    return user;
}

export const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
    collections.userCollection.find({}).toArray()
        .then(arr => res.json(arr.map(user => insertHateoasLinks(user))));
});

userRouter.get("/:id", async (req, res) => {
    const {id} = req.params;
    if(!id) return res.sendStatus(404);
    collections.userCollection.findOne({"_id" : new ObjectId(id)})
        .then(val => res.json(insertHateoasLinks(val)));
});

userRouter.post("/", async (req, res) => {
    const {name, age, color} = req.body;
    console.log(name, age, color);
    if(!name || !age || !color) return res.sendStatus(400);
    collections.userCollection.insertOne({
            name: name,
            age: age,
            color: color
    }).then(val => res.json(insertHateoasLinks({
        _id : val.insertedId,
        name : name,
        age: age,
        color: color
    })));
});

userRouter.put("/", async (req, res) => {
    const {_id, name, age, color} = req.body;
    console.log(_id, name, age, color);
    if(!_id || !name || !age ) return res.sendStatus(404);
    collections.userCollection.updateOne({_id : new ObjectId(_id)},{$set : {
        name : name,
        age : age,
        color : color || "#ffffff"
    }}).then(val => (!val.acknowledged) ? res.sendStatus(400) : res.json(insertHateoasLinks({
        _id : _id,
        name: name,
        age : age,
        color: color || "#ffffff"
    })));
});

userRouter.delete("/:id", async (req, res) => {
    const {id} = req.params;
    if(!id) return res.sendStatus(404);
    collections.userCollection.deleteOne({_id : new ObjectId(id)})
        .then(val => (val.deletedCount == 1) ? res.sendStatus(200) : res.sendStatus(404));
});