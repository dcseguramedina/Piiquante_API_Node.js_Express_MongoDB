const Sauce = require('../models/Sauce');
const Like = require('../models/Like');

exports.likeDislikeSauce = (req, res, next) => {
            const likeDislikeObject = JSON.parse(req.body.like);
            delete likeDislikeObject.userId;
            const likeDislike = new Like({
                ...likeDislikeObject,
                userId: req.auth.userId,
            });
            // like = -1,0,1
            if (likeDislike.like != [-1, 0, 1]) {
                return res.status(400).send({ message: "Bad request" });
            }
            
            if (likeDislike.like = -1) {
                Sauce.updateOne({ _id: req.params.id }, 
                    {$addToSet: { usersDisliked: userId }, $inc: { dislikes: +1 }}
                )
                    .then(() => res.status(200).json({ message: 'Dislike !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
            else if (likeDislike.like = 0) {
                Sauce.findOne({ _id: req.params.id })
                    .then((sauce) => {
                        if (sauce.usersLiked.includes(userId)) {
                            Sauce.updateOne({ _id: req.params.id }, 
                                {$pull: { usersLiked: userId }, $inc: { likes: -1 }}
                            )
                                .then(() => res.status(200).json({ message: 'Like canceled !'}))
                                .catch((error) => res.status(400).json({ error }));
                        }
                        if (sauce.usersDisliked.includes(userId)) {
                            Sauce.updateOne({ _id: req.params.id },
                                {$pull: { usersDisliked: req.body.userId }, $inc: { dislikes: -1 }}
                            )
                                .then(() => res.status(200).json({ message: 'Dislike canceled !'})
                                )
                                .catch((error) => res.status(400).json({ error }));
                        }
                    })
                    .catch((error) => res.status(404).json({ error }));
            }
            else if (likeDislike.like = 1) {
                Sauce.updateOne({ _id: req.params.id },
                    {$addToSet: { usersLiked: req.body.userId }, $inc: { likes: +1 }}
                )
                    .then(() => res.status(200).json({ message: 'Like !' }))
                    .catch((error) => res.status(400).json({ error }));
            }
        };