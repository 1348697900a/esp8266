import express from "express";
import bodyParser from "body-parser";
import dayjs from "dayjs";
import connectMongoDB from "./utils/connectDB.js";
import manageServerRouter from "./router/manage-server.js";
import esp8266Router from './router/esp8266.js'
const app = express();

const client = await connectMongoDB("mongodb://localhost:27017");
export const db = client.db("fingerManageData");

// 服务端没做统一容错处理
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/esp8266",esp8266Router)
app.use("/manageServer", manageServerRouter);
app.listen(8080, function () {
  console.log("server start!");
  console.log(dayjs(new Date().getTime()).format('YYYY-MM-DD'));
});
