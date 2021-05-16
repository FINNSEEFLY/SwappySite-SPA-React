const {Router} = require('express')
const auth = require('../middleware/auth')
const {insertLinkAndRules} = require("../models/Link");
const {getShortLinkId} = require("../models/Link");
const bcrypt = require('bcryptjs')
const {updateLink} = require("../models/Link");
const {deleteLink} = require("../models/Link");
const {getShortAndLongLinksAndCreationTimeByUserId} = require("../models/Link");
const {getLinkRulesForAllLinksByUserId} = require("../models/Link");
const {getStatsForAllLinksByUserId} = require("../models/Link");
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
            if ((await getShortLinkId(shortUrl)).result != null) {
                res.status(406).json({message: "Данная короткая ссылка уже существует"})
                return
            }
            if (password !== undefined && password === '') {
                res.status(406).json({message: "Заполните пароль"})
                return
            } else {
                if (password !== undefined) {
                    password = await bcrypt.hash(password, 10)
                }
            }
            if (clickLimit !== undefined && clickLimit < 0) {
                res.status(406).json({message: "Ограничение кликов должно быть положительным"})
                return
            }
            if (disabledOnDateTime !== undefined && disabledOnDateTime === '') {
                res.status(406).json({message: "Заполните дату и время"})
                return
            }
            if (longUrl.length <= 1) {
                res.status(406).json({message: "Заполните длинную ссылку"})
                return
            }
            await insertLinkAndRules(shortUrl, longUrl, req.user, {
                password: password,
                clickLimit: clickLimit,
                disabledOnDateTime: disabledOnDateTime
            })
            res.status(201).json({message: "Ссылка успешно добавлена"})
        } catch (e) {
            res.status(500).json({message: "Внутренняя ошибка сервера при создании ссылки"})
        }
    }
)
// /system/link/getAllLinks
router.post("/getAllLinks",
    auth,
    async (req, res) => {
        try {
            let statsForAllLinks = await getStatsForAllLinksByUserId(req.user)
            let rulesForAllLinks = await getLinkRulesForAllLinksByUserId(req.user)
            let baseLinksInfo = await getShortAndLongLinksAndCreationTimeByUserId(req.user)
            let allLinks = {
                forListInfo: baseLinksInfo, detailInfo: []
            };
            for (let i = 0; i < baseLinksInfo.length; i++) {
                allLinks.detailInfo.push({
                    stats: statsForAllLinks[i],
                    info: {...rulesForAllLinks[i], ...baseLinksInfo[i]}
                })
            }

            res.status(200).json(allLinks)
        } catch (e) {
            res.status(500).json({message: "Внутренняя ошибка сервера при получении ссылок"})
        }
    }
);

// /system/link/delete

router.post("/delete",
    auth,
    async (req, res) => {
        try {
            let result = await deleteLink(req.body.shortUrl)
            res.status(200).json({message: result.message})
        } catch (e) {
            res.status(500).json({message: "Внутренняя ошибка сервера при удалении сылки"})
        }
    }
);

// /system/link/update

router.post("/update",
    auth,
    async (req, res) => {
        try {
            let {
                longUrl,
                shortUrl,
                oldShortUrl,
                isDisabledLink,
                password,
                clicksToDisable,
                datetimeToDisable
            } = req.body
            if (systemRegExp.test(shortUrl)) {
                res.status(406).json({message: "Недопустимая ссылка /system зарезервирован"})
                return
            }
            if (!allowedUrls.test(shortUrl)) {
                res.status(406).json({message: "Короткая ссылка содержит недопустимые символы или длиннее 200 символов"})
                return
            }
            if ((await getShortLinkId(oldShortUrl)).result == null) {
                res.status(406).json({message: "Данная ссылка не существует"})
                return
            }
            if (oldShortUrl !== shortUrl) {
                if ((await getShortLinkId(shortUrl)).result != null) {
                    res.status(406).json({message: "Данная короткая ссылка уже существует"})
                    return
                }
            }
            if (password !== undefined && password === '') {
                res.status(406).json({message: "Заполните пароль"})
                return
            } else {
                if (password !== undefined) {
                    password = await bcrypt.hash(String(password), 10)
                }
            }
            if (clicksToDisable !== undefined && clicksToDisable < 0) {
                res.status(406).json({message: "Ограничение кликов должно быть положительным"})
                return
            }
            if (datetimeToDisable !== undefined && datetimeToDisable === '') {
                res.status(406).json({message: "Заполните дату и время"})
                return
            }
            if (longUrl.length <= 1) {
                res.status(406).json({message: "Заполните длинную ссылку"})
                return
            }
            await updateLink(oldShortUrl, shortUrl, longUrl, {
                password: password,
                clicksToDisable: clicksToDisable,
                datetimeToDisable: datetimeToDisable,
                isDisabledLink: isDisabledLink
            })
            res.status(200).json({message: "Ссылка успешно обновлена"})
        } catch (e) {
            res.status(500).json({message: "Внутренняя ошибка сервера при обновлении ссылки"})
        }
    }
);