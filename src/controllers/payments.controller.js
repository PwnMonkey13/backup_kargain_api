const PaymentModel = require('../models').Payment
const Errors = require('../utils/Errors')
const config = require('../config/config')
const stripe = require('stripe')(config.stripe.test.secret_key)

const calculateOrderAmount = items => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    return 1400
}

exports.getIntent = async (req, res, next) => {
    try {
        const intent = PaymentModel.findOne({ intent_id })
        return res.json({ client_secret: intent.client_secret })
    } catch (err) {
        return next(err)
    }
}

const offers = [
    {
        maxAnnounces: 10,
        price: 49.9, //EUR
        text: 'Vitrine publique ou vitrine location de 10 annonces, vitrine pro de 10 annonces',
        title: 'announces-10',
        niceTitle: 'Announces 10'
    },
    {
        maxAnnounces: 20,
        price: 99.9, //EUR
        title: 'announces-20',
        niceTitle: 'Announces 20'
    },
    {
        maxAnnounces: 50,
        price: 199.9, //EUR
        text: 'Vitrine publique ou vitrine location de 10 annonces, vitrine pro de 10 annonces',
        title: 'announces-100',
        niceTitle: 'Announces 100'
    },
]

exports.createPaymentIntent = async (req, res, next) => {
    const { product } = req.body
    const offer = offers.find(offer => offer.title === product)
    if (!offer) return next(Errors.UnAuthorizedError('missing offer'))
    if (!offer.price) return next(Errors.UnAuthorizedError('missing price'))
    
    try {
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Number(offer.price) * 10,
            currency: 'eur',
            metadata: {
                integration_check: 'accept_a_payment',
            },
        })
        
        return res.json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret
            }
        })
        
    } catch (err) {
        return next(err)
    }
}

exports.createUserSubscription = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    const { payload, offerTitle } = req.body
    const offer = offers.find(offer => offer.title === offerTitle)
    try {
        const payment = new PaymentModel({
            ...payload,
            user: req.user,
            offer: {
                name: offer.title,
                title: offer.niceTitle
            },
        })
        
        const docPayment = await payment.save()
        
        req.user.subscription = docPayment.id
        req.user.hasProPlan = true
        
        const docUser = await req.user.save()
        
        return res.json({
            success: true, data: {
                docPayment,
                docUser
            }
        })
    } catch (err) {
        return next(err)
    }
}
