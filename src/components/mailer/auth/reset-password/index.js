const CONFIG = require('../../../../config/config');
const mailer = require('../../../../utils/mailer');
// const fs = require('fs')
// const path = require('path')
// const template = fs.readFileSync(path.resolve(__dirname, 'template.html'), 'utf8')

const sendConfirmEmail = async params => {
  if(!params.email) throw 'missing email';
  if(!params.lastname) throw 'missing lastname';
  if(!params.firstname) throw 'missing firstname';
  if(!params.token) throw 'missing confirmUrl';

  const message = {
    Messages: [
      {
        "From": {
          Email: CONFIG.mailer.from.email,
          Name: CONFIG.mailer.from.name,
        },
        "To": [
          {
            Email: 'giraudo.nicolas13@gmail.com',
            Name: `${params.lastname} ${params.firstname}`
          }
        ],
        TemplateID: 1337110,
        TemplateLanguage: true,
        "Subject": "Activation Mail Kargain",
        "URLTags": `token=${params.token}`,
        "Variables": {
          // link_activation: params.confirmUrl
        },
        // "HTMLPart": template,
      }
    ]
  };

  try {
    return await mailer.sendMailJet(message);
  } catch (err) {
    next(err);
  }
};

module.exports = sendConfirmEmail;
