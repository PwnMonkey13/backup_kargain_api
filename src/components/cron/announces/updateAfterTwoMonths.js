const cron = require('node-cron')
const moment = require('moment')
const AnnounceModel = require('../../../models').Announce

cron.schedule('* * * * *', async () => {
    const twoMonthsAgo = moment().subtract(2, 'months')
    const docs = await AnnounceModel.updateMany({
        visible: true,
        'createdAt': {
            $lte: twoMonthsAgo.toDate()
        }
    }, {
        visible: false,
    })
    console.log("cron job")
    console.log(docs)
})
