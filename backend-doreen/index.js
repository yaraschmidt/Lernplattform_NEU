import express from "express";
import cors from "cors";
import { connect } from "./db.js";
import { ObjectId } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

const [userCollection, cardCollection] = await connect();
const server = express();
const baseUrl = process.env.URL;

server.use(express.json());
server.use(cors());

function processUser(user){
    if(!user) return user;
    user.links = {
        create   : { url : baseUrl + "/user", method : "POST" },
        getAll   : { url : baseUrl + "/user", method : "GET" },
        get      : { url : baseUrl + "/user/" + user._id,                   method : "GET" },
        update   : { url : baseUrl + "/user/" + user._id,                   method : "PUT" },
        delete   : { url : baseUrl + "/user/" + user._id,                   method : "DELETE" },
        nextCard : { url : baseUrl + "/cards/nextForUser/" + user._id, method : "GET" },
    }
    return user;
}

function processCard(card){
    console.log(card);
    if(!card)
        return { links :{
                create : { url : baseUrl + "/cards", method : "POST" },
                getAll : { url : baseUrl + "/cards", method : "GET" }
            }
        }
    card.links = {
        create : { url : baseUrl + "/cards",                   method : "POST" },
        getAll : { url : baseUrl + "/cards",                   method : "GET" },
        solve  : { url : baseUrl + "/cards/solve",        method : "POST" },
        get    : { url : baseUrl + "/cards/" + card._id,  method : "GET" },
        update : { url : baseUrl + "/cards/" + card._id,  method : "PUT" },
        delete : { url : baseUrl + "/cards/" + card._id,  method : "DELETE" },
    }
    return card
}
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

server.get("/cards", (req, res) => {
    cardCollection.find({}).toArray()
        .then(arr => arr.map(processCard))
        .then(cards => res.json(cards));
});

server.get("/cards/:id", (req, res) => {
    const {id, } = req.params;
    if(id == undefined) return res.sendStatus(400);
    cardCollection.findOne({_id : new ObjectId(id)})
        .then(processCard)
        .then(card => res.json(card));
})

server.post("/cards", (req, res) => {
    const {question, answer, color} = req.body;
    if( question == undefined || answer == undefined || color == undefined) return res.sendStatus(404);
    const card = {
        question : question,
        answer : answer,
        color : color,
        user : []
    }
    cardCollection.insertOne(card)
        .then(resp => resp.insertedId)
        .then(id => {card._id = id; return card;})
        .then(processCard)
        .then(card => res.json(card));
});

server.post("/cards/solve", async (req, res) => {
    const {cardId, userId, answerKind} = req.body;
    console.log(cardId, userId);
    if(cardId == undefined || userId == undefined) return res.sendStatus(400);
    userCollection.findOne({_id : new ObjectId(userId)})
        .then(user => (!user) ? Promise.reject("") : user )
        .then(user => 
            cardCollection.updateOne({_id : new ObjectId(cardId)}, {$push : {"user" : { userId : user._id, kind : answerKind }}})
        )
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(403))
});

server.get("/cards/nextForUser/:id", async (req, res) => {
    const { id } = req.params;
    if(id == undefined ) return res.sendStatus(400);
    cardCollection.find({
        $or : [
            { user : { $eq : [] } },
            { user : 
                { $not : {
                    "$elemMatch" : {
                        userId : new ObjectId(id),
                        kind : 'solved'
                    }
            } } }
        ]
    }).toArray()
        .then(arr => arr[Math.floor(Math.random()*arr.length)])
        .then(processCard)
        .then(card => res.json(card));
});

server.put("/cards", (req, res) => {
    const { _id, question, answer, color } = req.body;
    if(_id == undefined || question == undefined || answer == undefined || color == undefined ) return res.sendStatus(400);
    const card = {
        _id : new ObjectId(_id),
        question : question,
        answer : answer,
        color : color
    }
    cardCollection.updateOne({_id : card._id}, {$set : card})
        .then(resp => (resp.acknowledged && resp.modifiedCount == 1) ? card : null)
        .then(processCard)
        .then(card => res.json(card))
});

server.delete("/cards/:id", (req, res) => {
    const { id } = req.params;
    if(id == undefined) return res.sendStatus(400);
    cardCollection.deleteOne({_id : new ObjectId(id)})
        .then(resp => (resp.acknowledged && resp.deletedCount == 1) ? 200 : 403)
        .then(code => res.sendStatus(code));
});

server.listen(3000, "0.0.0.0", () => {
    console.log("Server gestartet!");
});