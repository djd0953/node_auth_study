require('dotenv').config();
const express = require('express');

const app = express();
const port = 4000;

const jwtRouter = require('jwt.Router.js');

app.use(express.json());
app.use(cookieParser());
app.use('/jwt', jwtRouter);

app.listen(port, () => 
{
    console.log(`listening on port ${port}`);
})