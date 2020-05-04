const CONFIG = require('../../../../config/config')
const mailer = require('../../../../utils/mailer')

const sendConfirmEmail = async params => {
  if (!params.email) throw new Error('missing email')
  if (!params.lastname) throw new Error('missing lastname')
  if (!params.firstname) throw new Error('missing firstname')
  if (!params.token) throw new Error('missing confirmUrl')

  const message = {
    Messages: [
      {
        From: {
          Email: CONFIG.mailer.from.email,
          Name: CONFIG.mailer.from.name
        },
        To: [
          {
            Email: 'giraudo.nicolas13@gmail.com',
            Name: `${params.lastname} ${params.firstname}`
          }
        ],
        TemplateID: 1337110,
        TemplateLanguage: true,
        Subject: 'Activation Mail Kargain',
        URLTags: `token=${params.token}`,
        Variables: {
          // link_activation: params.confirmUrl
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

module.exports = sendConfirmEmail
