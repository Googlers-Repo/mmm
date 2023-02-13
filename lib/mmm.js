#!/system/bin/env node

const fs = require("fs");
const path = require("path");
const { userInfo } = require("os");
const { which, exit } = require("shelljs");
const { program } = require("commander");
const { SystemProperties } = require("android");

// Commands
const install = require("./commands/install.js");
const { conf, configPath } = require("./commands/config.js");

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8")
);

if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, ini.stringify({ repo: 'https://raw.githubusercontent.com/Magisk-Modules-Alt-Repo/json/main/modules.json' }))
}

// if (userInfo().username != "root") {
//   console.log("Try with '\x1b[33msudo apm [...ARGS]\x1b[0m' again");
//   exit(0);
// }

// // Check if pm is installed on Android
// if (!which("magisk")) {
//   console.log("Sorry, this script requires pm");
//   exit(1);
// }

program.name("mmm").description(pkg.description).version(pkg.version);

program
  .command("install")
  .description("installs an module from the given repo")
  .argument("<module...>", "module/s to install")
  .action(install)
  .aliases(["add", "i"]);

program
   .command("config")
   .description("configs for mmm")
   .option("--set <key> <value>", "")
   .option("--get <key>", "")
   .option("--del <key>", "")
   .action(config)
   .aliases(["remove"]);

// program
//   .command("uninstall")
//   .description("uninstall an package from device")
//   .argument("<module...>", "module/s to uninstall")
//   .action((id, opt) => {
//     console.log(id)
//   })
//   .aliases(["remove"]);

program.parse();
