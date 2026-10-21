    const router = require(`express`).Router()
const createError = require('http-errors')
const mongoose = require('mongoose')
const multer = require('multer')
const path = require('path')
const productsModel = require(`../models/products`)

const productStorage = multer.diskStorage({
    destination: (req, file, cb) =>
    {
        cb(null, 'uploads/products/')
    },
    filename: (req, file, cb) =>
    {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`)
    }
})

const uploadProductImages = multer({ storage: productStorage })

    
// read all records
router.get(`/products`, (req, res, next) =>
{
    //user does not have to be logged in to see product details
    productsModel.find({})
    .then(data => res.json(data))
    .catch(err => next(err))
})


// Read one record
router.get(`/products/:id`, (req, res, next) =>
{
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
    {
        return next(createError(400, `Invalid product id`))
    }

    productsModel.findById(req.params.id)
    .then(data => res.json(data))
    .catch(err => next(err))
})


// Add new record
router.post(`/products`, uploadProductImages.array('images'), (req, res, next) =>
{
    // validate input on the server side too
    const { name, category, energyRating, price, stockLevel } = req.body;
    const uploadedFiles = Array.isArray(req.files) ? req.files : []

    if (!name || typeof name !== 'string' || !name.trim()) {
        return next(createError(400, `Name is required and must be a non‑empty string`));
    } else if (!category || typeof category !== 'string' || !category.trim()) {
        return next(createError(400, `Category is required and must be a non‑empty string`));
    } else if (!energyRating || typeof energyRating !== 'string' || !energyRating.trim()) {
        return next(createError(400, `Energy rating is required and must be a string`));
    } else if (price === undefined || isNaN(price) || Number(price) < 0) {
        return next(createError(400, `Price must be a number greater than or equal to zero`));
    } else if (stockLevel === undefined || isNaN(stockLevel) || Number(stockLevel) < 0) {
        return next(createError(400, `Stock level must be a number greater than or equal to zero`));
    } else if (uploadedFiles.length === 0) {
        return next(createError(400, `At least one product image is required`));
    }

    const imageUrls = uploadedFiles.map(file => `${req.protocol}://${req.get('host')}/uploads/products/${file.filename}`)

    const productObject = {
        image: imageUrls,
        name: name.trim(),
        category: category.trim(),
        energyRating: energyRating.trim(),
        price: Number(price),
        stockLevel: Number(stockLevel)
    }

    productsModel.create(productObject)
    .then(data => res.json(data))
    .catch(err => next(err))
})


// Update one record
router.put(`/products/:id`, uploadProductImages.array('images'), (req, res, next) =>
{
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
    {
        return next(createError(400, `Invalid product id`))
    }

    // similar validation as POST; we allow partial updates but still check provided fields
    const { name, category, energyRating, price, stockLevel } = req.body;
    const uploadedFiles = Array.isArray(req.files) ? req.files : []

    let existingImages = []

    if (req.body.existingImages !== undefined)
    {
        try
        {
            const parsedImages = JSON.parse(req.body.existingImages)
            if (!Array.isArray(parsedImages))
            {
                return next(createError(400, `existingImages must be a JSON array`))
            }

            existingImages = parsedImages.filter(imageUrl =>
                typeof imageUrl === 'string' &&
                imageUrl.trim() !== '' &&
                !imageUrl.startsWith('blob:')
            )
        }
        catch (error)
        {
            return next(createError(400, `existingImages must be valid JSON`))
        }
    }
    else if (req.body.image !== undefined)
    {
        const legacyImages = Array.isArray(req.body.image) ? req.body.image : [req.body.image]
        existingImages = legacyImages.filter(imageUrl =>
            typeof imageUrl === 'string' &&
            imageUrl.trim() !== '' &&
            !imageUrl.startsWith('blob:')
        )
    }

    if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
        return next(createError(400, `Name must be a non‑empty string`));
    } else if (category !== undefined && (typeof category !== 'string' || !category.trim())) {
        return next(createError(400, `Category must be a non‑empty string`));
    } else if (energyRating !== undefined && (typeof energyRating !== 'string' || !energyRating.trim())) {
        return next(createError(400, `Energy rating must be a string`));
    } else if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
        return next(createError(400, `Price must be a number greater than or equal to zero`));
    } else if (stockLevel !== undefined && (isNaN(stockLevel) || Number(stockLevel) < 0)) {
        return next(createError(400, `Stock level must be a number greater than or equal to zero`));
    }

    const uploadedImageUrls = uploadedFiles.map(file => `${req.protocol}://${req.get('host')}/uploads/products/${file.filename}`)
    const updateObject = {
        ...req.body
    }

    if (updateObject.name !== undefined) {
        updateObject.name = updateObject.name.trim()
    }

    if (updateObject.category !== undefined) {
        updateObject.category = updateObject.category.trim()
    }

    if (updateObject.energyRating !== undefined) {
        updateObject.energyRating = updateObject.energyRating.trim()
    }

    if (updateObject.price !== undefined) {
        updateObject.price = Number(updateObject.price)
    }

    if (updateObject.stockLevel !== undefined) {
        updateObject.stockLevel = Number(updateObject.stockLevel)
    }

    // Remove transport-only fields before persisting.
    delete updateObject.existingImages

    if (req.body.existingImages !== undefined || req.body.image !== undefined || uploadedImageUrls.length > 0)
    {
        const finalImages = [...existingImages, ...uploadedImageUrls]

        if (finalImages.length === 0)
        {
            return next(createError(400, `At least one product image is required`))
        }

        updateObject.image = finalImages
    }

    productsModel.findByIdAndUpdate(req.params.id, {$set: updateObject})
    .then(data => res.json(data))
    .catch(err => next(err))
})


// Delete one record
router.delete(`/products/:id`, async (req, res, next) =>
{
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
    {
        return next(createError(400, `Invalid product id`))
    }

    productsModel.findByIdAndDelete(req.params.id)
    .then(data => res.json(data))
    .catch(err => next(err))
})

// Decrement stock levels after purchase
router.post(`/products/decrement-stock`, async (req, res, next) =>
{
    const items = Array.isArray(req.body.items) ? req.body.items : []

    if (items.length === 0)
    {
        return next(createError(400, `Items array is required`))
    }

    try
    {
        for (const item of items)
        {
            if (!item || !mongoose.Types.ObjectId.isValid(item.productId) || isNaN(item.quantity) || Number(item.quantity) <= 0)
            {
                throw createError(400, `Each item must include a valid productId and quantity > 0`)
            }

            const updated = await productsModel.findOneAndUpdate(
                { _id: item.productId, stockLevel: { $gte: Number(item.quantity) } },
                { $inc: { stockLevel: -Number(item.quantity) } },
                { new: true }
            )

            if (!updated)
            {
                throw createError(400, `Insufficient stock for product ${item.productId}`)
            }
        }

        res.json({ success: true })
    }
    catch (err)
    {
        next(err)
    }
})

module.exports = router