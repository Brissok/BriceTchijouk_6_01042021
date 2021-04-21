const Sauce = require('../models/Sauce');
const fs = require('fs');
const User = require('../models/User');

exports.createSauce = (req, res, next) => {
  console.log(req.body);
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  console.log(sauce);
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
      .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
            Sauce.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
                .catch(error => res.status(400).json({ error }));
        });
      })
      .catch(error => res.status(500).json({ error }));
};

exports.postLike = (req, res, next) => {
  const userId = req.body.userId;
  const like = req.body.like;
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (like === 1) {
        sauce.usersLiked.push(userId);
        sauce.likes = sauce.usersLiked.length;
        sauce.save()
          .then(() => res.status(201).json({ message: 'Like ajouté !'}))
          .catch(error => res.status(400).json({ error }));
      } else if (like === -1) {
        sauce.usersDisliked.push(userId);
        sauce.dislikes = sauce.usersDisliked.length;
        sauce.save()
          .then(() => res.status(201).json({ message: 'Dislike ajouté !'}))
          .catch(error => res.status(400).json({ error }));
      } else if (like === 0) {
        for(let i = 0; i < sauce.usersLiked.length; i++) {
          if(sauce.usersLiked[i] === userId) {
            sauce.usersLiked.splice(i, 1);
            i--;
          }
        }
        for(let i = 0; i < sauce.usersDisliked.length; i++) {
          if(sauce.usersDisliked[i] === userId) {
            sauce.usersDisliked.splice(i, 1);
            i--;
          }
        }
        sauce.likes = sauce.usersLiked.length;
        sauce.dislikes = sauce.usersDisliked.length;
        sauce.save()
          .then(() => res.status(201).json({ message: 'Dislike ajouté !'}))
          .catch(error => res.status(400).json({ error }));
      }
    })
    .catch(error => res.status(404).json({ error }));
};