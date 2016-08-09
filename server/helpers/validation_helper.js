'use strict'

const validator = require('validator')

const isUrlSafe = value => {
  if (!validator.matches(value, /^[A-Za-z0-9\-_]+$/))
    throw new Error('Must be URL safe (use hyphens instead of spaces, like "my-cool-username")')
}

const isArray = arr => {
  if (!Array.isArray(arr))
    throw new Error('Actions must be an array.')
}

const isArrayOfStrings = arr => {
  arr.forEach(item => {
    if (typeof item !== 'string')
      throw new Error('Actions must be string values.')
  })
}

const notEmptyOrInList = (value, list) => {
  if (!Array.isArray(list)) return false

  return value !== '' && !list.includes(value)
}

Object.assign(exports, {
  isUrlSafe,
  isArray,
  isArrayOfStrings,
  notEmptyOrInList
})
