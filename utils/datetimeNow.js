const moment = require("moment");

function getDateTimeNow () {
    return moment().format('YYYY-MM-DD HH:mm:ss');
}

module.exports.getDateTimeNow = getDateTimeNow;