const express = require("express")
const app = express()
require("dotenv").config()
const { connectDB } = require("./db.js");

// body.parse(body)
app.use(express.json());
const PORT = process.env.PORT || 3000;
connectDB();

//import the router files
const userRoutes = require("./routes/userRoutes.js");
const candidateRoutes = require("./routes/candidateRoutes.js");

//use the routes
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

app.listen(PORT, ()=> {
    console.log(`listening on port ${PORT}`);
})