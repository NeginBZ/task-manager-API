const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const taskSchema = new mongoose.Schema({
    description:{
        type: String,
        trim: true,
        required: true
    },
    complete:{
        type:Boolean,
        default: false
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' //User is model name which we used in user.js Model
    }
},{
    timestamps: true
})

const task = mongoose.model('Task', taskSchema)

taskSchema.pre('save', async function (next){
    const task = this

    console.log('Befor saving Task')



    next()
})

const Task = mongoose.model('Task', taskSchema)

module.exports= Task 

