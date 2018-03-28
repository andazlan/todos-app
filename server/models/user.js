const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
//store schema for user

var UserSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        trim : true,
        minlength : 1,
        unique : true,
        validate : {
            validator : (value) => {
                return validator.isEmail(value);
            },
            message : '{VALUE} is not a valid email'
        }
    },
    password : {
        type : String,
        require : true,
        minlength : 6,
    },
    tokens : [{
        access : {
            type : String,
            required : true
        },
        token : {
            type : String,
            required : true
        }
    }]
});

UserSchema.methods.toJSON = function () { 
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id', 'email']);
}

//jangan pakai arrow function
UserSchema.methods.generateAuthToken = function() {
    var user = this
    var access = 'auth';
    var token = jwt.sign({_id : user._id.toHexString(), access}, 'abc123').toString();

    user.tokens = user.tokens.concat([{access, token}]);
    return user.save().then(() => {
        return token;
    });
};

UserSchema.methods.removeToken = function (sentToken) {  
    var user = this;
    return user.update({
        $pull : {
            tokens : {
                token : sentToken
            }
        }
    });
};

UserSchema.statics.findByToken = function (token) {  
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, 'abc123');
    }
    catch(error) {
        return new Promise((resolve, reject) => {
            reject();
        });
    }

    return User.findOne({
        '_id' : decoded._id,
        'tokens.token' : token,
        'tokens.access' : 'auth'
    });
};

UserSchema.statics.findByCredentials = function (email, password) {  
    var User = this;
    return User.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            var hashedPassword = user.password;
            bcrypt.compare(password, hashedPassword, (error, result) => {
                if (result) {
                    resolve(user);
                }
                else{
                    reject();
                }
            });
        });
    });
};

//TODO: fungsi ini dijalankan sebelum dokumen di save, seperti onBeforeWrite, dimana 
//password yang belum dienkrip, akan dienkrip sebelum disimpan 
UserSchema.pre('save', function (next) {  
    var user = this;
    if (user.isModified('password')) {
        var password = user.password;
        bcrypt.genSalt(10, (error, salt) => {
            bcrypt.hash(password, salt, (error, hash) => {
                user.password = hash;
                next();
            });
        });
    }
    else {
        next();
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = {
    User
}