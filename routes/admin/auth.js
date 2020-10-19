const express = require('express');
const { check, validationResult } = require('express-validator');

const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');

const { requireEmail, requirePassword, requirePasswordConfirmation, requireEmailExists, requireValidPasswordForUser } = require('./validators');

const router = express.Router();

router.get('/signup', (req, res) => {
    res.send(signupTemplate({ req }));
});

// WAY OF PARSING MANUALLY

// const bodyParser = (req, res, next) => {
//     if (req.method === 'POST') {
//         req.on('data', data => {
//             const parsed = data.toString('utf8').split('&');
//             const formData = {};
//             for (let pair of parsed) {
//                 const [key, value]  = pair.split('=');
//                 formData[key] = value;
//             }
//             req.body = formData;
//             next();
//         });
//     } else {
//         next();
//     }
// }

// app.post('/', bodyParser, (req, res) => {
//     console.log(req.body);
//     res.send('!');
// });

router.post('/signup',
    [requireEmail, requirePassword, requirePasswordConfirmation],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.send(signupTemplate({ req, errors }));
            return;
        }

        const { email, password, passwordConfirmation } = req.body;

        // Create a user
        const user = await usersRepo.create({ email, password });

        // Store id in the cookie
        req.session.userId = user.id;

        res.send("Account created!");
    }
);

router.get('/signin', (req, res) => {
        res.send(signinTemplate( req ));
    }
);

router.post('/signin',
    [requireEmailExists, requireValidPasswordForUser],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.send(signinTemplate({ req, errors }));
            return;
        }

        const { email } = req.body;
        
        const user = await usersRepo.getOneBy({ email });
        
        // Store id in the cookie
        req.session.userId = user.id;

        res.send("Signed in!");
    }
);

router.get('/signout', (req, res) => {
    req.session = null;
    res.redirect('/signup',);
});

module.exports = router;