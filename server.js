const express = require("express");
const dotEnv = require("dotenv");
const cors = require("cors"); 
const mongoose = require("mongoose");

const authRouter = require("./routes/userRoutes");
const product = require("./routes/productRoutes");
const buyerRouter = require("./routes/buyerRoutes");
const sellerRouter = require("./routes/sellerRoutes");

const app = express();
const PORT = 8087;

dotEnv.config();

app.use(
  cors({
    origin: "http://localhost:3000", 
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE"], 
  })
);


mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("MongoDB is connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });


app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/products", product);
app.use("/api/buyer", buyerRouter);
app.use("/api/seller", sellerRouter);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
