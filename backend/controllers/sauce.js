const Sauce = require('../models/Sauce');

exports.createSauce = (req, res, next) => {
  const sauce = new Sauce({
    ...req.body
  });
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
  Sauce.find()
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  Sauce.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
      .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.deleteOne({ _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
      .catch(error => res.status(400).json({ error }));
};

exports.postLike = (req, res, next) => {
  //POST like
};