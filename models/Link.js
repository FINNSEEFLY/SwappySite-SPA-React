const moment = require("moment");
const {getRandomString} = require("../utils/randomStringMaker")
const {mySqlConnectionPool} = require("./MySqlPull")
const {getDateTimeNow} = require("../utils/datetimeNow")
const config = require('config')
const bcrypt = require('bcryptjs')
const {compareMySqlDateAndNow} = require("../utils/compareMySqlDateAndNow");
const {convertUTCTimeToMySqlDateTime} = require("../utils/convertUTCTimeToMySqlDateTime");

const REQUEST_GET_SHORT_LINK_ID_BY_NAME = `SELECT sl_id
                                           FROM swappydb.short_link
                                           WHERE sl_short_url = ?`

const REQUEST_GET_LONG_LINKS_BY_SHORT_LINK_ID = 'SELECT ll_long_url FROM swappydb.long_link WHERE ll_sl_id = ?'

const REQUEST_GET_ACTIVE_RULES_BY_SHORT_LINK_ID = `SELECT r_id, rd_name, r_param
                                                   FROM swappydb.rules,
                                                        swappydb.rules_definition
                                                   WHERE r_short_url_id = ?
                                                     AND r_rule_id = rules_definition.rd_id
                                                     AND r_is_active = true`

const REQUEST_GET_RULE_ID = `SELECT rd_id
                             FROM swappydb.rules_definition
                             WHERE rd_name = ?`

const REQUEST_INSERT_SHORT_LINK = `INSERT INTO swappydb.short_link(sl_short_url, sl_user_id, sl_creation_time)
                                   VALUES (?, ?, ?)`

const REQUEST_INSERT_LONG_LINK = `INSERT INTO swappydb.long_link(ll_long_url, ll_sl_id, ll_creation_time)
                                  VALUES (?, ?, ?)`

const REQUEST_INSERT_STATS = `INSERT INTO swappydb.stats(s_sl_id, s_date_time, s_url_referrer, s_platform,
                                                         s_screen_width,
                                                         s_screen_height,
                                                         s_ip_address)
                              VALUES (?, ?, ?, ?, ?, ?, ?)`

const REQUEST_INSERT_RULE = `INSERT INTO swappydb.rules(r_short_url_id, r_param, r_is_active, r_rule_id)
                             VALUES (?, ?, true, ?)`

const REQUEST_UPDATE_RULE_PARAM = `UPDATE swappydb.rules
                                   SET r_param = ?
                                   WHERE r_id = ?`


const REQUEST_GET_SHORT_LINKS_ID_BY_USER_ID = `SELECT sl_id
                                               FROM swappydb.short_link
                                               WHERE sl_user_id = ?`

const REQUEST_GET_STATS_BY_SHORT_LINK_ID = `SELECT s_url_referrer,
                                                   s_date_time,
                                                   s_platform,
                                                   s_screen_width,
                                                   s_screen_height,
                                                   s_ip_address
                                            FROM swappydb.stats
                                            WHERE s_sl_id = ?`

const REQUEST_GET_SHORT_AND_LONG_LINK_AND_CREATION_TIME_BY_USER_ID = `SELECT sl_short_url, ll_long_url, sl_creation_time
                                                                      FROM swappydb.short_link
                                                                               LEFT JOIN swappydb.long_link ll on short_link.sl_id = ll.ll_sl_id
                                                                      WHERE sl_user_id = ?`

const REQUEST_DELETE_SHORT_LINK_BY_URL = `DELETE
                                          FROM swappydb.short_link
                                          WHERE sl_short_url = ?`

async function makeRandomShortLink(req, res) {
    try {
        const longLink = req.body.link
        let randomLink;
        do {
            randomLink = getRandomString(8);
        } while (((await getShortLinkId(randomLink)).result))
        await insertRandomLink(randomLink, longLink)
        res.status(201).json({message: randomLink})
    } catch (e) {
        return res.status(500).json({message: "Внутренняя ошибка сервера при генерации ссылки"})
    }
}

async function getShortLinkId(shortLink) {
    try {
        let result = {result: null, message: ""}
        const data = await mySqlConnectionPool.execute(REQUEST_GET_SHORT_LINK_ID_BY_NAME, [shortLink])
        if (data[0].length === 0) {
            result.message = "Ссылка не найдена"
            return result
        }
        result = {result: data[0][0]['sl_id']}
        return result
    } catch (e) {
        console.log(`Error in (getShortLinkId: shortLink=${shortLink};\nMessage:${e.message}`)
        throw e
    }
}

async function insertLink(shortLink, longLink, userId) {
    let dateTimeNow = getDateTimeNow()
    try {
        const data = await mySqlConnectionPool.execute(REQUEST_INSERT_SHORT_LINK, [shortLink, userId, dateTimeNow])
        await mySqlConnectionPool.execute(REQUEST_INSERT_LONG_LINK, [longLink, data[0].insertId, dateTimeNow])
        return data[0].insertId
    } catch (e) {
        console.log(`Error in (insertLink: shortLink=${shortLink}, longLink=${longLink}, userId=${userId};\nMessage:${e.message}`)
        throw e
    }
}

async function insertRandomLink(shortLink, longLink) {
    try {
        let swappyId = config.get("swappyUserId")
        return await insertLink(shortLink, longLink, swappyId)
    } catch (e) {
        console.log(`Error in (insertRandomLink: shortLink=${shortLink}, longLink=${longLink};\nMessage:${e.message}`)
        throw e
    }
}

async function getLongLinksByShortLinkId(id) {
    try {
        let result = {result: [], message: ""}
        const data = await mySqlConnectionPool.execute(REQUEST_GET_LONG_LINKS_BY_SHORT_LINK_ID, [id])
        if (data[0].length === 0) {
            result.message = "С данной короткой ссылкой не связаны длинные ссылки"
            return result
        }
        for (let item of data[0]) {
            result.result.push({link: item['ll_long_url']})
        }
        return result
    } catch (e) {
        console.log(`Error in (getLongLinksByShortLinkId: id=${id};\nMessage:${e.message}`)
        throw e
    }
}

async function getActiveRulesByShortLinkId(id) {
    try {
        let result = {result: [], message: ""}
        const data = await mySqlConnectionPool.execute(REQUEST_GET_ACTIVE_RULES_BY_SHORT_LINK_ID, [id])
        for (let item of data[0]) {
            result.result.push({name: item["rd_name"], param: item["r_param"], id: item["r_id"]})
        }
        return result
    } catch (e) {
        console.log(`Error in (getActiveRulesByShortLinkId: id=${id};\nMessage:${e.message}`)
        throw e
    }
}

async function updateRuleParam(id, param) {
    try {
        await mySqlConnectionPool.execute(REQUEST_UPDATE_RULE_PARAM, [param, id])
    } catch (e) {
        console.log(`Error in (updateRuleParam: id=${id}, param=${param};\nMessage:${e.message}`)
        throw e
    }
}

async function routeSomeLink(req, res) {
    const link = req.url.replace("/", "");
    try {
        let result = await getShortLinkId(link);
        if (!result.result) {
            res.redirect("/")
            return
        }
        const shortLinkId = result.result
        result = await getLongLinksByShortLinkId(shortLinkId)
        if (result.result.length === 0) {
            res.redirect("/")
            return
        }
        const longLinks = result.result
        result = await getActiveRulesByShortLinkId(shortLinkId)
        const rules = result.result
        let passwordRequired = false
        for (let rule of rules) {
            switch (rule.name) {
                case 'clicks-before-disabling':
                    if (rule.param <= 0) {
                        res.redirect("/")
                        return
                    } else {
                        await updateRuleParam(rule.id, rule.param - 1)
                    }
                    break
                case 'will-be-disabled-on-datetime':
                    if (!compareMySqlDateAndNow(rule.param)) {
                        res.redirect("/")
                        return
                    }
                    break
                case 'password-required':
                    passwordRequired = true
                    break
            }
        }
        if (!passwordRequired) {
            res.render("fastRedirect", {
                layout: false,
                next_link: longLinks.pop().link,
            })
        } else {
            res.render("passRedirect", {layout: false, title: "Введите пароль"})
        }
    } catch (e) {
        return res.status(500).json({message: `Внутренняя ошибка сервера при поиске ссылки ${e.stackTrace}`})
    }
}

async function authLinkAccess(req, res) {
    try {
        let {shortUrl, password} = req.body
        if (shortUrl === undefined || password === undefined) {
            res.sendStatus(401)
            return
        }
        shortUrl = shortUrl.replace("/", "")
        const data = await getShortLinkId(shortUrl)
        if (data.result == null) {
            res.sendStatus(404)
            return
        }
        const rules = await getActiveRulesByShortLinkId(data.result)
        if (rules.result.isEmpty) {
            res.sendStatus(404)
            return
        }
        let passwordRule = rules.result.find(x => x.name === "password-required")
        if (!await bcrypt.compare(password, passwordRule.param)) {
            res.sendStatus(401);
            return
        }
        let longLinkResult = await getLongLinksByShortLinkId(data.result)
        if (longLinkResult.result.isEmpty) {
            res.sendStatus(404)
            return
        }
        res.json({link: longLinkResult.result.pop().link})
    } catch (e) {
        return res.status(500).json({message: `Внутренняя ошибка сервера при обработке пароля ${e.stackTrace}`})
    }
}

async function receiveStatistics(req, res) {
    try {
        const stats = {
            shortLink: req.body.url_from.replace("/", ""),
            dateTime: getDateTimeNow(),
            referrer: req.body.url_referrer,
            platform: req.body.platform,
            width: req.body.screen_width,
            height: req.body.screen_height,
            ip: req.ip === "::1" ? "::ffff:127.0.0.1" : "req.ip"
        }
        let result = await getShortLinkId(stats.shortLink)
        if (!result.result) {
            throw new Error({message: "Не найдена ссылка"})
        }
        stats.shortLinkId = result.result
        result = await insertStats(stats)
        if (result !== undefined) {
            res.sendStatus(200)
        }
    } catch (e) {
        return res.status(500).json({message: `Внутренняя ошибка сервера при обработке ссылки ${e.stackTrace}`})
    }
}

async function insertStats(stats) {
    try {
        return (await mySqlConnectionPool.execute(REQUEST_INSERT_STATS,
            [stats.shortLinkId, stats.dateTime, stats.referrer, stats.platform,
                stats.width, stats.height, stats.ip]))[0].insertId
    } catch (e) {
        console.log(`Error in (insertStats: stats=${JSON.stringify(stats)};\nMessage:${e.message}`)
        throw e
    }
}

async function getRuleIdByName(ruleName) {
    try {
        let result = {result: null, message: ""}
        const data = await mySqlConnectionPool.execute(REQUEST_GET_RULE_ID, [ruleName])
        if (data[0].length === 0) {
            result.message = "Правило не найдено"
            return result
        }
        result.result = data[0][0]['rd_id']
        return result
    } catch (e) {
        console.log(`Error in (getRuleIdByName: ruleName=${ruleName};\nMessage:${e.message}`)
        throw e
    }
}

async function insertRule(shortUrlId, param, ruleId) {
    try {
        let result = {result: null, message: ""}
        const data = await mySqlConnectionPool.execute(REQUEST_INSERT_RULE, [shortUrlId, param, ruleId])
        if (data[0].insertId === undefined) {
            result.message = "Не удалось добавить правило"
            return result
        }
        result.result = data[0].insertId
        return result
    } catch (e) {
        console.log(`Error in (insertRule: shortUrlId=${shortUrlId}, param=${param}, ruleId=${ruleId};\nMessage:${e.message}`)
        throw e
    }
}

async function insertLinkAndRules(shortLink, longLink, userId, rules) {
    try {
        const shortLinkId = await insertLink(shortLink, longLink, userId)
        if (rules.password !== undefined) {
            let data = await getRuleIdByName('password-required')
            if (data.result === null) {
                throw new Error("Не удалось добавить пароль")
            }
            data = await insertRule(shortLinkId, rules.password, data.result)
            if (data.result === null) {
                throw new Error("Не удалось добавить пароль")
            }
        }
        if (rules.clickLimit !== undefined) {
            let data = await getRuleIdByName('clicks-before-disabling')
            if (data.result === null) {
                throw new Error("Не удалось добавить ограничение по кликам")
            }
            data = await insertRule(shortLinkId, rules.clickLimit, data.result)
            if (data.result === null) {
                throw new Error("Не удалось добавить ограничение по кликам")
            }
        }
        if (rules.disabledOnDateTime !== undefined) {
            let data = await getRuleIdByName('will-be-disabled-on-datetime')
            if (data.result === null) {
                throw new Error("Не удалось добавить ограничение по времени")
            }
            let disabledOnDateTime = convertUTCTimeToMySqlDateTime(rules.disabledOnDateTime)
            data = await insertRule(shortLinkId, disabledOnDateTime, data.result)
            if (data.result === null) {
                throw new Error("Не удалось добавить ограничение по времени")
            }
        }
        return true
    } catch (e) {
        console.log(`Error in (insertLinkAndRules: shortLink=${shortLink}, longLink=${longLink}, userId=${userId} rules=${JSON.stringify(rules)};\nMessage:${e.message}`)
        throw e
    }

}


async function getStatsForLinkByShortLinkId(shortLinkId) {
    try {
        let result = {result: [], message: ""}
        const statsFromDb = await mySqlConnectionPool.execute(REQUEST_GET_STATS_BY_SHORT_LINK_ID, [shortLinkId])
        if (statsFromDb[0].length === 0) {
            result.message = "Статистики нет"
            return result
        }
        let data = statsFromDb[0];
        for (let statLine of data) {
            result.result.push({
                referrer: statLine.s_url_referrer,
                datetime: moment(statLine.s_date_time).format("DD-MM-YYYY HH:mm:ss"),
                platform: statLine.s_platform,
                screenWidth: statLine.s_screen_width,
                screenHeight: statLine.s_screen_height,
                ipAddress: String(statLine.s_ip_address).match(/::ffff:(([0-9]{0,3}\.){3}[0-9]{0,3})/)[1]
            })
        }
        return result
    } catch (e) {
        console.log(`Error in (getStatsForLinkByShortLinkId: shortLinkId=${shortLinkId}\nMessage:${e.message}`)
        throw e
    }
}

async function getStatsForAllLinksByUserId(userId) {
    try {
        let result = {result: [], message: ""}
        const ShortLinksIDFromDB = await mySqlConnectionPool.execute(REQUEST_GET_SHORT_LINKS_ID_BY_USER_ID, [userId])
        if (ShortLinksIDFromDB[0].length === 0) {
            result.message = "Ссылок нет"
            return result.result
        }
        for (let shortLinkId of ShortLinksIDFromDB[0]) {
            result.result.push((await getStatsForLinkByShortLinkId(shortLinkId.sl_id)).result)
        }
        return result.result
    } catch (e) {
        console.log(`Error in (getStatsForAllLinksByUserId: userId=${userId}\nMessage:${e.message}`)
        throw e
    }
}

async function getLinkRulesByShortLinkId(shortLinkId) {
    try {
        let result = {result: {}, message: ""}
        const rules = await mySqlConnectionPool.execute(REQUEST_GET_ACTIVE_RULES_BY_SHORT_LINK_ID, [shortLinkId])
        if (rules[0].length === 0) {
            result.message = "Правил нет"
            return result
        }
        for (let rule of rules[0]) {
            switch (rule.rd_name) {
                case "password-required":
                    result.result.password = true
                    break;
                case "disabled":
                    result.result.disabled = rule.r_param
                    break;
                case "will-be-disabled-on-datetime":
                    result.result.datetimeToDisable = rule.r_param
                    break;
                case "clicks-before-disabling":
                    result.result.clicksToDisable = rule.r_param
                    break;
            }
        }
        return result
    } catch (e) {
        console.log(`Error in (getLinkRulesByShortLinkId: shortLinkId=${shortLinkId}\nMessage:${e.message}`)
        throw e
    }
}

async function getLinkRulesForAllLinksByUserId(userId) {
    try {
        let result = {result: [], message: ""}
        const ShortLinksIDFromDB = await mySqlConnectionPool.execute(REQUEST_GET_SHORT_LINKS_ID_BY_USER_ID, [userId])
        if (ShortLinksIDFromDB[0].length === 0) {
            result.message = "Ссылок нет"
            return result.result
        }
        for (let shortLinkId of ShortLinksIDFromDB[0]) {
            result.result.push((await getLinkRulesByShortLinkId(shortLinkId.sl_id)).result)
        }
        return result.result
    } catch (e) {
        console.log(`Error in (getLinkRulesForAllLinksByUserId: userId=${userId}\nMessage:${e.message}`)
        throw e
    }
}

async function getShortAndLongLinksAndCreationTimeByUserId(userId) {
    try {
        let result = {result: [], message: ""}
        const data = await mySqlConnectionPool.execute(REQUEST_GET_SHORT_AND_LONG_LINK_AND_CREATION_TIME_BY_USER_ID, [userId])
        if (data[0].length === 0) {
            result.message = "Ссылок нет"
            return result
        }
        for (let row of data[0]) {
            result.result.push({
                shortUrl: row.sl_short_url,
                longUrl: row.ll_long_url,
                creationTime: moment(row.sl_creation_time).format("DD-MM-YYYY HH:mm:ss"),
            })
        }
        return result.result
    } catch (e) {
        console.log(`Error in (getShortAndLongLinksAndCreationTimeByUserId: userId=${userId}\nMessage:${e.message}`)
        throw e
    }
}

async function deleteLink(shortLink) {
    try {
        let result = {result: [], message: ""}
        await mySqlConnectionPool.execute(REQUEST_DELETE_SHORT_LINK_BY_URL, [shortLink])
        result.message = "Ссылка удалена"
        return result
    } catch (e) {
        console.log(`Error in (deleteLink: shortLink=${shortLink}\nMessage:${e.message}`)
        throw e
    }
}

module.exports.deleteLink = deleteLink
module.exports.getShortAndLongLinksAndCreationTimeByUserId = getShortAndLongLinksAndCreationTimeByUserId
module.exports.getLinkRulesForAllLinksByUserId = getLinkRulesForAllLinksByUserId
module.exports.getStatsForAllLinksByUserId = getStatsForAllLinksByUserId
module.exports.authLinkAccess = authLinkAccess
module.exports.insertLinkAndRules = insertLinkAndRules
module.exports.insertLink = insertLink
module.exports.receiveStatistics = receiveStatistics
module.exports.getShortLinkId = getShortLinkId
module.exports.makeRandomShortLink = makeRandomShortLink
module.exports.routeSomeLink = routeSomeLink