const moment = require("moment");

function convertUTCTimeToMySqlDateTime (utcString) {
    let date = new Date(utcString)
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
}

module.exports.convertUTCTimeToMySqlDateTime = convertUTCTimeToMySqlDateTime;