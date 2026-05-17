import 'dotenv/config';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import connectDB from "./src/config/db.ts";
import recipeRoutes from "./src/routes/recipeRoutes.ts";
import aiRoutes from "./src/routes/aiRoutes.ts";
import errorHandler from "./src/middleware/errorHandler.ts";
import mongoose from "mongoose";

async function startServer() {
  const app = express();
  const PORT = 3000;

  connectDB();

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/status", (req, res) => {
    const isOnline = mongoose.connection.readyState === 1;
    res.json({ isOnline });
  });

  app.use("/api/recipes", recipeRoutes);
  app.use("/api/ai", aiRoutes);

 
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
