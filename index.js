const express = require('express');
const bodyParser = require('body-parser');
const usersRepo = require('./repositories/users');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(`
        <form method="POST">
            <input name='email' placeholder='email'></input>
            <input name='password' placeholder='password'></input>
            <input name='passwordConfirmation' placeholder='password confirmation'></input>
            <button>Sign Up</button>
        </form>
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

app.post('/', async (req, res) => {
    const { email, password, passwordConfirmation } = req.body;
    const existingUser = await usersRepo.getOneBy({ email });
    
    if (existingUser) {
        res.send('Email in use!');
    }
    
    if (password !== passwordConfirmation) {
        res.send("Passwords don't match!");
    }

    res.send("Account created!");
});

app.listen(3000, () => {
    console.log('Running!');
})