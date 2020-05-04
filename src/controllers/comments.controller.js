const NotFoundError = require('../utils/Errors').NotFoundError
const AnnounceModel = require('../models').Announce
const CommentModel = require('../models').Comment
const UserModel = require('../models').User

const createComment = async (req, res, next) => {
  const { announce_id: announceId, user_id: userId, message } = req.body
  const user = await UserModel.findById(userId)
  const announce = await AnnounceModel.findById(announceId)

  if (!user) return next('user not found')
  if (!announce) return next('announce not found')
  if (!message) return next('comment can\'t be empty')

  try {
    const comment = new CommentModel({
      announceId,
      userId,
      message
    })

    announce.comments.push(comment._id)
    await announce.save()
    const document = await comment.save()
    return res.json({ success: true, message: 'comment added successfully', data: document })
  } catch (err) {
    throw err
  }
}

const getCommentsByAnnounce = async (req, res, next) => {
  const { announce_id } = req.params

  const announce = await AnnounceModel.findById(announce_id).exec()
  if (!announce) throw NotFoundError('announce not found')

  const comments = await CommentModel.find({ announce_id, enabled: true })
  return res.json({ success: true, message: 'comment fetch successfully', data: comments })
}

const enableComment = async (req, res, next) => {
  const { comment_id } = req.params

  const update = await CommentModel.findOneAndUpdate(comment_id, { enabled: true }).exec()
  return res.json({ success: true, message: 'comment enabled successfully', data: update })
}

const disableComment = async (req, res, next) => {
  const { comment_id } = req.params

  const update = await CommentModel.findOneAndUpdate(comment_id, { enabled: false }).exec()
  return res.json({ success: true, message: 'comment disabled successfully', data: update })
}

const removeComment = async (req, res, next) => {
  const { comment_id } = req.params

  const document = await CommentModel.findOneAndDelete(comment_id).exec()
  return res.json({ success: true, message: 'comment removed successfully', data: document })
}

module.exports = { createComment, getCommentsByAnnounce, enableComment, disableComment, removeComment }
