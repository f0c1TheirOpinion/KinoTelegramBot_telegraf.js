const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    idUser:{
        type:Number, 
        unique:true,
        required: true,
    }
}, {timestamps: true})

const RdIdUser = mongoose.model('RdIdUser', postSchema);
module.exports = RdIdUser;