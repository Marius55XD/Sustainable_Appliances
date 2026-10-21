
require(`dotenv`).config({path:`./config/.env`})
require(`./config/db`)


const express = require(`express`)
const app = express()
const path = require(`path`)
const createError = require('http-errors')

app.use(require(`body-parser`).json())
app.use(require(`cors`)({credentials: true, origin: process.env.LOCAL_HOST}))
app.use(`/uploads`, express.static(path.resolve(process.env.UPLOADED_FILES_FOLDER || `./uploads`)))


app.use(require(`./routes/products`))
app.use(require(`./routes/users`))
app.use(require(`./routes/sales`))



app.listen(process.env.SERVER_PORT, () => 
{
    console.log(`Connected to port ` + process.env.SERVER_PORT)
})


//ERROR HANDLING
//404 errors if page not found
app.use((req, res, next) => {next(createError(404))})

//Handles all other errors
app.use(function (err, req, res, next)
{
    console.error(err.message)
    if (!err.statusCode) 
    {
        err.statusCode = 500
    }
    //Sends the error message back to the client
    res.status(err.statusCode).send(err.message)
})