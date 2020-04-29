const AnnounceModel = require('../models').Announce
const UserModel = require('../models').User

//TODO
const getAnnouncesLegacy = async (req, res, next) => {
	const { base64params } = req.params
	const buff = new Buffer(base64params, 'base64')
	const string = buff.toString('ascii')
	const params = JSON.parse(string)
	const { filters, sorter } = params
	
	try {
		const page = (req.query.page && parseInt(req.query.page) > 0) ? parseInt(req.query.page) : 1
		let size = 5
		let sorters = { 'createdAt': -1 }
		if (sorter) sorters = { [sorter.value.key]: sorter.value.desc ? -1 : 1, ...sorters }
		
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
				}
				
				//TODO
				// else if (typeof filter === 'object') {}
				
				else {
					carry[key] = filter.rule === 'strict' ? filter.value.toLowerCase() : {
						'$regex': filter.value,
						'$options': 'i'
					}
				}
			}
			return carry
		}, {}) : {}
		
		const rows = await AnnounceModel
		.find(query)
		.skip(skip)
		.sort(sorters)
		.limit(size)
		.populate('user')
		
		const total = await AnnounceModel.estimatedDocumentCount().exec()
		
		const data = {
			query,
			filters,
			sorter,
			page: page,
			pages: Math.ceil(total / size),
			total,
			size: size,
			rows
		}
		
		return res.json({ success: true, data })
		
	} catch (e) {
		throw e
	}
}

const getAnnounces = async (req, res, next) => {
	
	try {
		const page = (req.query.page && parseInt(req.query.page) > 0) ? parseInt(req.query.page) : 1
		let size = 5
		let sorters = { 'createdAt': -1 }
		
		if (req.query.size && parseInt(req.query.size) > 0 && parseInt(req.query.size) < 500) {
			size = parseInt(req.query.size)
		}
		const skip = (size * (page - 1) > 0) ? size * (page - 1) : 0
		
		const query = {}
		
		const rows = await AnnounceModel
		.find(query)
		.skip(skip)
		.sort(sorters)
		.limit(size)
		.populate('user')
		
		const total = await AnnounceModel.estimatedDocumentCount().exec()
		
		const data = {
			page: page,
			pages: Math.ceil(total / size),
			total,
			size: size,
			rows
		}
		
		return res.json({ success: true, data })
		
	} catch (e) {
		throw e
	}
}

const getAnnouncesByUser = async (req, res, next) => {
	const uid = req.params.uid
	const user = await UserModel.findById(uid)
	if (!user) return next('No user found')
	const announces = await AnnounceModel.findByUser(uid)
	if (announces) return res.json({ success: true, data: announces })
	else return res.status(400).json({ success: false, msg: 'no announces found', uid })
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
	
	if (req.user) announce.user = req.user
	
	announce.save().then(document => {
		return res.json({ success: true, message: 'Ad created successfully', data: document })
	}).catch(err => next(err))
}

module.exports = { getAnnouncesLegacy, getAnnounces, getAnnouncesByUser, getBySlug, create }
