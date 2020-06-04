const CONFIG = require('../../../config/config')
const mailer = require('../../../utils/mailer')

const successConfirmAnnounce = async params => {
    if (!params.email) throw new Error('missing email')
    if (!params.firstname) throw new Error('missing firstname')
    if (!params.announce_link) throw new Error('missing announce link')
    
    const message = {
        Messages: [
            {
                From: {
                    Email: CONFIG.mailer.from.email,
                    Name: CONFIG.mailer.from.name
                },
                To: [
                    {
                        Email: params.email,
                        Name: `${params.lastname} ${params.firstname}`
                    }
                ],
                Variables : {
                    manufacturer_make : params?.manufacturer?.make,
                    manufacturer_model : params?.manufacturer?.model,
                    manufacturer_generation : params?.manufacturer?.generation,
                    announce_link : params.announce_link,
                    featured_img_link : params.featured_img_link
                },
                TemplateID: 1481702,
                TemplateLanguage: true,
                Subject: 'Kargain | Announce activated',
            }
        ]
    }
    
    try {
        return await mailer.sendMailJet(message)
    } catch (err) {
        throw err
    }
}

module.exports = successConfirmAnnounce
