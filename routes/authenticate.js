const {Router} = require('express')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const {check, validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')

const router = Router()

module.exports = router

// /system/auth/register
router.post(
    '/register',
    [
        check('email', 'Некорректный email').normalizeEmail().isEmail(),
        check('password', 'Пароль должен состоять как минимум из 6 символов').isLength({min: 6}),
        check('login', "Логин должен может содержать только латинские буквы символ тире и знак подчеркивания").custom(
            value => {
            const regExp = /^[a-zA-Z0-9_-]+$/
            return regExp.test(value)
        }
        )
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                let errList = "Ошибка при регистрации"
                    for (let err of errors.errors) {
                        errList = errList + '<br/>'+ err.msg
                    }
                return res.status(400).json({
                    errors: errors.array(),
                    message: errList
                })
            }

            const {email, password, login} = req.body
            const isUserAlreadyExist = await User.isUserAlreadyExist(email, login);
            if (!isUserAlreadyExist.result) {
                return res.status(400).json({message: isUserAlreadyExist.message})
            }

            const hashedPass = await bcrypt.hash(password, 10)
            const getUserResult = await User.createNewUser(login, email, hashedPass)
            const token = jwt.sign(
                {userId: getUserResult},
                config.get('jwtSecret'),
                {expiresIn: '1h'}
            )
            res.status(201).json({token, userId: getUserResult, message: "Пользователь успешно создан"})

        } catch (e) {
            res.status(500).json({message: "Внутренняя ошибка сервера при регистрации"})
        }
    })

// /system/auth/login
router.post(
    '/login',
    [
        check('password', 'Пароль должен состоять как минимум из 6 символов').isLength({min: 6}),
        check('login', "Логин должен может содержать только латинские буквы символ тире и знак подчеркивания").custom(value => {
            const regExp = /^[a-zA-Z0-9_-]+$/
            return regExp.test(value)
        })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status((400).json({
                    errors: errors.array(),
                    message: "Некорректные данные при авторизации"
                }))
            }
            const {login, password} = req.body

            let getUserResult = await User.getUserByLogin(login);
            if (getUserResult.result === null) {
                return res.status(400).json({message: "Неверный логин или пароль"})
            }

            const isMatch = await bcrypt.compare(password, getUserResult.result.password)
            if (!isMatch) {
                return res.status(400).json({message: "Неверный логин или пароль"})
            }

            const token = jwt.sign(
                {userId: getUserResult.result.userId},
                config.get('jwtSecret'),
                {expiresIn: '1h'}
            )
            res.json({token, userId: getUserResult.result.userId})
        } catch (e) {
            res.status(500).json({message: "Внутренняя ошибка сервера при регистрации"})
        }
    })