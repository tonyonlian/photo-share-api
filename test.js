const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb://tunyl:1q2w3e@cluster0-shard-00-00-4n2ii.mongodb.net:27017,cluster0-shard-00-01-4n2ii.mongodb.net:27017,cluster0-shard-00-02-4n2ii.mongodb.net:27017/test?ssl=true&replicaSet=GettingStarted-shared-0&authSource=admin&retryWrites=truemongodb+srv://tunyl:1q2w3e@cluster0-4n2ii.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useUnifiedTopology: true });
client.connect(err => {
    console.log(err);
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

