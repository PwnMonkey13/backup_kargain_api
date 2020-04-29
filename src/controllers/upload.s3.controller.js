const utilsS3 = require('../utils/s3-presigner')
const { uuid } = require('uuidv4');
const shortid = require('shortid');
const mediaModel = require('../models').Media;

function getWithoutExtension(filename){
    return filename.split('.').slice(0, -1).join('.')
}

function getExtension(filename){
    return filename.split('.').pop();
}

const getS3Config = (req, res, next) => {
    try{
        const config = utilsS3.getConfig();
        res.json({ success: true, data : { config }})
    }catch (err) {
        next(err)
    }
};

const postObjects = async (req, res, next) => {
    const baseDir = req.body.base;
    const hash = Boolean(req.body.hash)
    
    //see https://attacomsian.com/blog/uploading-files-nodejs-express
    if(!req.files || !req.files.images) return next('missing files to upload')
    
    try{
        const images = !Array.isArray(req.files.images) ? [req.files.images] : req.files.images;
        
        const pArray = (images, baseDir) => {
            return images.map(async file => {
                const dir = `${baseDir ? baseDir + '/' : ''}`
                const name = hash ? `${uuid()}` : `${getWithoutExtension(file.name)}_${shortid.generate()}`
                const key = `${dir}${name}.${getExtension(file.name)}`
                const uploadResponse = await utilsS3.uploadObject(file.data, key)
                
                const media = new mediaModel({
                    originalName : file.name,
                    mimeType : file.mimetype,
                    size : file.size,
                    etag : uploadResponse.ETag,
                    location : uploadResponse.Location,
                    filename : uploadResponse.Key,
                });
                
                return await media.save();
            });
        }
        
        const result = await Promise.all(pArray(images, baseDir));
        res.json({ success: true, data : result })
    } catch (err) {
        next(err)
    }
}

// GET URL
const generateGetUrl = (req, res, next) => {
    // Both Key and ContentType are defined in the client side.
    // Key refers to the remote name of the file.
    const { Key } = req.query
    utilsS3.generateGetUrl(Key)
    .then(getURL => {
        res.json({ success: true, data: { getURL } })
    })
    .catch(err => {
            next(err)
        }
    )
}

// PUT URL
const generatePutUrl = (req, res, next) => {
    // Both Key and ContentType are defined in the client side.
    // Key refers to the remote name of the file.
    // ContentType refers to the MIME content type, in this case image/jpeg
    const { Key, ContentType } = req.query
    utilsS3.generatePutUrl(Key, ContentType).then(putURL => {
        res.json({ success: true, data : { putURL }})
    })
    .catch(err => {
        next(err)
    })
}

module.exports = {getS3Config, postObjects, generateGetUrl, generatePutUrl}
