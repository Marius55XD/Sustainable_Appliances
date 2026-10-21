const mongoose = require(`mongoose`)

let salesSchema = new mongoose.Schema(
   {
        paypalPaymentID: {type: String, required: true},
        customerName: {type: String, required: true},
        customerEmail: {type: String, required: true},
        items: [{
            productId: {type: String, required: true},
            productName: {type: String, required: true},
            productImage: {type: String, default: ""},
            quantity: {type: Number, required: true},
            price: {type: Number, required: true}
        }],
        totalAmount: {type: Number, required: true},
        purchaseDate: {type: Date, default: Date.now}
   },
   {
       collection: `sales`
   })

module.exports = mongoose.model(`sales`, salesSchema)
