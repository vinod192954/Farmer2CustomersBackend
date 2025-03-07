const express = require("express");
const dotEnv = require("dotenv");
const { MongoClient } = require("mongodb");
const app = express();
const authRouter = require("./routes/userRoutes");
const product = require("./routes/productRoutes");
const buyerRouter = require("./routes/buyerRoutes");
const sellerRouter = require("./routes/sellerRoutes");
const { default: mongoose } = require("mongoose");
const PORT = 8087;
dotEnv.config();
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("MonogoDB is connected successfully");
  })
  .catch((err) => {
    console.log(err);
  });
//console.log(process.env);
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/products", product);
app.use("/api/buyer", buyerRouter);
app.use("/api/seller", sellerRouter);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
