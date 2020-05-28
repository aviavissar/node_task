const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth')
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeMail,sendGoodbyeMail } = require('../emails/account')

const router = new express.Router();

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save()
        sendWelcomeMail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken()
        res.send({ user, token });
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save();
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

const upload = multer({
    //dest: 'avatar',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('file must be jpg or png.'));
        }
        cb(undefined, true)//file its ok
    }
})

router.post('/users/me/avatar', auth, upload.single('upload'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer;
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})


router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error('no user or img')
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


router.patch('/users/me', auth, async (req, res) => {
    const valid = ['name', 'age', 'email', 'password']
    const update = Object.keys(req.body);
    const isValid = update.every((key) => valid.includes(key));
    if (!isValid) {
        res.status(404).send({ error: 'invalid update' })
    }
    try {
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        // const user = await User.findById(req.params.id);
        update.forEach((key) => {
            req.user[key] = req.body[key]
        })
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const deleted = await User.findByIdAndDelete(req.user._id);
        // if (!deleted) {
        //     return res.status(404).send({ error: 'invalid id' })
        // }
        sendGoodbyeMail(req.user.email, req.user.name);
        await req.user.remove()
        res.send(req.user)
    } catch (error) {
        res.status(400).send()
    }
})

module.exports = router;