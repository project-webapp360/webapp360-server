const {Router} = require('express')
const router = Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware')
const roleMiddleware = require('../middlewares/roleMiddleware')
const path = require("path");


router.post('/register', userController.registration )
router.post('/login', userController.login )
router.get('/users', roleMiddleware('ADMIN'), userController.getAllUsers)
router.get('/token/refresh', userController.refreshToken)
router.post('/token/delete', userController.deleteToken)


router.post('/event/create', userController.eventCreate)
router.get('/event/delete/:id', userController.eventDelete)
router.get('/event/events', userController.getAllEvents)

router.get('/activate/:link', userController.activate)

module.exports = router