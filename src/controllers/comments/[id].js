import comments from '../../../libs/comments.json'

export default (req, res) => {
  res.status(200).json({ post: req.query.id, comments })
}
