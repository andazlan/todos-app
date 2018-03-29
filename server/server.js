require('./config/config');

const _ = require('lodash');
const {ObjectID} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (request, response) => {
    var todo = new Todo({
        text : request.body.text,
        _creator : request.user._id
    });

    todo.save().then((doc) => {
        response.send(doc);
    }, (error) => {
        response.status(400).send(error);
    });
});

app.get('/todos', authenticate, (request, response) => {
    Todo.find({
        _creator : request.user._id
    }).then((todos) => {
        response.send({
            todos
        })
    }, (error) => {
        response.status(400).send(error);
    });
});

app.get('/todos/:id', authenticate, (request, response) => {
    var id = request.params.id;
    if (!ObjectID.isValid(id)){
        return response.status(404).send();
    }

    //Todo.findById(id).then((todo) => { // old version
    Todo.findOne({
        _id : id,
        _creator : request.user._id
    }).then((todo) => {
        if (!todo) {
            return response.status(404).send({});
        }

        response.send({
            todo
        });
    }).catch((error) => {
        response.status(200).send();
    });
});

app.delete(`/todos/:id`, authenticate, (request, response) => {
    var id = request.params.id;
    if (!ObjectID.isValid(id)){
        return response.status(404).send();
    }

    Todo.findOneAndRemove({
        _id : id,
        _creator : request.user._id
    }).then((todo) => {
        if (!todo) {
            return response.status(404).send();
        }
        response.status(200).send({todo});
    }).catch((error) => {
        response.status(400).send();
    });  
});

app.patch('/todos/:id', authenticate, (request, response) => {
    var id = request.params.id;
    var body = _.pick(request.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)){
        return response.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    }
    else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({
        _id : id,
        _creator : request.user._id
    }, {$set : body}, {new : true}).then((todo) => {
        if (!todo) {
            return response.status(404).send();
        }
        response.status(200).send({todo});
    }).catch((error) => {
        response.status(404).send();
    });
});

app.post('/users', (request, response) => {
    var body = _.pick(request.body, ['email', 'password']);
    var newUser = new User(body);

    newUser.save().then(() => {
        return newUser.generateAuthToken();
    }).then((token) => {
        response.header('x-auth', token).send(newUser);
    }).catch((error) => {
        response.status(400).send(error);
    });
});

app.get('/users/me', authenticate, (request, response) => {
    response.send(request.user);
});

app.post('/users/login', (request, response) => {
    var body = _.pick(request.body, ['email', 'password']);
    User.findByCredentials(body.email, body.password).then((user) => {
        //response.send(user);
        return user.generateAuthToken().then((token) => {
            response.header('x-auth', token).send(user);
        });
    }).catch((error) => {
        response.status(400).send();
    });
});

app.delete('/users/me/token', authenticate, (request, response) => {
    request.user.removeToken(request.token).then(() => {
        response.status(200).send();
    }, () => {
        response.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {
    app
}