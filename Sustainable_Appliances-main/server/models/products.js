const mongoose = require(`mongoose`)

let productsSchema = new mongoose.Schema(
   {
        image: {type: Array},
        name: {type: String},
        category: {type: String},
        energyRating: {type: String},
        price: {type: Number},
        stockLevel: {type: Number}
   },
   {
       collection: `products`
   })

module.exports = mongoose.model(`Product`, productsSchema)