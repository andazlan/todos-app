//const MongoClient = require("mongodb").MongoClient;
const {MongoClient, ObjectID} = require("mongodb");
//var obj = new ObjectID();
//console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB Server');
    }
    console.log("Connect to MongoDB Server");

    /*
    db.collection('Todos').insertOne({
        text : "Something to do",
        completed : false
    }, (err, result) => {
        if (err) {
            return console.log("Unable to insert Todo", err);
        }

        console.log(JSON.stringify(result.ops, undefined, 2));
    });

    db.collection('Users').insertOne({
        name : "Andrew Azlan",
        age : 28,
        location : "Surabaya"
    }, (err, result) => {
        if (err) {
            return console.log("Unable to insert Todo", err);
        }
        console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
    });
    */
    db.close();
});