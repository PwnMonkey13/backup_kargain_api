const CONFIG = require('../../../../config/config')
const mailer = require('../../../../utils/mailer')

const confirmCreateAnnounce = async params => {
    if (!params.email) throw new Error('missing email')
    if (!params.lastname) throw new Error('missing lastname')
    if (!params.firstname) throw new Error('missing firstname')
    if (!params.confirmUrl) throw new Error('missing confirmUrl')
    
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
                TemplateID: 1472608,
                TemplateLanguage: true,
                Subject: 'Kargain new announce confirmation email',
                URLTags: `token=${params.token}`,
                Variables: {
                    activation_link: params.confirmUrl,
                    firstname : params.firstname
                }
                // "HTMLPart": template,
            }
        ]
    }
    
    try {
        return await mailer.sendMailJet(message)
    } catch (err) {
        throw err
    }
}

module.exports = confirmCreateAnnounce
