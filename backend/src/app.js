const express = require('express');
const cors = require('cors');
const morgan = require('morgan');


require('dotenv').config();
const app = express();

app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));






module.exports = app;
