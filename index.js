const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000
require('dotenv').config()

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@nahid.tb9vewq.mongodb.net/?appName=Nahid`:

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('Server is running')
})

async function run() {
    try {
        await client.connect();
        const db = client.db('freelance_app_db')
        const jobsCollection = db.collection('allJobs')
        const usersCollection = db.collection('users')


        app.get('/allJobs/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await jobsCollection.findOne(query)
            res.send(result)
        })

        // for latest jobs-----------------------------------------
        app.get('/latestJobs', async (req, res) => {
            const cursor = jobsCollection
                .find()
                .sort({ _id: -1 })
                .limit(6);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/allJobs', async (req, res) => {
            const { email } = req.query;
            const filter = {};

            if (email) {
                filter.userEmail = email;
            }

            const result = await jobsCollection
                .find(filter)
                .sort({ _id: -1 })
                .toArray();

            res.send(result);
        });



        app.post('/allJobs', async (req, res) => {
            const newJob = req.body;
            const result = await jobsCollection.insertOne(newJob);
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const newUser = req.body
            const result = await usersCollection.insertOne(newUser)
            res.send(result)
        })

        app.put('/allJobs/:id', async (req, res) => {
            const id = req.params.id;
            const updatedJob = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: updatedJob
            };
            const result = await jobsCollection.updateOne(filter, updateDoc);
            res.send(result);
        });


        const acceptedCollection = db.collection('acceptedJobs')

        app.get('/acceptedJobs', async (req, res) => {
            const cursor = acceptedCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.post('/acceptedJobs', async (req, res) => {
            const acceptedJob = req.body
            const result = await acceptedCollection.insertOne(acceptedJob)
            res.send(result)
        })

        app.delete('/acceptedJobs/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await acceptedCollection.deleteOne(query)
            res.send(result)
        })


        app.delete('/allJobs/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await jobsCollection.deleteOne(query)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})