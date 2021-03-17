const {Router} = require('express')
const auth = require('../middleware/auth')
const {insertLinkAndRules} = require("../models/Link");
const {getShortLinkId} = require("../models/Link");
const bcrypt = require('bcryptjs')
const router = Router()
const systemRegExp = /^((\/)?system)/
const allowedUrls = /^[\/a-zA-Z0-9_\-%]{1,200}$/

module.exports = router


// /system/link/create
router.post(
    '/create',
    auth,
    async (req, res) => {
        try {
            let {longUrl, shortUrl, password, clickLimit, disabledOnDateTime} = req.body
            if (systemRegExp.test(shortUrl)) {
                res.status(406).json({message: "Недопустимая ссылка /system зарезервирован"})
                return
            }
            if (!allowedUrls.test(shortUrl)) {
                res.status(406).json({message: "Короткая ссылка содержит недопустимые символы или длиннее 200 символов"})
                return
            }
            if ((await getShortLinkId(shortUrl)).result!=null) {
                res.status(406).json({message: "Данная короткая ссылка уже существует"})
                return
            }
            if (password!==undefined && password==='') {
                res.status(406).json({message: "Заполните пароль"})
                return
            } else {
                if (password!==undefined) {
                    password = await bcrypt.hash(password, 10)
                }
            }
            if (clickLimit!==undefined && clickLimit<0) {
                res.status(406).json({message: "Ограничение кликов должно быть положительным"})
                return
            }
            if (disabledOnDateTime!==undefined && disabledOnDateTime==='') {
                res.status(406).json({message: "Заполните дату и время"})
                return
            }
            if (longUrl.length<=1) {
                res.status(406).json({message: "Заполните длинную ссылку"})
                return
            }
            await insertLinkAndRules(shortUrl,longUrl,req.user.userId,{password: password, clickLimit: clickLimit, disabledOnDateTime: disabledOnDateTime})
            res.status(201).json({message:"Ссылка успешно добавлена"})
        } catch (e) {
            res.status(500).json({message: "Внутренняя ошибка сервера при создании ссылки"})
        }
    }
)