const express = require('express');
const router = express.Router();

// mongodb user model
const User = require('../models/User');


//password handler with bcrypt
const bcrypt = require('bcrypt');

//signup
router.post('./register', (req, res) => {
    let {name, email, password, userName} = req.body;
    name = name.trim();
    email = email.trim();
    password = password.trim();
    userName = userName.trim();

    if(name =="" || email == "" || password =="" || userName == ""){
        res.json({
            status: "FAILED",
            message: "Empty input fields!"
        });
    } else if (!/^[a-zA-Z ]*$/.test(name)){
        res.json({
            status: "FAILED",
            message: "Invalid name Entered"
        });
    } else if (!/^[a-zA-Z ]*$/.test(userName)){
        res.json({
            status: "FAILED",
            message: "Invalid userName Entered"
        });
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status: "FAILED",
            message: "Invalid email Entered"
        });
    } else if (password.length < 8){
        res.json({
            status: "FAILED",
            message: "Password is too short!"
        })
    } else {
        //checking if user already exists
        User.find({email}).then(result => {
            if (result.length) {
                //A user already exists
                res.json({
                    status: "FAILED",
                    message: "User with the provided email already exists"
                })
            } else {
                //try to create new user
                

                //password handling
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new User({
                        name, email, password: hashedPassword, userName
                    });

                    newUser.save().then(result => {
                        res.json({
                            status: "SUCCESS",
                            message: "Signup successful",
                            data: result,
                        })
                    })
                    .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occured while saving user account!"
                        })
                    })
                        
                })
                .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occured while hashing password!"
                    })
                })
            }

        }). catch(err => {
            console.log(err);
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existing user!"
            })
        })
    }
})

//signin
router.post('./login', (req, res) => {

    let {email, password} = req.body;
    email = email.trim();
    password = password.trim();

    if(email == "" || password ==""){
        res.json({
            status: "FAILED",
            message: "Empty input fields!"
        });
    } else {
        User.find({email})
        .then (data=> {
            if (data.length){
                //user exists

                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword).then(result => {
                    if (result) {
                        res.json({
                            status: "SUCCESS",
                            message: "Signin successful",
                            data: data
                        })    
                    }
                    else{
                        res.json({
                            status: "FAILED",
                            message: "Invalid password enterd!"
                        })
                    }
                })
                . catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occured while comparing passwords!"
                    })
                })
            }
            else{
                res.json({
                    status: "FAILED",
                    message: "Invalid Credentials!"
                }) 
            }

        })
        . catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existing user!"
            })
        })
    }
    
})

module.exports = router;