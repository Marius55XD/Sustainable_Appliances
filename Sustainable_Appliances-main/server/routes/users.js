const router = require(`express`).Router()
const createError = require('http-errors')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const fs = require('fs').promises
const usersModel = require(`../models/users`)
const productsModel = require(`../models/products`)
const salesModel = require(`../models/sales`)
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

const ACCESS_LEVEL_NORMAL_USER = parseInt(process.env.ACCESS_LEVEL_NORMAL_USER || 1)
const ACCESS_LEVEL_ADMIN = parseInt(process.env.ACCESS_LEVEL_ADMIN || 2)
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "a@a.com").toLowerCase()
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123456!"

const getAccessLevel = (email) =>
{
    return (email || "").toLowerCase() === ADMIN_EMAIL
        ? ACCESS_LEVEL_ADMIN
        : ACCESS_LEVEL_NORMAL_USER
}

const deleteFilesInDirectory = async (directoryPath) =>
{
    try
    {
        const entries = await fs.readdir(directoryPath, { withFileTypes: true })
        const files = entries.filter(entry => entry.isFile())

        await Promise.all(files.map(file => fs.unlink(path.join(directoryPath, file.name))))
    }
    catch (err)
    {
        if (err.code !== 'ENOENT')
        {
            throw err
        }
    }
}

const clearUploadedFiles = async () =>
{
    const uploadsRoot = path.resolve(process.env.UPLOADED_FILES_FOLDER || './uploads')
    const productUploads = path.join(uploadsRoot, 'products')

    await Promise.all([
        deleteFilesInDirectory(uploadsRoot),
        deleteFilesInDirectory(productUploads)
    ])
}



router.post(`/users/reset_user_collection`, async (req, res, next) =>
{
    const requesterAccessLevel = parseInt(req.query.accessLevel || 0)

    if (requesterAccessLevel !== ACCESS_LEVEL_ADMIN)
    {
        return next(createError(403, `Forbidden`))
    }

    try
    {
        await Promise.all([
            usersModel.deleteMany({}),
            productsModel.deleteMany({}),
            salesModel.deleteMany({})
        ])

        await clearUploadedFiles()

        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)

        const adminUser = await usersModel.create({
            name: "Administrator",
            email: ADMIN_EMAIL,
            password: hashedPassword,
            accessLevel: ACCESS_LEVEL_ADMIN
        })

        res.json({
            success: true,
            message: `All collections and uploaded files have been reset`,
            adminEmail: adminUser.email
        })
    }
    catch (err)
    {
        next(createError(500, `Error resetting database\n${err}`))
    }
})


router.post(`/users/register/:name/:email/:password`, upload.single('profilePhoto'), (req, res, next) =>
{
    const name = (req.params.name || "").trim()
    const email = (req.params.email || "").trim().toLowerCase()
    const password = req.params.password || ""

    if (name.length < 2)
    {
        return next(createError(400, `Name must be at least 2 characters long`))
    }

    if (email.indexOf(`@`) === -1 || email.indexOf(`.`) === -1)
    {
        return next(createError(400, `Email is invalid`))
    }

    if (password.length < 8)
    {
        return next(createError(400, `Password must be at least 8 characters long`))
    }

    usersModel.findOne({email: email})
    .then(uniqueData =>
    {
        if(uniqueData)
        {
            next(createError(500, `User already exists`))
        }
        else
        {
            const accessLevel = getAccessLevel(email)
            const saltRounds = 10
            const profilePhotoFilename = req.file ? req.file.filename : ""

            bcrypt.hash(password, saltRounds, (err, hashedPassword) =>
            {
                if(err)
                {
                    next(createError(500, `error hashing password\n${err}`))
                    return
                }

                usersModel.create({
                    name: name,
                    email: email,
                    password: hashedPassword,
                    accessLevel: accessLevel,
                    profilePhotoFilename: profilePhotoFilename
                })
                .then(data => res.json({userId: data._id, name: data.name, email: data.email, accessLevel: data.accessLevel, profilePhotoFilename: data.profilePhotoFilename}))
                .catch(err => next(err))
            })
        }
    })
    .catch(err => next(err))
})


router.post(`/users/login/:email/:password`, (req, res, next) =>
{
    const email = (req.params.email || "").trim().toLowerCase()
    const password = req.params.password || ""

    if (email.indexOf(`@`) === -1 || email.indexOf(`.`) === -1 || !password)
    {
        return next(createError(400, `Email and password are required`))
    }

    usersModel.findOne({email: email})
    .then(data =>
    {
        if(data)
        {
            bcrypt.compare(password, data.password, (err, isMatch) =>
            {
                if(err)
                {
                    next(createError(500, `error comparing passwords\n${err}`))
                    return
                }

                if(isMatch)
                {
                    const accessLevel = (typeof data.accessLevel === "number")
                        ? data.accessLevel
                        : getAccessLevel(data.email)

                    if(data.accessLevel !== accessLevel)
                    {
                        data.accessLevel = accessLevel
                        data.save().catch(() => {})
                    }

                    res.json({userId: data._id, name: data.name, email: data.email, accessLevel: accessLevel, profilePhotoFilename: data.profilePhotoFilename})
                }
                else
                {
                    next(createError(401, `Invalid login credentials`))
                }
            })
        }
        else
        {
            next(createError(401, `Invalid login credentials`))
        }
    })
    .catch(err => next(err))
})


router.get(`/users`, (req, res, next) =>
{
    const requesterAccessLevel = parseInt(req.query.accessLevel || 0)

    if (requesterAccessLevel !== ACCESS_LEVEL_ADMIN)
    {
        return next(createError(403, `Forbidden`))
    }

    usersModel.find({}, { password: 0 })
    .sort({ name: 1 })
    .then(data => res.json(data))
    .catch(err => next(err))
})


router.put(`/users/:id`, upload.single('profilePhoto'), (req, res, next) =>
{
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
    {
        return next(createError(400, `Invalid user id`))
    }

    const { name, email, currentPassword, newPassword } = req.body
    const updateData = {}

    // Validate name if provided
    if (name !== undefined)
    {
        const trimmedName = (name || "").trim()
        if (trimmedName.length < 2)
        {
            return next(createError(400, `Name must be at least 2 characters long`))
        }
        updateData.name = trimmedName
    }

    // Validate email if provided
    if (email !== undefined)
    {
        const trimmedEmail = (email || "").trim().toLowerCase()
        if (trimmedEmail.indexOf(`@`) === -1 || trimmedEmail.indexOf(`.`) === -1)
        {
            return next(createError(400, `Email is invalid`))
        }
        updateData.email = trimmedEmail
        updateData.accessLevel = getAccessLevel(trimmedEmail)
    }

    // Handle profile photo update
    if (req.file)
    {
        updateData.profilePhotoFilename = req.file.filename
    }

    // If changing password, verify current password first
    if (newPassword)
    {
        if (!currentPassword)
        {
            return next(createError(400, `Current password is required to set a new password`))
        }

        if (newPassword.length < 8)
        {
            return next(createError(400, `New password must be at least 8 characters long`))
        }

        usersModel.findById(req.params.id)
        .then(user =>
        {
            if (!user)
            {
                return next(createError(404, `User not found`))
            }

            bcrypt.compare(currentPassword, user.password, (err, isMatch) =>
            {
                if (err)
                {
                    return next(createError(500, `Error verifying password\n${err}`))
                }

                if (!isMatch)
                {
                    return next(createError(401, `Current password is incorrect`))
                }

                // Hash and update password
                bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) =>
                {
                    if (hashErr)
                    {
                        return next(createError(500, `Error hashing new password\n${hashErr}`))
                    }

                    updateData.password = hashedPassword

                    usersModel.findByIdAndUpdate(req.params.id, updateData, { new: true })
                    .then(updatedUser =>
                    {
                        res.json({
                            name: updatedUser.name,
                            email: updatedUser.email,
                            accessLevel: updatedUser.accessLevel,
                            profilePhotoFilename: updatedUser.profilePhotoFilename
                        })
                    })
                    .catch(updateErr => next(updateErr))
                })
            })
        })
        .catch(err => next(err))
    }
    else
    {
        // No password change, just update other fields
        if (email !== undefined)
        {
            // Check if email already exists for another user
            usersModel.findOne({ email: updateData.email, _id: { $ne: req.params.id } })
            .then(existingUser =>
            {
                if (existingUser)
                {
                    return next(createError(400, `Email is already in use by another account`))
                }

                usersModel.findByIdAndUpdate(req.params.id, updateData, { new: true })
                .then(updatedUser =>
                {
                    if (!updatedUser)
                    {
                        return next(createError(404, `User not found`))
                    }

                    res.json({
                        name: updatedUser.name,
                        email: updatedUser.email,
                        accessLevel: updatedUser.accessLevel,
                        profilePhotoFilename: updatedUser.profilePhotoFilename
                    })
                })
                .catch(err => next(err))
            })
            .catch(err => next(err))
        }
        else
        {
            usersModel.findByIdAndUpdate(req.params.id, updateData, { new: true })
            .then(updatedUser =>
            {
                if (!updatedUser)
                {
                    return next(createError(404, `User not found`))
                }

                res.json({
                    name: updatedUser.name,
                    email: updatedUser.email,
                    accessLevel: updatedUser.accessLevel,
                    profilePhotoFilename: updatedUser.profilePhotoFilename
                })
            })
            .catch(err => next(err))
        }
    }
})

router.delete(`/users/:id`, (req, res, next) =>
{
    const requesterAccessLevel = parseInt(req.query.accessLevel || 0)

    if (requesterAccessLevel !== ACCESS_LEVEL_ADMIN)
    {
        return next(createError(403, `Forbidden`))
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
    {
        return next(createError(400, `Invalid user id`))
    }

    usersModel.findByIdAndDelete(req.params.id)
    .then(data => res.json({ success: true, deleted: data }))
    .catch(err => next(err))
})


module.exports = router