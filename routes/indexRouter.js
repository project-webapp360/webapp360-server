const {Router} = require('express')
const router = Router()
const path = require("path");

router.get('/', (req, res) => {
    console.log('Hello, React!')
    // res.sendFile(path.join(__dirname, '../front/build/index.html'));
    res.sendFile("C:/Users/Timur/projects_js/webapp360-client/public/index.html")
})

module.exports = router