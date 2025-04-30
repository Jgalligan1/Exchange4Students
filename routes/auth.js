// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

// Register route
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;

    if (!email.endsWith('@stevens.edu')) {
        return res.redirect('/CreateAccount.html?error=invalid');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        await db.promise().query(
            'INSERT INTO users (email, password, name, verified) VALUES (?, ?, ?, ?)',
            [ email, hashedPassword, name, true ]
        );

        // ✅ Redirect to login with success message
        res.redirect('/LoginScreen.html?success=created');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.redirect('/CreateAccount.html?error=duplicate');
        }
        console.error('REGISTER ERROR:', err);
        res.status(500).send('Error creating account.');
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.promise().query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.redirect('/LoginScreen.html?error=nouser');
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.redirect('/LoginScreen.html?error=wrongpassword');
        }

        if (!user.verified) {
            return res.redirect('/LoginScreen.html?error=unverified');
        }

        // ✅ Send email & ID to front-end (for localStorage)
        res.redirect(`/MainDashboard.html?email=${email}&id=${user.id}`);
    } catch (err) {
        console.error('LOGIN ERROR:', err);
        res.status(500).send('Login error');
    }
});


module.exports = router;
