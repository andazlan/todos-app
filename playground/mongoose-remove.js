const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

/*
Todo.remove({}).then((result) => {
    return console.log(result);
});
*/

//Todo.findOneAndRemove()
//Todo.findOneByIdAndRemove()

Todo.findOneAndRemove({_id : `5ab480d79b655b5dc1301e9e`}).then((todo) => {
    console.log(todo);
});

Todo.findByIdAndRemove(`5ab480d79b655b5dc1301e9e`).then((todo) => {
    console.log(todo);
});