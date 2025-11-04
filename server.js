import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";

dotenv.config();
await connectDB();



const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT ;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
