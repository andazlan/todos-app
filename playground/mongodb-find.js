const {MongoClient, ObjectID} = require("mongodb");

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB Server');
    }
    console.log("Connect to MongoDB Server");

    /*
    db.collection("Todos").find({
        _id : new ObjectID('5ab215005710814777a57381')
    }).toArray().then((docs) => {
        console.log("Todos");
        console.log(JSON.stringify(docs, undefined, 2));
    }, (error) => {
        console.log("Unable to fetch todos", error);
    });
    */

    /*
    db.collection("Todos").find().count().then((count) => {
        console.log("Todos count : " + count);
    }, (error) => {
        console.log("Unable to fetch todos", error);
    });
    */

    db.collection("Users").find({
        name : "Andrew Azlan"
    }).toArray().then((docs) => {
        console.log("Users");
        console.log(JSON.stringify(docs, undefined, 2));
    }, (error) => {
        console.log("Unable to fetch todos", error);
    });
    //db.close();
});