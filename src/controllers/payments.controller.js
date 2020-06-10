const PaymentModel = require('../models').Payment
const Errors = require('../utils/Errors')
const config = require('../config/config')
const stripe = require('stripe')(config.stripe.token);

exports.getIntent = async (req, res, next) => {
    const { intent_id } = req.params;
    
    try{
        const intent = PaymentModel.findOne({ intent_id })
        return res.json({client_secret: intent.client_secret});
    } catch (err) {
        return next(err)
    }
}

exports.createPayment = async (req, res, next) => {
    if (!req.user) return next(Errors.UnAuthorizedError('missing user'))
    
    const { amount, source, receipt_email } = req.body
    
    const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'eur',
        // Verify your integration in this guide by including this parameter
        metadata: {integration_check: 'accept_a_payment'},
    });
    
    try {
        const announce = new PaymentModel({
            user: req.user,
            paymentIntent
        })
        
        const document = await announce.save()
        
        return res.json({
            success: true,
            message: 'Ad created successfully',
            data: {
                document,
            },
        })
    } catch (err) {
        next(err)
    }
}

exports.postCharge = async (req, res, next) => {
    try {
        const { amount, source, receipt_email } = req.body
        
        const charge = await stripe.charges.create({
            amount,
            currency: 'eur',
            source,
            receipt_email
        })
        
        if (!charge) throw new Error('charge unsuccessful')
        
        return res.status(200).json({
            success : true,
            message: 'charge posted successfully',
            charge
        })
    } catch (err) {
        return next(err)
    }
}
