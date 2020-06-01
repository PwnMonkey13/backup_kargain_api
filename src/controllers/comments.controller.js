const AnnounceModel = require('../models').Announce
const CommentModel = require('../models').Comment
const Errors = require('../utils/Errors')

const getCommentsByAnnounce = async (req, res, next) => {
    const { announce_id } = req.params
    const announce = await AnnounceModel.findById(announce_id).exec()
    
    if (!announce) throw Errors.NotFoundError('announce not found')
    
    const comments = await CommentModel.find({ announce: announce_id, enabled: true }).exec()
    return res.json({ success: true, message: 'comment fetch successfully', data: comments })
}

const createComment = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError())
    
    const { announce_id, message } = req.body
    const announce = await AnnounceModel.findById(announce_id).exec()
    
    if (!announce) throw Errors.NotFoundError('announce not found')
    if (!message) return next('comment can\'t be empty')
    
    try {
        const comment = new CommentModel({
            announce: announce_id,
            user: req.user.id,
            message
        })
        
        const doc = await comment.save()
        announce.comments.push(doc._id)
        await announce.save()
        
        return res.json({
            success: true,
            data: doc
        })
    } catch (err) {
        throw err
    }
}

const enableComment = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError())
    
    const { comment_id } = req.params
    const update = await CommentModel.findOneAndUpdate({ _id: comment_id }, { enabled: true }).exec()
    return res.json({ success: true, message: 'comment enabled successfully', data: update })
}

const disableComment = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError())
    
    const { comment_id } = req.params
    const update = await CommentModel.findOneAndUpdate({ _id: comment_id }, { enabled: false }).exec()
    return res.json({ success: true, message: 'comment disabled successfully', data: update })
}

const removeComment = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError())
    
    const { comment_id } = req.params
    const document = await CommentModel.findOneAndDelete({ _id: comment_id }).exec()
    return res.json({ success: true, message: 'comment removed successfully', data: document })
}

const createCommentResponse = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError())
    
    const { comment_id: commentId, message } = req.body
    const comment = await CommentModel.findById(commentId).exec()
    
    if (!comment) return next('comment not found')
    if (!message) return next('comment can\'t be empty')
    
    try {
        const CommentResponse = {
            user: req.user.id,
            message
        }
        
        if (!comment.responses) comment.responses = []
        comment.responses.push(CommentResponse)
        const document = await comment.save()
        
        const populatedComment = await document
        .populate('user')
        .populate('responses.user')
        .execPopulate()
        
        return res.json({
            success: true,
            data: populatedComment
        })
    } catch (err) {
        return next(err)
    }
}

const createCommentLike = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError())
    
    const { comment_id: commentId } = req.params
    const comment = await CommentModel.findById(commentId).exec()
    
    if (!comment) return next('comment not found')
    
    if (!comment.likes) comment.likes = []
    comment.likes.push({
        user: req.user.id
    })
    
    const document = await comment.save()
    return res.json({ success: true, message: 'like added successfully', data: document })
}

const removeCommentLike = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError())
    
    const { comment_id: commentId, likeIndex } = req.params
    const comment = await CommentModel.findById(commentId).exec()
    
    if (!comment) return next('comment not found')
    
    comment.likes = comment.likes.slice(0, likeIndex).concat(comment.likes.slice(likeIndex + 1, comment.likes.length))
    
    const document = await comment.save()
    return res.json({ success: true, message: 'like added successfully', data: document })
}

const createCommentResponseLike = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError())
    
    const { comment_id: commentId, responseIndex } = req.params
    const comment = await CommentModel.findById(commentId).exec()
    if (!comment) return next('comment not found')
    
    const response = comment.responses && comment.responses[responseIndex]
    if (!response) return next('response not found')
    
    response.likes.push({
        user: req.user.id
    })
    
    const document = await comment.save()
    return res.json({ success: true, message: 'like added successfully', data: document })
}

const removeCommentResponseLike = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError())
    
    const { comment_id: commentId, responseIndex, likeIndex } = req.params
    const comment = await CommentModel.findById(commentId).exec()
    if (!comment) return next('comment not found')
    
    const response = comment.responses && comment.responses[responseIndex]
    if (!response) return next('response not found')
    
    response.likes = response.likes.slice(0, likeIndex).concat(comment.likes.slice(likeIndex + 1, response.likes.length))
    
    const document = await comment.save()
    return res.json({ success: true, message: 'like added successfully', data: document })
}

module.exports = {
    createComment,
    getCommentsByAnnounce,
    enableComment,
    disableComment,
    removeComment,
    createCommentLike,
    removeCommentLike,
    createCommentResponse,
    createCommentResponseLike,
    removeCommentResponseLike
}
