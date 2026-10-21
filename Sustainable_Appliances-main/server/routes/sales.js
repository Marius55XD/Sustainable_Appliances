const router = require(`express`).Router()
const createError = require('http-errors')
const salesModel = require(`../models/sales`)
const productsModel = require(`../models/products`)

const ACCESS_LEVEL_ADMIN = parseInt(process.env.ACCESS_LEVEL_ADMIN || 2)


// Create new sale record
router.post('/sales', (req, res, next) =>
{
    const { paypalPaymentID, customerName, customerEmail, items, totalAmount } = req.body

    if (!paypalPaymentID || !customerName || !customerEmail || !items || !totalAmount)
    {
        return next(createError(400, `Missing required fields for sale`))
    }

    if (!Array.isArray(items) || items.length === 0)
    {
        return next(createError(400, `Items must be a non-empty array`))
    }

    salesModel.create(req.body)
    .then(data => res.json({ success: true, saleId: data._id }))
    .catch(err => next(err))
})


// Get purchase history with role-based access:
// - admin can see all records
// - normal user can only see own records
router.get('/sales/history', async (req, res, next) =>
{
    const requesterEmail = (req.query.requesterEmail || "").toString().trim().toLowerCase()
    const requesterAccessLevel = parseInt(req.query.accessLevel || 0)

    if (!requesterEmail)
    {
        return next(createError(400, `Requester email is required`))
    }

    const query = requesterAccessLevel === ACCESS_LEVEL_ADMIN
        ? {}
        : { customerEmail: requesterEmail }

    try
    {
        const sales = await salesModel.find(query).sort({ purchaseDate: -1 }).lean()

        const missingImageIds = new Set()

        sales.forEach(sale =>
        {
            ;(sale.items || []).forEach(item =>
            {
                if (!item.productImage && typeof item.productId === 'string' && /^[a-f\d]{24}$/i.test(item.productId))
                {
                    missingImageIds.add(item.productId)
                }
            })
        })

        let productImageMap = new Map()

        if (missingImageIds.size > 0)
        {
            const products = await productsModel.find({ _id: { $in: Array.from(missingImageIds) } }).select('_id image').lean()
            productImageMap = new Map(
                products.map(product => [String(product._id), Array.isArray(product.image) && product.image.length > 0 ? product.image[0] : ""])
            )
        }

        const enrichedSales = sales.map(sale => ({
            ...sale,
            items: (sale.items || []).map(item => ({
                ...item,
                productImage: item.productImage || productImageMap.get(item.productId) || ""
            }))
        }))

        res.json(enrichedSales)
    }
    catch (err)
    {
        next(err)
    }
})


module.exports = router
