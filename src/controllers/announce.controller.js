const AnnounceModel = require('../models').Announce

const getAnnounces = async (req, res, next) => {
  const { base64params } = req.params;
  const buff = new Buffer(base64params, 'base64');
  const string = buff.toString('ascii');
  const filters = JSON.parse(string);

  try {
    const page = (req.query.page && parseInt(req.query.page) > 0) ? parseInt(req.query.page) : 1
    const sort = (req.query.sort) ? { [req.query.sort]: 1 } : {}
    let size = 5

    if (req.query.size && parseInt(req.query.size) > 0 && parseInt(req.query.size) < 500) {
      size = parseInt(req.query.size)
    }
    const skip = (size * (page - 1) > 0) ? size * (page - 1) : 0

    const query = filters ? Object.keys(filters).reduce((carry, key) => {
      const filter = filters[key]
      if (typeof filter === 'object') {
        if (filter.type === 'number') {
          if (!carry[filter.ref]) carry[filter.ref] = {}
          if (filter.rule === 'min') carry[filter.ref] = { ...carry[filter.ref], $gte: filter.value }
          else if (filter.rule === 'max') carry[filter.ref] = { ...carry[filter.ref], $lte: filter.value }
        } else carry[key] = filter.rule === 'strict' ? filter.value.toLowerCase() : {
          '$regex': filter.value,
          '$options': 'i'
        }
      }
      return carry
    }, {}) : {};

    const announces = await AnnounceModel
      .find(query)
      .skip(skip)
      .sort(sort)
      .limit(size)
      .populate('user')

    const allData = await AnnounceModel.find().exec();

    let data = {
      filters,
      length : announces.length,
      total : allData.length,
      announces
    }

    return res.json({ success: true, data });

  } catch (e) {
    throw e
  }
}

const getBySlug = async (req, res, next) => {
  const announce = await AnnounceModel.findOne({ slug: req.params.slug }).populate('user')
  if (announce) return res.json({ success: true, data: announce })
  else return res.status(400).json({ success: false, msg: 'no announce found' })
}

const create = async (req, res, next) => {

  let announce = new AnnounceModel({
    ...req.body
  })

  if(req.user) announce.user = req.user;

  announce.save().then(document => {
    return res.json({ success: true, message: 'Ad created successfully', data: document })
  }).catch(err => next(err))
}

module.exports = { getAnnounces, getBySlug, create }
