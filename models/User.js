const {mySqlConnectionPool} = require('./MySqlPull')
const REQUEST_IS_LOGIN_ALREADY_EXIST = 'SELECT u_id FROM user WHERE u_login = ?'
const REQUEST_IS_EMAIL_ALREADY_EXIST = 'SELECT u_id FROM user WHERE u_email = ?'
const REQUEST_INSERT_USER = 'INSERT INTO user (u_login, u_email, u_hash) VALUES (?,?,?)'
const REQUEST_GET_USER_BY_LOGIN = 'SELECT u_id, u_login, u_hash FROM user WHERE u_login = ?'

async function isUserAlreadyExist(email, login) {
    try {
        let result = {result: false, message: ""}
        let sqlResult = await mySqlConnectionPool.execute(REQUEST_IS_LOGIN_ALREADY_EXIST, [login])
        if (sqlResult[0].length !== 0) {
            result.message = "Пользователь с таким логином уже зарегистрирован"
            return result;
        }
        sqlResult = await mySqlConnectionPool.execute(REQUEST_IS_EMAIL_ALREADY_EXIST, [email])
        if (sqlResult[0].length !== 0) {
            result.message = "Пользователь с таким email'ом уже зарегистрирован"
            return result
        }
        result.result = true;
        return result
    } catch (e) {
        console.log(`Error in (isUserAlreadyExist: login=${login}, email=${email});\nMessage:${e.message}`)
        throw e
    }
}

async function createNewUser(login, email, password) {
    try {
        return (await mySqlConnectionPool.execute(REQUEST_INSERT_USER, [login, email, password]))[0].insertId
    } catch (e) {
        console.log(`Error in (createNewUser: login=${login}, email=${email}, password = ${password});\nMessage:${e.message}`)
        throw e
    }
}

async function getUserByLogin(login) {
    try {
        let result = {result: null, message: ""}
        let sqlResult = await mySqlConnectionPool.execute(REQUEST_GET_USER_BY_LOGIN, [login])
        if (sqlResult[0].length === 0) {
            result.message = "Пользователь с данным логином отсутствует"
            return result
        }
        result.result =
            {
                login: sqlResult[0][0]['u_login'],
                password: sqlResult[0][0]['u_hash'],
                userId: sqlResult[0][0]['u_id']
            }
        return result;

    } catch (e) {
        console.log(`Error in (getUserByLogin: login=${login});\nMessage:${e.message}`)
        throw e
    }
}

module.exports.isUserAlreadyExist = isUserAlreadyExist
module.exports.createNewUser = createNewUser
module.exports.getUserByLogin = getUserByLogin


