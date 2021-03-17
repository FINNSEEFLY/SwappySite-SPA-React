const moment = require("moment");

function compareMySqlDateAndNow (mysqlDateTime) {
    return new Date(moment(mysqlDateTime,'YYYY-MM-DD HH:mm:ss',true).format())>new Date()
}

module.exports.compareMySqlDateAndNow = compareMySqlDateAndNow;