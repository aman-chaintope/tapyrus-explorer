const compression = require('compression')
const express = require('express');

const app = express();

app.use(compression());

module.exports = app;
