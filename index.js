const express = require("express");
const { default: mongoose } = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files (for uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// router
const MessageRouter = require("./routes/message.route.js");

app.use(MessageRouter);

const bootstrap = async () => {
  try {
    const PORT = process.env.PORT || 4100;
    const MONGO_URI = process.env.MONGO_URI;

    app.listen(PORT, () =>
      console.log(`App has been started at http://localhost:${PORT}`)
    );
    mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.log(err);
  }
};

bootstrap();
