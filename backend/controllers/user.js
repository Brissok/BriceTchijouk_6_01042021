const User = require('../models/User');
const cryptoJS = require('crypto-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    var emailRegex = /[A-Za-z0-9](([_\.\-]?[a-zA-Z0-9]+)*)@([A-Za-z0-9]+)(([_\.\-]?[a-zA-Z0-9]+)*)\.([A-Za-z]{2,})/;
    var pwdRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
    if(req.body.email.match(emailRegex)) {
        if(req.body.password.match(pwdRegex)) {
            var cryptedEmail = cryptoJS.AES.encrypt(req.body.email, 'secret key 123').toString();
            var bytes  = cryptoJS.AES.decrypt(cryptedEmail, 'secret key 123');
            var originalText = bytes.toString(cryptoJS.enc.Utf8);
            console.log(originalText);
            bcrypt.hash(req.body.password, 10)
            .then(hash => {
                const user = new User({
                    email: cryptedEmail,
                    password: hash
                });
                user.save()
                    .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(500).json({ error }));
        } else {
            res.status(404).json({ message: 'Le mot de passe doit contenir entre 8 et 15 caractères avec au moins un chiffre, une majuscule, une minuscule et un caractère spécial !' });
        }
    }
    else {
        res.status(404).json({ message: "L'email est invalide !" });
    }
    

};

exports.login = async (req, res, next) => {
    const users = await User.find();
    const user = users.reduce((acc, user) => {
        const bytes = cryptoJS.AES.decrypt(user.email, 'secret key 123');
        const emailDecrypted = bytes.toString(cryptoJS.enc.Utf8);
        if(emailDecrypted === req.body.email) {
            acc = user;
        }
        return acc;
    }, null);

    if(user) {
        bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
    } else {
        return res.status(401).json({ message: 'Utilisateur non trouvé !' });
    }
}