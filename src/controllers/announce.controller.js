const Announce = require('../models').Announce;

const getAll = async (req, res, next) => {
    const data = await Announce.find()
    return res.json({success: true, data : data });
}

const create = async (req, res, next) => {

  let announce = new Announce({ user : req.user.id, ...req.body });
  console.log(announce);
  announce.save().then(document => {
    return res.json({ success: true, message: 'User signed up successfully', data: document })
  }).catch(err => next(err))
}

module.exports = { getAll, create }
