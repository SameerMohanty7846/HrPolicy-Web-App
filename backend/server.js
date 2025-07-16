import express from "express";
import cors from "cors";
import router from "./routes/employee.route.js";

const app = express();
const port = 2000;

app.use(express.json());
app.use(cors()); // ✅ Correct call

app.use("/api", router);

app.listen(port, () => {
    console.log("Server started at", port);
});
