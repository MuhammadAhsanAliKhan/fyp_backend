const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

require("./src/db/conn");

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
