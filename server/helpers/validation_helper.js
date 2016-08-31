'use strict'

const validator = require('validator')

const isUrlSafe = name => value => {
  if (!validator.matches(value, /^[A-Za-z0-9\-_]+$/))
    throw new Error(`${ name } must be URL safe (use hyphens instead of spaces, like "my-cool-name")`)
}

const isArray = name => arr => {
  if (!Array.isArray(arr))
    throw new Error(`${ name } must be an array`)
}

const isArrayOfStrings = name => arr => {
  arr.forEach(item => {
    if (typeof item !== 'string')
      throw new Error(`${ name } must be string values`)
  })
}

const notEmptyOrInList = (value, list) => {
  if (!Array.isArray(list)) return false

  return value !== '' && !list.includes(value)
}

module.exports = {
  isUrlSafe,
  isArray,
  isArrayOfStrings,
  notEmptyOrInList
}
