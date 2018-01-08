'use strict'

const nodemailer = require('nodemailer')
const sesTransport = require('nodemailer-ses-transport')
const EmailTemplate = require('email-templates').EmailTemplate
const config = require('../../config/server')

const transporter = nodemailer.createTransport(sesTransport({
  accessKeyId: config.email.sesAccessKeyId,
  secretAccessKey: config.email.sesSecretAccessKey,
  region: config.email.sesRegion,
  rateLimit: config.email.sesRateLimit
}))

const sendEmail = ({
  to = '',
  subject = '',
  html = '',
  text = ''
}) => transporter.sendMail({
  to,
  from: config.email.from,
  subject,
  html,
  text
}).then(res => res.messageId)

const renderTemplate = (templateName, data) => {
  const template = new EmailTemplate(`${ config.email.templateDir }/${ templateName }`)

  return template.render(data)
}

module.exports = {
  sendEmail,
  renderTemplate
}
