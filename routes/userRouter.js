const {Router} = require('express')
const router = Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middlewares/authMiddleware')
const roleMiddleware = require('../middlewares/roleMiddleware')
const path = require("path");


router.post('/register', userController.registration)
router.post('/login', userController.login)
router.post('/user/delete', userController.deleteUser)
// router.get('/users', roleMiddleware('ADMIN'), userController.getAllUsers)
router.get('/users', userController.getAllUsers)
router.get('/token/refresh', userController.refreshToken)
router.post('/token/delete', userController.deleteToken)


router.post('/event/create', userController.eventCreate)
router.post('/event/create/user', userController.eventCreateUser)
router.get('/event/delete/:id', userController.eventDelete)
router.get('/event/events', userController.getAllEvents)
router.post('/event/events/user', userController.getAllEventsUser)
router.post('/event/delete/user', userController.eventDeleteUser)

router.post('/results/set/user', userController.resultsSetUser)
router.post('/results/get/user', userController.resultsGetUser)


router.get('/activate/:link', userController.activate)

router.get('/testing/create', userController.testingCreateRoute)
router.get('/testing/delete', userController.testingDeleteRoute)

module.exports = router