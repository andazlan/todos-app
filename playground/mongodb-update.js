const {MongoClient, ObjectID} = require("mongodb");

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB Server');
    }
    console.log("Connect to MongoDB Server");
     
    // filter, operator, return
    /*
    db.collection("Todos").findOneAndUpdate({
        _id : new ObjectID("5ab21d775710814777a5752d")
    }, { 
        $set : { completed : true }
    }, {
        returnOriginal : false
    }).then((result) => {
        console.log(result);
    });
    */

   db.collection("Users").findOneAndUpdate({
        name : "Mike"
    }, { 
        $inc : { age : 1 }
    }, {
        returnOriginal : false
    }).then((result) => {
        console.log(result);
    });
    //db.close();
});