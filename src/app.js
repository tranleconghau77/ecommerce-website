const express = require("express")
const morgan = require("morgan")
const app = express()

// init middlewares
app.use(morgan("dev"))

// init db

// init router
app.get("/", (req, res, next) => {
    return res.status(200).json({ message: "Welcome Ecommerce Server" })
})

// handle error

module.exports = app