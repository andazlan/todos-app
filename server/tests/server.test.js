const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Text todo text';
        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({
                text
            })
            .expect(200)
            .expect((response) => {
                expect(response.body.text).toBe(text)
            })
            .end((error, result) => {
                if (error) {
                    return done(error);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((error) => done(error));
            });
    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((error, result) => {
                if (error) {
                    return done(error);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((error) => done(error));
            });
    })
});

describe('Get /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((response) => {
                expect(response.body.todos.length).toBe(1);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((response) => {
                expect(response.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should not return todo doc by other user', (done) => {
        request(app)
            .get(`/todos/${todos[1]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('it should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${hexId}}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('it should return for non-object ids', (done) => {
        request(app)
            .get('/todos/123abc')
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
});

describe('Delete /todos/:id', () => {
    it('should remove a todo', (done) => {
        var hexId = todos[1]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(200)
            .expect((response) => {
                expect(response.body.todo._id).toBe(hexId);
            })
            .end((error, response) => {
                if (error) {
                    return done(error);
                }

                Todo.findById(hexId).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch((error) => done(error));
            });
    });

    it('should not remove a todo by other user', (done) => {
        var hexId = todos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end((error, response) => {
                if (error) {
                    return done(error);
                }

                Todo.findById(hexId).then((todo) => {
                    expect(todo).toExist();
                    done();
                }).catch((error) => done(error));
            });
    });
    
    it('should return 404 if todo not found', (done) => {
        var hexId = new ObjectID().toHexString();
        request(app)
            .delete(`/todos/${hexId}}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 if object id not valid', (done) => {
        request(app)
            .delete('/todos/123abc')
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        var hexId = todos[0]._id.toHexString();
        var text = "this should be the new text";
        //TODO : auth as first user
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({
                text,
                completed : true
            })
            .expect(200)
            .expect((response) => {
                expect(response.body.todo.text).toEqual(text);
                expect(response.body.todo.completed).toBe(true);
                expect(response.body.todo.completedAt).toBeA('number')
            })
            .end(done);
    });

    //TODO: duplicate above test 
    //Try to update first todo as second user
    //assert 404 response
    it('should not update the todo by other user', (done) => {
        var hexId = todos[0]._id.toHexString();
        var text = "this should be the new text";
        //TODO : auth as first user
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({
                text,
                completed : true
            })
            .expect(404)
            .end(done);
    });

    it('should clear completedAt when todo is not completed', (done) => {
        var hexId = todos[1]._id.toHexString();
        var text = "this should be the new text!!";

        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({
                text,
                completed : false
            })
            .expect(200)
            .expect((response) => {
                expect(response.body.todo.text).toEqual(text);
                expect(response.body.todo.completed).toBe(false);
                expect(response.body.todo.completedAt).toNotExist();
            })
            .end(done);
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', "aasdasdadadasd")
            .expect(401)
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create user', (done) => {
       var email = 'example@example.com';
       var password = 'abc123';
       request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((response) => {
                expect(response.headers['x-auth']).toExist();
                expect(response.body.email).toBe(email);
            }).end((error) => {
                if (error) {
                    return done(error);
                }

                User.findOne({email}).then((user) => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                }).catch((error) => {
                    done(error);
                });
            });
    });

    it('should return validation errors if request invalid', (done) => {
        var email = 'example';
        var password = 'abc123';

        request(app).post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        //var email = 'azlan@example.com';
        //var password = 'abc123';

        request(app).post('/users')
        //    .send({email, password})
            .send({
                email : users[0].email,
                password : "password123"
            })
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app).post('/users/login')
            .send({
                email : users[1].email,
                password : users[1].password
            })
            .expect(200)
            .expect((response) => {
                expect(response.headers['x-auth']).toExist();
            })
            //.end(done);
            //FIXME: the test should be like this but i don't know it doesn't work
            
            .end((error, response) => {
                if (error) {
                    return done(error);
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens[1]).toInclude({
                        access : 'auth',
                        token : response.headers['x-auth']
                    });
                    done();
                }).catch((error) => {
                    done(error)
                });
            });
    });

    it('should reject invalid login', (done) => {
        request(app).post('/users/login')
            .send({
                email : users[1].email + "asdasd",
                password : users[1].password + "sadasd"
            })
            .expect(400)
            .expect((response) => {
                expect(response.headers['x-auth']).toNotExist();
            })
            .end((error, response) => {
                if (error) {
                    return done(error);
                }

                User.findById(users[1]._id).then((user) => {
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch((error) => {
                    done(error);
                });
            });
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((error, response) => {
                if (error) {
                    return done(error);
                }

                User.findById(users[0]._id).then((user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch((error) => {
                    done(error);
                });
            });
    });
});