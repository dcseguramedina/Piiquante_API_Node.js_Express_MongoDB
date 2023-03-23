const Sauce = require('../models/Sauce');
//const Vote = require('../models/Vote');
const fs = require('fs');

/**
 *
 * Expects request to contain:
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
    sauce.save()
        .then(() => { res.status(201).json({ message: 'Sauce enregistrée !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

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
            } else {
                if(sauceObject.imageUrl) {
                    const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => {
                        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                            .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
                            .catch(error => res.status(401).json({ error }));
                    });
                }
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

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non-autorisé' });
            } else {
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

exports.getSauceById = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.getSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

/**
 *
 * Expects request to contain:
 * {
 *   like: number,
 *   userId: String,
 * }
 * 
 */

exports.likeDislikeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            //If userId is not included in usersLiked (array) and like = 1 (likes = +1)
            if (!sauce.usersLiked.includes(req.auth.userId) && req.body.like === 1) {
                //Update object in MDB
                Sauce.updateOne({ _id: req.params.id },
                    { $push: { usersLiked: req.auth.userId }, $inc: { likes: +1 } }
                )
                    .then(() => res.status(201).json({ message: 'Like !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
            //If userId is included in usersLiked (array) and like = 0 (likes = 0)
            else if (sauce.usersLiked.includes(req.auth.userId) && req.body.like === 0) {
                //Update object in MDB
                Sauce.updateOne({ _id: req.params.id },
                    { $pull: { usersLiked: req.auth.userId }, $inc: { likes: -1 } }
                )
                    .then(() => res.status(201).json({ message: 'Unlike !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
            //If userId is not included in usersDisliked (array) and like = -1 (dislikes = +1)
            else if (!sauce.usersDisliked.includes(req.auth.userId) && req.body.like === -1) {
                //Update object in MDB
                Sauce.updateOne({ _id: req.params.id },
                    { $push: { usersDisliked: req.auth.userId }, $inc: { dislikes: +1 } }
                )
                    .then(() => res.status(201).json({ message: 'Dislike !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
            //If userId is not included in usersDisliked (array) and like = -1 (dislikes = +1)
            else if (sauce.usersDisliked.includes(req.auth.userId) && req.body.like === 0) {
                //Update object in MDB
                Sauce.updateOne({ _id: req.params.id },
                    { $pull: { usersDisliked: req.auth.userId }, $inc: { dislikes: -1 } }
                )
                    .then(() => res.status(201).json({ message: 'Undislike !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
        })
        .catch((error) => res.status(404).json({ error }));
}

/* console.log(req.body);
    const voteObject = JSON.parse(req.body);
    console.log(voteObject);
    delete voteObject.userId;
    const vote = new Vote({
        ...voteObject,
        userId: req.auth.userId,
    });
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            //If userId is not included in usersLiked (array) and like = 1 (likes = +1)
            if (!sauce.usersLiked.includes(vote.userId) && vote.like === 1) {
                //Update object in MDB
                Sauce.updateOne({ _id: req.params.id },
                    { $push: { usersLiked: vote.userId }, $inc: { likes: +1 } }
                )
                    .then(() => res.status(201).json({ message: 'Like !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
            //If userId is included in usersLiked (array) and like = 0 (likes = 0)
            else if (sauce.usersLiked.includes(vote.userId) && vote.like === 0) {
                //Update object in MDB
                Sauce.updateOne({ _id: req.params.id },
                    { $pull: { usersLiked: vote.userId }, $inc: { likes: -1 } }
                )
                    .then(() => res.status(201).json({ message: 'Unlike !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
            //If userId is not included in usersDisliked (array) and like = -1 (dislikes = +1)
            else if (!sauce.usersDisliked.includes(vote.userId) && vote.like === -1) {
                //Update object in MDB
                Sauce.updateOne({ _id: req.params.id },
                    { $push: { usersDisliked: vote.userId }, $inc: { dislikes: +1 } }
                )
                    .then(() => res.status(201).json({ message: 'Dislike !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
            //If userId is not included in usersDisliked (array) and like = -1 (dislikes = +1)
            else if (sauce.usersDisliked.includes(vote.userId) && vote.like === 0) {
                //Update object in MDB
                Sauce.updateOne({ _id: req.params.id },
                    { $pull: { usersDisliked: vote.userId }, $inc: { dislikes: -1 } }
                )
                    .then(() => res.status(201).json({ message: 'Undislike !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
        })
        .catch((error) => res.status(404).json({ error })); */