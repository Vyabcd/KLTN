import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";
import authRouter from "../server/routes/authRoute.js";
import userRouter from "../server/routes/userRoute.js";
import categoryRouter from "../server/routes/categoryRoute.js";
import productRouter from "../server/routes/productRoute.js";
import blogRouter from "../server/routes/blogRoute.js";
import couponRouter from "../server/routes/couponRoute.js";
import orderRouter from "../server/routes/orderRoute.js";
import brandRouter from "../server/routes/brandRoute.js";
import cartRoute from "../server/routes/cartRoute.js";
import reviewRoute from "../server/routes/reviewRoute.js";
import promotionRoute from "../server/routes/promotionRoute.js";
import chatRoute from "../server/routes/chatRoute.js";

// public
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from "path";
import { ConnectSocket } from "./config/socket/socket.js";
import { createServer } from "http";
import bodyParser from "body-parser";
dotenv.config();

const app = express();
const server = createServer(app);

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.json());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "https: data:"],
      "connect-src": [
        "'self'",
        "https://www.paypal.com",
        "https://www.sandbox.paypal.com",
        "https://recommendsys1-production-ba91.up.railway.app",
        "https://dev-online-gateway.ghn.vn",
      ],
      "script-src": [
        "'self'",
        "https://www.paypal.com",
        "https://cdn.tiny.cloud",
      ],
      "frame-src": ["'self'", "https://www.sandbox.paypal.com"],
    },
  })
);

ConnectSocket(server);

app.use(cors());

app.use(express.static(path.resolve(__dirname, "../admin/dist")));

// app.use(express.static(path.resolve(__dirname, "../client/dist")));

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/category", categoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/order", orderRouter);
app.use("/api/cart", cartRoute);
app.use("/api/review", reviewRoute);
app.use("/api/promotion", promotionRoute);
app.use("/api/chat", chatRoute);

app.get("/*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../admin/dist", "index.html"));
});

// app.get("/*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "../client/dist", "index.html"));
// });

// Not Found Middleware
app.use("*", (req, res) => {
  res.status(404).json({ msg: "Not Found!!!" });
});

// Error Middleware
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 3001;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    server.listen(PORT, () => console.log(`Listen on port ${PORT}`));
  })
  .catch((error) => console.log(error));
