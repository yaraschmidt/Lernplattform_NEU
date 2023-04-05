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