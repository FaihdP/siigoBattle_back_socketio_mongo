import express from "express";
import morgan from "morgan";
import cors from "cors";
//import "./database/database.js"

const app = express();

// Server config
app.use(morgan("dev"));
app.use(cors());

export default app;
