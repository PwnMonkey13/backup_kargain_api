const Announce = require('../models').Announce;

const getAll = async (req, res, next) => {
    const data = await Announce.find()
    return res.json({success: true, data : data });
}

const create = async (req, res, next) => {

  let announce = new Announce({
    user : req.user.id,
    ...req.body
  });

  announce.save().then(document => {
    return res.json({ success: true, message: 'Ad created successfully', data: document })
  }).catch(err => next(err));
}

module.exports = { getAll, create }
