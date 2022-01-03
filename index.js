require('dotenv').config();
const connectToMongo = require("./db.js");
connectToMongo();
const express = require('express');
const app = express();
const port = process.env.PORT;
const dotenv = require('dotenv');
const cors = require('cors');


app.use(cors());

dotenv.config({path:'./.env'});

app.use(express.json());

//Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.listen(port, () => {
  console.log(`Notezy-backend listening at http://localhost:${port}`)
})
