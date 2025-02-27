import express from "express";
import connectDB from "./db/index.js";
import { app } from "./app.js";

const port = process.env.PORT || 8080;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("Database Connection failed!! ERR:", err);
  });
