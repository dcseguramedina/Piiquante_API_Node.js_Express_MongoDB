// Import User model
const Sauce = require('../models/Sauce');

// Import fs package to be able to interact with server's filesystem (delete a file)
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

// Create an instance of the sauce model
// Delete id and userId sent in the request and replace userId by the authenticated one
// Use req.protocol and req.get('host'), connected by '://' and req.file.filename to reconstruct the url of the saved file image
// Add like/dislike values to a new sauce object
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
    // Use save() method to register sauces in the database
    sauce.save()
        .then(() => { res.status(201).json({ message: 'Sauce enregistrée !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

// Use updateOne() method to update sauces that correspond to the object passed as the first argument
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: 'Non-autorisé' });
            } 
            // Use the unlink function of fs package to delete an image file from the filesystem
            else {
                if(sauceObject.imageUrl) {
                    const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => {
                        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                            .then(() => res.status(201).json({ message: 'Sauce modifiée!' }))
                            .catch(error => res.status(400).json({ error }));
                    });
                }
                // Use id parameter passed in the request, and replace it with a sauce as the second argument
                else {
                    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(201).json({ message: 'Sauce modifiée!' }))
                    .catch(error => res.status(400).json({ error }));
                }                           
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

// Use deleteOne() method to remove a single sauce from the database
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(403).json({ message: 'Non-autorisé' });
            } 
            // Use the unlink function of fs package to delete an image file from the filesystem
            else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Sauce supprimée !' }) })
                        .catch(error => res.status(400).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

// Use find() method to return an array containing all sauces in the database
exports.getSauceById = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

// Use findOne() method to find a single sauce with the same _id as the query parameter
exports.getSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

/**
 *
 * Expects request (likeDislikeSauce) to contains:
 * {
 *   like: number,
 *   userId: String,
 * }
 * 
 */

// Use findOne() and updateOne methods to manage the like/dislike function
exports.likeDislikeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            // If userId is not included in usersLiked (array) and like = 1 (likes = +1)
            if (!sauce.usersLiked.includes(req.auth.userId) && req.body.like === 1) {
                Sauce.updateOne({ _id: req.params.id },
                    { $push: { usersLiked: req.auth.userId }, $inc: { likes: +1 } }
                )
                    .then(() => res.status(201).json({ message: 'Like !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
            // If userId is included in usersLiked (array) and like = 0 (likes = 0)
            else if (sauce.usersLiked.includes(req.auth.userId) && req.body.like === 0) {
                Sauce.updateOne({ _id: req.params.id },
                    { $pull: { usersLiked: req.auth.userId }, $inc: { likes: -1 } }
                )
                    .then(() => res.status(201).json({ message: 'Unlike !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
            // If userId is not included in usersDisliked (array) and like = -1 (dislikes = +1)
            else if (!sauce.usersDisliked.includes(req.auth.userId) && req.body.like === -1) {
                Sauce.updateOne({ _id: req.params.id },
                    { $push: { usersDisliked: req.auth.userId }, $inc: { dislikes: +1 } }
                )
                    .then(() => res.status(201).json({ message: 'Dislike !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
            // If userId is included in usersDisliked (array) and like = -1 (dislikes = +1)
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