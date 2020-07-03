const ConversationModel = require('../models').Conversation

exports.getConversationsWithProfile = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    const { profileId } = req.params
    
    try {
        const conversation = await ConversationModel.findOne({
            from: req.user.id,
            to: profileId
        }).populate({
            path: 'to',
            select: 'firstname lastname email'
        })
        
        return res.json({
            success: true,
            data: conversation
        })
    } catch (err) {
        return next(err)
    }
}

exports.getConversationsByAuthedUser = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    try {
        const conversations = await ConversationModel.find({
            from: req.user.id,
        }).populate({
            path: 'to',
            select: 'firstname username lastname email'
        })
        
        return res.json({
            success: true,
            data: conversations
        })
    } catch (err) {
        return next(err)
    }
}

exports.postConversationMessage = async (req, res, next) => {
    const { message, recipientId } = req.body
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    
    try {
        const conversation = await ConversationModel.findOneAndUpdate(
            {
                from: req.user.id,
                to: recipientId
            },
            {
                from: req.user.id,
                to: recipientId,
                $push: {
                    messages: {
                        from: req.user.id,
                        content: message,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                }
            },
            {
                upsert: true,
                returnNewDocument: true
            })
        .populate({
            path: 'to',
            select: 'firstname lastname email'
        })
        
        console.log(conversation)
        
        return res.json({
            success: true,
            data: conversation
        })
    } catch (err) {
        console.log(err)
        return next(err)
    }
}
