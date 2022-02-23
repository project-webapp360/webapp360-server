const {Router} = require('express')
const router = Router()
const path = require("path");

router.get('/', (req, res) => {
    console.log('Hello, React!')
    // res.sendFile(path.join(__dirname, '../front/build/index.html'));
    res.sendFile("C:/Users/ASUS_/WebstormProjects/intspirit/SPA-WebApp360-M2/front/build/index.html")
})

module.exports = router