const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { Error } = require('mongoose')
const {sendWelcomeEmail, sendGoodbyeEmail} = require('../emails/account')

router.get('/test',(req,res)=>{
    res.send('From a new file')

})
//POST
router.post('/users', async (req,res)=>{
    const user = new User (req.body)
    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/login', async(req, res)=>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})

    }catch(e){
        res.status(400).send()
    }
})

//Post logout
router.post('/users/logout', auth, async(req, res)=>{
    try{
       req.user.tokens = req.user.tokens.filter((token)=>{
           return token.token !== req.token
       })
       await req.user.save()
       res.send()

    }catch(e){
        res.status(500).send()
    }
})

//Post logoutAll
router.post('/users/logoutAll', auth, async(req, res)=>{
    try{
       req.user.tokens = []
       await req.user.save()
       res.send()

    }catch(e){
        res.status(500).send()
    }
})


//GET
router.get('/users/me',auth, async (req,res)=>{

    res.send(req.user)
   
})

//Update
router.patch('/users/me',auth ,async (req,res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdate = ['name', 'email', 'password', 'age']
    const isValidOpperation = updates.every((update)=>allowedUpdate.includes(update))
    if(!isValidOpperation){
        return res.status(400).send({error:'Invalid Updates!'})
    }
    try{

        updates.forEach((update)=>req.user[update] = req.body[update])

        await req.user.save()
                res.send(req.user)

    }catch(e){
        res.status(500).send(e)
    }
})
//Delete
router.delete('/users/me', auth, async (req, res)=>{
    try{
        await req.user.remove()
        sendGoodbyeEmail(req.user.email, req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})
//Upload

const upload = multer({
    limits:{
        fileSize: 1000000

    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }

})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res)=>{
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error, req, res, next)=>{
    res.status(400).send({error: error.message})
})
//DELETE AVATAR
router.delete('/users/me/avatar', auth, async (req, res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

//Get users avatar
router.get('users/:id/avatar', async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user|| !user.avatar){
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    }catch(e){
        res.status(401).send()
    }
})

module.exports = router