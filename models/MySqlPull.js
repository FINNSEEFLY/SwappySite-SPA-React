const config = require('config')
const {createPool} = require('mysql2/promise')

const mySqlConnectionPool = createPool(config.get("mySqlConfig"))

module.exports.mySqlConnectionPool = mySqlConnectionPool