function getRandomString(numOfLetters) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < numOfLetters; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}

module.exports.getRandomString = getRandomString