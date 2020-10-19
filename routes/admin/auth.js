const express = require('express');
const usersRepo = require('../../repositories/users');

const router = express.Router();

router.get('/signup', (req, res) => {
    res.send(`
        <div>
            Your ID: ${req.session.userId}
            <form method="POST">
                <input name='email' placeholder='email'></input>
                <input name='password' placeholder='password'></input>
                <input name='passwordConfirmation' placeholder='password confirmation'></input>
                <button>Sign Up</button>
            </form>
        </div>
    `);
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

router.post('/signup', async (req, res) => {
    const { email, password, passwordConfirmation } = req.body;
    const existingUser = await usersRepo.getOneBy({ email });
    
    if (existingUser) {
        res.send('Email in use!');
    }
    
    if (password !== passwordConfirmation) {
        res.send("Passwords don't match!");
    }

    // Create a user
    const user = await usersRepo.create({ email, password });

    // Store id in the cookie
    req.session.userId = user.id;

    res.send("Account created!");
});

router.get('/signin', (req, res) => {
    res.send(`
        <div>
            <form method="POST">
                <input name='email' placeholder='email'></input>
                <input name='password' placeholder='password'></input>
                <button>Sign In</button>
            </form>
        </div>
    `);
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    const user = await usersRepo.getOneBy({ email });
    
    if (!user) {
        return res.send('Email not found!');
    }

    const validPassword = await usersRepo.comparePasswords(user.password, password);

    if (!validPassword) {
        return res.send('Wrong password!');
    }

    // Store id in the cookie
    req.session.userId = user.id;

    res.send("Signed in!");
});

router.get('/signout', (req, res) => {
    req.session = null;
    res.redirect('/signup',);
});

module.exports = router;