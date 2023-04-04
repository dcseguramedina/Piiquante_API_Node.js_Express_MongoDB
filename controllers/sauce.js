//Import the "User" model
const Sauce = require('../models/Sauce');

//Import the fs package to be able interact with the server's file system (delete a file)
const fs = require('fs');

/**
 *
 * Expects request (createSauce) to contain:
 * {
 *   userId: string, 
 *   name: string, 
 *   manufacturer: string, 
 *   description: string,
 *   mainPepper: string, 
 *   imageUrl: string, 
 *   heat: number, 
 * }
 * 
 */

//Create an instance of the sauce model
//Pre-deleted the id and the userId sent in the request and replace the userId by the authenticated one
//Use req.protocol and req.get('host'), connected by '://' and req.file.filename to reconstruct theurl of the saved file image
//Add the like/dislike valuest to the new sauce object
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersdisLiked: [],
    });
    //Use the save() method to register the sauce in the database
    sauce.save()
        .then(() => { res.status(201).json({ message: 'Sauce enregistrée !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

//Use the updateOne() method to update the sauce that corresponds to the object passed as the first argument
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: 'Requête non-autorisée' });
            } 
            //Use the unlink function of the fs package to delete a file image from the file system
            else {
                if(sauceObject.imageUrl) {
                    const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => {
                        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                            .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
                            .catch(error => res.status(401).json({ error }));
                    });
                }
                //Use the id parameter passed in the request, and replace it with the passed sauce as the second argument
                else {
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
                    .catch(error => res.status(401).json({ error }));
                }                           
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

//Use the deleteOne() method to remove a single sauce from the database
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé' });
            } 
            //Use the unlink function of the fs package to delete a file image from the file system
            else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Sauce supprimée !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

//Use the find() method to return an array containing all the sauces in the database
exports.getSauceById = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

//Use the findOne() method to find the single sauce with the same _id as the query parameter
exports.getSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

/**
 *
 * Expects request (likeDislikeSauce) to contain:
 * {
 *   like: number,
 *   userId: String,
 * }
 * 
 */

//Use the findOne() and updateOne methods to manage the like/dislike function
exports.likeDislikeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            //If userId is not included in usersLiked (array) and like = 1 (likes = +1)
            if (!sauce.usersLiked.includes(req.auth.userId) && req.body.like === 1) {
                Sauce.updateOne({ _id: req.params.id },
                    { $push: { usersLiked: req.auth.userId }, $inc: { likes: +1 } }
                )
                    .then(() => res.status(201).json({ message: 'Like !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
            //If userId is included in usersLiked (array) and like = 0 (likes = 0)
            else if (sauce.usersLiked.includes(req.auth.userId) && req.body.like === 0) {
                Sauce.updateOne({ _id: req.params.id },
                    { $pull: { usersLiked: req.auth.userId }, $inc: { likes: -1 } }
                )
                    .then(() => res.status(201).json({ message: 'Unlike !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
            //If userId is not included in usersDisliked (array) and like = -1 (dislikes = +1)
            else if (!sauce.usersDisliked.includes(req.auth.userId) && req.body.like === -1) {
                Sauce.updateOne({ _id: req.params.id },
                    { $push: { usersDisliked: req.auth.userId }, $inc: { dislikes: +1 } }
                )
                    .then(() => res.status(201).json({ message: 'Dislike !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
            //If userId is not included in usersDisliked (array) and like = -1 (dislikes = +1)
            else if (sauce.usersDisliked.includes(req.auth.userId) && req.body.like === 0) {
                Sauce.updateOne({ _id: req.params.id },
                    { $pull: { usersDisliked: req.auth.userId }, $inc: { dislikes: -1 } }
                )
                    .then(() => res.status(201).json({ message: 'Undislike !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
        })
        .catch((error) => res.status(404).json({ error }));
};