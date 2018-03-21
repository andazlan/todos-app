const {MongoClient, ObjectID} = require("mongodb");

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB Server');
    }
    console.log("Connect to MongoDB Server");
    
    //delete many
    /*
    db.collection("Todos").deleteMany({
        text: "Eat lunch"
    }).then((result) => {
        console.log(result);
    })
    */

    //delete one
    /*
    db.collection("Todos").deleteOne({
        text: "Eat lunch"
    }).then((result) => {
        console.log(result);
    })
    */

    //find one delete
    /*
    db.collection("Todos").findOneAndDelete({completed : false}).then((result) => {
        console.log(result);
    })
    */

    /*
    db.collection("Users").findOneAndDelete({
        _id : new ObjectID("5aafba51dedf38a7a4dddf75")
    }).then((result) => {
        console.log(result);
    });
    

    db.collection("Users").deleteMany({
        name : "Andrew Azlan"
    }).then((result) => {
        console.log(result);
    });
    */
});