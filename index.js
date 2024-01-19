const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware setup
app.use(cors());
app.use(express.json());

// MongoDB Config

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fyh6bpe.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }
});
async function run() {
    try {
        await client.connect();

        const toysCollection = client.db('toysMarket').collection('toys');
        const categoriesCollection = client.db('toysMarket').collection('categories');

        // app.get('/toys', async (req, res) => {
        //     const { page, limit } = req.query;
        //     const pageNumber = parseInt(page) || 1;
        //     const itemsPerPage = parseInt(limit) || 20;
        //     const skip = (pageNumber - 1) * itemsPerPage;
        //     const result = await toysCollection.find().skip(skip).limit(itemsPerPage).toArray();
        //     res.send(result);
        // });

        app.post('/toys', async (req, res) => {
            const newToys = req.body;
            const result = await toysCollection.insertOne(newToys);
            res.send(result);
        });

        // Search
        app.get('/search', async (req, res) => {
            const searchTerm = req.query.searchTerm;
            const page = parseInt(req.query.page) || 1;
            const pageSize = 20;

            const result = await toysCollection
                .find({
                    $or: [
                        { name: { $regex: searchTerm, $options: 'i' } },
                        { category: { $regex: searchTerm, $options: 'i' } }
                    ]
                })
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .toArray();

            const totalResults = await toysCollection.countDocuments({
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { category: { $regex: searchTerm, $options: 'i' } }
                ]
            });

            res.send({
                result,
                totalResults,
                currentPage: page,
                totalPages: Math.ceil(totalResults / pageSize)
            });
        });

        app.get('/categories', async (req, res) => {
            const result = await categoriesCollection.find().toArray();
            res.send(result);
        });

        app.get('/categories/:id', async (req, res) => {
            const id = req.params.id;
            const query = { categoryID: parseInt(id) };
            const result = await toysCollection.find(query).toArray();
            res.send(result);
        });

        await client.db('admin').command({ ping: 1 });
        console.log('Pinged your deployment. You successfully connected to MongoDB!');
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Toys Market is Open');
});

app.listen(port, () => {
    console.log(`The Toys Market is running on port: ${port}`);
});
