const express = require('express');
const { default: mongoose } = require('mongoose');
const path = require('path');
const app = express();
const port = 4000;

app.use('/static', express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://userHJJ:HJJ@cluster0.nu6j2ch.mongodb.net/?retryWrites=true&w=majority')
.then(() => console.log('mongodb connected'))
.catch(err => console.error(err));

app.listen(port, () => 
{
    console.log(`Listen on ${port}`);
})