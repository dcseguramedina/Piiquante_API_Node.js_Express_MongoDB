//Import the bcrypt encryption package for the signup function
const bcrypt = require('bcrypt');
//Import the JSON web tokens package for the authorization
const jwt = require('jsonwebtoken');

//Import the "User" model
const User = require('../models/User');

//Create a user and save it in the database
//Call the hash function of bcrypt in the password and ask it to "salt" the password 10 times
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)        
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

//Verify that the email entered by the user matches an existing user in the database
exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
            }
            //Use the compare function of bcrypt to compare the password entered by the user with the hash saved in the database
            else {
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if (!valid) {
                            return res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
                        }
                        //If matched, return a response containing the user ID and a token
                        //Use the sign function of jsonwebtoken to encrypt the token
                        res.status(200).json({
                            userId: user._id,
                            token: jwt.sign(
                                { userId: user._id },
                                process.env.AUTH_TOKEN,
                                { expiresIn: '24h' }
                            )
                        });
                    })
                    .catch(error => res.status(500).json({ error }));
            }
        })
        .catch(error => res.status(500).json({ error }));
};