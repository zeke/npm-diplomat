var nodemailer = require("nodemailer")

var transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "support@npmjs.com",
    pass: process.env.GMAIL_PASSWORD
  }
})

var mailer = module.exports = function(options, callback) {
  options.from = "npm Support <support@npmjs.com>"

  if (!options.to || !options.subject || !options.text) {
    console.log(options)
    throw("Missing some required options")
  }

  transporter.sendMail(options, callback)
}
