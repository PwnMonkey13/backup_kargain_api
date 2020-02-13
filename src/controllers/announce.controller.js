const Announce = require('../models').Announce

const getAll = async (req, res, next) => {
  const data = await Announce.find()
  return res.json({ success: true, data: data })
}

const getBySlug = async (req, res, next) => {
  const announce = await Announce.findOne({ slug: req.params.slug })
  if (announce) return res.json({ success: true, data: announce })
  else return res.status(400).json({ success: false, msg: 'no announce found' })
}

const create = async (req, res, next) => {
  let announce = new Announce({
    user: req.user.id,
    ...req.body
  })

  console.log(announce);

  announce.save().then(document => {
    return res.json({ success: true, message: 'Ad created successfully', data: document })
  }).catch(err => next(err))
}

module.exports = { getAll, getBySlug, create }
