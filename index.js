#!/usr/bin/env node

require("./lib/config")()
var fs = require("fs")
var path = require("path")
var prompt = require("prompt")
var fmt = require("util").format
var handlebars = require("handlebars")
var superagent = require("superagent")
var getEmail = require("get-email-address-from-npm-username")
var mail = require("./mailer")
var output

var schema = {
  properties: {
    agent: {
      message: 'Hello npm support person. What is your name?',
      required: true,
      default: process.env.NPM_EMPLOYEE_USERNAME
    },
    pkg: {
      message: 'What is the name of the package under discussion?',
      required: true
    },
    requester: {
      message: 'What is the username of the person who wants it?',
      required: true
    },
  }
}

var confirmationSchema = {
  properties: {
    confirm: {
      message: "I'm ready to send this email. Are you?",
      default: "yes"
    }
  }
}

prompt.message = ""
prompt.delimiter = ""
prompt.start()

prompt.get(schema, function (err, ctx) {
  if (err) throw err

  // Template
  var templateFilePath = path.resolve(__dirname, "templates/transfer.hbs")
  var templateFile = fs.readFileSync(templateFilePath).toString()
  var template = handlebars.compile(templateFile)

  getEmail(ctx.requester, function(err, email) {
    if (err) throw err
    ctx.requesterEmail = email
    superagent.get(fmt("http://registry.npmjs.org/%s", ctx.pkg), function(pkg) {
      pkg = pkg.body
      ctx.owner = pkg.maintainers[0].name
      ctx.ownerEmail = pkg.maintainers[0].email
      output = template(ctx)

      // Show the email draft
      console.log(output)

      prompt.get(confirmationSchema, function (err, response) {

        if (!response.confirm.match(/y/i)) {
          return console.log("Aborting. Email not sent.")
        }

        // Send the email!
        mail({
          to: [ctx.ownerEmail, ctx.requesterEmail].join(", "),
          subject: fmt("Can %s take over %s on npm?", ctx.requester, ctx.pkg),
          text: output
          }, function(err, mailResponse) {
            if (err) throw err
            console.log(mailResponse)
        })
      })

    })

  })

})
