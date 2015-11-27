var fs = require("fs")
var userhome = require("userhome")
var dotenv = require("dotenv")

// Look for gmail password and npm employee username in ~/.npm-diplomat
module.exports = function() {

  if (!fs.existsSync(userhome(".npm-diplomat"))) {
    fs.writeFileSync(userhome(".npm-diplomat"), "GMAIL_PASSWORD=???\nNPM_EMPLOYEE_USERNAME=???")
    console.log(
      "Created default config. Please go fill in the blanks.",
      "\n\n$EDITOR " + userhome(".npm-diplomat")
    )
    process.exit(1);
  } else {
    var config = dotenv.parse(fs.readFileSync(userhome(".npm-diplomat")));
    Object.keys(config).forEach(function(key){
      process.env[key] = config[key]
    })

    if (!process.env.GMAIL_PASSWORD || process.env.GMAIL_PASSWORD === "???") {
      console.log("Please specify GMAIL_PASSWORD in " + userhome(".npm-diplomat"))
      process.exit(1);
    }

    if (!process.env.NPM_EMPLOYEE_USERNAME || process.env.NPM_EMPLOYEE_USERNAME === "???") {
      console.log("Please specify NPM_EMPLOYEE_USERNAME in " + userhome(".npm-diplomat"))
      process.exit(1);
    }
  }

}
