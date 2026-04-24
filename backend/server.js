import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import journalRoutes from "./routes/journals.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/journals", journalRoutes);

app.get("/", (req, res) => res.send("AI Journal API running"));

app.listen(5000, () => console.log("Server on port 5000"));
