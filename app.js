const express = require('express')
const config = require('config')
const {makeRandomShortLink} = require("./models/Link");
const hbs = require("hbs");
const expressHbs = require("express-handlebars");
const {routeSomeLink} = require("./models/Link");
const path = require('path')
const {authLinkAccess} = require("./models/Link");
const {receiveStatistics} = require("./models/Link");

const app = express()
const PORT = config.get('port') || 80

app.set("view engine", "hbs");
app.set("views", "res/views");
hbs.registerPartials(__dirname + "/res/views/partials");
app.engine("hbs", expressHbs(
    {
        layoutsDir: "res/views/patterns",
        defaultLayout: "pattern",
        extname: "hbs"
    }
))

app.use(express.json({extended: true}))

app.use('/system/auth/', require('./routes/authenticate'))

app.use('/system/link/', require('./routes/linkManage'))

// Static Files Delivery
app.use('/system/styles', express.static(`${__dirname}/res/css`));
app.use('/system/fonts', express.static(`${__dirname}/res/fonts`));
app.use('/system/img', express.static(`${__dirname}/res/img`));
app.use('/system/scripts', express.static(`${__dirname}/res/scripts`));

async function start() {
    try {
        app.listen(PORT, () => console.log(`Server has been started on port ${PORT}`))
    } catch (e) {
        console.log(`Server Error(start): ${e.message}`)
        process.exit(1)
    }
}

// Random Link Requests
app.post("/system/randomShortLinkModel", makeRandomShortLink)

// Receiving Stats
app.post("/system/sendStatsInfo", receiveStatistics);

//Manage Pass Redirect
app.post("/system/sendPasswordToRedirect",authLinkAccess)

app.use('/', express.static(path.join(__dirname, 'client', 'build')))
app.get('(/system/register)|(/system/login/)|(/system/myLinks)|(/system/createLinks)', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
})

// Managed Links Routing
app.use(routeSomeLink);


start();
