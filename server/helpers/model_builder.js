'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')

const getModelFiles = dir => fs.readdirSync(dir)
  .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js'))
  .map(file => path.join(dir, file))

// Take an array of sequelize model files and load/init them with sequelize and
// return an object containing each model as an attribute.
const modelBuilder = (customDir, url, dialect) => new Promise((resolve, reject) => {
  const sequelize = new Sequelize(url, { dialect, logging: false })
  const models = {}
  const customFiles = customDir ? getModelFiles(customDir) : []
  const coreFiles = getModelFiles(path.resolve('server', 'models'))
  const files = [...customFiles, ...coreFiles]

  files.forEach(file => {
    const model = sequelize.import(file)

    models[model.name] = model

    console.log('Loaded model ', model.name)
  })

  Object.keys(models).forEach(modelName => {
    if ('associate' in models[modelName]) models[modelName].associate(models)
  })

  models.sequelize = sequelize
  models.Sequelize = Sequelize

  resolve(models)
})

module.exports = modelBuilder
