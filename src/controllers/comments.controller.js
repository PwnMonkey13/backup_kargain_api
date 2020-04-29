const mongoose = require('mongoose')
const NotFoundError = require('../utils/handleError').NotFoundError
const AnnounceModel = require('../models').Announce
const CommentModel = require('../models').Comment
const UserModel = require('../models').User

const createComment = async (req, res, next) => {
    const { announce_id, user_id, message } = req.body;
    
    try{
        const user = await UserModel.findById(user_id);
        const announce = await AnnounceModel.findById(announce_id);
        
        if(!user) return next("user not found");
        if(!announce) return next("announce not found");
        if(!message) return next("comment can't be empty");
        
        const comment = new CommentModel({
            announce_id,
            user_id,
            message
        });
    
        announce.comments.push(comment._id);
        const result = await announce.save();
        const document = await comment.save();
        return res.json({ success: true, message: 'comment added successfully', data: document })
    
    } catch (err) {
        throw err;
    }
}

const getCommentsByAnnounce = async (req, res, next) => {
    const { announce_id } = req.params;
    
    try{
        const announce = await AnnounceModel.findById(announce_id).exec();
        if(!announce) throw NotFoundError("announce not found");
        
        const comments = await CommentModel.find({announce_id, enabled : true});
        return res.json({ success: true, message: 'comment fetch successfully', data: comments })
        
    } catch (err) {
        throw err;
    }
}

const enableComment = async (req, res, next) => {
    const { comment_id } = req.params;
    
    try{
        const update = await CommentModel.findOneAndUpdate(comment_id, {enabled : true}).exec();
        return res.json({ success: true, message: 'comment enabled successfully', data: update })
        
    } catch (err) {
        throw err;
    }
}

const disableComment = async (req, res, next) => {
    const { comment_id } = req.params;
    
    try{
        const update = await CommentModel.findOneAndUpdate(comment_id, {enabled : false}).exec();
        return res.json({ success: true, message: 'comment disabled successfully', data: update })
        
    } catch (err) {
        throw err;
    }
}

const removeComment = async (req, res, next) => {
    const { comment_id } = req.params;
    
    try{
        const document = await CommentModel.findOneAndDelete(comment_id).exec();
        return res.json({ success: true, message: 'comment removed successfully', data: document })
        
    } catch (err) {
        throw err;
    }
}

module.exports = { createComment, getCommentsByAnnounce, enableComment, disableComment, removeComment }
