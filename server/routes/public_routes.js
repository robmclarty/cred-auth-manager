'use strict'

const router = require('express').Router()

// Homepage. Loads the index.html file to launch the front-end client UI.
router.route('/')
  .get((req, res) => {
    const assetsPath = req.app.get('assets-path')
    res.sendFile('index.html', { root: assetsPath })
  })

module.exports = router
