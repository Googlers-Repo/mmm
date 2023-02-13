const { spawn } = require("child_process");
const yesno = require("yesno");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");
const { https } = require('follow-redirects');
const crypto = require("crypto");
const { env, exit, cwd } = require("process");

const formatBytes = require("../util/formatBytes.js");

log = {
  i(msg, ...data) {
    console.log(`\x1b[32m-\x1b[0m ${msg}`, ...data)
  },
  w(msg, ...data) {
    console.log(`\x1b[33m?\x1b[0m ${msg}`, ...data)
  },
  e(msg, ...data) {
    console.log(`\x1b[31m!\x1b[0m ${msg}`, ...data)
  }
}

const IDontKnowHowIShouldNameThisShit_SimplyAnInstaller = async (id, opt) => {
  const repo_data = await (
    // await fetch(opt.repo)
    await fetch("https://raw.githubusercontent.com/Magisk-Modules-Alt-Repo/json/main/modules.json")
  ).json();

  // const repo_data = JSON.parse(
  //   fs.readFileSync(path.resolve(__dirname, "../../modules.json"), "utf-8")
  // );

  log.i("Current repo: %s", repo_data.name);

  if (!repo_data.modules.some((module) => module.id == id)) {
    log.e("\x1b[36m%s\x1b[0m was not found", id)
    exit(0)
  }

  let module;
  try {
    module = repo_data.modules.find((module) => module.id == id);
    log.i("Found \x1b[36m%s\x1b[0m", id);
  } catch (err) {
    log.e("\x1b[36m%s\x1b[0m was not found, abort");
    exit(0);
  }


  // console.log(module);
  const branch = module.zip_url.substring(module.zip_url.lastIndexOf('/') + 1).split('.').slice(0, -1).join('.')
  log.i("Picked branch: \x1b[31m%s\x1b[0m", branch)

  const tmp_zip_path = `${env.TMPDIR}/${id}-${branch}_${Math.floor(
    Math.random() * repo_data.modules.length
  )}`;
  const tmp_zip_randomless = `${env.TMPDIR}/${id}-${branch}`;
  const tmp_zip_migrated = `${tmp_zip_path}-migrated.zip`;
  const tmp_zip = `${tmp_zip_path}.zip`;
  const file = fs.createWriteStream(tmp_zip);

  const req = https.request(module.zip_url);

  req.on("response", function (res) {

    res.pipe(file);

    res.on("end", function () {
      file.close();
    });

    file.on("finish", async () => {
      file.close();
      log.i(`\x1b[36m%s\x1b[0m download completed`, id);
      try {
        log.i(`Migrate \x1b[36m%s\x1b[0m zip`, id);

        try {
          const migrate_zip = new AdmZip(tmp_zip);
          log.i(`Extracting source`);
          migrate_zip.extractAllTo(env.TMPDIR);
        } catch (e) {
          log.e(`Something went wrong. %s`, e?.message);
          exit(0);          
        }

        try {
          const zip = new AdmZip();
          zip.addLocalFolder(tmp_zip_randomless);
          zip.writeZip(tmp_zip_migrated);
          log.i("Created %s successfully", tmp_zip_migrated);
        } catch (e) {
          log.e(`Something went wrong. %s`,e?.message);
          exit(0);
        }

        log.i(
          "- Size: \x1b[31m%s\x1b[0m",
          formatBytes(
            await (async () => {
              return await new Promise((resolve, reject) => {
                fs.stat(tmp_zip_migrated, (err, oStats) => {
                  if (err == null) {
                    resolve(oStats.size);
                  } else {
                    reject(err);
                  }
                });
              });
            })()
          )
        );

        const install = spawn("magisk", ["--install-module", tmp_zip_migrated], {
          cwd: cwd(),
          detached: true,
          stdio: "inherit",
        });

        install.on("error", (err) => {
          log.e(
            `Something went wrong installing ${tmp_zip_migrated}`,
            err.message
          );
          exit(0);
        });

        install.on("exit", () => {});
      } catch (e) {
        log.e(e.message);
      }
    });

    file.on("close", function () {
      // the file is done downloading
    });
  });

  req.end();
}

async function install(id, opt) {
  id.forEach((module)=> {
    IDontKnowHowIShouldNameThisShit_SimplyAnInstaller(module, opt)
  })
}

module.exports = install;
