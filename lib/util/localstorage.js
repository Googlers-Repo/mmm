class LocalStorage {
  _fs = require('fs')
  _ini = require('ini')
  // _props = require('android').SystemProperties
  _os = require('os')
  _path = undefined;
  _map = new Map()

  constructor(name, def) {
    // const rootfs = this._props.get('persist.mkshrc.rootfs', '/data/mkuser'); 
    this._path = `${this._os.homedir()}/.${name}rc`
    this._def = def;


    if (this._fs.existsSync(this._path)) {
      this._conf = this._ini.parse(this._fs.readFileSync(this._path, 'utf-8'))
    } else {
      this._conf = def
    }
  }

  _writeData(data) {
    this._fs.writeFileSync(this._path, this._ini.stringify(data))
  }

  getItem(key) {
    return this._conf[key];
  }

  setItem(key, value) {
    this.conf[key] = value;
    this._writeData(this._path, this._conf);
  }

  removeItem(key) {
    delete this._conf[key];
    this._writeData(this._path, this._conf);
  }

  clear() {
    this._conf = {};
    this.writeData(this._path, this._conf);
  }

  key(i) {
    return "";
  }

  get length() {
    return Object.keys(this._conf).length;
  }
}

module.exports = LocalStorage;