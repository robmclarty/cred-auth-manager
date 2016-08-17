let config = require('./development.json')

// By default, use the dev environment. If 'production' is explicitly specified,
// use the special production config variables instead.
if (process.env.NODE_ENV === 'production') config = require('./production.json')

module.exports = config
