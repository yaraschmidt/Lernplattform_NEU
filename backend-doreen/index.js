import express from "express";
import cors from "cors";
import { connect } from "./db.js";
import { ObjectId } from "mongodb";

const [userCollection, cardCollection] = await connect();
const server = express();
const baseUrl = "http://localhost:3000";

server.use(express.json());
server.use(cors());

server.listen(3000, "0.0.0.0", () => {
    console.log("Server gestartet!");
});