/** @license
 * Autodesk rollup-plugin-app-utils
 * Date: 2019-02-22
 * License: Apache-2.0
 *
 * Bundled dependencies (npm packages): 
 * {"package":"log-utils@1.0.0","license":"MIT","link":"https://github.com/jonschlinkert/log-utils"}, {"package":"ansi-colors@3.2.3","license":"MIT","link":"https://github.com/doowb/ansi-colors"}, {"package":"fs-extra@7.0.1","license":"MIT","link":"https://github.com/jprichardson/node-fs-extra"}, {"package":"spelunk@0.5.0","license":"(MIT)","link":"https://github.com/Rich-Harris/spelunk"}, {"package":"string-template@1.0.0","license":"MIT","link":"https://github.com/Matt-Esch/string-template"}, {"package":"graceful-fs@4.1.15","license":"ISC","link":"https://github.com/isaacs/node-graceful-fs#readme"}, {"package":"time-stamp@2.2.0","license":"MIT","link":"https://github.com/jonschlinkert/time-stamp"}, {"package":"minimatch@0.2.14","license":{"type":"MIT","url":"http://github.com/isaacs/minimatch/raw/master/LICENSE"},"link":"https://github.com/isaacs/minimatch#readme"}, {"package":"es6-promise@1.0.0","license":"MIT","link":"https://github.com/jakearchibald/ES6-Promises#readme"}, {"package":"jsonfile@4.0.0","license":"MIT","link":"https://github.com/jprichardson/node-jsonfile#readme"}, {"package":"universalify@0.1.2","license":"MIT","link":"https://github.com/RyanZim/universalify#readme"}
 */
import constants from 'constants';
import fs from 'fs';
import path from 'path';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var symbols = createCommonjsModule(function (module) {

var isWindows = process.platform === 'win32';
var isLinux = process.platform === 'linux';

var windows = {
  bullet: '•',
  check: '√',
  cross: '×',
  ellipsis: '...',
  heart: '❤',
  info: 'i',
  line: '─',
  middot: '·',
  minus: '－',
  plus: '＋',
  question: '?',
  questionSmall: '﹖',
  pointer: '>',
  pointerSmall: '»',
  warning: '‼'
};

var other = {
  ballotCross: '✘',
  bullet: '•',
  check: '✔',
  cross: '✖',
  ellipsis: '…',
  heart: '❤',
  info: 'ℹ',
  line: '─',
  middot: '·',
  minus: '－',
  plus: '＋',
  question: '?',
  questionFull: '？',
  questionSmall: '﹖',
  pointer: isLinux ? '▸' : '❯',
  pointerSmall: isLinux ? '‣' : '›',
  warning: '⚠'
};

module.exports = isWindows ? windows : other;
Reflect.defineProperty(module.exports, 'windows', { enumerable: false, value: windows });
Reflect.defineProperty(module.exports, 'other', { enumerable: false, value: other });
});

var colors = { enabled: true, visible: true, styles: {}, keys: {} };

if ('FORCE_COLOR' in process.env) {
  colors.enabled = process.env.FORCE_COLOR !== '0';
}

var ansi = function (style) {
  style.open = "\u001b[" + (style.codes[0]) + "m";
  style.close = "\u001b[" + (style.codes[1]) + "m";
  style.regex = new RegExp(("\\u001b\\[" + (style.codes[1]) + "m"), 'g');
  return style;
};

var wrap = function (style, str, nl) {
  var open = style.open;
  var close = style.close;
  var regex = style.regex;
  str = open + (str.includes(close) ? str.replace(regex, close + open) : str) + close;
  // see https://github.com/chalk/chalk/pull/92, thanks to the
  // chalk contributors for this fix. However, we've confirmed that
  // this issue is also present in Windows terminals
  return nl ? str.replace(/\r?\n/g, (close + "$&" + open)) : str;
};

var style = function (input, stack) {
  if (input === '' || input == null) { return ''; }
  if (colors.enabled === false) { return input; }
  if (colors.visible === false) { return ''; }
  var str = '' + input;
  var nl = str.includes('\n');
  var n = stack.length;
  while (n-- > 0) { str = wrap(colors.styles[stack[n]], str, nl); }
  return str;
};

var define = function (name, codes, type) {
  colors.styles[name] = ansi({ name: name, codes: codes });
  var t = colors.keys[type] || (colors.keys[type] = []);
  t.push(name);

  Reflect.defineProperty(colors, name, {
    get: function get() {
      var color = function (input) { return style(input, color.stack); };
      Reflect.setPrototypeOf(color, colors);
      color.stack = this.stack ? this.stack.concat(name) : [name];
      return color;
    }
  });
};

define('reset', [0, 0], 'modifier');
define('bold', [1, 22], 'modifier');
define('dim', [2, 22], 'modifier');
define('italic', [3, 23], 'modifier');
define('underline', [4, 24], 'modifier');
define('inverse', [7, 27], 'modifier');
define('hidden', [8, 28], 'modifier');
define('strikethrough', [9, 29], 'modifier');

define('black', [30, 39], 'color');
define('red', [31, 39], 'color');
define('green', [32, 39], 'color');
define('yellow', [33, 39], 'color');
define('blue', [34, 39], 'color');
define('magenta', [35, 39], 'color');
define('cyan', [36, 39], 'color');
define('white', [37, 39], 'color');
define('gray', [90, 39], 'color');
define('grey', [90, 39], 'color');

define('bgBlack', [40, 49], 'bg');
define('bgRed', [41, 49], 'bg');
define('bgGreen', [42, 49], 'bg');
define('bgYellow', [43, 49], 'bg');
define('bgBlue', [44, 49], 'bg');
define('bgMagenta', [45, 49], 'bg');
define('bgCyan', [46, 49], 'bg');
define('bgWhite', [47, 49], 'bg');

define('blackBright', [90, 39], 'bright');
define('redBright', [91, 39], 'bright');
define('greenBright', [92, 39], 'bright');
define('yellowBright', [93, 39], 'bright');
define('blueBright', [94, 39], 'bright');
define('magentaBright', [95, 39], 'bright');
define('cyanBright', [96, 39], 'bright');
define('whiteBright', [97, 39], 'bright');

define('bgBlackBright', [100, 49], 'bgBright');
define('bgRedBright', [101, 49], 'bgBright');
define('bgGreenBright', [102, 49], 'bgBright');
define('bgYellowBright', [103, 49], 'bgBright');
define('bgBlueBright', [104, 49], 'bgBright');
define('bgMagentaBright', [105, 49], 'bgBright');
define('bgCyanBright', [106, 49], 'bgBright');
define('bgWhiteBright', [107, 49], 'bgBright');

/* eslint-disable no-control-regex */
var re = colors.ansiRegex = /\u001b\[\d+m/gm;
colors.hasColor = colors.hasAnsi = function (str) {
  re.lastIndex = 0;
  return !!str && typeof str === 'string' && re.test(str);
};

colors.unstyle = function (str) {
  re.lastIndex = 0;
  return typeof str === 'string' ? str.replace(re, '') : str;
};

colors.none = colors.clear = colors.noop = function (str) { return str; }; // no-op, for programmatic usage
colors.stripColor = colors.unstyle;
colors.symbols = symbols;
colors.define = define;
var ansiColors = colors;

/*!
 * time-stamp <https://github.com/jonschlinkert/time-stamp>
 *
 * Copyright (c) 2015-2018, Jon Schlinkert.
 * Released under the MIT License.
 */

var dateRegex = /(?=(YYYY|YY|MM|DD|HH|mm|ss|ms))\1([:\/]*)/g;
var timespan = {
  YYYY: ['getFullYear', 4],
  YY: ['getFullYear', 2],
  MM: ['getMonth', 2, 1], // getMonth is zero-based, thus the extra increment field
  DD: ['getDate', 2],
  HH: ['getHours', 2],
  mm: ['getMinutes', 2],
  ss: ['getSeconds', 2],
  ms: ['getMilliseconds', 3]
};

var timestamp = function(str, date, utc) {
  if (typeof str !== 'string') {
    date = str;
    str = 'YYYY-MM-DD';
  }

  if (!date) { date = new Date(); }
  return str.replace(dateRegex, function(match, key, rest) {
    var args = timespan[key];
    var name = args[0];
    var chars = args[1];
    if (utc === true) { name = 'getUTC' + name.slice(3); }
    var val = '00' + String(date[name]() + (args[2] || 0));
    return val.slice(-chars) + (rest || '');
  });
};

timestamp.utc = function(str, date) {
  return timestamp(str, date, true);
};

var timeStamp = timestamp;

var log = console.log;

/**
 * Get a red error symbol.
 *
 * ```js
 * console.log(log.error); //=> ✖
 * ```
 * @name .error
 * @api public
 */

getter(log, 'error', function () { return ansiColors.red(ansiColors.symbols.cross); });

/**
 * Get a cyan info symbol.
 *
 * ```js
 * console.log(log.info); //=> ℹ
 * ```
 * @name .info
 * @api public
 */

getter(log, 'info', function () { return ansiColors.cyan(ansiColors.symbols.info); });

/**
 * Get a green success symbol.
 *
 * ```js
 * console.log(log.success); //=> ✔
 * ```
 * @name .success
 * @api public
 */

getter(log, 'success', function () { return ansiColors.green(ansiColors.symbols.check); });

/**
 * Get a yellow warning symbol.
 *
 * ```js
 * console.log(log.warning); //=> ⚠
 * ```
 * @name .warning
 * @api public
 */

getter(log, 'warning', function () { return ansiColors.yellow(ansiColors.symbols.warning); });

/**
 * Get a formatted timestamp.
 *
 * ```js
 * console.log(log.timestamp); //=> [15:27:46]
 * ```
 * @name .timestamp
 * @api public
 */

getter(log, 'timestamp', function () {
  return '[' + ansiColors.gray(timeStamp('HH:mm:ss')) + ']';
});

/**
 * Returns a formatted string prefixed by a green check.
 *
 * ```js
 * console.log(log.ok('   foo'));
 * console.log(log.ok('  foo'));
 * console.log(log.ok(' foo'));
 * console.log(log.ok('foo'));
 * // Results in:
 * //    ✔ foo
 * //   ✔ foo
 * //  ✔ foo
 * // ✔ foo
 * ```
 * @name .ok
 * @api public
 */

log.ok = function (str) {
  var ok = ansiColors.green(ansiColors.symbols.check);
  return str.replace(/^(\s*)(.*?)$/, function (m, s, v) {
    return s + ok + ' ' + v;
  });
};

/**
 * Make the given text bold and underlined.
 *
 * ```js
 * console.log(log.heading('foo'));
 * // or
 * console.log(log.heading('foo', 'bar'));
 * ```
 * @name .heading
 * @api public
 */

log.heading = function () {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  var str = args.filter(function (v) { return v !== void 0; }).map(String).join(' ');
  return ansiColors.bold.underline(str);
};

/**
 * Utility for defining a getter
 */

function getter(obj, prop, fn) {
  Object.defineProperty(obj, prop, {
    configurable: true,
    enumerable: true,
    get: fn
  });
}

/**
 * Expose `log`
 */

log.__proto__ = ansiColors;
var logUtils = log;

var fromCallback = function (fn) {
  return Object.defineProperty(function () {
    var arguments$1 = arguments;
    var this$1 = this;

    if (typeof arguments[arguments.length - 1] === 'function') { fn.apply(this, arguments); }
    else {
      return new Promise(function (resolve, reject) {
        arguments$1[arguments$1.length] = function (err, res) {
          if (err) { return reject(err) }
          resolve(res);
        };
        arguments$1.length++;
        fn.apply(this$1, arguments$1);
      })
    }
  }, 'name', { value: fn.name })
};

var fromPromise = function (fn) {
  return Object.defineProperty(function () {
    var cb = arguments[arguments.length - 1];
    if (typeof cb !== 'function') { return fn.apply(this, arguments) }
    else { fn.apply(this, arguments).then(function (r) { return cb(null, r); }, cb); }
  }, 'name', { value: fn.name })
};

var universalify = {
	fromCallback: fromCallback,
	fromPromise: fromPromise
};

var origCwd = process.cwd;
var cwd = null;

var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;

process.cwd = function() {
  if (!cwd)
    { cwd = origCwd.call(process); }
  return cwd
};
try {
  process.cwd();
} catch (er) {}

var chdir = process.chdir;
process.chdir = function(d) {
  cwd = null;
  chdir.call(process, d);
};

var polyfills = patch;

function patch (fs$$1) {
  // (re-)implement some things that are known busted or missing.

  // lchmod, broken prior to 0.6.2
  // back-port the fix here.
  if (constants.hasOwnProperty('O_SYMLINK') &&
      process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs$$1);
  }

  // lutimes implementation, or no-op
  if (!fs$$1.lutimes) {
    patchLutimes(fs$$1);
  }

  // https://github.com/isaacs/node-graceful-fs/issues/4
  // Chown should not fail on einval or eperm if non-root.
  // It should not fail on enosys ever, as this just indicates
  // that a fs doesn't support the intended operation.

  fs$$1.chown = chownFix(fs$$1.chown);
  fs$$1.fchown = chownFix(fs$$1.fchown);
  fs$$1.lchown = chownFix(fs$$1.lchown);

  fs$$1.chmod = chmodFix(fs$$1.chmod);
  fs$$1.fchmod = chmodFix(fs$$1.fchmod);
  fs$$1.lchmod = chmodFix(fs$$1.lchmod);

  fs$$1.chownSync = chownFixSync(fs$$1.chownSync);
  fs$$1.fchownSync = chownFixSync(fs$$1.fchownSync);
  fs$$1.lchownSync = chownFixSync(fs$$1.lchownSync);

  fs$$1.chmodSync = chmodFixSync(fs$$1.chmodSync);
  fs$$1.fchmodSync = chmodFixSync(fs$$1.fchmodSync);
  fs$$1.lchmodSync = chmodFixSync(fs$$1.lchmodSync);

  fs$$1.stat = statFix(fs$$1.stat);
  fs$$1.fstat = statFix(fs$$1.fstat);
  fs$$1.lstat = statFix(fs$$1.lstat);

  fs$$1.statSync = statFixSync(fs$$1.statSync);
  fs$$1.fstatSync = statFixSync(fs$$1.fstatSync);
  fs$$1.lstatSync = statFixSync(fs$$1.lstatSync);

  // if lchmod/lchown do not exist, then make them no-ops
  if (!fs$$1.lchmod) {
    fs$$1.lchmod = function (path$$1, mode, cb) {
      if (cb) { process.nextTick(cb); }
    };
    fs$$1.lchmodSync = function () {};
  }
  if (!fs$$1.lchown) {
    fs$$1.lchown = function (path$$1, uid, gid, cb) {
      if (cb) { process.nextTick(cb); }
    };
    fs$$1.lchownSync = function () {};
  }

  // on Windows, A/V software can lock the directory, causing this
  // to fail with an EACCES or EPERM if the directory contains newly
  // created files.  Try again on failure, for up to 60 seconds.

  // Set the timeout this long because some Windows Anti-Virus, such as Parity
  // bit9, may lock files for up to a minute, causing npm package install
  // failures. Also, take care to yield the scheduler. Windows scheduling gives
  // CPU to a busy looping process, which can cause the program causing the lock
  // contention to be starved of CPU by node, so the contention doesn't resolve.
  if (platform === "win32") {
    fs$$1.rename = (function (fs$rename) { return function (from, to, cb) {
      var start = Date.now();
      var backoff = 0;
      fs$rename(from, to, function CB (er) {
        if (er
            && (er.code === "EACCES" || er.code === "EPERM")
            && Date.now() - start < 60000) {
          setTimeout(function() {
            fs$$1.stat(to, function (stater, st) {
              if (stater && stater.code === "ENOENT")
                { fs$rename(from, to, CB); }
              else
                { cb(er); }
            });
          }, backoff);
          if (backoff < 100)
            { backoff += 10; }
          return;
        }
        if (cb) { cb(er); }
      });
    }})(fs$$1.rename);
  }

  // if read() returns EAGAIN, then just try it again.
  fs$$1.read = (function (fs$read) { return function (fd, buffer, offset, length, position, callback_) {
    var callback;
    if (callback_ && typeof callback_ === 'function') {
      var eagCounter = 0;
      callback = function (er, _, __) {
        if (er && er.code === 'EAGAIN' && eagCounter < 10) {
          eagCounter ++;
          return fs$read.call(fs$$1, fd, buffer, offset, length, position, callback)
        }
        callback_.apply(this, arguments);
      };
    }
    return fs$read.call(fs$$1, fd, buffer, offset, length, position, callback)
  }})(fs$$1.read);

  fs$$1.readSync = (function (fs$readSync) { return function (fd, buffer, offset, length, position) {
    var eagCounter = 0;
    while (true) {
      try {
        return fs$readSync.call(fs$$1, fd, buffer, offset, length, position)
      } catch (er) {
        if (er.code === 'EAGAIN' && eagCounter < 10) {
          eagCounter ++;
          continue
        }
        throw er
      }
    }
  }})(fs$$1.readSync);

  function patchLchmod (fs$$1) {
    fs$$1.lchmod = function (path$$1, mode, callback) {
      fs$$1.open( path$$1
             , constants.O_WRONLY | constants.O_SYMLINK
             , mode
             , function (err, fd) {
        if (err) {
          if (callback) { callback(err); }
          return
        }
        // prefer to return the chmod error, if one occurs,
        // but still try to close, and report closing errors if they occur.
        fs$$1.fchmod(fd, mode, function (err) {
          fs$$1.close(fd, function(err2) {
            if (callback) { callback(err || err2); }
          });
        });
      });
    };

    fs$$1.lchmodSync = function (path$$1, mode) {
      var fd = fs$$1.openSync(path$$1, constants.O_WRONLY | constants.O_SYMLINK, mode);

      // prefer to return the chmod error, if one occurs,
      // but still try to close, and report closing errors if they occur.
      var threw = true;
      var ret;
      try {
        ret = fs$$1.fchmodSync(fd, mode);
        threw = false;
      } finally {
        if (threw) {
          try {
            fs$$1.closeSync(fd);
          } catch (er) {}
        } else {
          fs$$1.closeSync(fd);
        }
      }
      return ret
    };
  }

  function patchLutimes (fs$$1) {
    if (constants.hasOwnProperty("O_SYMLINK")) {
      fs$$1.lutimes = function (path$$1, at, mt, cb) {
        fs$$1.open(path$$1, constants.O_SYMLINK, function (er, fd) {
          if (er) {
            if (cb) { cb(er); }
            return
          }
          fs$$1.futimes(fd, at, mt, function (er) {
            fs$$1.close(fd, function (er2) {
              if (cb) { cb(er || er2); }
            });
          });
        });
      };

      fs$$1.lutimesSync = function (path$$1, at, mt) {
        var fd = fs$$1.openSync(path$$1, constants.O_SYMLINK);
        var ret;
        var threw = true;
        try {
          ret = fs$$1.futimesSync(fd, at, mt);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs$$1.closeSync(fd);
            } catch (er) {}
          } else {
            fs$$1.closeSync(fd);
          }
        }
        return ret
      };

    } else {
      fs$$1.lutimes = function (_a, _b, _c, cb) { if (cb) { process.nextTick(cb); } };
      fs$$1.lutimesSync = function () {};
    }
  }

  function chmodFix (orig) {
    if (!orig) { return orig }
    return function (target, mode, cb) {
      return orig.call(fs$$1, target, mode, function (er) {
        if (chownErOk(er)) { er = null; }
        if (cb) { cb.apply(this, arguments); }
      })
    }
  }

  function chmodFixSync (orig) {
    if (!orig) { return orig }
    return function (target, mode) {
      try {
        return orig.call(fs$$1, target, mode)
      } catch (er) {
        if (!chownErOk(er)) { throw er }
      }
    }
  }


  function chownFix (orig) {
    if (!orig) { return orig }
    return function (target, uid, gid, cb) {
      return orig.call(fs$$1, target, uid, gid, function (er) {
        if (chownErOk(er)) { er = null; }
        if (cb) { cb.apply(this, arguments); }
      })
    }
  }

  function chownFixSync (orig) {
    if (!orig) { return orig }
    return function (target, uid, gid) {
      try {
        return orig.call(fs$$1, target, uid, gid)
      } catch (er) {
        if (!chownErOk(er)) { throw er }
      }
    }
  }


  function statFix (orig) {
    if (!orig) { return orig }
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, cb) {
      return orig.call(fs$$1, target, function (er, stats) {
        if (!stats) { return cb.apply(this, arguments) }
        if (stats.uid < 0) { stats.uid += 0x100000000; }
        if (stats.gid < 0) { stats.gid += 0x100000000; }
        if (cb) { cb.apply(this, arguments); }
      })
    }
  }

  function statFixSync (orig) {
    if (!orig) { return orig }
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target) {
      var stats = orig.call(fs$$1, target);
      if (stats.uid < 0) { stats.uid += 0x100000000; }
      if (stats.gid < 0) { stats.gid += 0x100000000; }
      return stats;
    }
  }

  // ENOSYS means that the fs doesn't support the op. Just ignore
  // that, because it doesn't matter.
  //
  // if there's no getuid, or if getuid() is something other
  // than 0, and the error is EINVAL or EPERM, then just ignore
  // it.
  //
  // This specific case is a silent failure in cp, install, tar,
  // and most other unix tools that manage permissions.
  //
  // When running as root, or if other types of errors are
  // encountered, then it's strict.
  function chownErOk (er) {
    if (!er)
      { return true }

    if (er.code === "ENOSYS")
      { return true }

    var nonroot = !process.getuid || process.getuid() !== 0;
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        { return true }
    }

    return false
  }
}

var Stream = require('stream').Stream;

var legacyStreams = legacy;

function legacy (fs$$1) {
  return {
    ReadStream: ReadStream,
    WriteStream: WriteStream
  }

  function ReadStream (path$$1, options) {
    if (!(this instanceof ReadStream)) { return new ReadStream(path$$1, options); }

    Stream.call(this);

    var self = this;

    this.path = path$$1;
    this.fd = null;
    this.readable = true;
    this.paused = false;

    this.flags = 'r';
    this.mode = 438; /*=0666*/
    this.bufferSize = 64 * 1024;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.encoding) { this.setEncoding(this.encoding); }

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.end === undefined) {
        this.end = Infinity;
      } else if ('number' !== typeof this.end) {
        throw TypeError('end must be a Number');
      }

      if (this.start > this.end) {
        throw new Error('start must be <= end');
      }

      this.pos = this.start;
    }

    if (this.fd !== null) {
      process.nextTick(function() {
        self._read();
      });
      return;
    }

    fs$$1.open(this.path, this.flags, this.mode, function (err, fd) {
      if (err) {
        self.emit('error', err);
        self.readable = false;
        return;
      }

      self.fd = fd;
      self.emit('open', fd);
      self._read();
    });
  }

  function WriteStream (path$$1, options) {
    if (!(this instanceof WriteStream)) { return new WriteStream(path$$1, options); }

    Stream.call(this);

    this.path = path$$1;
    this.fd = null;
    this.writable = true;

    this.flags = 'w';
    this.encoding = 'binary';
    this.mode = 438; /*=0666*/
    this.bytesWritten = 0;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.start < 0) {
        throw new Error('start must be >= zero');
      }

      this.pos = this.start;
    }

    this.busy = false;
    this._queue = [];

    if (this.fd === null) {
      this._open = fs$$1.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
      this.flush();
    }
  }
}

var clone_1 = clone;

function clone (obj) {
  if (obj === null || typeof obj !== 'object')
    { return obj }

  if (obj instanceof Object)
    { var copy = { __proto__: obj.__proto__ }; }
  else
    { var copy = Object.create(null); }

  Object.getOwnPropertyNames(obj).forEach(function (key) {
    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
  });

  return copy
}

var gracefulFs = createCommonjsModule(function (module) {
var fs$$1 = require('fs');




var queue = [];

var util = require('util');

function noop () {}

var debug = noop;
if (util.debuglog)
  { debug = util.debuglog('gfs4'); }
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
  { debug = function() {
    var m = util.format.apply(util, arguments);
    m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ');
    console.error(m);
  }; }

if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
  process.on('exit', function() {
    debug(queue);
    require('assert').equal(queue.length, 0);
  });
}

module.exports = patch(clone_1(fs$$1));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs$$1.__patched) {
    module.exports = patch(fs$$1);
    fs$$1.__patched = true;
}

// Always patch fs.close/closeSync, because we want to
// retry() whenever a close happens *anywhere* in the program.
// This is essential when multiple graceful-fs instances are
// in play at the same time.
module.exports.close = (function (fs$close) { return function (fd, cb) {
  return fs$close.call(fs$$1, fd, function (err) {
    if (!err)
      { retry(); }

    if (typeof cb === 'function')
      { cb.apply(this, arguments); }
  })
}})(fs$$1.close);

module.exports.closeSync = (function (fs$closeSync) { return function (fd) {
  // Note that graceful-fs also retries when fs.closeSync() fails.
  // Looks like a bug to me, although it's probably a harmless one.
  var rval = fs$closeSync.apply(fs$$1, arguments);
  retry();
  return rval
}})(fs$$1.closeSync);

// Only patch fs once, otherwise we'll run into a memory leak if
// graceful-fs is loaded multiple times, such as in test environments that
// reset the loaded modules between tests.
// We look for the string `graceful-fs` from the comment above. This
// way we are not adding any extra properties and it will detect if older
// versions of graceful-fs are installed.
if (!/\bgraceful-fs\b/.test(fs$$1.closeSync.toString())) {
  fs$$1.closeSync = module.exports.closeSync;
  fs$$1.close = module.exports.close;
}

function patch (fs$$1) {
  // Everything that references the open() function needs to be in here
  polyfills(fs$$1);
  fs$$1.gracefulify = patch;
  fs$$1.FileReadStream = ReadStream;  // Legacy name.
  fs$$1.FileWriteStream = WriteStream;  // Legacy name.
  fs$$1.createReadStream = createReadStream;
  fs$$1.createWriteStream = createWriteStream;
  var fs$readFile = fs$$1.readFile;
  fs$$1.readFile = readFile;
  function readFile (path$$1, options, cb) {
    if (typeof options === 'function')
      { cb = options, options = null; }

    return go$readFile(path$$1, options, cb)

    function go$readFile (path$$1, options, cb) {
      return fs$readFile(path$$1, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          { enqueue([go$readFile, [path$$1, options, cb]]); }
        else {
          if (typeof cb === 'function')
            { cb.apply(this, arguments); }
          retry();
        }
      })
    }
  }

  var fs$writeFile = fs$$1.writeFile;
  fs$$1.writeFile = writeFile;
  function writeFile (path$$1, data, options, cb) {
    if (typeof options === 'function')
      { cb = options, options = null; }

    return go$writeFile(path$$1, data, options, cb)

    function go$writeFile (path$$1, data, options, cb) {
      return fs$writeFile(path$$1, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          { enqueue([go$writeFile, [path$$1, data, options, cb]]); }
        else {
          if (typeof cb === 'function')
            { cb.apply(this, arguments); }
          retry();
        }
      })
    }
  }

  var fs$appendFile = fs$$1.appendFile;
  if (fs$appendFile)
    { fs$$1.appendFile = appendFile; }
  function appendFile (path$$1, data, options, cb) {
    if (typeof options === 'function')
      { cb = options, options = null; }

    return go$appendFile(path$$1, data, options, cb)

    function go$appendFile (path$$1, data, options, cb) {
      return fs$appendFile(path$$1, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          { enqueue([go$appendFile, [path$$1, data, options, cb]]); }
        else {
          if (typeof cb === 'function')
            { cb.apply(this, arguments); }
          retry();
        }
      })
    }
  }

  var fs$readdir = fs$$1.readdir;
  fs$$1.readdir = readdir;
  function readdir (path$$1, options, cb) {
    var args = [path$$1];
    if (typeof options !== 'function') {
      args.push(options);
    } else {
      cb = options;
    }
    args.push(go$readdir$cb);

    return go$readdir(args)

    function go$readdir$cb (err, files) {
      if (files && files.sort)
        { files.sort(); }

      if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
        { enqueue([go$readdir, [args]]); }

      else {
        if (typeof cb === 'function')
          { cb.apply(this, arguments); }
        retry();
      }
    }
  }

  function go$readdir (args) {
    return fs$readdir.apply(fs$$1, args)
  }

  if (process.version.substr(0, 4) === 'v0.8') {
    var legStreams = legacyStreams(fs$$1);
    ReadStream = legStreams.ReadStream;
    WriteStream = legStreams.WriteStream;
  }

  var fs$ReadStream = fs$$1.ReadStream;
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype);
    ReadStream.prototype.open = ReadStream$open;
  }

  var fs$WriteStream = fs$$1.WriteStream;
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype);
    WriteStream.prototype.open = WriteStream$open;
  }

  fs$$1.ReadStream = ReadStream;
  fs$$1.WriteStream = WriteStream;

  function ReadStream (path$$1, options) {
    if (this instanceof ReadStream)
      { return fs$ReadStream.apply(this, arguments), this }
    else
      { return ReadStream.apply(Object.create(ReadStream.prototype), arguments) }
  }

  function ReadStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        if (that.autoClose)
          { that.destroy(); }

        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
        that.read();
      }
    });
  }

  function WriteStream (path$$1, options) {
    if (this instanceof WriteStream)
      { return fs$WriteStream.apply(this, arguments), this }
    else
      { return WriteStream.apply(Object.create(WriteStream.prototype), arguments) }
  }

  function WriteStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        that.destroy();
        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
      }
    });
  }

  function createReadStream (path$$1, options) {
    return new ReadStream(path$$1, options)
  }

  function createWriteStream (path$$1, options) {
    return new WriteStream(path$$1, options)
  }

  var fs$open = fs$$1.open;
  fs$$1.open = open;
  function open (path$$1, flags, mode, cb) {
    if (typeof mode === 'function')
      { cb = mode, mode = null; }

    return go$open(path$$1, flags, mode, cb)

    function go$open (path$$1, flags, mode, cb) {
      return fs$open(path$$1, flags, mode, function (err, fd) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          { enqueue([go$open, [path$$1, flags, mode, cb]]); }
        else {
          if (typeof cb === 'function')
            { cb.apply(this, arguments); }
          retry();
        }
      })
    }
  }

  return fs$$1
}

function enqueue (elem) {
  debug('ENQUEUE', elem[0].name, elem[1]);
  queue.push(elem);
}

function retry () {
  var elem = queue.shift();
  if (elem) {
    debug('RETRY', elem[0].name, elem[1]);
    elem[0].apply(null, elem[1]);
  }
}
});
var gracefulFs_1 = gracefulFs.close;
var gracefulFs_2 = gracefulFs.closeSync;

var fs_1 = createCommonjsModule(function (module, exports) {
// This is adapted from https://github.com/normalize/mz
// Copyright (c) 2014-2016 Jonathan Ong me@jongleberry.com and Contributors
var u = universalify.fromCallback;


var api = [
  'access',
  'appendFile',
  'chmod',
  'chown',
  'close',
  'copyFile',
  'fchmod',
  'fchown',
  'fdatasync',
  'fstat',
  'fsync',
  'ftruncate',
  'futimes',
  'lchown',
  'lchmod',
  'link',
  'lstat',
  'mkdir',
  'mkdtemp',
  'open',
  'readFile',
  'readdir',
  'readlink',
  'realpath',
  'rename',
  'rmdir',
  'stat',
  'symlink',
  'truncate',
  'unlink',
  'utimes',
  'writeFile'
].filter(function (key) {
  // Some commands are not available on some systems. Ex:
  // fs.copyFile was added in Node.js v8.5.0
  // fs.mkdtemp was added in Node.js v5.10.0
  // fs.lchown is not available on at least some Linux
  return typeof gracefulFs[key] === 'function'
});

// Export all keys:
Object.keys(gracefulFs).forEach(function (key) {
  if (key === 'promises') {
    // fs.promises is a getter property that triggers ExperimentalWarning
    // Don't re-export it here, the getter is defined in "lib/index.js"
    return
  }
  exports[key] = gracefulFs[key];
});

// Universalify async methods:
api.forEach(function (method) {
  exports[method] = u(gracefulFs[method]);
});

// We differ from mz/fs in that we still ship the old, broken, fs.exists()
// since we are a drop-in replacement for the native module
exports.exists = function (filename, callback) {
  if (typeof callback === 'function') {
    return gracefulFs.exists(filename, callback)
  }
  return new Promise(function (resolve) {
    return gracefulFs.exists(filename, resolve)
  })
};

// fs.read() & fs.write need special treatment due to multiple callback args

exports.read = function (fd, buffer, offset, length, position, callback) {
  if (typeof callback === 'function') {
    return gracefulFs.read(fd, buffer, offset, length, position, callback)
  }
  return new Promise(function (resolve, reject) {
    gracefulFs.read(fd, buffer, offset, length, position, function (err, bytesRead, buffer) {
      if (err) { return reject(err) }
      resolve({ bytesRead: bytesRead, buffer: buffer });
    });
  })
};

// Function signature can be
// fs.write(fd, buffer[, offset[, length[, position]]], callback)
// OR
// fs.write(fd, string[, position[, encoding]], callback)
// We need to handle both cases, so we use ...args
exports.write = function (fd, buffer) {
  var args = [], len = arguments.length - 2;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 2 ];

  if (typeof args[args.length - 1] === 'function') {
    return gracefulFs.write.apply(gracefulFs, [ fd, buffer ].concat( args ))
  }

  return new Promise(function (resolve, reject) {
    gracefulFs.write.apply(gracefulFs, [ fd, buffer ].concat( args, [function (err, bytesWritten, buffer) {
      if (err) { return reject(err) }
      resolve({ bytesWritten: bytesWritten, buffer: buffer });
    }] ));
  })
};
});
var fs_2 = fs_1.exists;
var fs_3 = fs_1.read;
var fs_4 = fs_1.write;

var path$1 = require('path');

// get drive on windows
function getRootPath (p) {
  p = path$1.normalize(path$1.resolve(p)).split(path$1.sep);
  if (p.length > 0) { return p[0] }
  return null
}

// http://stackoverflow.com/a/62888/10333 contains more accurate
// TODO: expand to include the rest
var INVALID_PATH_CHARS = /[<>:"|?*]/;

function invalidWin32Path (p) {
  var rp = getRootPath(p);
  p = p.replace(rp, '');
  return INVALID_PATH_CHARS.test(p)
}

var win32 = {
  getRootPath: getRootPath,
  invalidWin32Path: invalidWin32Path
};

var path$2 = require('path');
var invalidWin32Path$1 = win32.invalidWin32Path;

var o777 = parseInt('0777', 8);

function mkdirs (p, opts, callback, made) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  } else if (!opts || typeof opts !== 'object') {
    opts = { mode: opts };
  }

  if (process.platform === 'win32' && invalidWin32Path$1(p)) {
    var errInval = new Error(p + ' contains invalid WIN32 path characters.');
    errInval.code = 'EINVAL';
    return callback(errInval)
  }

  var mode = opts.mode;
  var xfs = opts.fs || gracefulFs;

  if (mode === undefined) {
    mode = o777 & (~process.umask());
  }
  if (!made) { made = null; }

  callback = callback || function () {};
  p = path$2.resolve(p);

  xfs.mkdir(p, mode, function (er) {
    if (!er) {
      made = made || p;
      return callback(null, made)
    }
    switch (er.code) {
      case 'ENOENT':
        if (path$2.dirname(p) === p) { return callback(er) }
        mkdirs(path$2.dirname(p), opts, function (er, made) {
          if (er) { callback(er, made); }
          else { mkdirs(p, opts, callback, made); }
        });
        break

      // In the case of any other error, just see if there's a dir
      // there already.  If so, then hooray!  If not, then something
      // is borked.
      default:
        xfs.stat(p, function (er2, stat) {
          // if the stat fails, then that's super weird.
          // let the original error be the failure reason.
          if (er2 || !stat.isDirectory()) { callback(er, made); }
          else { callback(null, made); }
        });
        break
    }
  });
}

var mkdirs_1 = mkdirs;

var path$3 = require('path');
var invalidWin32Path$2 = win32.invalidWin32Path;

var o777$1 = parseInt('0777', 8);

function mkdirsSync (p, opts, made) {
  if (!opts || typeof opts !== 'object') {
    opts = { mode: opts };
  }

  var mode = opts.mode;
  var xfs = opts.fs || gracefulFs;

  if (process.platform === 'win32' && invalidWin32Path$2(p)) {
    var errInval = new Error(p + ' contains invalid WIN32 path characters.');
    errInval.code = 'EINVAL';
    throw errInval
  }

  if (mode === undefined) {
    mode = o777$1 & (~process.umask());
  }
  if (!made) { made = null; }

  p = path$3.resolve(p);

  try {
    xfs.mkdirSync(p, mode);
    made = made || p;
  } catch (err0) {
    if (err0.code === 'ENOENT') {
      if (path$3.dirname(p) === p) { throw err0 }
      made = mkdirsSync(path$3.dirname(p), opts, made);
      mkdirsSync(p, opts, made);
    } else {
      // In the case of any other error, just see if there's a dir there
      // already. If so, then hooray!  If not, then something is borked.
      var stat;
      try {
        stat = xfs.statSync(p);
      } catch (err1) {
        throw err0
      }
      if (!stat.isDirectory()) { throw err0 }
    }
  }

  return made
}

var mkdirsSync_1 = mkdirsSync;

var u = universalify.fromCallback;
var mkdirs$1 = u(mkdirs_1);


var mkdirs_1$1 = {
  mkdirs: mkdirs$1,
  mkdirsSync: mkdirsSync_1,
  // alias
  mkdirp: mkdirs$1,
  mkdirpSync: mkdirsSync_1,
  ensureDir: mkdirs$1,
  ensureDirSync: mkdirsSync_1
};

var os = require('os');
var path$4 = require('path');

// HFS, ext{2,3}, FAT do not, Node.js v0.10 does not
function hasMillisResSync () {
  var tmpfile = path$4.join('millis-test-sync' + Date.now().toString() + Math.random().toString().slice(2));
  tmpfile = path$4.join(os.tmpdir(), tmpfile);

  // 550 millis past UNIX epoch
  var d = new Date(1435410243862);
  gracefulFs.writeFileSync(tmpfile, 'https://github.com/jprichardson/node-fs-extra/pull/141');
  var fd = gracefulFs.openSync(tmpfile, 'r+');
  gracefulFs.futimesSync(fd, d, d);
  gracefulFs.closeSync(fd);
  return gracefulFs.statSync(tmpfile).mtime > 1435410243000
}

function hasMillisRes (callback) {
  var tmpfile = path$4.join('millis-test' + Date.now().toString() + Math.random().toString().slice(2));
  tmpfile = path$4.join(os.tmpdir(), tmpfile);

  // 550 millis past UNIX epoch
  var d = new Date(1435410243862);
  gracefulFs.writeFile(tmpfile, 'https://github.com/jprichardson/node-fs-extra/pull/141', function (err) {
    if (err) { return callback(err) }
    gracefulFs.open(tmpfile, 'r+', function (err, fd) {
      if (err) { return callback(err) }
      gracefulFs.futimes(fd, d, d, function (err) {
        if (err) { return callback(err) }
        gracefulFs.close(fd, function (err) {
          if (err) { return callback(err) }
          gracefulFs.stat(tmpfile, function (err, stats) {
            if (err) { return callback(err) }
            callback(null, stats.mtime > 1435410243000);
          });
        });
      });
    });
  });
}

function timeRemoveMillis (timestamp) {
  if (typeof timestamp === 'number') {
    return Math.floor(timestamp / 1000) * 1000
  } else if (timestamp instanceof Date) {
    return new Date(Math.floor(timestamp.getTime() / 1000) * 1000)
  } else {
    throw new Error('fs-extra: timeRemoveMillis() unknown parameter type')
  }
}

function utimesMillis (path$$1, atime, mtime, callback) {
  // if (!HAS_MILLIS_RES) return fs.utimes(path, atime, mtime, callback)
  gracefulFs.open(path$$1, 'r+', function (err, fd) {
    if (err) { return callback(err) }
    gracefulFs.futimes(fd, atime, mtime, function (futimesErr) {
      gracefulFs.close(fd, function (closeErr) {
        if (callback) { callback(futimesErr || closeErr); }
      });
    });
  });
}

function utimesMillisSync (path$$1, atime, mtime) {
  var fd = gracefulFs.openSync(path$$1, 'r+');
  gracefulFs.futimesSync(fd, atime, mtime);
  return gracefulFs.closeSync(fd)
}

var utimes = {
  hasMillisRes: hasMillisRes,
  hasMillisResSync: hasMillisResSync,
  timeRemoveMillis: timeRemoveMillis,
  utimesMillis: utimesMillis,
  utimesMillisSync: utimesMillisSync
};

/* eslint-disable node/no-deprecated-api */
var buffer = function (size) {
  if (typeof Buffer.allocUnsafe === 'function') {
    try {
      return Buffer.allocUnsafe(size)
    } catch (e) {
      return new Buffer(size)
    }
  }
  return new Buffer(size)
};

var path$5 = require('path');
var mkdirpSync = mkdirs_1$1.mkdirsSync;
var utimesSync = utimes.utimesMillisSync;

var notExist = Symbol('notExist');

function copySync (src, dest, opts) {
  if (typeof opts === 'function') {
    opts = {filter: opts};
  }

  opts = opts || {};
  opts.clobber = 'clobber' in opts ? !!opts.clobber : true; // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber; // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    console.warn("fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n\n    see https://github.com/jprichardson/node-fs-extra/issues/269");
  }

  var destStat = checkPaths(src, dest);

  if (opts.filter && !opts.filter(src, dest)) { return }

  var destParent = path$5.dirname(dest);
  if (!gracefulFs.existsSync(destParent)) { mkdirpSync(destParent); }
  return startCopy(destStat, src, dest, opts)
}

function startCopy (destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) { return }
  return getStats(destStat, src, dest, opts)
}

function getStats (destStat, src, dest, opts) {
  var statSync = opts.dereference ? gracefulFs.statSync : gracefulFs.lstatSync;
  var srcStat = statSync(src);

  if (srcStat.isDirectory()) { return onDir(srcStat, destStat, src, dest, opts) }
  else if (srcStat.isFile() ||
           srcStat.isCharacterDevice() ||
           srcStat.isBlockDevice()) { return onFile(srcStat, destStat, src, dest, opts) }
  else if (srcStat.isSymbolicLink()) { return onLink(destStat, src, dest, opts) }
}

function onFile (srcStat, destStat, src, dest, opts) {
  if (destStat === notExist) { return copyFile(srcStat, src, dest, opts) }
  return mayCopyFile(srcStat, src, dest, opts)
}

function mayCopyFile (srcStat, src, dest, opts) {
  if (opts.overwrite) {
    gracefulFs.unlinkSync(dest);
    return copyFile(srcStat, src, dest, opts)
  } else if (opts.errorOnExist) {
    throw new Error(("'" + dest + "' already exists"))
  }
}

function copyFile (srcStat, src, dest, opts) {
  if (typeof gracefulFs.copyFileSync === 'function') {
    gracefulFs.copyFileSync(src, dest);
    gracefulFs.chmodSync(dest, srcStat.mode);
    if (opts.preserveTimestamps) {
      return utimesSync(dest, srcStat.atime, srcStat.mtime)
    }
    return
  }
  return copyFileFallback(srcStat, src, dest, opts)
}

function copyFileFallback (srcStat, src, dest, opts) {
  var BUF_LENGTH = 64 * 1024;
  var _buff = buffer(BUF_LENGTH);

  var fdr = gracefulFs.openSync(src, 'r');
  var fdw = gracefulFs.openSync(dest, 'w', srcStat.mode);
  var pos = 0;

  while (pos < srcStat.size) {
    var bytesRead = gracefulFs.readSync(fdr, _buff, 0, BUF_LENGTH, pos);
    gracefulFs.writeSync(fdw, _buff, 0, bytesRead);
    pos += bytesRead;
  }

  if (opts.preserveTimestamps) { gracefulFs.futimesSync(fdw, srcStat.atime, srcStat.mtime); }

  gracefulFs.closeSync(fdr);
  gracefulFs.closeSync(fdw);
}

function onDir (srcStat, destStat, src, dest, opts) {
  if (destStat === notExist) { return mkDirAndCopy(srcStat, src, dest, opts) }
  if (destStat && !destStat.isDirectory()) {
    throw new Error(("Cannot overwrite non-directory '" + dest + "' with directory '" + src + "'."))
  }
  return copyDir(src, dest, opts)
}

function mkDirAndCopy (srcStat, src, dest, opts) {
  gracefulFs.mkdirSync(dest);
  copyDir(src, dest, opts);
  return gracefulFs.chmodSync(dest, srcStat.mode)
}

function copyDir (src, dest, opts) {
  gracefulFs.readdirSync(src).forEach(function (item) { return copyDirItem(item, src, dest, opts); });
}

function copyDirItem (item, src, dest, opts) {
  var srcItem = path$5.join(src, item);
  var destItem = path$5.join(dest, item);
  var destStat = checkPaths(srcItem, destItem);
  return startCopy(destStat, srcItem, destItem, opts)
}

function onLink (destStat, src, dest, opts) {
  var resolvedSrc = gracefulFs.readlinkSync(src);

  if (opts.dereference) {
    resolvedSrc = path$5.resolve(process.cwd(), resolvedSrc);
  }

  if (destStat === notExist) {
    return gracefulFs.symlinkSync(resolvedSrc, dest)
  } else {
    var resolvedDest;
    try {
      resolvedDest = gracefulFs.readlinkSync(dest);
    } catch (err) {
      // dest exists and is a regular file or directory,
      // Windows may throw UNKNOWN error. If dest already exists,
      // fs throws error anyway, so no need to guard against it here.
      if (err.code === 'EINVAL' || err.code === 'UNKNOWN') { return gracefulFs.symlinkSync(resolvedSrc, dest) }
      throw err
    }
    if (opts.dereference) {
      resolvedDest = path$5.resolve(process.cwd(), resolvedDest);
    }
    if (isSrcSubdir(resolvedSrc, resolvedDest)) {
      throw new Error(("Cannot copy '" + resolvedSrc + "' to a subdirectory of itself, '" + resolvedDest + "'."))
    }

    // prevent copy if src is a subdir of dest since unlinking
    // dest in this case would result in removing src contents
    // and therefore a broken symlink would be created.
    if (gracefulFs.statSync(dest).isDirectory() && isSrcSubdir(resolvedDest, resolvedSrc)) {
      throw new Error(("Cannot overwrite '" + resolvedDest + "' with '" + resolvedSrc + "'."))
    }
    return copyLink(resolvedSrc, dest)
  }
}

function copyLink (resolvedSrc, dest) {
  gracefulFs.unlinkSync(dest);
  return gracefulFs.symlinkSync(resolvedSrc, dest)
}

// return true if dest is a subdir of src, otherwise false.
function isSrcSubdir (src, dest) {
  var srcArray = path$5.resolve(src).split(path$5.sep);
  var destArray = path$5.resolve(dest).split(path$5.sep);
  return srcArray.reduce(function (acc, current, i) { return acc && destArray[i] === current; }, true)
}

function checkStats (src, dest) {
  var srcStat = gracefulFs.statSync(src);
  var destStat;
  try {
    destStat = gracefulFs.statSync(dest);
  } catch (err) {
    if (err.code === 'ENOENT') { return {srcStat: srcStat, destStat: notExist} }
    throw err
  }
  return {srcStat: srcStat, destStat: destStat}
}

function checkPaths (src, dest) {
  var ref = checkStats(src, dest);
  var srcStat = ref.srcStat;
  var destStat = ref.destStat;
  if (destStat.ino && destStat.ino === srcStat.ino) {
    throw new Error('Source and destination must not be the same.')
  }
  if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
    throw new Error(("Cannot copy '" + src + "' to a subdirectory of itself, '" + dest + "'."))
  }
  return destStat
}

var copySync_1 = copySync;

var copySync$1 = {
  copySync: copySync_1
};

var u$1 = universalify.fromPromise;


function pathExists (path$$1) {
  return fs_1.access(path$$1).then(function () { return true; }).catch(function () { return false; })
}

var pathExists_1 = {
  pathExists: u$1(pathExists),
  pathExistsSync: fs_1.existsSync
};

var path$6 = require('path');
var mkdirp = mkdirs_1$1.mkdirs;
var pathExists$1 = pathExists_1.pathExists;
var utimes$1 = utimes.utimesMillis;

var notExist$1 = Symbol('notExist');

function copy (src, dest, opts, cb) {
  if (typeof opts === 'function' && !cb) {
    cb = opts;
    opts = {};
  } else if (typeof opts === 'function') {
    opts = {filter: opts};
  }

  cb = cb || function () {};
  opts = opts || {};

  opts.clobber = 'clobber' in opts ? !!opts.clobber : true; // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber; // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    console.warn("fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n\n    see https://github.com/jprichardson/node-fs-extra/issues/269");
  }

  checkPaths$1(src, dest, function (err, destStat) {
    if (err) { return cb(err) }
    if (opts.filter) { return handleFilter(checkParentDir, destStat, src, dest, opts, cb) }
    return checkParentDir(destStat, src, dest, opts, cb)
  });
}

function checkParentDir (destStat, src, dest, opts, cb) {
  var destParent = path$6.dirname(dest);
  pathExists$1(destParent, function (err, dirExists) {
    if (err) { return cb(err) }
    if (dirExists) { return startCopy$1(destStat, src, dest, opts, cb) }
    mkdirp(destParent, function (err) {
      if (err) { return cb(err) }
      return startCopy$1(destStat, src, dest, opts, cb)
    });
  });
}

function handleFilter (onInclude, destStat, src, dest, opts, cb) {
  Promise.resolve(opts.filter(src, dest)).then(function (include) {
    if (include) {
      if (destStat) { return onInclude(destStat, src, dest, opts, cb) }
      return onInclude(src, dest, opts, cb)
    }
    return cb()
  }, function (error) { return cb(error); });
}

function startCopy$1 (destStat, src, dest, opts, cb) {
  if (opts.filter) { return handleFilter(getStats$1, destStat, src, dest, opts, cb) }
  return getStats$1(destStat, src, dest, opts, cb)
}

function getStats$1 (destStat, src, dest, opts, cb) {
  var stat = opts.dereference ? gracefulFs.stat : gracefulFs.lstat;
  stat(src, function (err, srcStat) {
    if (err) { return cb(err) }

    if (srcStat.isDirectory()) { return onDir$1(srcStat, destStat, src, dest, opts, cb) }
    else if (srcStat.isFile() ||
             srcStat.isCharacterDevice() ||
             srcStat.isBlockDevice()) { return onFile$1(srcStat, destStat, src, dest, opts, cb) }
    else if (srcStat.isSymbolicLink()) { return onLink$1(destStat, src, dest, opts, cb) }
  });
}

function onFile$1 (srcStat, destStat, src, dest, opts, cb) {
  if (destStat === notExist$1) { return copyFile$1(srcStat, src, dest, opts, cb) }
  return mayCopyFile$1(srcStat, src, dest, opts, cb)
}

function mayCopyFile$1 (srcStat, src, dest, opts, cb) {
  if (opts.overwrite) {
    gracefulFs.unlink(dest, function (err) {
      if (err) { return cb(err) }
      return copyFile$1(srcStat, src, dest, opts, cb)
    });
  } else if (opts.errorOnExist) {
    return cb(new Error(("'" + dest + "' already exists")))
  } else { return cb() }
}

function copyFile$1 (srcStat, src, dest, opts, cb) {
  if (typeof gracefulFs.copyFile === 'function') {
    return gracefulFs.copyFile(src, dest, function (err) {
      if (err) { return cb(err) }
      return setDestModeAndTimestamps(srcStat, dest, opts, cb)
    })
  }
  return copyFileFallback$1(srcStat, src, dest, opts, cb)
}

function copyFileFallback$1 (srcStat, src, dest, opts, cb) {
  var rs = gracefulFs.createReadStream(src);
  rs.on('error', function (err) { return cb(err); }).once('open', function () {
    var ws = gracefulFs.createWriteStream(dest, { mode: srcStat.mode });
    ws.on('error', function (err) { return cb(err); })
      .on('open', function () { return rs.pipe(ws); })
      .once('close', function () { return setDestModeAndTimestamps(srcStat, dest, opts, cb); });
  });
}

function setDestModeAndTimestamps (srcStat, dest, opts, cb) {
  gracefulFs.chmod(dest, srcStat.mode, function (err) {
    if (err) { return cb(err) }
    if (opts.preserveTimestamps) {
      return utimes$1(dest, srcStat.atime, srcStat.mtime, cb)
    }
    return cb()
  });
}

function onDir$1 (srcStat, destStat, src, dest, opts, cb) {
  if (destStat === notExist$1) { return mkDirAndCopy$1(srcStat, src, dest, opts, cb) }
  if (destStat && !destStat.isDirectory()) {
    return cb(new Error(("Cannot overwrite non-directory '" + dest + "' with directory '" + src + "'.")))
  }
  return copyDir$1(src, dest, opts, cb)
}

function mkDirAndCopy$1 (srcStat, src, dest, opts, cb) {
  gracefulFs.mkdir(dest, function (err) {
    if (err) { return cb(err) }
    copyDir$1(src, dest, opts, function (err) {
      if (err) { return cb(err) }
      return gracefulFs.chmod(dest, srcStat.mode, cb)
    });
  });
}

function copyDir$1 (src, dest, opts, cb) {
  gracefulFs.readdir(src, function (err, items) {
    if (err) { return cb(err) }
    return copyDirItems(items, src, dest, opts, cb)
  });
}

function copyDirItems (items, src, dest, opts, cb) {
  var item = items.pop();
  if (!item) { return cb() }
  return copyDirItem$1(items, item, src, dest, opts, cb)
}

function copyDirItem$1 (items, item, src, dest, opts, cb) {
  var srcItem = path$6.join(src, item);
  var destItem = path$6.join(dest, item);
  checkPaths$1(srcItem, destItem, function (err, destStat) {
    if (err) { return cb(err) }
    startCopy$1(destStat, srcItem, destItem, opts, function (err) {
      if (err) { return cb(err) }
      return copyDirItems(items, src, dest, opts, cb)
    });
  });
}

function onLink$1 (destStat, src, dest, opts, cb) {
  gracefulFs.readlink(src, function (err, resolvedSrc) {
    if (err) { return cb(err) }

    if (opts.dereference) {
      resolvedSrc = path$6.resolve(process.cwd(), resolvedSrc);
    }

    if (destStat === notExist$1) {
      return gracefulFs.symlink(resolvedSrc, dest, cb)
    } else {
      gracefulFs.readlink(dest, function (err, resolvedDest) {
        if (err) {
          // dest exists and is a regular file or directory,
          // Windows may throw UNKNOWN error. If dest already exists,
          // fs throws error anyway, so no need to guard against it here.
          if (err.code === 'EINVAL' || err.code === 'UNKNOWN') { return gracefulFs.symlink(resolvedSrc, dest, cb) }
          return cb(err)
        }
        if (opts.dereference) {
          resolvedDest = path$6.resolve(process.cwd(), resolvedDest);
        }
        if (isSrcSubdir$1(resolvedSrc, resolvedDest)) {
          return cb(new Error(("Cannot copy '" + resolvedSrc + "' to a subdirectory of itself, '" + resolvedDest + "'.")))
        }

        // do not copy if src is a subdir of dest since unlinking
        // dest in this case would result in removing src contents
        // and therefore a broken symlink would be created.
        if (destStat.isDirectory() && isSrcSubdir$1(resolvedDest, resolvedSrc)) {
          return cb(new Error(("Cannot overwrite '" + resolvedDest + "' with '" + resolvedSrc + "'.")))
        }
        return copyLink$1(resolvedSrc, dest, cb)
      });
    }
  });
}

function copyLink$1 (resolvedSrc, dest, cb) {
  gracefulFs.unlink(dest, function (err) {
    if (err) { return cb(err) }
    return gracefulFs.symlink(resolvedSrc, dest, cb)
  });
}

// return true if dest is a subdir of src, otherwise false.
function isSrcSubdir$1 (src, dest) {
  var srcArray = path$6.resolve(src).split(path$6.sep);
  var destArray = path$6.resolve(dest).split(path$6.sep);
  return srcArray.reduce(function (acc, current, i) { return acc && destArray[i] === current; }, true)
}

function checkStats$1 (src, dest, cb) {
  gracefulFs.stat(src, function (err, srcStat) {
    if (err) { return cb(err) }
    gracefulFs.stat(dest, function (err, destStat) {
      if (err) {
        if (err.code === 'ENOENT') { return cb(null, {srcStat: srcStat, destStat: notExist$1}) }
        return cb(err)
      }
      return cb(null, {srcStat: srcStat, destStat: destStat})
    });
  });
}

function checkPaths$1 (src, dest, cb) {
  checkStats$1(src, dest, function (err, stats) {
    if (err) { return cb(err) }
    var srcStat = stats.srcStat;
    var destStat = stats.destStat;
    if (destStat.ino && destStat.ino === srcStat.ino) {
      return cb(new Error('Source and destination must not be the same.'))
    }
    if (srcStat.isDirectory() && isSrcSubdir$1(src, dest)) {
      return cb(new Error(("Cannot copy '" + src + "' to a subdirectory of itself, '" + dest + "'.")))
    }
    return cb(null, destStat)
  });
}

var copy_1 = copy;

var u$2 = universalify.fromCallback;
var copy$1 = {
  copy: u$2(copy_1)
};

var path$7 = require('path');
var assert = require('assert');

var isWindows = (process.platform === 'win32');

function defaults (options) {
  var methods = [
    'unlink',
    'chmod',
    'stat',
    'lstat',
    'rmdir',
    'readdir'
  ];
  methods.forEach(function (m) {
    options[m] = options[m] || gracefulFs[m];
    m = m + 'Sync';
    options[m] = options[m] || gracefulFs[m];
  });

  options.maxBusyTries = options.maxBusyTries || 3;
}

function rimraf (p, options, cb) {
  var busyTries = 0;

  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  assert(p, 'rimraf: missing path');
  assert.strictEqual(typeof p, 'string', 'rimraf: path should be a string');
  assert.strictEqual(typeof cb, 'function', 'rimraf: callback function required');
  assert(options, 'rimraf: invalid options argument provided');
  assert.strictEqual(typeof options, 'object', 'rimraf: options should be object');

  defaults(options);

  rimraf_(p, options, function CB (er) {
    if (er) {
      if ((er.code === 'EBUSY' || er.code === 'ENOTEMPTY' || er.code === 'EPERM') &&
          busyTries < options.maxBusyTries) {
        busyTries++;
        var time = busyTries * 100;
        // try again, with the same exact callback as this one.
        return setTimeout(function () { return rimraf_(p, options, CB); }, time)
      }

      // already gone
      if (er.code === 'ENOENT') { er = null; }
    }

    cb(er);
  });
}

// Two possible strategies.
// 1. Assume it's a file.  unlink it, then do the dir stuff on EPERM or EISDIR
// 2. Assume it's a directory.  readdir, then do the file stuff on ENOTDIR
//
// Both result in an extra syscall when you guess wrong.  However, there
// are likely far more normal files in the world than directories.  This
// is based on the assumption that a the average number of files per
// directory is >= 1.
//
// If anyone ever complains about this, then I guess the strategy could
// be made configurable somehow.  But until then, YAGNI.
function rimraf_ (p, options, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  // sunos lets the root user unlink directories, which is... weird.
  // so we have to lstat here and make sure it's not a dir.
  options.lstat(p, function (er, st) {
    if (er && er.code === 'ENOENT') {
      return cb(null)
    }

    // Windows can EPERM on stat.  Life is suffering.
    if (er && er.code === 'EPERM' && isWindows) {
      return fixWinEPERM(p, options, er, cb)
    }

    if (st && st.isDirectory()) {
      return rmdir(p, options, er, cb)
    }

    options.unlink(p, function (er) {
      if (er) {
        if (er.code === 'ENOENT') {
          return cb(null)
        }
        if (er.code === 'EPERM') {
          return (isWindows)
            ? fixWinEPERM(p, options, er, cb)
            : rmdir(p, options, er, cb)
        }
        if (er.code === 'EISDIR') {
          return rmdir(p, options, er, cb)
        }
      }
      return cb(er)
    });
  });
}

function fixWinEPERM (p, options, er, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');
  if (er) {
    assert(er instanceof Error);
  }

  options.chmod(p, 438, function (er2) {
    if (er2) {
      cb(er2.code === 'ENOENT' ? null : er);
    } else {
      options.stat(p, function (er3, stats) {
        if (er3) {
          cb(er3.code === 'ENOENT' ? null : er);
        } else if (stats.isDirectory()) {
          rmdir(p, options, er, cb);
        } else {
          options.unlink(p, cb);
        }
      });
    }
  });
}

function fixWinEPERMSync (p, options, er) {
  var stats;

  assert(p);
  assert(options);
  if (er) {
    assert(er instanceof Error);
  }

  try {
    options.chmodSync(p, 438);
  } catch (er2) {
    if (er2.code === 'ENOENT') {
      return
    } else {
      throw er
    }
  }

  try {
    stats = options.statSync(p);
  } catch (er3) {
    if (er3.code === 'ENOENT') {
      return
    } else {
      throw er
    }
  }

  if (stats.isDirectory()) {
    rmdirSync(p, options, er);
  } else {
    options.unlinkSync(p);
  }
}

function rmdir (p, options, originalEr, cb) {
  assert(p);
  assert(options);
  if (originalEr) {
    assert(originalEr instanceof Error);
  }
  assert(typeof cb === 'function');

  // try to rmdir first, and only readdir on ENOTEMPTY or EEXIST (SunOS)
  // if we guessed wrong, and it's not a directory, then
  // raise the original error.
  options.rmdir(p, function (er) {
    if (er && (er.code === 'ENOTEMPTY' || er.code === 'EEXIST' || er.code === 'EPERM')) {
      rmkids(p, options, cb);
    } else if (er && er.code === 'ENOTDIR') {
      cb(originalEr);
    } else {
      cb(er);
    }
  });
}

function rmkids (p, options, cb) {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  options.readdir(p, function (er, files) {
    if (er) { return cb(er) }

    var n = files.length;
    var errState;

    if (n === 0) { return options.rmdir(p, cb) }

    files.forEach(function (f) {
      rimraf(path$7.join(p, f), options, function (er) {
        if (errState) {
          return
        }
        if (er) { return cb(errState = er) }
        if (--n === 0) {
          options.rmdir(p, cb);
        }
      });
    });
  });
}

// this looks simpler, and is strictly *faster*, but will
// tie up the JavaScript thread and fail on excessively
// deep directory trees.
function rimrafSync (p, options) {
  var st;

  options = options || {};
  defaults(options);

  assert(p, 'rimraf: missing path');
  assert.strictEqual(typeof p, 'string', 'rimraf: path should be a string');
  assert(options, 'rimraf: missing options');
  assert.strictEqual(typeof options, 'object', 'rimraf: options should be object');

  try {
    st = options.lstatSync(p);
  } catch (er) {
    if (er.code === 'ENOENT') {
      return
    }

    // Windows can EPERM on stat.  Life is suffering.
    if (er.code === 'EPERM' && isWindows) {
      fixWinEPERMSync(p, options, er);
    }
  }

  try {
    // sunos lets the root user unlink directories, which is... weird.
    if (st && st.isDirectory()) {
      rmdirSync(p, options, null);
    } else {
      options.unlinkSync(p);
    }
  } catch (er) {
    if (er.code === 'ENOENT') {
      return
    } else if (er.code === 'EPERM') {
      return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er)
    } else if (er.code !== 'EISDIR') {
      throw er
    }
    rmdirSync(p, options, er);
  }
}

function rmdirSync (p, options, originalEr) {
  assert(p);
  assert(options);
  if (originalEr) {
    assert(originalEr instanceof Error);
  }

  try {
    options.rmdirSync(p);
  } catch (er) {
    if (er.code === 'ENOTDIR') {
      throw originalEr
    } else if (er.code === 'ENOTEMPTY' || er.code === 'EEXIST' || er.code === 'EPERM') {
      rmkidsSync(p, options);
    } else if (er.code !== 'ENOENT') {
      throw er
    }
  }
}

function rmkidsSync (p, options) {
  assert(p);
  assert(options);
  options.readdirSync(p).forEach(function (f) { return rimrafSync(path$7.join(p, f), options); });

  if (isWindows) {
    // We only end up here once we got ENOTEMPTY at least once, and
    // at this point, we are guaranteed to have removed all the kids.
    // So, we know that it won't be ENOENT or ENOTDIR or anything else.
    // try really hard to delete stuff on windows, because it has a
    // PROFOUNDLY annoying habit of not closing handles promptly when
    // files are deleted, resulting in spurious ENOTEMPTY errors.
    var startTime = Date.now();
    do {
      try {
        var ret = options.rmdirSync(p, options);
        return ret
      } catch (er) { }
    } while (Date.now() - startTime < 500) // give up after 500ms
  } else {
    var ret$1 = options.rmdirSync(p, options);
    return ret$1
  }
}

var rimraf_1 = rimraf;
rimraf.sync = rimrafSync;

var u$3 = universalify.fromCallback;


var remove = {
  remove: u$3(rimraf_1),
  removeSync: rimraf_1.sync
};

var u$4 = universalify.fromCallback;
var fs$1 = require('fs');
var path$8 = require('path');



var emptyDir = u$4(function emptyDir (dir, callback) {
  callback = callback || function () {};
  fs$1.readdir(dir, function (err, items) {
    if (err) { return mkdirs_1$1.mkdirs(dir, callback) }

    items = items.map(function (item) { return path$8.join(dir, item); });

    deleteItem();

    function deleteItem () {
      var item = items.pop();
      if (!item) { return callback() }
      remove.remove(item, function (err) {
        if (err) { return callback(err) }
        deleteItem();
      });
    }
  });
});

function emptyDirSync (dir) {
  var items;
  try {
    items = fs$1.readdirSync(dir);
  } catch (err) {
    return mkdirs_1$1.mkdirsSync(dir)
  }

  items.forEach(function (item) {
    item = path$8.join(dir, item);
    remove.removeSync(item);
  });
}

var empty = {
  emptyDirSync: emptyDirSync,
  emptydirSync: emptyDirSync,
  emptyDir: emptyDir,
  emptydir: emptyDir
};

var u$5 = universalify.fromCallback;
var path$9 = require('path');


var pathExists$2 = pathExists_1.pathExists;

function createFile (file, callback) {
  function makeFile () {
    gracefulFs.writeFile(file, '', function (err) {
      if (err) { return callback(err) }
      callback();
    });
  }

  gracefulFs.stat(file, function (err, stats) { // eslint-disable-line handle-callback-err
    if (!err && stats.isFile()) { return callback() }
    var dir = path$9.dirname(file);
    pathExists$2(dir, function (err, dirExists) {
      if (err) { return callback(err) }
      if (dirExists) { return makeFile() }
      mkdirs_1$1.mkdirs(dir, function (err) {
        if (err) { return callback(err) }
        makeFile();
      });
    });
  });
}

function createFileSync (file) {
  var stats;
  try {
    stats = gracefulFs.statSync(file);
  } catch (e) {}
  if (stats && stats.isFile()) { return }

  var dir = path$9.dirname(file);
  if (!gracefulFs.existsSync(dir)) {
    mkdirs_1$1.mkdirsSync(dir);
  }

  gracefulFs.writeFileSync(file, '');
}

var file = {
  createFile: u$5(createFile),
  createFileSync: createFileSync
};

var u$6 = universalify.fromCallback;
var path$a = require('path');


var pathExists$3 = pathExists_1.pathExists;

function createLink (srcpath, dstpath, callback) {
  function makeLink (srcpath, dstpath) {
    gracefulFs.link(srcpath, dstpath, function (err) {
      if (err) { return callback(err) }
      callback(null);
    });
  }

  pathExists$3(dstpath, function (err, destinationExists) {
    if (err) { return callback(err) }
    if (destinationExists) { return callback(null) }
    gracefulFs.lstat(srcpath, function (err) {
      if (err) {
        err.message = err.message.replace('lstat', 'ensureLink');
        return callback(err)
      }

      var dir = path$a.dirname(dstpath);
      pathExists$3(dir, function (err, dirExists) {
        if (err) { return callback(err) }
        if (dirExists) { return makeLink(srcpath, dstpath) }
        mkdirs_1$1.mkdirs(dir, function (err) {
          if (err) { return callback(err) }
          makeLink(srcpath, dstpath);
        });
      });
    });
  });
}

function createLinkSync (srcpath, dstpath) {
  var destinationExists = gracefulFs.existsSync(dstpath);
  if (destinationExists) { return undefined }

  try {
    gracefulFs.lstatSync(srcpath);
  } catch (err) {
    err.message = err.message.replace('lstat', 'ensureLink');
    throw err
  }

  var dir = path$a.dirname(dstpath);
  var dirExists = gracefulFs.existsSync(dir);
  if (dirExists) { return gracefulFs.linkSync(srcpath, dstpath) }
  mkdirs_1$1.mkdirsSync(dir);

  return gracefulFs.linkSync(srcpath, dstpath)
}

var link = {
  createLink: u$6(createLink),
  createLinkSync: createLinkSync
};

var path$b = require('path');

var pathExists$4 = pathExists_1.pathExists;

/**
 * Function that returns two types of paths, one relative to symlink, and one
 * relative to the current working directory. Checks if path is absolute or
 * relative. If the path is relative, this function checks if the path is
 * relative to symlink or relative to current working directory. This is an
 * initiative to find a smarter `srcpath` to supply when building symlinks.
 * This allows you to determine which path to use out of one of three possible
 * types of source paths. The first is an absolute path. This is detected by
 * `path.isAbsolute()`. When an absolute path is provided, it is checked to
 * see if it exists. If it does it's used, if not an error is returned
 * (callback)/ thrown (sync). The other two options for `srcpath` are a
 * relative url. By default Node's `fs.symlink` works by creating a symlink
 * using `dstpath` and expects the `srcpath` to be relative to the newly
 * created symlink. If you provide a `srcpath` that does not exist on the file
 * system it results in a broken symlink. To minimize this, the function
 * checks to see if the 'relative to symlink' source file exists, and if it
 * does it will use it. If it does not, it checks if there's a file that
 * exists that is relative to the current working directory, if does its used.
 * This preserves the expectations of the original fs.symlink spec and adds
 * the ability to pass in `relative to current working direcotry` paths.
 */

function symlinkPaths (srcpath, dstpath, callback) {
  if (path$b.isAbsolute(srcpath)) {
    return gracefulFs.lstat(srcpath, function (err) {
      if (err) {
        err.message = err.message.replace('lstat', 'ensureSymlink');
        return callback(err)
      }
      return callback(null, {
        'toCwd': srcpath,
        'toDst': srcpath
      })
    })
  } else {
    var dstdir = path$b.dirname(dstpath);
    var relativeToDst = path$b.join(dstdir, srcpath);
    return pathExists$4(relativeToDst, function (err, exists) {
      if (err) { return callback(err) }
      if (exists) {
        return callback(null, {
          'toCwd': relativeToDst,
          'toDst': srcpath
        })
      } else {
        return gracefulFs.lstat(srcpath, function (err) {
          if (err) {
            err.message = err.message.replace('lstat', 'ensureSymlink');
            return callback(err)
          }
          return callback(null, {
            'toCwd': srcpath,
            'toDst': path$b.relative(dstdir, srcpath)
          })
        })
      }
    })
  }
}

function symlinkPathsSync (srcpath, dstpath) {
  var exists;
  if (path$b.isAbsolute(srcpath)) {
    exists = gracefulFs.existsSync(srcpath);
    if (!exists) { throw new Error('absolute srcpath does not exist') }
    return {
      'toCwd': srcpath,
      'toDst': srcpath
    }
  } else {
    var dstdir = path$b.dirname(dstpath);
    var relativeToDst = path$b.join(dstdir, srcpath);
    exists = gracefulFs.existsSync(relativeToDst);
    if (exists) {
      return {
        'toCwd': relativeToDst,
        'toDst': srcpath
      }
    } else {
      exists = gracefulFs.existsSync(srcpath);
      if (!exists) { throw new Error('relative srcpath does not exist') }
      return {
        'toCwd': srcpath,
        'toDst': path$b.relative(dstdir, srcpath)
      }
    }
  }
}

var symlinkPaths_1 = {
  symlinkPaths: symlinkPaths,
  symlinkPathsSync: symlinkPathsSync
};

function symlinkType (srcpath, type, callback) {
  callback = (typeof type === 'function') ? type : callback;
  type = (typeof type === 'function') ? false : type;
  if (type) { return callback(null, type) }
  gracefulFs.lstat(srcpath, function (err, stats) {
    if (err) { return callback(null, 'file') }
    type = (stats && stats.isDirectory()) ? 'dir' : 'file';
    callback(null, type);
  });
}

function symlinkTypeSync (srcpath, type) {
  var stats;

  if (type) { return type }
  try {
    stats = gracefulFs.lstatSync(srcpath);
  } catch (e) {
    return 'file'
  }
  return (stats && stats.isDirectory()) ? 'dir' : 'file'
}

var symlinkType_1 = {
  symlinkType: symlinkType,
  symlinkTypeSync: symlinkTypeSync
};

var u$7 = universalify.fromCallback;
var path$c = require('path');


var mkdirs$2 = mkdirs_1$1.mkdirs;
var mkdirsSync$1 = mkdirs_1$1.mkdirsSync;


var symlinkPaths$1 = symlinkPaths_1.symlinkPaths;
var symlinkPathsSync$1 = symlinkPaths_1.symlinkPathsSync;


var symlinkType$1 = symlinkType_1.symlinkType;
var symlinkTypeSync$1 = symlinkType_1.symlinkTypeSync;

var pathExists$5 = pathExists_1.pathExists;

function createSymlink (srcpath, dstpath, type, callback) {
  callback = (typeof type === 'function') ? type : callback;
  type = (typeof type === 'function') ? false : type;

  pathExists$5(dstpath, function (err, destinationExists) {
    if (err) { return callback(err) }
    if (destinationExists) { return callback(null) }
    symlinkPaths$1(srcpath, dstpath, function (err, relative) {
      if (err) { return callback(err) }
      srcpath = relative.toDst;
      symlinkType$1(relative.toCwd, type, function (err, type) {
        if (err) { return callback(err) }
        var dir = path$c.dirname(dstpath);
        pathExists$5(dir, function (err, dirExists) {
          if (err) { return callback(err) }
          if (dirExists) { return gracefulFs.symlink(srcpath, dstpath, type, callback) }
          mkdirs$2(dir, function (err) {
            if (err) { return callback(err) }
            gracefulFs.symlink(srcpath, dstpath, type, callback);
          });
        });
      });
    });
  });
}

function createSymlinkSync (srcpath, dstpath, type) {
  var destinationExists = gracefulFs.existsSync(dstpath);
  if (destinationExists) { return undefined }

  var relative = symlinkPathsSync$1(srcpath, dstpath);
  srcpath = relative.toDst;
  type = symlinkTypeSync$1(relative.toCwd, type);
  var dir = path$c.dirname(dstpath);
  var exists = gracefulFs.existsSync(dir);
  if (exists) { return gracefulFs.symlinkSync(srcpath, dstpath, type) }
  mkdirsSync$1(dir);
  return gracefulFs.symlinkSync(srcpath, dstpath, type)
}

var symlink = {
  createSymlink: u$7(createSymlink),
  createSymlinkSync: createSymlinkSync
};

var ensure = {
  // file
  createFile: file.createFile,
  createFileSync: file.createFileSync,
  ensureFile: file.createFile,
  ensureFileSync: file.createFileSync,
  // link
  createLink: link.createLink,
  createLinkSync: link.createLinkSync,
  ensureLink: link.createLink,
  ensureLinkSync: link.createLinkSync,
  // symlink
  createSymlink: symlink.createSymlink,
  createSymlinkSync: symlink.createSymlinkSync,
  ensureSymlink: symlink.createSymlink,
  ensureSymlinkSync: symlink.createSymlinkSync
};

var origCwd$1 = process.cwd;
var cwd$1 = null;

var platform$1 = process.env.GRACEFUL_FS_PLATFORM || process.platform;

process.cwd = function() {
  if (!cwd$1)
    { cwd$1 = origCwd$1.call(process); }
  return cwd$1
};
try {
  process.cwd();
} catch (er) {}

var chdir$1 = process.chdir;
process.chdir = function(d) {
  cwd$1 = null;
  chdir$1.call(process, d);
};

var polyfills$1 = patch$1;

function patch$1 (fs$$1) {
  // (re-)implement some things that are known busted or missing.

  // lchmod, broken prior to 0.6.2
  // back-port the fix here.
  if (constants.hasOwnProperty('O_SYMLINK') &&
      process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs$$1);
  }

  // lutimes implementation, or no-op
  if (!fs$$1.lutimes) {
    patchLutimes(fs$$1);
  }

  // https://github.com/isaacs/node-graceful-fs/issues/4
  // Chown should not fail on einval or eperm if non-root.
  // It should not fail on enosys ever, as this just indicates
  // that a fs doesn't support the intended operation.

  fs$$1.chown = chownFix(fs$$1.chown);
  fs$$1.fchown = chownFix(fs$$1.fchown);
  fs$$1.lchown = chownFix(fs$$1.lchown);

  fs$$1.chmod = chmodFix(fs$$1.chmod);
  fs$$1.fchmod = chmodFix(fs$$1.fchmod);
  fs$$1.lchmod = chmodFix(fs$$1.lchmod);

  fs$$1.chownSync = chownFixSync(fs$$1.chownSync);
  fs$$1.fchownSync = chownFixSync(fs$$1.fchownSync);
  fs$$1.lchownSync = chownFixSync(fs$$1.lchownSync);

  fs$$1.chmodSync = chmodFixSync(fs$$1.chmodSync);
  fs$$1.fchmodSync = chmodFixSync(fs$$1.fchmodSync);
  fs$$1.lchmodSync = chmodFixSync(fs$$1.lchmodSync);

  fs$$1.stat = statFix(fs$$1.stat);
  fs$$1.fstat = statFix(fs$$1.fstat);
  fs$$1.lstat = statFix(fs$$1.lstat);

  fs$$1.statSync = statFixSync(fs$$1.statSync);
  fs$$1.fstatSync = statFixSync(fs$$1.fstatSync);
  fs$$1.lstatSync = statFixSync(fs$$1.lstatSync);

  // if lchmod/lchown do not exist, then make them no-ops
  if (!fs$$1.lchmod) {
    fs$$1.lchmod = function (path$$1, mode, cb) {
      if (cb) { process.nextTick(cb); }
    };
    fs$$1.lchmodSync = function () {};
  }
  if (!fs$$1.lchown) {
    fs$$1.lchown = function (path$$1, uid, gid, cb) {
      if (cb) { process.nextTick(cb); }
    };
    fs$$1.lchownSync = function () {};
  }

  // on Windows, A/V software can lock the directory, causing this
  // to fail with an EACCES or EPERM if the directory contains newly
  // created files.  Try again on failure, for up to 60 seconds.

  // Set the timeout this long because some Windows Anti-Virus, such as Parity
  // bit9, may lock files for up to a minute, causing npm package install
  // failures. Also, take care to yield the scheduler. Windows scheduling gives
  // CPU to a busy looping process, which can cause the program causing the lock
  // contention to be starved of CPU by node, so the contention doesn't resolve.
  if (platform$1 === "win32") {
    fs$$1.rename = (function (fs$rename) { return function (from, to, cb) {
      var start = Date.now();
      var backoff = 0;
      fs$rename(from, to, function CB (er) {
        if (er
            && (er.code === "EACCES" || er.code === "EPERM")
            && Date.now() - start < 60000) {
          setTimeout(function() {
            fs$$1.stat(to, function (stater, st) {
              if (stater && stater.code === "ENOENT")
                { fs$rename(from, to, CB); }
              else
                { cb(er); }
            });
          }, backoff);
          if (backoff < 100)
            { backoff += 10; }
          return;
        }
        if (cb) { cb(er); }
      });
    }})(fs$$1.rename);
  }

  // if read() returns EAGAIN, then just try it again.
  fs$$1.read = (function (fs$read) { return function (fd, buffer, offset, length, position, callback_) {
    var callback;
    if (callback_ && typeof callback_ === 'function') {
      var eagCounter = 0;
      callback = function (er, _, __) {
        if (er && er.code === 'EAGAIN' && eagCounter < 10) {
          eagCounter ++;
          return fs$read.call(fs$$1, fd, buffer, offset, length, position, callback)
        }
        callback_.apply(this, arguments);
      };
    }
    return fs$read.call(fs$$1, fd, buffer, offset, length, position, callback)
  }})(fs$$1.read);

  fs$$1.readSync = (function (fs$readSync) { return function (fd, buffer, offset, length, position) {
    var eagCounter = 0;
    while (true) {
      try {
        return fs$readSync.call(fs$$1, fd, buffer, offset, length, position)
      } catch (er) {
        if (er.code === 'EAGAIN' && eagCounter < 10) {
          eagCounter ++;
          continue
        }
        throw er
      }
    }
  }})(fs$$1.readSync);

  function patchLchmod (fs$$1) {
    fs$$1.lchmod = function (path$$1, mode, callback) {
      fs$$1.open( path$$1
             , constants.O_WRONLY | constants.O_SYMLINK
             , mode
             , function (err, fd) {
        if (err) {
          if (callback) { callback(err); }
          return
        }
        // prefer to return the chmod error, if one occurs,
        // but still try to close, and report closing errors if they occur.
        fs$$1.fchmod(fd, mode, function (err) {
          fs$$1.close(fd, function(err2) {
            if (callback) { callback(err || err2); }
          });
        });
      });
    };

    fs$$1.lchmodSync = function (path$$1, mode) {
      var fd = fs$$1.openSync(path$$1, constants.O_WRONLY | constants.O_SYMLINK, mode);

      // prefer to return the chmod error, if one occurs,
      // but still try to close, and report closing errors if they occur.
      var threw = true;
      var ret;
      try {
        ret = fs$$1.fchmodSync(fd, mode);
        threw = false;
      } finally {
        if (threw) {
          try {
            fs$$1.closeSync(fd);
          } catch (er) {}
        } else {
          fs$$1.closeSync(fd);
        }
      }
      return ret
    };
  }

  function patchLutimes (fs$$1) {
    if (constants.hasOwnProperty("O_SYMLINK")) {
      fs$$1.lutimes = function (path$$1, at, mt, cb) {
        fs$$1.open(path$$1, constants.O_SYMLINK, function (er, fd) {
          if (er) {
            if (cb) { cb(er); }
            return
          }
          fs$$1.futimes(fd, at, mt, function (er) {
            fs$$1.close(fd, function (er2) {
              if (cb) { cb(er || er2); }
            });
          });
        });
      };

      fs$$1.lutimesSync = function (path$$1, at, mt) {
        var fd = fs$$1.openSync(path$$1, constants.O_SYMLINK);
        var ret;
        var threw = true;
        try {
          ret = fs$$1.futimesSync(fd, at, mt);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs$$1.closeSync(fd);
            } catch (er) {}
          } else {
            fs$$1.closeSync(fd);
          }
        }
        return ret
      };

    } else {
      fs$$1.lutimes = function (_a, _b, _c, cb) { if (cb) { process.nextTick(cb); } };
      fs$$1.lutimesSync = function () {};
    }
  }

  function chmodFix (orig) {
    if (!orig) { return orig }
    return function (target, mode, cb) {
      return orig.call(fs$$1, target, mode, function (er) {
        if (chownErOk(er)) { er = null; }
        if (cb) { cb.apply(this, arguments); }
      })
    }
  }

  function chmodFixSync (orig) {
    if (!orig) { return orig }
    return function (target, mode) {
      try {
        return orig.call(fs$$1, target, mode)
      } catch (er) {
        if (!chownErOk(er)) { throw er }
      }
    }
  }


  function chownFix (orig) {
    if (!orig) { return orig }
    return function (target, uid, gid, cb) {
      return orig.call(fs$$1, target, uid, gid, function (er) {
        if (chownErOk(er)) { er = null; }
        if (cb) { cb.apply(this, arguments); }
      })
    }
  }

  function chownFixSync (orig) {
    if (!orig) { return orig }
    return function (target, uid, gid) {
      try {
        return orig.call(fs$$1, target, uid, gid)
      } catch (er) {
        if (!chownErOk(er)) { throw er }
      }
    }
  }


  function statFix (orig) {
    if (!orig) { return orig }
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, cb) {
      return orig.call(fs$$1, target, function (er, stats) {
        if (!stats) { return cb.apply(this, arguments) }
        if (stats.uid < 0) { stats.uid += 0x100000000; }
        if (stats.gid < 0) { stats.gid += 0x100000000; }
        if (cb) { cb.apply(this, arguments); }
      })
    }
  }

  function statFixSync (orig) {
    if (!orig) { return orig }
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target) {
      var stats = orig.call(fs$$1, target);
      if (stats.uid < 0) { stats.uid += 0x100000000; }
      if (stats.gid < 0) { stats.gid += 0x100000000; }
      return stats;
    }
  }

  // ENOSYS means that the fs doesn't support the op. Just ignore
  // that, because it doesn't matter.
  //
  // if there's no getuid, or if getuid() is something other
  // than 0, and the error is EINVAL or EPERM, then just ignore
  // it.
  //
  // This specific case is a silent failure in cp, install, tar,
  // and most other unix tools that manage permissions.
  //
  // When running as root, or if other types of errors are
  // encountered, then it's strict.
  function chownErOk (er) {
    if (!er)
      { return true }

    if (er.code === "ENOSYS")
      { return true }

    var nonroot = !process.getuid || process.getuid() !== 0;
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        { return true }
    }

    return false
  }
}

var Stream$1 = require('stream').Stream;

var legacyStreams$1 = legacy$1;

function legacy$1 (fs$$1) {
  return {
    ReadStream: ReadStream,
    WriteStream: WriteStream
  }

  function ReadStream (path$$1, options) {
    if (!(this instanceof ReadStream)) { return new ReadStream(path$$1, options); }

    Stream$1.call(this);

    var self = this;

    this.path = path$$1;
    this.fd = null;
    this.readable = true;
    this.paused = false;

    this.flags = 'r';
    this.mode = 438; /*=0666*/
    this.bufferSize = 64 * 1024;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.encoding) { this.setEncoding(this.encoding); }

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.end === undefined) {
        this.end = Infinity;
      } else if ('number' !== typeof this.end) {
        throw TypeError('end must be a Number');
      }

      if (this.start > this.end) {
        throw new Error('start must be <= end');
      }

      this.pos = this.start;
    }

    if (this.fd !== null) {
      process.nextTick(function() {
        self._read();
      });
      return;
    }

    fs$$1.open(this.path, this.flags, this.mode, function (err, fd) {
      if (err) {
        self.emit('error', err);
        self.readable = false;
        return;
      }

      self.fd = fd;
      self.emit('open', fd);
      self._read();
    });
  }

  function WriteStream (path$$1, options) {
    if (!(this instanceof WriteStream)) { return new WriteStream(path$$1, options); }

    Stream$1.call(this);

    this.path = path$$1;
    this.fd = null;
    this.writable = true;

    this.flags = 'w';
    this.encoding = 'binary';
    this.mode = 438; /*=0666*/
    this.bytesWritten = 0;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.start < 0) {
        throw new Error('start must be >= zero');
      }

      this.pos = this.start;
    }

    this.busy = false;
    this._queue = [];

    if (this.fd === null) {
      this._open = fs$$1.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
      this.flush();
    }
  }
}

var clone_1$1 = clone$1;

function clone$1 (obj) {
  if (obj === null || typeof obj !== 'object')
    { return obj }

  if (obj instanceof Object)
    { var copy = { __proto__: obj.__proto__ }; }
  else
    { var copy = Object.create(null); }

  Object.getOwnPropertyNames(obj).forEach(function (key) {
    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
  });

  return copy
}

var gracefulFs$1 = createCommonjsModule(function (module) {
var fs$$1 = require('fs');




var queue = [];

var util = require('util');

function noop () {}

var debug = noop;
if (util.debuglog)
  { debug = util.debuglog('gfs4'); }
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
  { debug = function() {
    var m = util.format.apply(util, arguments);
    m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ');
    console.error(m);
  }; }

if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
  process.on('exit', function() {
    debug(queue);
    require('assert').equal(queue.length, 0);
  });
}

module.exports = patch(clone_1$1(fs$$1));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs$$1.__patched) {
    module.exports = patch(fs$$1);
    fs$$1.__patched = true;
}

// Always patch fs.close/closeSync, because we want to
// retry() whenever a close happens *anywhere* in the program.
// This is essential when multiple graceful-fs instances are
// in play at the same time.
module.exports.close = (function (fs$close) { return function (fd, cb) {
  return fs$close.call(fs$$1, fd, function (err) {
    if (!err)
      { retry(); }

    if (typeof cb === 'function')
      { cb.apply(this, arguments); }
  })
}})(fs$$1.close);

module.exports.closeSync = (function (fs$closeSync) { return function (fd) {
  // Note that graceful-fs also retries when fs.closeSync() fails.
  // Looks like a bug to me, although it's probably a harmless one.
  var rval = fs$closeSync.apply(fs$$1, arguments);
  retry();
  return rval
}})(fs$$1.closeSync);

// Only patch fs once, otherwise we'll run into a memory leak if
// graceful-fs is loaded multiple times, such as in test environments that
// reset the loaded modules between tests.
// We look for the string `graceful-fs` from the comment above. This
// way we are not adding any extra properties and it will detect if older
// versions of graceful-fs are installed.
if (!/\bgraceful-fs\b/.test(fs$$1.closeSync.toString())) {
  fs$$1.closeSync = module.exports.closeSync;
  fs$$1.close = module.exports.close;
}

function patch (fs$$1) {
  // Everything that references the open() function needs to be in here
  polyfills$1(fs$$1);
  fs$$1.gracefulify = patch;
  fs$$1.FileReadStream = ReadStream;  // Legacy name.
  fs$$1.FileWriteStream = WriteStream;  // Legacy name.
  fs$$1.createReadStream = createReadStream;
  fs$$1.createWriteStream = createWriteStream;
  var fs$readFile = fs$$1.readFile;
  fs$$1.readFile = readFile;
  function readFile (path$$1, options, cb) {
    if (typeof options === 'function')
      { cb = options, options = null; }

    return go$readFile(path$$1, options, cb)

    function go$readFile (path$$1, options, cb) {
      return fs$readFile(path$$1, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          { enqueue([go$readFile, [path$$1, options, cb]]); }
        else {
          if (typeof cb === 'function')
            { cb.apply(this, arguments); }
          retry();
        }
      })
    }
  }

  var fs$writeFile = fs$$1.writeFile;
  fs$$1.writeFile = writeFile;
  function writeFile (path$$1, data, options, cb) {
    if (typeof options === 'function')
      { cb = options, options = null; }

    return go$writeFile(path$$1, data, options, cb)

    function go$writeFile (path$$1, data, options, cb) {
      return fs$writeFile(path$$1, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          { enqueue([go$writeFile, [path$$1, data, options, cb]]); }
        else {
          if (typeof cb === 'function')
            { cb.apply(this, arguments); }
          retry();
        }
      })
    }
  }

  var fs$appendFile = fs$$1.appendFile;
  if (fs$appendFile)
    { fs$$1.appendFile = appendFile; }
  function appendFile (path$$1, data, options, cb) {
    if (typeof options === 'function')
      { cb = options, options = null; }

    return go$appendFile(path$$1, data, options, cb)

    function go$appendFile (path$$1, data, options, cb) {
      return fs$appendFile(path$$1, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          { enqueue([go$appendFile, [path$$1, data, options, cb]]); }
        else {
          if (typeof cb === 'function')
            { cb.apply(this, arguments); }
          retry();
        }
      })
    }
  }

  var fs$readdir = fs$$1.readdir;
  fs$$1.readdir = readdir;
  function readdir (path$$1, options, cb) {
    var args = [path$$1];
    if (typeof options !== 'function') {
      args.push(options);
    } else {
      cb = options;
    }
    args.push(go$readdir$cb);

    return go$readdir(args)

    function go$readdir$cb (err, files) {
      if (files && files.sort)
        { files.sort(); }

      if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
        { enqueue([go$readdir, [args]]); }

      else {
        if (typeof cb === 'function')
          { cb.apply(this, arguments); }
        retry();
      }
    }
  }

  function go$readdir (args) {
    return fs$readdir.apply(fs$$1, args)
  }

  if (process.version.substr(0, 4) === 'v0.8') {
    var legStreams = legacyStreams$1(fs$$1);
    ReadStream = legStreams.ReadStream;
    WriteStream = legStreams.WriteStream;
  }

  var fs$ReadStream = fs$$1.ReadStream;
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype);
    ReadStream.prototype.open = ReadStream$open;
  }

  var fs$WriteStream = fs$$1.WriteStream;
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype);
    WriteStream.prototype.open = WriteStream$open;
  }

  fs$$1.ReadStream = ReadStream;
  fs$$1.WriteStream = WriteStream;

  function ReadStream (path$$1, options) {
    if (this instanceof ReadStream)
      { return fs$ReadStream.apply(this, arguments), this }
    else
      { return ReadStream.apply(Object.create(ReadStream.prototype), arguments) }
  }

  function ReadStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        if (that.autoClose)
          { that.destroy(); }

        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
        that.read();
      }
    });
  }

  function WriteStream (path$$1, options) {
    if (this instanceof WriteStream)
      { return fs$WriteStream.apply(this, arguments), this }
    else
      { return WriteStream.apply(Object.create(WriteStream.prototype), arguments) }
  }

  function WriteStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        that.destroy();
        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
      }
    });
  }

  function createReadStream (path$$1, options) {
    return new ReadStream(path$$1, options)
  }

  function createWriteStream (path$$1, options) {
    return new WriteStream(path$$1, options)
  }

  var fs$open = fs$$1.open;
  fs$$1.open = open;
  function open (path$$1, flags, mode, cb) {
    if (typeof mode === 'function')
      { cb = mode, mode = null; }

    return go$open(path$$1, flags, mode, cb)

    function go$open (path$$1, flags, mode, cb) {
      return fs$open(path$$1, flags, mode, function (err, fd) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          { enqueue([go$open, [path$$1, flags, mode, cb]]); }
        else {
          if (typeof cb === 'function')
            { cb.apply(this, arguments); }
          retry();
        }
      })
    }
  }

  return fs$$1
}

function enqueue (elem) {
  debug('ENQUEUE', elem[0].name, elem[1]);
  queue.push(elem);
}

function retry () {
  var elem = queue.shift();
  if (elem) {
    debug('RETRY', elem[0].name, elem[1]);
    elem[0].apply(null, elem[1]);
  }
}
});
var gracefulFs_1$1 = gracefulFs$1.close;
var gracefulFs_2$1 = gracefulFs$1.closeSync;

var _fs;
try {
  _fs = gracefulFs$1;
} catch (_) {
  _fs = require('fs');
}

function readFile (file, options, callback) {
  if (callback == null) {
    callback = options;
    options = {};
  }

  if (typeof options === 'string') {
    options = {encoding: options};
  }

  options = options || {};
  var fs$$1 = options.fs || _fs;

  var shouldThrow = true;
  if ('throws' in options) {
    shouldThrow = options.throws;
  }

  fs$$1.readFile(file, options, function (err, data) {
    if (err) { return callback(err) }

    data = stripBom(data);

    var obj;
    try {
      obj = JSON.parse(data, options ? options.reviver : null);
    } catch (err2) {
      if (shouldThrow) {
        err2.message = file + ': ' + err2.message;
        return callback(err2)
      } else {
        return callback(null, null)
      }
    }

    callback(null, obj);
  });
}

function readFileSync (file, options) {
  options = options || {};
  if (typeof options === 'string') {
    options = {encoding: options};
  }

  var fs$$1 = options.fs || _fs;

  var shouldThrow = true;
  if ('throws' in options) {
    shouldThrow = options.throws;
  }

  try {
    var content = fs$$1.readFileSync(file, options);
    content = stripBom(content);
    return JSON.parse(content, options.reviver)
  } catch (err) {
    if (shouldThrow) {
      err.message = file + ': ' + err.message;
      throw err
    } else {
      return null
    }
  }
}

function stringify (obj, options) {
  var spaces;
  var EOL = '\n';
  if (typeof options === 'object' && options !== null) {
    if (options.spaces) {
      spaces = options.spaces;
    }
    if (options.EOL) {
      EOL = options.EOL;
    }
  }

  var str = JSON.stringify(obj, options ? options.replacer : null, spaces);

  return str.replace(/\n/g, EOL) + EOL
}

function writeFile (file, obj, options, callback) {
  if (callback == null) {
    callback = options;
    options = {};
  }
  options = options || {};
  var fs$$1 = options.fs || _fs;

  var str = '';
  try {
    str = stringify(obj, options);
  } catch (err) {
    // Need to return whether a callback was passed or not
    if (callback) { callback(err, null); }
    return
  }

  fs$$1.writeFile(file, str, options, callback);
}

function writeFileSync (file, obj, options) {
  options = options || {};
  var fs$$1 = options.fs || _fs;

  var str = stringify(obj, options);
  // not sure if fs.writeFileSync returns anything, but just in case
  return fs$$1.writeFileSync(file, str, options)
}

function stripBom (content) {
  // we do this because JSON.parse would convert it to a utf8 string if encoding wasn't specified
  if (Buffer.isBuffer(content)) { content = content.toString('utf8'); }
  content = content.replace(/^\uFEFF/, '');
  return content
}

var jsonfile = {
  readFile: readFile,
  readFileSync: readFileSync,
  writeFile: writeFile,
  writeFileSync: writeFileSync
};

var jsonfile_1 = jsonfile;

var u$8 = universalify.fromCallback;


var jsonfile$1 = {
  // jsonfile exports
  readJson: u$8(jsonfile_1.readFile),
  readJsonSync: jsonfile_1.readFileSync,
  writeJson: u$8(jsonfile_1.writeFile),
  writeJsonSync: jsonfile_1.writeFileSync
};

var path$d = require('path');

var pathExists$6 = pathExists_1.pathExists;


function outputJson (file, data, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var dir = path$d.dirname(file);

  pathExists$6(dir, function (err, itDoes) {
    if (err) { return callback(err) }
    if (itDoes) { return jsonfile$1.writeJson(file, data, options, callback) }

    mkdirs_1$1.mkdirs(dir, function (err) {
      if (err) { return callback(err) }
      jsonfile$1.writeJson(file, data, options, callback);
    });
  });
}

var outputJson_1 = outputJson;

var path$e = require('path');



function outputJsonSync (file, data, options) {
  var dir = path$e.dirname(file);

  if (!gracefulFs.existsSync(dir)) {
    mkdirs_1$1.mkdirsSync(dir);
  }

  jsonfile$1.writeJsonSync(file, data, options);
}

var outputJsonSync_1 = outputJsonSync;

var u$9 = universalify.fromCallback;


jsonfile$1.outputJson = u$9(outputJson_1);
jsonfile$1.outputJsonSync = outputJsonSync_1;
// aliases
jsonfile$1.outputJSON = jsonfile$1.outputJson;
jsonfile$1.outputJSONSync = jsonfile$1.outputJsonSync;
jsonfile$1.writeJSON = jsonfile$1.writeJson;
jsonfile$1.writeJSONSync = jsonfile$1.writeJsonSync;
jsonfile$1.readJSON = jsonfile$1.readJson;
jsonfile$1.readJSONSync = jsonfile$1.readJsonSync;

var json = jsonfile$1;

var path$f = require('path');
var copySync$2 = copySync$1.copySync;
var removeSync = remove.removeSync;
var mkdirpSync$1 = mkdirs_1$1.mkdirsSync;


function moveSync (src, dest, options) {
  options = options || {};
  var overwrite = options.overwrite || options.clobber || false;

  src = path$f.resolve(src);
  dest = path$f.resolve(dest);

  if (src === dest) { return gracefulFs.accessSync(src) }

  if (isSrcSubdir$2(src, dest)) { throw new Error(("Cannot move '" + src + "' into itself '" + dest + "'.")) }

  mkdirpSync$1(path$f.dirname(dest));
  tryRenameSync();

  function tryRenameSync () {
    if (overwrite) {
      try {
        return gracefulFs.renameSync(src, dest)
      } catch (err) {
        if (err.code === 'ENOTEMPTY' || err.code === 'EEXIST' || err.code === 'EPERM') {
          removeSync(dest);
          options.overwrite = false; // just overwriteed it, no need to do it again
          return moveSync(src, dest, options)
        }

        if (err.code !== 'EXDEV') { throw err }
        return moveSyncAcrossDevice(src, dest, overwrite)
      }
    } else {
      try {
        gracefulFs.linkSync(src, dest);
        return gracefulFs.unlinkSync(src)
      } catch (err) {
        if (err.code === 'EXDEV' || err.code === 'EISDIR' || err.code === 'EPERM' || err.code === 'ENOTSUP') {
          return moveSyncAcrossDevice(src, dest, overwrite)
        }
        throw err
      }
    }
  }
}

function moveSyncAcrossDevice (src, dest, overwrite) {
  var stat = gracefulFs.statSync(src);

  if (stat.isDirectory()) {
    return moveDirSyncAcrossDevice(src, dest, overwrite)
  } else {
    return moveFileSyncAcrossDevice(src, dest, overwrite)
  }
}

function moveFileSyncAcrossDevice (src, dest, overwrite) {
  var BUF_LENGTH = 64 * 1024;
  var _buff = buffer(BUF_LENGTH);

  var flags = overwrite ? 'w' : 'wx';

  var fdr = gracefulFs.openSync(src, 'r');
  var stat = gracefulFs.fstatSync(fdr);
  var fdw = gracefulFs.openSync(dest, flags, stat.mode);
  var pos = 0;

  while (pos < stat.size) {
    var bytesRead = gracefulFs.readSync(fdr, _buff, 0, BUF_LENGTH, pos);
    gracefulFs.writeSync(fdw, _buff, 0, bytesRead);
    pos += bytesRead;
  }

  gracefulFs.closeSync(fdr);
  gracefulFs.closeSync(fdw);
  return gracefulFs.unlinkSync(src)
}

function moveDirSyncAcrossDevice (src, dest, overwrite) {
  var options = {
    overwrite: false
  };

  if (overwrite) {
    removeSync(dest);
    tryCopySync();
  } else {
    tryCopySync();
  }

  function tryCopySync () {
    copySync$2(src, dest, options);
    return removeSync(src)
  }
}

// return true if dest is a subdir of src, otherwise false.
// extract dest base dir and check if that is the same as src basename
function isSrcSubdir$2 (src, dest) {
  try {
    return gracefulFs.statSync(src).isDirectory() &&
           src !== dest &&
           dest.indexOf(src) > -1 &&
           dest.split(path$f.dirname(src) + path$f.sep)[1].split(path$f.sep)[0] === path$f.basename(src)
  } catch (e) {
    return false
  }
}

var moveSync_1 = {
  moveSync: moveSync
};

var u$a = universalify.fromCallback;

var path$g = require('path');
var copy$2 = copy$1.copy;
var remove$1 = remove.remove;
var mkdirp$1 = mkdirs_1$1.mkdirp;
var pathExists$7 = pathExists_1.pathExists;

function move (src, dest, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {};
  }

  var overwrite = opts.overwrite || opts.clobber || false;

  src = path$g.resolve(src);
  dest = path$g.resolve(dest);

  if (src === dest) { return gracefulFs.access(src, cb) }

  gracefulFs.stat(src, function (err, st) {
    if (err) { return cb(err) }

    if (st.isDirectory() && isSrcSubdir$3(src, dest)) {
      return cb(new Error(("Cannot move '" + src + "' to a subdirectory of itself, '" + dest + "'.")))
    }
    mkdirp$1(path$g.dirname(dest), function (err) {
      if (err) { return cb(err) }
      return doRename(src, dest, overwrite, cb)
    });
  });
}

function doRename (src, dest, overwrite, cb) {
  if (overwrite) {
    return remove$1(dest, function (err) {
      if (err) { return cb(err) }
      return rename(src, dest, overwrite, cb)
    })
  }
  pathExists$7(dest, function (err, destExists) {
    if (err) { return cb(err) }
    if (destExists) { return cb(new Error('dest already exists.')) }
    return rename(src, dest, overwrite, cb)
  });
}

function rename (src, dest, overwrite, cb) {
  gracefulFs.rename(src, dest, function (err) {
    if (!err) { return cb() }
    if (err.code !== 'EXDEV') { return cb(err) }
    return moveAcrossDevice(src, dest, overwrite, cb)
  });
}

function moveAcrossDevice (src, dest, overwrite, cb) {
  var opts = {
    overwrite: overwrite,
    errorOnExist: true
  };

  copy$2(src, dest, opts, function (err) {
    if (err) { return cb(err) }
    return remove$1(src, cb)
  });
}

function isSrcSubdir$3 (src, dest) {
  var srcArray = src.split(path$g.sep);
  var destArray = dest.split(path$g.sep);

  return srcArray.reduce(function (acc, current, i) {
    return acc && destArray[i] === current
  }, true)
}

var move_1 = {
  move: u$a(move)
};

var u$b = universalify.fromCallback;

var path$h = require('path');

var pathExists$8 = pathExists_1.pathExists;

function outputFile (file, data, encoding, callback) {
  if (typeof encoding === 'function') {
    callback = encoding;
    encoding = 'utf8';
  }

  var dir = path$h.dirname(file);
  pathExists$8(dir, function (err, itDoes) {
    if (err) { return callback(err) }
    if (itDoes) { return gracefulFs.writeFile(file, data, encoding, callback) }

    mkdirs_1$1.mkdirs(dir, function (err) {
      if (err) { return callback(err) }

      gracefulFs.writeFile(file, data, encoding, callback);
    });
  });
}

function outputFileSync (file) {
  var args = [], len = arguments.length - 1;
  while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  var dir = path$h.dirname(file);
  if (gracefulFs.existsSync(dir)) {
    return gracefulFs.writeFileSync.apply(gracefulFs, [ file ].concat( args ))
  }
  mkdirs_1$1.mkdirsSync(dir);
  gracefulFs.writeFileSync.apply(gracefulFs, [ file ].concat( args ));
}

var output = {
  outputFile: u$b(outputFile),
  outputFileSync: outputFileSync
};

var lib = createCommonjsModule(function (module) {

module.exports = Object.assign(
  {},
  // Export promiseified graceful-fs:
  fs_1,
  // Export extra methods:
  copySync$1,
  copy$1,
  empty,
  ensure,
  json,
  mkdirs_1$1,
  moveSync_1,
  move_1,
  output,
  pathExists_1,
  remove
);

// Export fs.promises as a getter property so that we don't trigger
// ExperimentalWarning before fs.promises is actually accessed.
var fs$$1 = require('fs');
if (Object.getOwnPropertyDescriptor(fs$$1, 'promises')) {
  Object.defineProperty(module.exports, 'promises', {
    get: function get () { return fs$$1.promises }
  });
}
});

var emptyDirectories = function (directories) {
  return {
    buildStart: function buildStart () {
      if (typeof directories === 'string') {
        directories = [directories];
      }
      console.log(ansiColors.bold.underline.cyan("\nCleaning directories"));
      directories.forEach(function (dir) {
        try {
          lib.emptyDirSync(dir);
          console.log(ansiColors.green(("  " + (logUtils.success) + " " + dir)));
        } catch (ex) {
          console.log(ansiColors.green(("  " + (logUtils.error) + " " + dir)));
          console.log(ex);
        }
      });
    }
  }
};

var prepareDirectories = function (directories) {
  return {
    buildStart: function buildStart () {
      if (typeof directories === 'string') {
        directories = [directories];
      }
      console.log(ansiColors.bold.underline.cyan("\nPreparing directories"));
      directories.forEach(function (dir) {
        try {
          lib.ensureDirSync(dir);
          console.log(ansiColors.green(("  " + (logUtils.success) + " " + dir)));
        } catch (ex) {
          console.log(ansiColors.green(("  " + (logUtils.error) + " " + dir)));
          console.log(ex);
        }
      });
    }
  }
};

var nargs = /\{([0-9a-zA-Z_]+)\}/g;

var stringTemplate = template;

function template(string) {
    var arguments$1 = arguments;

    var args;

    if (arguments.length === 2 && typeof arguments[1] === "object") {
        args = arguments[1];
    } else {
        args = new Array(arguments.length - 1);
        for (var i = 1; i < arguments.length; ++i) {
            args[i - 1] = arguments$1[i];
        }
    }

    if (!args || !args.hasOwnProperty) {
        args = {};
    }

    return string.replace(nargs, function replaceArg(match, i, index) {
        var result;

        if (string[index - 1] === "{" &&
            string[index + match.length] === "}") {
            return i
        } else {
            result = args.hasOwnProperty(i) ? args[i] : null;
            if (result === null || result === undefined) {
                return ""
            }

            return result
        }
    })
}

var htmlInjector = function (options) {
  return {
    generateBundle: function generateBundle () {
      var template = options.template;
      var target = options.target;
      if (fs.existsSync(template)) {
        var content = fs.readFileSync(template, 'utf-8');
        content = stringTemplate(content, options.injects);
        lib.ensureFileSync(target);
        fs.writeFileSync(target, content);
        console.log(ansiColors.green(("\n" + (logUtils.success) + " HTML Injector: " + target)));
      } else {
        console.log(ansiColors.red(("\n" + (logUtils.error) + " HTML Injector: " + template)));
      }
    }
  }
};

var config = {
  instrument: false
};

function configure(name, value) {
  if (arguments.length === 2) {
    config[name] = value;
  } else {
    return config[name];
  }
}

var config_2 = config;
var configure_1 = configure;

var config_1 = {
	config: config_2,
	configure: configure_1
};

function objectOrFunction(x) {
  return isFunction(x) || (typeof x === "object" && x !== null);
}

function isFunction(x) {
  return typeof x === "function";
}

function isArray(x) {
  return Object.prototype.toString.call(x) === "[object Array]";
}

// Date.now is not available in browsers < IE9
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
var now = Date.now || function() { return new Date().getTime(); };


var objectOrFunction_1 = objectOrFunction;
var isFunction_1 = isFunction;
var isArray_1 = isArray;
var now_1 = now;

var utils = {
	objectOrFunction: objectOrFunction_1,
	isFunction: isFunction_1,
	isArray: isArray_1,
	now: now_1
};

/* global toString */

var isArray$1 = utils.isArray;
var isFunction$1 = utils.isFunction;

/**
  Returns a promise that is fulfilled when all the given promises have been
  fulfilled, or rejected if any of them become rejected. The return promise
  is fulfilled with an array that gives all the values in the order they were
  passed in the `promises` array argument.

  Example:

  ```javascript
  var promise1 = RSVP.resolve(1);
  var promise2 = RSVP.resolve(2);
  var promise3 = RSVP.resolve(3);
  var promises = [ promise1, promise2, promise3 ];

  RSVP.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `RSVP.all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  var promise1 = RSVP.resolve(1);
  var promise2 = RSVP.reject(new Error("2"));
  var promise3 = RSVP.reject(new Error("3"));
  var promises = [ promise1, promise2, promise3 ];

  RSVP.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @for RSVP
  @param {Array} promises
  @param {String} label
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
*/
function all(promises) {
  /*jshint validthis:true */
  var Promise = this;

  if (!isArray$1(promises)) {
    throw new TypeError('You must pass an array to all.');
  }

  return new Promise(function(resolve, reject) {
    var results = [], remaining = promises.length,
    promise;

    if (remaining === 0) {
      resolve([]);
    }

    function resolver(index) {
      return function(value) {
        resolveAll(index, value);
      };
    }

    function resolveAll(index, value) {
      results[index] = value;
      if (--remaining === 0) {
        resolve(results);
      }
    }

    for (var i = 0; i < promises.length; i++) {
      promise = promises[i];

      if (promise && isFunction$1(promise.then)) {
        promise.then(resolver(i), reject);
      } else {
        resolveAll(i, promise);
      }
    }
  });
}

var all_2 = all;

var all_1 = {
	all: all_2
};

/* global toString */
var isArray$2 = utils.isArray;

/**
  `RSVP.race` allows you to watch a series of promises and act as soon as the
  first promise given to the `promises` argument fulfills or rejects.

  Example:

  ```javascript
  var promise1 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve("promise 1");
    }, 200);
  });

  var promise2 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve("promise 2");
    }, 100);
  });

  RSVP.race([promise1, promise2]).then(function(result){
    // result === "promise 2" because it was resolved before promise1
    // was resolved.
  });
  ```

  `RSVP.race` is deterministic in that only the state of the first completed
  promise matters. For example, even if other promises given to the `promises`
  array argument are resolved, but the first completed promise has become
  rejected before the other promises became fulfilled, the returned promise
  will become rejected:

  ```javascript
  var promise1 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve("promise 1");
    }, 200);
  });

  var promise2 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error("promise 2"));
    }, 100);
  });

  RSVP.race([promise1, promise2]).then(function(result){
    // Code here never runs because there are rejected promises!
  }, function(reason){
    // reason.message === "promise2" because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  @method race
  @for RSVP
  @param {Array} promises array of promises to observe
  @param {String} label optional string for describing the promise returned.
  Useful for tooling.
  @return {Promise} a promise that becomes fulfilled with the value the first
  completed promises is resolved with if the first completed promise was
  fulfilled, or rejected with the reason that the first completed promise
  was rejected with.
*/
function race(promises) {
  /*jshint validthis:true */
  var Promise = this;

  if (!isArray$2(promises)) {
    throw new TypeError('You must pass an array to race.');
  }
  return new Promise(function(resolve, reject) {
    var promise;

    for (var i = 0; i < promises.length; i++) {
      promise = promises[i];

      if (promise && typeof promise.then === 'function') {
        promise.then(resolve, reject);
      } else {
        resolve(promise);
      }
    }
  });
}

var race_2 = race;

var race_1 = {
	race: race_2
};

function resolve(value) {
  /*jshint validthis:true */
  if (value && typeof value === 'object' && value.constructor === this) {
    return value;
  }

  var Promise = this;

  return new Promise(function(resolve) {
    resolve(value);
  });
}

var resolve_2 = resolve;

var resolve_1 = {
	resolve: resolve_2
};

/**
  `RSVP.reject` returns a promise that will become rejected with the passed
  `reason`. `RSVP.reject` is essentially shorthand for the following:

  ```javascript
  var promise = new RSVP.Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  var promise = RSVP.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @for RSVP
  @param {Any} reason value that the returned promise will be rejected with.
  @param {String} label optional string for identifying the returned promise.
  Useful for tooling.
  @return {Promise} a promise that will become rejected with the given
  `reason`.
*/
function reject(reason) {
  /*jshint validthis:true */
  var Promise = this;

  return new Promise(function (resolve, reject) {
    reject(reason);
  });
}

var reject_2 = reject;

var reject_1 = {
	reject: reject_2
};

var browserGlobal = (typeof window !== 'undefined') ? window : {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var local = (typeof commonjsGlobal !== 'undefined') ? commonjsGlobal : (commonjsGlobal === undefined? window:commonjsGlobal);

// node
function useNextTick() {
  return function() {
    process.nextTick(flush);
  };
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function() {
    node.data = (iterations = ++iterations % 2);
  };
}

function useSetTimeout() {
  return function() {
    local.setTimeout(flush, 1);
  };
}

var queue = [];
function flush() {
  for (var i = 0; i < queue.length; i++) {
    var tuple = queue[i];
    var callback = tuple[0], arg = tuple[1];
    callback(arg);
  }
  queue = [];
}

var scheduleFlush;

// Decide what async method to use to triggering processing of queued callbacks:
if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else {
  scheduleFlush = useSetTimeout();
}

function asap(callback, arg) {
  var length = queue.push([callback, arg]);
  if (length === 1) {
    // If length is 1, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    scheduleFlush();
  }
}

var asap_2 = asap;

var asap_1 = {
	asap: asap_2
};

var config$1 = config_1.config;
var objectOrFunction$1 = utils.objectOrFunction;
var isFunction$2 = utils.isFunction;
var all$1 = all_1.all;
var race$1 = race_1.race;
var staticResolve = resolve_1.resolve;
var staticReject = reject_1.reject;
var asap$1 = asap_1.asap;

config$1.async = asap$1; // default async is asap;

function Promise$1(resolver) {
  if (!isFunction$2(resolver)) {
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
  }

  if (!(this instanceof Promise$1)) {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }

  this._subscribers = [];

  invokeResolver(resolver, this);
}

function invokeResolver(resolver, promise) {
  function resolvePromise(value) {
    resolve$1(promise, value);
  }

  function rejectPromise(reason) {
    reject$1(promise, reason);
  }

  try {
    resolver(resolvePromise, rejectPromise);
  } catch(e) {
    rejectPromise(e);
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction$2(callback),
      value, error, succeeded, failed;

  if (hasCallback) {
    try {
      value = callback(detail);
      succeeded = true;
    } catch(e) {
      failed = true;
      error = e;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (handleThenable(promise, value)) {
    return;
  } else if (hasCallback && succeeded) {
    resolve$1(promise, value);
  } else if (failed) {
    reject$1(promise, error);
  } else if (settled === FULFILLED) {
    resolve$1(promise, value);
  } else if (settled === REJECTED) {
    reject$1(promise, value);
  }
}

var PENDING   = void 0;
var SEALED    = 0;
var FULFILLED = 1;
var REJECTED  = 2;

function subscribe(parent, child, onFulfillment, onRejection) {
  var subscribers = parent._subscribers;
  var length = subscribers.length;

  subscribers[length] = child;
  subscribers[length + FULFILLED] = onFulfillment;
  subscribers[length + REJECTED]  = onRejection;
}

function publish(promise, settled) {
  var child, callback, subscribers = promise._subscribers, detail = promise._detail;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    invokeCallback(settled, child, callback, detail);
  }

  promise._subscribers = null;
}

Promise$1.prototype = {
  constructor: Promise$1,

  _state: undefined,
  _detail: undefined,
  _subscribers: undefined,

  then: function(onFulfillment, onRejection) {
    var promise = this;

    var thenPromise = new this.constructor(function() {});

    if (this._state) {
      var callbacks = arguments;
      config$1.async(function invokePromiseCallback() {
        invokeCallback(promise._state, thenPromise, callbacks[promise._state - 1], promise._detail);
      });
    } else {
      subscribe(this, thenPromise, onFulfillment, onRejection);
    }

    return thenPromise;
  },

  'catch': function(onRejection) {
    return this.then(null, onRejection);
  }
};

Promise$1.all = all$1;
Promise$1.race = race$1;
Promise$1.resolve = staticResolve;
Promise$1.reject = staticReject;

function handleThenable(promise, value) {
  var then = null,
  resolved;

  try {
    if (promise === value) {
      throw new TypeError("A promises callback cannot return that same promise.");
    }

    if (objectOrFunction$1(value)) {
      then = value.then;

      if (isFunction$2(then)) {
        then.call(value, function(val) {
          if (resolved) { return true; }
          resolved = true;

          if (value !== val) {
            resolve$1(promise, val);
          } else {
            fulfill(promise, val);
          }
        }, function(val) {
          if (resolved) { return true; }
          resolved = true;

          reject$1(promise, val);
        });

        return true;
      }
    }
  } catch (error) {
    if (resolved) { return true; }
    reject$1(promise, error);
    return true;
  }

  return false;
}

function resolve$1(promise, value) {
  if (promise === value) {
    fulfill(promise, value);
  } else if (!handleThenable(promise, value)) {
    fulfill(promise, value);
  }
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) { return; }
  promise._state = SEALED;
  promise._detail = value;

  config$1.async(publishFulfillment, promise);
}

function reject$1(promise, reason) {
  if (promise._state !== PENDING) { return; }
  promise._state = SEALED;
  promise._detail = reason;

  config$1.async(publishRejection, promise);
}

function publishFulfillment(promise) {
  publish(promise, promise._state = FULFILLED);
}

function publishRejection(promise) {
  publish(promise, promise._state = REJECTED);
}

var Promise_1 = Promise$1;

var promise = {
	Promise: Promise_1
};

/*global self*/
var RSVPPromise = promise.Promise;
var isFunction$3 = utils.isFunction;

function polyfill() {
  var local;

  if (typeof commonjsGlobal !== 'undefined') {
    local = commonjsGlobal;
  } else if (typeof window !== 'undefined' && window.document) {
    local = window;
  } else {
    local = self;
  }

  var es6PromiseSupport = 
    "Promise" in local &&
    // Some of these methods are missing from
    // Firefox/Chrome experimental implementations
    "resolve" in local.Promise &&
    "reject" in local.Promise &&
    "all" in local.Promise &&
    "race" in local.Promise &&
    // Older version of the spec had a resolver object
    // as the arg rather than a function
    (function() {
      var resolve;
      new local.Promise(function(r) { resolve = r; });
      return isFunction$3(resolve);
    }());

  if (!es6PromiseSupport) {
    local.Promise = RSVPPromise;
  }
}

var polyfill_2 = polyfill;

var polyfill_1 = {
	polyfill: polyfill_2
};

var Promise$2 = promise.Promise;
var polyfill$1 = polyfill_1.polyfill;
var Promise_1$1 = Promise$2;
var polyfill_1$1 = polyfill$1;

var main = {
	Promise: Promise_1$1,
	polyfill: polyfill_1$1
};

var minimatch = createCommonjsModule(function (module) {
(function (require, exports, module, platform) {

if (module) { module.exports = minimatch; }
else { exports.minimatch = minimatch; }

if (!require) {
  require = function (id) {
    switch (id) {
      case "sigmund": return function sigmund (obj) {
        return JSON.stringify(obj)
      }
      case "path": return { basename: function (f) {
        f = f.split(/[\/\\]/);
        var e = f.pop();
        if (!e) { e = f.pop(); }
        return e
      }}
      case "lru-cache": return function LRUCache () {
        // not quite an LRU, but still space-limited.
        var cache = {};
        var cnt = 0;
        this.set = function (k, v) {
          cnt ++;
          if (cnt >= 100) { cache = {}; }
          cache[k] = v;
        };
        this.get = function (k) { return cache[k] };
      }
    }
  };
}

minimatch.Minimatch = Minimatch;

var LRU = require("lru-cache")
  , cache = minimatch.cache = new LRU({max: 100})
  , GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {}
  , sigmund = require("sigmund");

var path$$1 = require("path")
  // any single thing other than /
  // don't need to escape / when using new RegExp()
  , qmark = "[^/]"

  // * => any number of characters
  , star = qmark + "*?"

  // ** when dots are allowed.  Anything goes, except .. and .
  // not (^ or / followed by one or two dots followed by $ or /),
  // followed by anything, any number of times.
  , twoStarDot = "(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?"

  // not a ^ or / followed by a dot,
  // followed by anything, any number of times.
  , twoStarNoDot = "(?:(?!(?:\\\/|^)\\.).)*?"

  // characters that need to be escaped in RegExp.
  , reSpecials = charSet("().*{}+?[]^$\\!");

// "abc" -> { a:true, b:true, c:true }
function charSet (s) {
  return s.split("").reduce(function (set, c) {
    set[c] = true;
    return set
  }, {})
}

// normalizes slashes.
var slashSplit = /\/+/;

minimatch.filter = filter;
function filter (pattern, options) {
  options = options || {};
  return function (p, i, list) {
    return minimatch(p, pattern, options)
  }
}

function ext (a, b) {
  a = a || {};
  b = b || {};
  var t = {};
  Object.keys(b).forEach(function (k) {
    t[k] = b[k];
  });
  Object.keys(a).forEach(function (k) {
    t[k] = a[k];
  });
  return t
}

minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) { return minimatch }

  var orig = minimatch;

  var m = function minimatch (p, pattern, options) {
    return orig.minimatch(p, pattern, ext(def, options))
  };

  m.Minimatch = function Minimatch (pattern, options) {
    return new orig.Minimatch(pattern, ext(def, options))
  };

  return m
};

Minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) { return Minimatch }
  return minimatch.defaults(def).Minimatch
};


function minimatch (p, pattern, options) {
  if (typeof pattern !== "string") {
    throw new TypeError("glob pattern string required")
  }

  if (!options) { options = {}; }

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === "#") {
    return false
  }

  // "" only matches ""
  if (pattern.trim() === "") { return p === "" }

  return new Minimatch(pattern, options).match(p)
}

function Minimatch (pattern, options) {
  if (!(this instanceof Minimatch)) {
    return new Minimatch(pattern, options, cache)
  }

  if (typeof pattern !== "string") {
    throw new TypeError("glob pattern string required")
  }

  if (!options) { options = {}; }
  pattern = pattern.trim();

  // windows: need to use /, not \
  // On other platforms, \ is a valid (albeit bad) filename char.
  if (platform === "win32") {
    pattern = pattern.split("\\").join("/");
  }

  // lru storage.
  // these things aren't particularly big, but walking down the string
  // and turning it into a regexp can get pretty costly.
  var cacheKey = pattern + "\n" + sigmund(options);
  var cached = minimatch.cache.get(cacheKey);
  if (cached) { return cached }
  minimatch.cache.set(cacheKey, this);

  this.options = options;
  this.set = [];
  this.pattern = pattern;
  this.regexp = null;
  this.negate = false;
  this.comment = false;
  this.empty = false;

  // make the set of regexps etc.
  this.make();
}

Minimatch.prototype.debug = function() {};

Minimatch.prototype.make = make;
function make () {
  // don't do it more than once.
  if (this._made) { return }

  var pattern = this.pattern;
  var options = this.options;

  // empty patterns and comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === "#") {
    this.comment = true;
    return
  }
  if (!pattern) {
    this.empty = true;
    return
  }

  // step 1: figure out negation, etc.
  this.parseNegate();

  // step 2: expand braces
  var set = this.globSet = this.braceExpand();

  if (options.debug) { this.debug = console.error; }

  this.debug(this.pattern, set);

  // step 3: now we have a set, so turn each one into a series of path-portion
  // matching patterns.
  // These will be regexps, except in the case of "**", which is
  // set to the GLOBSTAR object for globstar behavior,
  // and will not contain any / characters
  set = this.globParts = set.map(function (s) {
    return s.split(slashSplit)
  });

  this.debug(this.pattern, set);

  // glob --> regexps
  set = set.map(function (s, si, set) {
    return s.map(this.parse, this)
  }, this);

  this.debug(this.pattern, set);

  // filter out everything that didn't compile properly.
  set = set.filter(function (s) {
    return -1 === s.indexOf(false)
  });

  this.debug(this.pattern, set);

  this.set = set;
}

Minimatch.prototype.parseNegate = parseNegate;
function parseNegate () {
  var pattern = this.pattern
    , negate = false
    , options = this.options
    , negateOffset = 0;

  if (options.nonegate) { return }

  for ( var i = 0, l = pattern.length
      ; i < l && pattern.charAt(i) === "!"
      ; i ++) {
    negate = !negate;
    negateOffset ++;
  }

  if (negateOffset) { this.pattern = pattern.substr(negateOffset); }
  this.negate = negate;
}

// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
minimatch.braceExpand = function (pattern, options) {
  return new Minimatch(pattern, options).braceExpand()
};

Minimatch.prototype.braceExpand = braceExpand;
function braceExpand (pattern, options) {
  options = options || this.options;
  pattern = typeof pattern === "undefined"
    ? this.pattern : pattern;

  if (typeof pattern === "undefined") {
    throw new Error("undefined pattern")
  }

  if (options.nobrace ||
      !pattern.match(/\{.*\}/)) {
    // shortcut. no need to expand.
    return [pattern]
  }

  var escaping = false;

  // examples and comments refer to this crazy pattern:
  // a{b,c{d,e},{f,g}h}x{y,z}
  // expected:
  // abxy
  // abxz
  // acdxy
  // acdxz
  // acexy
  // acexz
  // afhxy
  // afhxz
  // aghxy
  // aghxz

  // everything before the first \{ is just a prefix.
  // So, we pluck that off, and work with the rest,
  // and then prepend it to everything we find.
  if (pattern.charAt(0) !== "{") {
    this.debug(pattern);
    var prefix = null;
    for (var i = 0, l = pattern.length; i < l; i ++) {
      var c = pattern.charAt(i);
      this.debug(i, c);
      if (c === "\\") {
        escaping = !escaping;
      } else if (c === "{" && !escaping) {
        prefix = pattern.substr(0, i);
        break
      }
    }

    // actually no sets, all { were escaped.
    if (prefix === null) {
      this.debug("no sets");
      return [pattern]
    }

   var tail = braceExpand.call(this, pattern.substr(i), options);
    return tail.map(function (t) {
      return prefix + t
    })
  }

  // now we have something like:
  // {b,c{d,e},{f,g}h}x{y,z}
  // walk through the set, expanding each part, until
  // the set ends.  then, we'll expand the suffix.
  // If the set only has a single member, then'll put the {} back

  // first, handle numeric sets, since they're easier
  var numset = pattern.match(/^\{(-?[0-9]+)\.\.(-?[0-9]+)\}/);
  if (numset) {
    this.debug("numset", numset[1], numset[2]);
    var suf = braceExpand.call(this, pattern.substr(numset[0].length), options)
      , start = +numset[1]
      , end = +numset[2]
      , inc = start > end ? -1 : 1
      , set = [];
    for (var i = start; i != (end + inc); i += inc) {
      // append all the suffixes
      for (var ii = 0, ll = suf.length; ii < ll; ii ++) {
        set.push(i + suf[ii]);
      }
    }
    return set
  }

  // ok, walk through the set
  // We hope, somewhat optimistically, that there
  // will be a } at the end.
  // If the closing brace isn't found, then the pattern is
  // interpreted as braceExpand("\\" + pattern) so that
  // the leading \{ will be interpreted literally.
  var i = 1 // skip the \{
    , depth = 1
    , set = []
    , member = ""
    , escaping = false;

  function addMember () {
    set.push(member);
    member = "";
  }

  this.debug("Entering for");
  FOR: for (i = 1, l = pattern.length; i < l; i ++) {
    var c = pattern.charAt(i);
    this.debug("", i, c);

    if (escaping) {
      escaping = false;
      member += "\\" + c;
    } else {
      switch (c) {
        case "\\":
          escaping = true;
          continue

        case "{":
          depth ++;
          member += "{";
          continue

        case "}":
          depth --;
          // if this closes the actual set, then we're done
          if (depth === 0) {
            addMember();
            // pluck off the close-brace
            i ++;
            break FOR
          } else {
            member += c;
            continue
          }

        case ",":
          if (depth === 1) {
            addMember();
          } else {
            member += c;
          }
          continue

        default:
          member += c;
          continue
      } // switch
    } // else
  } // for

  // now we've either finished the set, and the suffix is
  // pattern.substr(i), or we have *not* closed the set,
  // and need to escape the leading brace
  if (depth !== 0) {
    this.debug("didn't close", pattern);
    return braceExpand.call(this, "\\" + pattern, options)
  }

  // x{y,z} -> ["xy", "xz"]
  this.debug("set", set);
  this.debug("suffix", pattern.substr(i));
  var suf = braceExpand.call(this, pattern.substr(i), options);
  // ["b", "c{d,e}","{f,g}h"] ->
  //   [["b"], ["cd", "ce"], ["fh", "gh"]]
  var addBraces = set.length === 1;
  this.debug("set pre-expanded", set);
  set = set.map(function (p) {
    return braceExpand.call(this, p, options)
  }, this);
  this.debug("set expanded", set);


  // [["b"], ["cd", "ce"], ["fh", "gh"]] ->
  //   ["b", "cd", "ce", "fh", "gh"]
  set = set.reduce(function (l, r) {
    return l.concat(r)
  });

  if (addBraces) {
    set = set.map(function (s) {
      return "{" + s + "}"
    });
  }

  // now attach the suffixes.
  var ret = [];
  for (var i = 0, l = set.length; i < l; i ++) {
    for (var ii = 0, ll = suf.length; ii < ll; ii ++) {
      ret.push(set[i] + suf[ii]);
    }
  }
  return ret
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
Minimatch.prototype.parse = parse;
var SUBPARSE = {};
function parse (pattern, isSub) {
  var options = this.options;

  // shortcuts
  if (!options.noglobstar && pattern === "**") { return GLOBSTAR }
  if (pattern === "") { return "" }

  var re = ""
    , hasMagic = !!options.nocase
    , escaping = false
    // ? => one single character
    , patternListStack = []
    , plType
    , stateChar
    , inClass = false
    , reClassStart = -1
    , classStart = -1
    // . and .. never match anything that doesn't start with .,
    // even when options.dot is set.
    , patternStart = pattern.charAt(0) === "." ? "" // anything
      // not (start or / followed by . or .. followed by / or end)
      : options.dot ? "(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))"
      : "(?!\\.)"
    , self = this;

  function clearStateChar () {
    if (stateChar) {
      // we had some state-tracking character
      // that wasn't consumed by this pass.
      switch (stateChar) {
        case "*":
          re += star;
          hasMagic = true;
          break
        case "?":
          re += qmark;
          hasMagic = true;
          break
        default:
          re += "\\"+stateChar;
          break
      }
      self.debug('clearStateChar %j %j', stateChar, re);
      stateChar = false;
    }
  }

  for ( var i = 0, len = pattern.length, c
      ; (i < len) && (c = pattern.charAt(i))
      ; i ++ ) {

    this.debug("%s\t%s %s %j", pattern, i, re, c);

    // skip over any that are escaped.
    if (escaping && reSpecials[c]) {
      re += "\\" + c;
      escaping = false;
      continue
    }

    SWITCH: switch (c) {
      case "/":
        // completely not allowed, even escaped.
        // Should already be path-split by now.
        return false

      case "\\":
        clearStateChar();
        escaping = true;
        continue

      // the various stateChar values
      // for the "extglob" stuff.
      case "?":
      case "*":
      case "+":
      case "@":
      case "!":
        this.debug("%s\t%s %s %j <-- stateChar", pattern, i, re, c);

        // all of those are literals inside a class, except that
        // the glob [!a] means [^a] in regexp
        if (inClass) {
          this.debug('  in class');
          if (c === "!" && i === classStart + 1) { c = "^"; }
          re += c;
          continue
        }

        // if we already have a stateChar, then it means
        // that there was something like ** or +? in there.
        // Handle the stateChar, then proceed with this one.
        self.debug('call clearStateChar %j', stateChar);
        clearStateChar();
        stateChar = c;
        // if extglob is disabled, then +(asdf|foo) isn't a thing.
        // just clear the statechar *now*, rather than even diving into
        // the patternList stuff.
        if (options.noext) { clearStateChar(); }
        continue

      case "(":
        if (inClass) {
          re += "(";
          continue
        }

        if (!stateChar) {
          re += "\\(";
          continue
        }

        plType = stateChar;
        patternListStack.push({ type: plType
                              , start: i - 1
                              , reStart: re.length });
        // negation is (?:(?!js)[^/]*)
        re += stateChar === "!" ? "(?:(?!" : "(?:";
        this.debug('plType %j %j', stateChar, re);
        stateChar = false;
        continue

      case ")":
        if (inClass || !patternListStack.length) {
          re += "\\)";
          continue
        }

        clearStateChar();
        hasMagic = true;
        re += ")";
        plType = patternListStack.pop().type;
        // negation is (?:(?!js)[^/]*)
        // The others are (?:<pattern>)<type>
        switch (plType) {
          case "!":
            re += "[^/]*?)";
            break
          case "?":
          case "+":
          case "*": re += plType;
          case "@": break // the default anyway
        }
        continue

      case "|":
        if (inClass || !patternListStack.length || escaping) {
          re += "\\|";
          escaping = false;
          continue
        }

        clearStateChar();
        re += "|";
        continue

      // these are mostly the same in regexp and glob
      case "[":
        // swallow any state-tracking char before the [
        clearStateChar();

        if (inClass) {
          re += "\\" + c;
          continue
        }

        inClass = true;
        classStart = i;
        reClassStart = re.length;
        re += c;
        continue

      case "]":
        //  a right bracket shall lose its special
        //  meaning and represent itself in
        //  a bracket expression if it occurs
        //  first in the list.  -- POSIX.2 2.8.3.2
        if (i === classStart + 1 || !inClass) {
          re += "\\" + c;
          escaping = false;
          continue
        }

        // finish up the class.
        hasMagic = true;
        inClass = false;
        re += c;
        continue

      default:
        // swallow any state char that wasn't consumed
        clearStateChar();

        if (escaping) {
          // no need
          escaping = false;
        } else if (reSpecials[c]
                   && !(c === "^" && inClass)) {
          re += "\\";
        }

        re += c;

    } // switch
  } // for


  // handle the case where we left a class open.
  // "[abc" is valid, equivalent to "\[abc"
  if (inClass) {
    // split where the last [ was, and escape it
    // this is a huge pita.  We now have to re-walk
    // the contents of the would-be class to re-translate
    // any characters that were passed through as-is
    var cs = pattern.substr(classStart + 1)
      , sp = this.parse(cs, SUBPARSE);
    re = re.substr(0, reClassStart) + "\\[" + sp[0];
    hasMagic = hasMagic || sp[1];
  }

  // handle the case where we had a +( thing at the *end*
  // of the pattern.
  // each pattern list stack adds 3 chars, and we need to go through
  // and escape any | chars that were passed through as-is for the regexp.
  // Go through and escape them, taking care not to double-escape any
  // | chars that were already escaped.
  var pl;
  while (pl = patternListStack.pop()) {
    var tail = re.slice(pl.reStart + 3);
    // maybe some even number of \, then maybe 1 \, followed by a |
    tail = tail.replace(/((?:\\{2})*)(\\?)\|/g, function (_, $1, $2) {
      if (!$2) {
        // the | isn't already escaped, so escape it.
        $2 = "\\";
      }

      // need to escape all those slashes *again*, without escaping the
      // one that we need for escaping the | character.  As it works out,
      // escaping an even number of slashes can be done by simply repeating
      // it exactly after itself.  That's why this trick works.
      //
      // I am sorry that you have to see this.
      return $1 + $1 + $2 + "|"
    });

    this.debug("tail=%j\n   %s", tail, tail);
    var t = pl.type === "*" ? star
          : pl.type === "?" ? qmark
          : "\\" + pl.type;

    hasMagic = true;
    re = re.slice(0, pl.reStart)
       + t + "\\("
       + tail;
  }

  // handle trailing things that only matter at the very end.
  clearStateChar();
  if (escaping) {
    // trailing \\
    re += "\\\\";
  }

  // only need to apply the nodot start if the re starts with
  // something that could conceivably capture a dot
  var addPatternStart = false;
  switch (re.charAt(0)) {
    case ".":
    case "[":
    case "(": addPatternStart = true;
  }

  // if the re is not "" at this point, then we need to make sure
  // it doesn't match against an empty path part.
  // Otherwise a/* will match a/, which it should not.
  if (re !== "" && hasMagic) { re = "(?=.)" + re; }

  if (addPatternStart) { re = patternStart + re; }

  // parsing just a piece of a larger pattern.
  if (isSub === SUBPARSE) {
    return [ re, hasMagic ]
  }

  // skip the regexp for non-magical patterns
  // unescape anything in it, though, so that it'll be
  // an exact match against a file etc.
  if (!hasMagic) {
    return globUnescape(pattern)
  }

  var flags = options.nocase ? "i" : ""
    , regExp = new RegExp("^" + re + "$", flags);

  regExp._glob = pattern;
  regExp._src = re;

  return regExp
}

minimatch.makeRe = function (pattern, options) {
  return new Minimatch(pattern, options || {}).makeRe()
};

Minimatch.prototype.makeRe = makeRe;
function makeRe () {
  if (this.regexp || this.regexp === false) { return this.regexp }

  // at this point, this.set is a 2d array of partial
  // pattern strings, or "**".
  //
  // It's better to use .match().  This function shouldn't
  // be used, really, but it's pretty convenient sometimes,
  // when you just want to work with a regex.
  var set = this.set;

  if (!set.length) { return this.regexp = false }
  var options = this.options;

  var twoStar = options.noglobstar ? star
      : options.dot ? twoStarDot
      : twoStarNoDot
    , flags = options.nocase ? "i" : "";

  var re = set.map(function (pattern) {
    return pattern.map(function (p) {
      return (p === GLOBSTAR) ? twoStar
           : (typeof p === "string") ? regExpEscape(p)
           : p._src
    }).join("\\\/")
  }).join("|");

  // must match entire pattern
  // ending in a * or ** will make it less strict.
  re = "^(?:" + re + ")$";

  // can match anything, as long as it's not this.
  if (this.negate) { re = "^(?!" + re + ").*$"; }

  try {
    return this.regexp = new RegExp(re, flags)
  } catch (ex) {
    return this.regexp = false
  }
}

minimatch.match = function (list, pattern, options) {
  var mm = new Minimatch(pattern, options);
  list = list.filter(function (f) {
    return mm.match(f)
  });
  if (options.nonull && !list.length) {
    list.push(pattern);
  }
  return list
};

Minimatch.prototype.match = match;
function match (f, partial) {
  this.debug("match", f, this.pattern);
  // short-circuit in the case of busted things.
  // comments, etc.
  if (this.comment) { return false }
  if (this.empty) { return f === "" }

  if (f === "/" && partial) { return true }

  var options = this.options;

  // windows: need to use /, not \
  // On other platforms, \ is a valid (albeit bad) filename char.
  if (platform === "win32") {
    f = f.split("\\").join("/");
  }

  // treat the test path as a set of pathparts.
  f = f.split(slashSplit);
  this.debug(this.pattern, "split", f);

  // just ONE of the pattern sets in this.set needs to match
  // in order for it to be valid.  If negating, then just one
  // match means that we have failed.
  // Either way, return on the first hit.

  var set = this.set;
  this.debug(this.pattern, "set", set);

  var splitFile = path$$1.basename(f.join("/")).split("/");

  for (var i = 0, l = set.length; i < l; i ++) {
    var pattern = set[i], file = f;
    if (options.matchBase && pattern.length === 1) {
      file = splitFile;
    }
    var hit = this.matchOne(file, pattern, partial);
    if (hit) {
      if (options.flipNegate) { return true }
      return !this.negate
    }
  }

  // didn't get any hits.  this is success if it's a negative
  // pattern, failure otherwise.
  if (options.flipNegate) { return false }
  return this.negate
}

// set partial to true to test if, for example,
// "/a/b" matches the start of "/*/b/*/d"
// Partial means, if you run out of file before you run
// out of pattern, then that's fine, as long as all
// the parts match.
Minimatch.prototype.matchOne = function (file, pattern, partial) {
  var options = this.options;

  this.debug("matchOne",
              { "this": this
              , file: file
              , pattern: pattern });

  this.debug("matchOne", file.length, pattern.length);

  for ( var fi = 0
          , pi = 0
          , fl = file.length
          , pl = pattern.length
      ; (fi < fl) && (pi < pl)
      ; fi ++, pi ++ ) {

    this.debug("matchOne loop");
    var p = pattern[pi]
      , f = file[fi];

    this.debug(pattern, p, f);

    // should be impossible.
    // some invalid regexp stuff in the set.
    if (p === false) { return false }

    if (p === GLOBSTAR) {
      this.debug('GLOBSTAR', [pattern, p, f]);

      // "**"
      // a/**/b/**/c would match the following:
      // a/b/x/y/z/c
      // a/x/y/z/b/c
      // a/b/x/b/x/c
      // a/b/c
      // To do this, take the rest of the pattern after
      // the **, and see if it would match the file remainder.
      // If so, return success.
      // If not, the ** "swallows" a segment, and try again.
      // This is recursively awful.
      //
      // a/**/b/**/c matching a/b/x/y/z/c
      // - a matches a
      // - doublestar
      //   - matchOne(b/x/y/z/c, b/**/c)
      //     - b matches b
      //     - doublestar
      //       - matchOne(x/y/z/c, c) -> no
      //       - matchOne(y/z/c, c) -> no
      //       - matchOne(z/c, c) -> no
      //       - matchOne(c, c) yes, hit
      var fr = fi
        , pr = pi + 1;
      if (pr === pl) {
        this.debug('** at the end');
        // a ** at the end will just swallow the rest.
        // We have found a match.
        // however, it will not swallow /.x, unless
        // options.dot is set.
        // . and .. are *never* matched by **, for explosively
        // exponential reasons.
        for ( ; fi < fl; fi ++) {
          if (file[fi] === "." || file[fi] === ".." ||
              (!options.dot && file[fi].charAt(0) === ".")) { return false }
        }
        return true
      }

      // ok, let's see if we can swallow whatever we can.
      WHILE: while (fr < fl) {
        var swallowee = file[fr];

        this.debug('\nglobstar while',
                    file, fr, pattern, pr, swallowee);

        // XXX remove this slice.  Just pass the start index.
        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
          this.debug('globstar found match!', fr, fl, swallowee);
          // found a match.
          return true
        } else {
          // can't swallow "." or ".." ever.
          // can only swallow ".foo" when explicitly asked.
          if (swallowee === "." || swallowee === ".." ||
              (!options.dot && swallowee.charAt(0) === ".")) {
            this.debug("dot detected!", file, fr, pattern, pr);
            break WHILE
          }

          // ** swallows a segment, and continue.
          this.debug('globstar swallow a segment, and continue');
          fr ++;
        }
      }
      // no match was found.
      // However, in partial mode, we can't say this is necessarily over.
      // If there's more *pattern* left, then 
      if (partial) {
        // ran out of file
        this.debug("\n>>> no match, partial?", file, fr, pattern, pr);
        if (fr === fl) { return true }
      }
      return false
    }

    // something other than **
    // non-magic patterns just have to match exactly
    // patterns with magic have been turned into regexps.
    var hit;
    if (typeof p === "string") {
      if (options.nocase) {
        hit = f.toLowerCase() === p.toLowerCase();
      } else {
        hit = f === p;
      }
      this.debug("string match", p, f, hit);
    } else {
      hit = f.match(p);
      this.debug("pattern match", p, f, hit);
    }

    if (!hit) { return false }
  }

  // Note: ending in / means that we'll get a final ""
  // at the end of the pattern.  This can only match a
  // corresponding "" at the end of the file.
  // If the file ends in /, then it can only match a
  // a pattern that ends in /, unless the pattern just
  // doesn't have any more for it. But, a/b/ should *not*
  // match "a/b/*", even though "" matches against the
  // [^/]*? pattern, except in partial mode, where it might
  // simply not be reached yet.
  // However, a/b/ should still satisfy a/*

  // now either we fell off the end of the pattern, or we're done.
  if (fi === fl && pi === pl) {
    // ran out of pattern and filename at the same time.
    // an exact hit!
    return true
  } else if (fi === fl) {
    // ran out of file, but still had pattern left.
    // this is ok if we're doing the match as part of
    // a glob fs traversal.
    return partial
  } else if (pi === pl) {
    // ran out of pattern, still have file left.
    // this is only acceptable if we're on the very last
    // empty segment of a file with a trailing slash.
    // a/* should match a/b/
    var emptyFileEnd = (fi === fl - 1) && (file[fi] === "");
    return emptyFileEnd
  }

  // should be unreachable.
  throw new Error("wtf?")
};


// replace stuff like \* with *
function globUnescape (s) {
  return s.replace(/\\(.)/g, "$1")
}


function regExpEscape (s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}

})( typeof require === "function" ? require : null,
    commonjsGlobal,
    module,
    typeof process === "object" ? process.platform : "win32"
  );
});

var path$i = require('path');
var promise$1 = main;
promise$1 = 'default' in promise$1 ? promise$1['default'] : promise$1;
var fs$2 = require('fs');
var minimatch$1 = minimatch;
minimatch$1 = 'default' in minimatch$1 ? minimatch$1['default'] : minimatch$1;

function normaliseOptions() {
	var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	// Exclude .DS_Store, Thumbs.db and any other gubbins specified by the user
	if (!options.exclude) {
		options.exclude = [];
	} else if (typeof options.exclude === 'string') {
		options.exclude = [options.exclude];
	}

	options.exclude.push('**/.DS_Store', '**/Thumbs.db', '**/.gitkeep');
	return options;
}

function filterExclusions(files, relative, exclusions) {
	if (!exclusions) { return files; }

	return files.filter(function (fileName) {
		var filePath = path$i.join(relative, fileName);

		var i = exclusions.length;
		while (i--) {
			if (minimatch$1(filePath, exclusions[i])) { return false; }
		}

		return true;
	});
}

// Get key from path, e.g. 'project/data/config.json' -> 'config'

function getKey(fileName, options) {
	var lastDotIndex = fileName.lastIndexOf('.');

	if (lastDotIndex > 0 && !options.keepExtensions) {
		return fileName.substr(0, lastDotIndex);
	}

	return fileName;
}

function toArray(object) {
	var array = [],
	    key;

	for (key in object) {
		if (object.hasOwnProperty(key)) {
			array[+key] = object[key];
		}
	}

	return array;
}

function isNumeric(key) {
	return !isNaN(+key);
}

function getDir(root, dir, options) {
	var rel = path$i.relative(root, dir);

	var files = fs$2.readdirSync(dir);
	files = filterExclusions(files, rel, options.exclude);

	if (!files.length) { return {}; }

	var keysAreNumeric = files.every(isNumeric);
	var result = keysAreNumeric ? [] : {};

	files.forEach(function (fileName) {
		var filePath = path$i.join(dir, fileName);
		var isDir = fs$2.statSync(filePath).isDirectory();

		var key = isDir ? fileName : getKey(fileName, options);

		if (key in result) {
			throw new Error('You cannot have multiple files in the same folder with the same name (disregarding extensions) - failed at ' + filePath);
		}

		result[keysAreNumeric ? +key : key] = isDir ? getDir(root, filePath, options) : getFile(filePath);
	});

	return result;
}

function getFile(filePath) {
	var data = fs$2.readFileSync(filePath, 'utf-8');

	try {
		data = JSON.parse(data);
	} catch (e) {
		// treat as text
	}

	return data;
}

function getDir$1(root, dir, options, gotDir) {
	var rel = path$i.relative(root, dir);

	fs$2.readdir(dir, function (err, files) {
		if (err) {
			gotDir(err);
			return;
		}

		var result = {};

		var contents = filterExclusions(files, rel, options.exclude);

		if (!contents.length) {
			gotDir(null, result);
			return;
		}

		var keysAreNumeric = true; // assume we need to create an array, until we don't
		var remaining = contents.length;

		function check() {
			if (! --remaining) {
				if (keysAreNumeric) {
					result = toArray(result);
				}

				gotDir(null, result);
			}
		}

		contents.forEach(function (fileName) {
			var filePath = path$i.join(dir, fileName);
			var key = undefined;

			function gotFile(err, data) {
				if (err) {
					gotDir(err, null);
				} else if (result[key] !== undefined) {
					gotDir('You cannot have multiple files in the same folder with the same name (disregarding extensions) - failed at ' + filePath);
				} else {
					result[key] = data;
					check();
				}
			}

			fs$2.stat(filePath, function (err, stats) {
				if (err) {
					gotDir(err, null);
					return;
				}

				if (stats.isDirectory()) {
					key = fileName;
					getDir$1(root, filePath, options, gotFile);
				} else {
					key = getKey(fileName, options);
					getFile$1(filePath, gotFile);
				}

				if (isNaN(+key)) {
					keysAreNumeric = false;
				}
			});
		});
	});
}

function getFile$1(filePath, gotFile) {
	fs$2.readFile(filePath, function (err, result) {
		var data;

		if (err) {
			gotFile(err, null);
		} else {
			data = result.toString();

			try {
				data = JSON.parse(data);
			} catch (e) {
				// treat as text
			}

			gotFile(null, data);
		}
	});
}

var Promise$3 = promise$1.Promise;

function spelunk(root, options, callback) {
	var promise = new Promise$3(function (fulfil, reject) {
		if (typeof options === 'function') {
			callback = options;
			options = {};
		}

		options = normaliseOptions(options);
		root = path$i.resolve(root);

		// Get the specified folder, then done
		getDir$1(root, root, options, function (err, result) {
			if (err) { return reject(err); }
			fulfil(result);
		});
	});

	if (callback) {
		promise.then(function (result) {
			return callback(null, result);
		})['catch'](callback);
	}

	return promise;
}

spelunk.sync = function (root, options) {
	root = path$i.resolve(root);
	return getDir(root, root, normaliseOptions(options));
};

var spelunk_1 = spelunk;

var generateTranslations = function (options) {
  var target = options.target;
  var baseLanguage = options.baseLanguage;
  var transformer = options.transformer;

  var i18nData = spelunk_1.sync(target, {
    keepExtensions: false,
    exclude: path.join(target, '/') + '**/*.!(json)'
  });

  var patches = {};

  var basei18n = i18nData[baseLanguage];
  var langi18n, lang, basei18nComponenti18n, langi18nComponenti18n, key, clonedBasei18nComponenti18n, component;
  for (lang in i18nData) {
    if (lang === baseLanguage) { continue }
    langi18n = i18nData[lang];
    patches[lang] = {};
    for (component in basei18n) {
      basei18nComponenti18n = basei18n[component];
      langi18nComponenti18n = langi18n[component];
      if (langi18nComponenti18n) {
        var t = JSON.stringify(basei18nComponenti18n);
        clonedBasei18nComponenti18n = JSON.parse(t);
        if (JSON.stringify(langi18nComponenti18n) !== t) {
          for (key in clonedBasei18nComponenti18n) {
            clonedBasei18nComponenti18n[key] = langi18nComponenti18n[key] || clonedBasei18nComponenti18n[key];
          }
          patches[lang][component] = clonedBasei18nComponenti18n;
          i18nData[lang][component] = clonedBasei18nComponenti18n;
        }
      } else if (!langi18nComponenti18n) {
        i18nData[lang][component] = basei18nComponenti18n || {};
        patches[lang][component] = basei18nComponenti18n || {};
      }
    }

    for (component in langi18n) {
      if (!basei18n[component]) {
        patches[lang][component] = null;
      }
    }
  }

  console.log(ansiColors.grey(("  " + (logUtils.info) + " Languages:")), ansiColors.green(("" + (Object.keys(i18nData).join(', ')))));

  for (lang in patches) {
    var components = Object.keys(patches[lang]);
    components.forEach(function (component) {
      var content = patches[lang][component];
      var filepath = path.join(target, lang, component + '.json');
      if (!content) {
        console.log(ansiColors.magenta(("  " + (logUtils.info) + " Removing " + lang + "/" + component + ". Matching base language: " + baseLanguage)));
        lib.removeSync(filepath);
      } else {
        console.log(ansiColors.grey(("  " + (logUtils.info) + " Matching " + lang + "/" + component + " with " + baseLanguage + "/" + component + " keys")));
        lib.writeJSONSync(filepath, content, {
          spaces: '\t'
        });
      }
    });
  }

  transformer = transformer || (function (lang, data) {
    return {
      translations: i18nData[lang]
    }
  });

  for (lang in i18nData) {
    i18nData[lang] = transformer(lang, i18nData[lang]);
  }

  return i18nData
};

var generated = null;
var moduleName = 'i18n.translations';

var i18nBundler = function (options) {
  return {
    name: 'locales-bundler',
    resolveId: function resolveId (importee) {
      if (importee === moduleName) {
        return importee
      }
      return null
    },
    load: function load (id) {
      if (id === moduleName) {
        console.log(
          ansiColors.underline.cyan("\ni18n bundler"), ansiColors.grey((": Target: " + (options.target) + ", Base language: " + (options.baseLanguage)))
        );
        if (!generated) {
          generated = generateTranslations(options);
          generated = 'export default ' + JSON.stringify(generated);
        }
        console.log(
          ansiColors.grey(("  " + (logUtils.info) + " Import translations using: ")) + ansiColors.bold.green(("import translations from '" + moduleName + "'"))
        );
        return generated
      }
      return null
    },
    watchChange: function watchChange () {
      generated = null;
    }
  }
};

var copyAssets = function (obj, filterFunc) {
  return {
    buildStart: function buildStart () {
      var filterConfig = filterFunc ? { filter: filterFunc } : undefined;
      console.log(ansiColors.bold.underline.cyan("\nCopying assets"));
      for (var p in obj) {
        lib.copySync(p, obj[p], filterConfig);
        console.log(ansiColors.green(("  " + (logUtils.success) + " " + p + " -> " + (obj[p]))));
      }
    }
  }
};

var index = {
  emptyDirectories: emptyDirectories,
  prepareDirectories: prepareDirectories,
  htmlInjector: htmlInjector,
  i18nBundler: i18nBundler,
  copyAssets: copyAssets
};

export default index;
//# sourceMappingURL=rollup-plugin-app-utils.es.js.map
