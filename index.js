const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Toys Market is Open');
});

app.listen(port, () => {
    console.log(`The Toys Market is running on port: ${port}`);
});
