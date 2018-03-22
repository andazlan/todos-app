const {ObjectID} = require('mongodb');
const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

var id = '5ab3aa9116a3eb1bf09795ce';

if (!ObjectID.isValid(id)) {
    return console.log('ID not found');
}

/*
Todo.find({
    _id : id
}).then((todos) => {
    console.log('Todos', todos);
});

Todo.findOne({
    _id : id
}).then((todo) => {
    console.log('\nTodo One', todo);
});
*/

Todo.findById(id).then((todo) => {
    if (!todo) {
        return console.log('Id not found');
    }
    console.log('\nTodos By ID', todo);
}).catch((error) => console.log(error));

var userId = 'ab3714671dd9000ec570dbe';
if (!ObjectID.isValid(userId)){
    return console.log('User ID Not found');
}
User.findById(userId).then((user) => {
    if (!user) {
        return console.log('User not found');
    }
    console.log('\nUser ', user);
});