/** @license
 * Autodesk rollup-plugin-app-utils
 * Date: 2019-12-17
 * License: Apache-2.0
 *
 * Bundled dependencies (npm packages): 
 * {"package":"ansi-colors@3.2.3","license":"MIT","link":"https://github.com/doowb/ansi-colors"}, {"package":"time-stamp@2.2.0","license":"MIT","link":"https://github.com/jonschlinkert/time-stamp"}, {"package":"log-utils@1.0.0","license":"MIT","link":"https://github.com/jonschlinkert/log-utils"}, {"package":"universalify@0.1.2","license":"MIT","link":"https://github.com/RyanZim/universalify#readme"}, {"package":"graceful-fs@4.2.3","license":"ISC","link":"https://github.com/isaacs/node-graceful-fs#readme"}, {"package":"fs-extra@8.1.0","license":"MIT","link":"https://github.com/jprichardson/node-fs-extra"}, {"package":"jsonfile@4.0.0","license":"MIT","link":"https://github.com/jprichardson/node-jsonfile#readme"}, {"package":"string-template@1.0.0","license":"MIT","link":"https://github.com/Matt-Esch/string-template"}, {"package":"rfc6902@3.0.4","license":"MIT","link":"https://github.com/chbrown/rfc6902"}, {"package":"object-path@0.11.4","license":"MIT","link":"https://github.com/mariocasciaro/object-path"}
 */
import fs from 'fs';
import constants from 'constants';
import stream from 'stream';
import util from 'util';
import assert from 'assert';
import path from 'path';
import os from 'os';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
}

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
  fs$$1.read = (function (fs$read) {
    function read (fd, buffer, offset, length, position, callback_) {
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
    }

    // This ensures `util.promisify` works as it does for native `fs.read`.
    read.__proto__ = fs$read;
    return read
  })(fs$$1.read);

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
    return function (target, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = null;
      }
      function callback (er, stats) {
        if (stats) {
          if (stats.uid < 0) { stats.uid += 0x100000000; }
          if (stats.gid < 0) { stats.gid += 0x100000000; }
        }
        if (cb) { cb.apply(this, arguments); }
      }
      return options ? orig.call(fs$$1, target, options, callback)
        : orig.call(fs$$1, target, callback)
    }
  }

  function statFixSync (orig) {
    if (!orig) { return orig }
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, options) {
      var stats = options ? orig.call(fs$$1, target, options)
        : orig.call(fs$$1, target);
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

var Stream = stream.Stream;

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
/* istanbul ignore next - node 0.x polyfill */
var gracefulQueue;
var previousSymbol;

/* istanbul ignore else - node 0.x polyfill */
if (typeof Symbol === 'function' && typeof Symbol.for === 'function') {
  gracefulQueue = Symbol.for('graceful-fs.queue');
  // This is used in testing by future versions
  previousSymbol = Symbol.for('graceful-fs.previous');
} else {
  gracefulQueue = '___graceful-fs.queue';
  previousSymbol = '___graceful-fs.previous';
}

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

// Once time initialization
if (!commonjsGlobal[gracefulQueue]) {
  // This queue can be shared by multiple loaded instances
  var queue = [];
  Object.defineProperty(commonjsGlobal, gracefulQueue, {
    get: function() {
      return queue
    }
  });

  // Patch fs.close/closeSync to shared queue version, because we need
  // to retry() whenever a close happens *anywhere* in the program.
  // This is essential when multiple graceful-fs instances are
  // in play at the same time.
  fs.close = (function (fs$close) {
    function close (fd, cb) {
      return fs$close.call(fs, fd, function (err) {
        // This function uses the graceful-fs shared queue
        if (!err) {
          retry();
        }

        if (typeof cb === 'function')
          { cb.apply(this, arguments); }
      })
    }

    Object.defineProperty(close, previousSymbol, {
      value: fs$close
    });
    return close
  })(fs.close);

  fs.closeSync = (function (fs$closeSync) {
    function closeSync (fd) {
      // This function uses the graceful-fs shared queue
      fs$closeSync.apply(fs, arguments);
      retry();
    }

    Object.defineProperty(closeSync, previousSymbol, {
      value: fs$closeSync
    });
    return closeSync
  })(fs.closeSync);

  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
    process.on('exit', function() {
      debug(commonjsGlobal[gracefulQueue]);
      assert.equal(commonjsGlobal[gracefulQueue].length, 0);
    });
  }
}

module.exports = patch(clone_1(fs));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
    module.exports = patch(fs);
    fs.__patched = true;
}

function patch (fs$$1) {
  // Everything that references the open() function needs to be in here
  polyfills(fs$$1);
  fs$$1.gracefulify = patch;

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

  Object.defineProperty(fs$$1, 'ReadStream', {
    get: function () {
      return ReadStream
    },
    set: function (val) {
      ReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(fs$$1, 'WriteStream', {
    get: function () {
      return WriteStream
    },
    set: function (val) {
      WriteStream = val;
    },
    enumerable: true,
    configurable: true
  });

  // legacy names
  var FileReadStream = ReadStream;
  Object.defineProperty(fs$$1, 'FileReadStream', {
    get: function () {
      return FileReadStream
    },
    set: function (val) {
      FileReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileWriteStream = WriteStream;
  Object.defineProperty(fs$$1, 'FileWriteStream', {
    get: function () {
      return FileWriteStream
    },
    set: function (val) {
      FileWriteStream = val;
    },
    enumerable: true,
    configurable: true
  });

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
    return new fs$$1.ReadStream(path$$1, options)
  }

  function createWriteStream (path$$1, options) {
    return new fs$$1.WriteStream(path$$1, options)
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
  commonjsGlobal[gracefulQueue].push(elem);
}

function retry () {
  var elem = commonjsGlobal[gracefulQueue].shift();
  if (elem) {
    debug('RETRY', elem[0].name, elem[1]);
    elem[0].apply(null, elem[1]);
  }
}
});

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

// fs.realpath.native only available in Node v9.2+
if (typeof gracefulFs.realpath.native === 'function') {
  exports.realpath.native = u(gracefulFs.realpath.native);
}
});
var fs_2 = fs_1.exists;
var fs_3 = fs_1.read;
var fs_4 = fs_1.write;

// get drive on windows
function getRootPath (p) {
  p = path.normalize(path.resolve(p)).split(path.sep);
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
  p = path.resolve(p);

  xfs.mkdir(p, mode, function (er) {
    if (!er) {
      made = made || p;
      return callback(null, made)
    }
    switch (er.code) {
      case 'ENOENT':
        if (path.dirname(p) === p) { return callback(er) }
        mkdirs(path.dirname(p), opts, function (er, made) {
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

  p = path.resolve(p);

  try {
    xfs.mkdirSync(p, mode);
    made = made || p;
  } catch (err0) {
    if (err0.code === 'ENOENT') {
      if (path.dirname(p) === p) { throw err0 }
      made = mkdirsSync(path.dirname(p), opts, made);
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

// HFS, ext{2,3}, FAT do not, Node.js v0.10 does not
function hasMillisResSync () {
  var tmpfile = path.join('millis-test-sync' + Date.now().toString() + Math.random().toString().slice(2));
  tmpfile = path.join(os.tmpdir(), tmpfile);

  // 550 millis past UNIX epoch
  var d = new Date(1435410243862);
  gracefulFs.writeFileSync(tmpfile, 'https://github.com/jprichardson/node-fs-extra/pull/141');
  var fd = gracefulFs.openSync(tmpfile, 'r+');
  gracefulFs.futimesSync(fd, d, d);
  gracefulFs.closeSync(fd);
  return gracefulFs.statSync(tmpfile).mtime > 1435410243000
}

function hasMillisRes (callback) {
  var tmpfile = path.join('millis-test' + Date.now().toString() + Math.random().toString().slice(2));
  tmpfile = path.join(os.tmpdir(), tmpfile);

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

var NODE_VERSION_MAJOR_WITH_BIGINT = 10;
var NODE_VERSION_MINOR_WITH_BIGINT = 5;
var NODE_VERSION_PATCH_WITH_BIGINT = 0;
var nodeVersion = process.versions.node.split('.');
var nodeVersionMajor = Number.parseInt(nodeVersion[0], 10);
var nodeVersionMinor = Number.parseInt(nodeVersion[1], 10);
var nodeVersionPatch = Number.parseInt(nodeVersion[2], 10);

function nodeSupportsBigInt () {
  if (nodeVersionMajor > NODE_VERSION_MAJOR_WITH_BIGINT) {
    return true
  } else if (nodeVersionMajor === NODE_VERSION_MAJOR_WITH_BIGINT) {
    if (nodeVersionMinor > NODE_VERSION_MINOR_WITH_BIGINT) {
      return true
    } else if (nodeVersionMinor === NODE_VERSION_MINOR_WITH_BIGINT) {
      if (nodeVersionPatch >= NODE_VERSION_PATCH_WITH_BIGINT) {
        return true
      }
    }
  }
  return false
}

function getStats (src, dest, cb) {
  if (nodeSupportsBigInt()) {
    gracefulFs.stat(src, { bigint: true }, function (err, srcStat) {
      if (err) { return cb(err) }
      gracefulFs.stat(dest, { bigint: true }, function (err, destStat) {
        if (err) {
          if (err.code === 'ENOENT') { return cb(null, { srcStat: srcStat, destStat: null }) }
          return cb(err)
        }
        return cb(null, { srcStat: srcStat, destStat: destStat })
      });
    });
  } else {
    gracefulFs.stat(src, function (err, srcStat) {
      if (err) { return cb(err) }
      gracefulFs.stat(dest, function (err, destStat) {
        if (err) {
          if (err.code === 'ENOENT') { return cb(null, { srcStat: srcStat, destStat: null }) }
          return cb(err)
        }
        return cb(null, { srcStat: srcStat, destStat: destStat })
      });
    });
  }
}

function getStatsSync (src, dest) {
  var srcStat, destStat;
  if (nodeSupportsBigInt()) {
    srcStat = gracefulFs.statSync(src, { bigint: true });
  } else {
    srcStat = gracefulFs.statSync(src);
  }
  try {
    if (nodeSupportsBigInt()) {
      destStat = gracefulFs.statSync(dest, { bigint: true });
    } else {
      destStat = gracefulFs.statSync(dest);
    }
  } catch (err) {
    if (err.code === 'ENOENT') { return { srcStat: srcStat, destStat: null } }
    throw err
  }
  return { srcStat: srcStat, destStat: destStat }
}

function checkPaths (src, dest, funcName, cb) {
  getStats(src, dest, function (err, stats) {
    if (err) { return cb(err) }
    var srcStat = stats.srcStat;
    var destStat = stats.destStat;
    if (destStat && destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
      return cb(new Error('Source and destination must not be the same.'))
    }
    if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
      return cb(new Error(errMsg(src, dest, funcName)))
    }
    return cb(null, { srcStat: srcStat, destStat: destStat })
  });
}

function checkPathsSync (src, dest, funcName) {
  var ref = getStatsSync(src, dest);
  var srcStat = ref.srcStat;
  var destStat = ref.destStat;
  if (destStat && destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
    throw new Error('Source and destination must not be the same.')
  }
  if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
    throw new Error(errMsg(src, dest, funcName))
  }
  return { srcStat: srcStat, destStat: destStat }
}

// recursively check if dest parent is a subdirectory of src.
// It works for all file types including symlinks since it
// checks the src and dest inodes. It starts from the deepest
// parent and stops once it reaches the src parent or the root path.
function checkParentPaths (src, srcStat, dest, funcName, cb) {
  var srcParent = path.resolve(path.dirname(src));
  var destParent = path.resolve(path.dirname(dest));
  if (destParent === srcParent || destParent === path.parse(destParent).root) { return cb() }
  if (nodeSupportsBigInt()) {
    gracefulFs.stat(destParent, { bigint: true }, function (err, destStat) {
      if (err) {
        if (err.code === 'ENOENT') { return cb() }
        return cb(err)
      }
      if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
        return cb(new Error(errMsg(src, dest, funcName)))
      }
      return checkParentPaths(src, srcStat, destParent, funcName, cb)
    });
  } else {
    gracefulFs.stat(destParent, function (err, destStat) {
      if (err) {
        if (err.code === 'ENOENT') { return cb() }
        return cb(err)
      }
      if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
        return cb(new Error(errMsg(src, dest, funcName)))
      }
      return checkParentPaths(src, srcStat, destParent, funcName, cb)
    });
  }
}

function checkParentPathsSync (src, srcStat, dest, funcName) {
  var srcParent = path.resolve(path.dirname(src));
  var destParent = path.resolve(path.dirname(dest));
  if (destParent === srcParent || destParent === path.parse(destParent).root) { return }
  var destStat;
  try {
    if (nodeSupportsBigInt()) {
      destStat = gracefulFs.statSync(destParent, { bigint: true });
    } else {
      destStat = gracefulFs.statSync(destParent);
    }
  } catch (err) {
    if (err.code === 'ENOENT') { return }
    throw err
  }
  if (destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev) {
    throw new Error(errMsg(src, dest, funcName))
  }
  return checkParentPathsSync(src, srcStat, destParent, funcName)
}

// return true if dest is a subdir of src, otherwise false.
// It only checks the path strings.
function isSrcSubdir (src, dest) {
  var srcArr = path.resolve(src).split(path.sep).filter(function (i) { return i; });
  var destArr = path.resolve(dest).split(path.sep).filter(function (i) { return i; });
  return srcArr.reduce(function (acc, cur, i) { return acc && destArr[i] === cur; }, true)
}

function errMsg (src, dest, funcName) {
  return ("Cannot " + funcName + " '" + src + "' to a subdirectory of itself, '" + dest + "'.")
}

var stat = {
  checkPaths: checkPaths,
  checkPathsSync: checkPathsSync,
  checkParentPaths: checkParentPaths,
  checkParentPathsSync: checkParentPathsSync,
  isSrcSubdir: isSrcSubdir
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

var mkdirpSync = mkdirs_1$1.mkdirsSync;
var utimesSync = utimes.utimesMillisSync;


function copySync (src, dest, opts) {
  if (typeof opts === 'function') {
    opts = { filter: opts };
  }

  opts = opts || {};
  opts.clobber = 'clobber' in opts ? !!opts.clobber : true; // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber; // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    console.warn("fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n\n    see https://github.com/jprichardson/node-fs-extra/issues/269");
  }

  var ref = stat.checkPathsSync(src, dest, 'copy');
  var srcStat = ref.srcStat;
  var destStat = ref.destStat;
  stat.checkParentPathsSync(src, srcStat, dest, 'copy');
  return handleFilterAndCopy(destStat, src, dest, opts)
}

function handleFilterAndCopy (destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) { return }
  var destParent = path.dirname(dest);
  if (!gracefulFs.existsSync(destParent)) { mkdirpSync(destParent); }
  return startCopy(destStat, src, dest, opts)
}

function startCopy (destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) { return }
  return getStats$1(destStat, src, dest, opts)
}

function getStats$1 (destStat, src, dest, opts) {
  var statSync = opts.dereference ? gracefulFs.statSync : gracefulFs.lstatSync;
  var srcStat = statSync(src);

  if (srcStat.isDirectory()) { return onDir(srcStat, destStat, src, dest, opts) }
  else if (srcStat.isFile() ||
           srcStat.isCharacterDevice() ||
           srcStat.isBlockDevice()) { return onFile(srcStat, destStat, src, dest, opts) }
  else if (srcStat.isSymbolicLink()) { return onLink(destStat, src, dest, opts) }
}

function onFile (srcStat, destStat, src, dest, opts) {
  if (!destStat) { return copyFile(srcStat, src, dest, opts) }
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
  if (!destStat) { return mkDirAndCopy(srcStat, src, dest, opts) }
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
  var srcItem = path.join(src, item);
  var destItem = path.join(dest, item);
  var ref = stat.checkPathsSync(srcItem, destItem, 'copy');
  var destStat = ref.destStat;
  return startCopy(destStat, srcItem, destItem, opts)
}

function onLink (destStat, src, dest, opts) {
  var resolvedSrc = gracefulFs.readlinkSync(src);
  if (opts.dereference) {
    resolvedSrc = path.resolve(process.cwd(), resolvedSrc);
  }

  if (!destStat) {
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
      resolvedDest = path.resolve(process.cwd(), resolvedDest);
    }
    if (stat.isSrcSubdir(resolvedSrc, resolvedDest)) {
      throw new Error(("Cannot copy '" + resolvedSrc + "' to a subdirectory of itself, '" + resolvedDest + "'."))
    }

    // prevent copy if src is a subdir of dest since unlinking
    // dest in this case would result in removing src contents
    // and therefore a broken symlink would be created.
    if (gracefulFs.statSync(dest).isDirectory() && stat.isSrcSubdir(resolvedDest, resolvedSrc)) {
      throw new Error(("Cannot overwrite '" + resolvedDest + "' with '" + resolvedSrc + "'."))
    }
    return copyLink(resolvedSrc, dest)
  }
}

function copyLink (resolvedSrc, dest) {
  gracefulFs.unlinkSync(dest);
  return gracefulFs.symlinkSync(resolvedSrc, dest)
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

var mkdirp = mkdirs_1$1.mkdirs;
var pathExists$1 = pathExists_1.pathExists;
var utimes$1 = utimes.utimesMillis;


function copy (src, dest, opts, cb) {
  if (typeof opts === 'function' && !cb) {
    cb = opts;
    opts = {};
  } else if (typeof opts === 'function') {
    opts = { filter: opts };
  }

  cb = cb || function () {};
  opts = opts || {};

  opts.clobber = 'clobber' in opts ? !!opts.clobber : true; // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber; // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    console.warn("fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n\n    see https://github.com/jprichardson/node-fs-extra/issues/269");
  }

  stat.checkPaths(src, dest, 'copy', function (err, stats) {
    if (err) { return cb(err) }
    var srcStat = stats.srcStat;
    var destStat = stats.destStat;
    stat.checkParentPaths(src, srcStat, dest, 'copy', function (err) {
      if (err) { return cb(err) }
      if (opts.filter) { return handleFilter(checkParentDir, destStat, src, dest, opts, cb) }
      return checkParentDir(destStat, src, dest, opts, cb)
    });
  });
}

function checkParentDir (destStat, src, dest, opts, cb) {
  var destParent = path.dirname(dest);
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
    if (include) { return onInclude(destStat, src, dest, opts, cb) }
    return cb()
  }, function (error) { return cb(error); });
}

function startCopy$1 (destStat, src, dest, opts, cb) {
  if (opts.filter) { return handleFilter(getStats$2, destStat, src, dest, opts, cb) }
  return getStats$2(destStat, src, dest, opts, cb)
}

function getStats$2 (destStat, src, dest, opts, cb) {
  var stat$$1 = opts.dereference ? gracefulFs.stat : gracefulFs.lstat;
  stat$$1(src, function (err, srcStat) {
    if (err) { return cb(err) }

    if (srcStat.isDirectory()) { return onDir$1(srcStat, destStat, src, dest, opts, cb) }
    else if (srcStat.isFile() ||
             srcStat.isCharacterDevice() ||
             srcStat.isBlockDevice()) { return onFile$1(srcStat, destStat, src, dest, opts, cb) }
    else if (srcStat.isSymbolicLink()) { return onLink$1(destStat, src, dest, opts, cb) }
  });
}

function onFile$1 (srcStat, destStat, src, dest, opts, cb) {
  if (!destStat) { return copyFile$1(srcStat, src, dest, opts, cb) }
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
  if (!destStat) { return mkDirAndCopy$1(srcStat, src, dest, opts, cb) }
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
  var srcItem = path.join(src, item);
  var destItem = path.join(dest, item);
  stat.checkPaths(srcItem, destItem, 'copy', function (err, stats) {
    if (err) { return cb(err) }
    var destStat = stats.destStat;
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
      resolvedSrc = path.resolve(process.cwd(), resolvedSrc);
    }

    if (!destStat) {
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
          resolvedDest = path.resolve(process.cwd(), resolvedDest);
        }
        if (stat.isSrcSubdir(resolvedSrc, resolvedDest)) {
          return cb(new Error(("Cannot copy '" + resolvedSrc + "' to a subdirectory of itself, '" + resolvedDest + "'.")))
        }

        // do not copy if src is a subdir of dest since unlinking
        // dest in this case would result in removing src contents
        // and therefore a broken symlink would be created.
        if (destStat.isDirectory() && stat.isSrcSubdir(resolvedDest, resolvedSrc)) {
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

var copy_1 = copy;

var u$2 = universalify.fromCallback;
var copy$1 = {
  copy: u$2(copy_1)
};

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
      rimraf(path.join(p, f), options, function (er) {
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
  options.readdirSync(p).forEach(function (f) { return rimrafSync(path.join(p, f), options); });

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





var emptyDir = u$4(function emptyDir (dir, callback) {
  callback = callback || function () {};
  gracefulFs.readdir(dir, function (err, items) {
    if (err) { return mkdirs_1$1.mkdirs(dir, callback) }

    items = items.map(function (item) { return path.join(dir, item); });

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
    items = gracefulFs.readdirSync(dir);
  } catch (err) {
    return mkdirs_1$1.mkdirsSync(dir)
  }

  items.forEach(function (item) {
    item = path.join(dir, item);
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
    var dir = path.dirname(file);
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

  var dir = path.dirname(file);
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

      var dir = path.dirname(dstpath);
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

  var dir = path.dirname(dstpath);
  var dirExists = gracefulFs.existsSync(dir);
  if (dirExists) { return gracefulFs.linkSync(srcpath, dstpath) }
  mkdirs_1$1.mkdirsSync(dir);

  return gracefulFs.linkSync(srcpath, dstpath)
}

var link = {
  createLink: u$6(createLink),
  createLinkSync: createLinkSync
};

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
  if (path.isAbsolute(srcpath)) {
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
    var dstdir = path.dirname(dstpath);
    var relativeToDst = path.join(dstdir, srcpath);
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
            'toDst': path.relative(dstdir, srcpath)
          })
        })
      }
    })
  }
}

function symlinkPathsSync (srcpath, dstpath) {
  var exists;
  if (path.isAbsolute(srcpath)) {
    exists = gracefulFs.existsSync(srcpath);
    if (!exists) { throw new Error('absolute srcpath does not exist') }
    return {
      'toCwd': srcpath,
      'toDst': srcpath
    }
  } else {
    var dstdir = path.dirname(dstpath);
    var relativeToDst = path.join(dstdir, srcpath);
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
        'toDst': path.relative(dstdir, srcpath)
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
        var dir = path.dirname(dstpath);
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
  var dir = path.dirname(dstpath);
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

var _fs;
try {
  _fs = gracefulFs;
} catch (_) {
  _fs = fs;
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

var pathExists$6 = pathExists_1.pathExists;


function outputJson (file, data, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var dir = path.dirname(file);

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

function outputJsonSync (file, data, options) {
  var dir = path.dirname(file);

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

var copySync$2 = copySync$1.copySync;
var removeSync = remove.removeSync;
var mkdirpSync$1 = mkdirs_1$1.mkdirpSync;


function moveSync (src, dest, opts) {
  opts = opts || {};
  var overwrite = opts.overwrite || opts.clobber || false;

  var ref = stat.checkPathsSync(src, dest, 'move');
  var srcStat = ref.srcStat;
  stat.checkParentPathsSync(src, srcStat, dest, 'move');
  mkdirpSync$1(path.dirname(dest));
  return doRename(src, dest, overwrite)
}

function doRename (src, dest, overwrite) {
  if (overwrite) {
    removeSync(dest);
    return rename(src, dest, overwrite)
  }
  if (gracefulFs.existsSync(dest)) { throw new Error('dest already exists.') }
  return rename(src, dest, overwrite)
}

function rename (src, dest, overwrite) {
  try {
    gracefulFs.renameSync(src, dest);
  } catch (err) {
    if (err.code !== 'EXDEV') { throw err }
    return moveAcrossDevice(src, dest, overwrite)
  }
}

function moveAcrossDevice (src, dest, overwrite) {
  var opts = {
    overwrite: overwrite,
    errorOnExist: true
  };
  copySync$2(src, dest, opts);
  return removeSync(src)
}

var moveSync_1 = moveSync;

var moveSync$1 = {
  moveSync: moveSync_1
};

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

  stat.checkPaths(src, dest, 'move', function (err, stats) {
    if (err) { return cb(err) }
    var srcStat = stats.srcStat;
    stat.checkParentPaths(src, srcStat, dest, 'move', function (err) {
      if (err) { return cb(err) }
      mkdirp$1(path.dirname(dest), function (err) {
        if (err) { return cb(err) }
        return doRename$1(src, dest, overwrite, cb)
      });
    });
  });
}

function doRename$1 (src, dest, overwrite, cb) {
  if (overwrite) {
    return remove$1(dest, function (err) {
      if (err) { return cb(err) }
      return rename$1(src, dest, overwrite, cb)
    })
  }
  pathExists$7(dest, function (err, destExists) {
    if (err) { return cb(err) }
    if (destExists) { return cb(new Error('dest already exists.')) }
    return rename$1(src, dest, overwrite, cb)
  });
}

function rename$1 (src, dest, overwrite, cb) {
  gracefulFs.rename(src, dest, function (err) {
    if (!err) { return cb() }
    if (err.code !== 'EXDEV') { return cb(err) }
    return moveAcrossDevice$1(src, dest, overwrite, cb)
  });
}

function moveAcrossDevice$1 (src, dest, overwrite, cb) {
  var opts = {
    overwrite: overwrite,
    errorOnExist: true
  };
  copy$2(src, dest, opts, function (err) {
    if (err) { return cb(err) }
    return remove$1(src, cb)
  });
}

var move_1 = move;

var u$a = universalify.fromCallback;
var move$1 = {
  move: u$a(move_1)
};

var u$b = universalify.fromCallback;



var pathExists$8 = pathExists_1.pathExists;

function outputFile (file, data, encoding, callback) {
  if (typeof encoding === 'function') {
    callback = encoding;
    encoding = 'utf8';
  }

  var dir = path.dirname(file);
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

  var dir = path.dirname(file);
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
  moveSync$1,
  move$1,
  output,
  pathExists_1,
  remove
);

// Export fs.promises as a getter property so that we don't trigger
// ExperimentalWarning before fs.promises is actually accessed.

if (Object.getOwnPropertyDescriptor(fs, 'promises')) {
  Object.defineProperty(module.exports, 'promises', {
    get: function get () { return fs.promises }
  });
}
});

var emptyDirectories = function (directories) {
  return {
    buildStart: function buildStart () {
      if (typeof directories === 'string') {
        directories = [directories];
      }
      console.log(ansiColors.bold.underline.cyan('\nCleaning directories'));
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
      console.log(ansiColors.bold.underline.cyan('\nPreparing directories'));
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

var pointer = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
/**
Unescape token part of a JSON Pointer string

`token` should *not* contain any '/' characters.

> Evaluation of each reference token begins by decoding any escaped
> character sequence.  This is performed by first transforming any
> occurrence of the sequence '~1' to '/', and then transforming any
> occurrence of the sequence '~0' to '~'.  By performing the
> substitutions in this order, an implementation avoids the error of
> turning '~01' first into '~1' and then into '/', which would be
> incorrect (the string '~01' correctly becomes '~1' after
> transformation).

Here's my take:

~1 is unescaped with higher priority than ~0 because it is a lower-order escape character.
I say "lower order" because '/' needs escaping due to the JSON Pointer serialization technique.
Whereas, '~' is escaped because escaping '/' uses the '~' character.
*/
function unescape(token) {
    return token.replace(/~1/g, '/').replace(/~0/g, '~');
}
/** Escape token part of a JSON Pointer string

> '~' needs to be encoded as '~0' and '/'
> needs to be encoded as '~1' when these characters appear in a
> reference token.

This is the exact inverse of `unescape()`, so the reverse replacements must take place in reverse order.
*/
function escape(token) {
    return token.replace(/~/g, '~0').replace(/\//g, '~1');
}
/**
JSON Pointer representation
*/
var Pointer = /** @class */ (function () {
    function Pointer(tokens) {
        if (tokens === void 0) { tokens = ['']; }
        this.tokens = tokens;
    }
    /**
    `path` *must* be a properly escaped string.
    */
    Pointer.fromJSON = function (path$$1) {
        var tokens = path$$1.split('/').map(unescape);
        if (tokens[0] !== '')
            { throw new Error("Invalid JSON Pointer: " + path$$1); }
        return new Pointer(tokens);
    };
    Pointer.prototype.toString = function () {
        return this.tokens.map(escape).join('/');
    };
    /**
    Returns an object with 'parent', 'key', and 'value' properties.
    In the special case that this Pointer's path == "",
    this object will be {parent: null, key: '', value: object}.
    Otherwise, parent and key will have the property such that parent[key] == value.
    */
    Pointer.prototype.evaluate = function (object) {
        var parent = null;
        var key = '';
        var value = object;
        for (var i = 1, l = this.tokens.length; i < l; i++) {
            parent = value;
            key = this.tokens[i];
            // not sure if this the best way to handle non-existant paths...
            value = (parent || {})[key];
        }
        return { parent: parent, key: key, value: value };
    };
    Pointer.prototype.get = function (object) {
        return this.evaluate(object).value;
    };
    Pointer.prototype.set = function (object, value) {
        var cursor = object;
        for (var i = 1, l = this.tokens.length - 1, token = this.tokens[i]; i < l; i++) {
            // not sure if this the best way to handle non-existant paths...
            cursor = (cursor || {})[token];
        }
        if (cursor) {
            cursor[this.tokens[this.tokens.length - 1]] = value;
        }
    };
    Pointer.prototype.push = function (token) {
        // mutable
        this.tokens.push(token);
    };
    /**
    `token` should be a String. It'll be coerced to one anyway.
  
    immutable (shallowly)
    */
    Pointer.prototype.add = function (token) {
        var tokens = this.tokens.concat(String(token));
        return new Pointer(tokens);
    };
    return Pointer;
}());
exports.Pointer = Pointer;
});

unwrapExports(pointer);
var pointer_1 = pointer.Pointer;

var util$1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
var hasOwnProperty = Object.prototype.hasOwnProperty;
/**
Recursively copy a value.

@param source - should be a JavaScript primitive, Array, or (plain old) Object.
@returns copy of source where every Array and Object have been recursively
         reconstructed from their constituent elements
*/
function clone(source) {
    // loose-equality checking for null is faster than strict checking for each of null/undefined/true/false
    // checking null first, then calling typeof, is faster than vice-versa
    if (source == null || typeof source != 'object') {
        // short-circuiting is faster than a single return
        return source;
    }
    // x.constructor == Array is the fastest way to check if x is an Array
    if (source.constructor == Array) {
        // construction via imperative for-loop is faster than source.map(arrayVsObject)
        var length_1 = source.length;
        // setting the Array length during construction is faster than just `[]` or `new Array()`
        var arrayTarget = new Array(length_1);
        for (var i = 0; i < length_1; i++) {
            arrayTarget[i] = clone(source[i]);
        }
        return arrayTarget;
    }
    // Object
    var objectTarget = {};
    // declaring the variable (with const) inside the loop is faster
    for (var key in source) {
        // hasOwnProperty costs a bit of performance, but it's semantically necessary
        // using a global helper is MUCH faster than calling source.hasOwnProperty(key)
        if (hasOwnProperty.call(source, key)) {
            objectTarget[key] = clone(source[key]);
        }
    }
    return objectTarget;
}
exports.clone = clone;
});

unwrapExports(util$1);
var util_1 = util$1.clone;

var equal = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
var hasOwnProperty = Object.prototype.hasOwnProperty;
function objectType(object) {
    if (object === undefined) {
        return 'undefined';
    }
    if (object === null) {
        return 'null';
    }
    if (Array.isArray(object)) {
        return 'array';
    }
    return typeof object;
}
exports.objectType = objectType;
/**
Evaluate `left === right`, treating `left` and `right` as ordered lists.

@returns true iff `left` and `right` have identical lengths, and every element
         of `left` is equal to the corresponding element of `right`. Equality is
         determined recursivly, via `compare`.
*/
function compareArrays(left, right) {
    var length = left.length;
    if (length !== right.length) {
        return false;
    }
    for (var i = 0; i < length; i++) {
        if (!compare(left[i], right[i])) {
            return false;
        }
    }
    return true;
}
/**
Evaluate `left === right`, treating `left` and `right` as property maps.

@returns true iff every property in `left` has a value equal to the value of the
         corresponding property in `right`, and vice-versa, stopping as soon as
         possible. Equality is determined recursivly, via `compare`.
*/
function compareObjects(left, right) {
    var left_keys = Object.keys(left);
    var right_keys = Object.keys(right);
    var length = left_keys.length;
    // quick exit if the number of keys don't match up
    if (length !== right_keys.length) {
        return false;
    }
    // we don't know for sure that Set(left_keys) is equal to Set(right_keys),
    // much less that their values in left and right are equal, but if right
    // contains each key in left, we know it can't have any additional keys
    for (var i = 0; i < length; i++) {
        var key = left_keys[i];
        if (!hasOwnProperty.call(right, key) || !compare(left[key], right[key])) {
            return false;
        }
    }
    return true;
}
/**
`compare()` returns true if `left` and `right` are materially equal
(i.e., would produce equivalent JSON), false otherwise.

> Here, "equal" means that the value at the target location and the
> value conveyed by "value" are of the same JSON type, and that they
> are considered equal by the following rules for that type:
> o  strings: are considered equal if they contain the same number of
>    Unicode characters and their code points are byte-by-byte equal.
> o  numbers: are considered equal if their values are numerically
>    equal.
> o  arrays: are considered equal if they contain the same number of
>    values, and if each value can be considered equal to the value at
>    the corresponding position in the other array, using this list of
>    type-specific rules.
> o  objects: are considered equal if they contain the same number of
>    members, and if each member can be considered equal to a member in
>    the other object, by comparing their keys (as strings) and their
>    values (using this list of type-specific rules).
> o  literals (false, true, and null): are considered equal if they are
>    the same.
*/
function compare(left, right) {
    // strict equality handles literals, numbers, and strings (a sufficient but not necessary cause)
    if (left === right) {
        return true;
    }
    var left_type = objectType(left);
    var right_type = objectType(right);
    // check arrays
    if (left_type == 'array' && right_type == 'array') {
        return compareArrays(left, right);
    }
    // check objects
    if (left_type == 'object' && right_type == 'object') {
        return compareObjects(left, right);
    }
    // mismatched arrays & objects, etc., are always inequal
    return false;
}
exports.compare = compare;
});

unwrapExports(equal);
var equal_1 = equal.objectType;
var equal_2 = equal.compare;

var patch$1 = createCommonjsModule(function (module, exports) {
var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });



var MissingError = /** @class */ (function (_super) {
    __extends(MissingError, _super);
    function MissingError(path$$1) {
        var _this = _super.call(this, "Value required at path: " + path$$1) || this;
        _this.path = path$$1;
        _this.name = 'MissingError';
        return _this;
    }
    return MissingError;
}(Error));
exports.MissingError = MissingError;
var TestError = /** @class */ (function (_super) {
    __extends(TestError, _super);
    function TestError(actual, expected) {
        var _this = _super.call(this, "Test failed: " + actual + " != " + expected) || this;
        _this.actual = actual;
        _this.expected = expected;
        _this.name = 'TestError';
        _this.actual = actual;
        _this.expected = expected;
        return _this;
    }
    return TestError;
}(Error));
exports.TestError = TestError;
function _add(object, key, value) {
    if (Array.isArray(object)) {
        // `key` must be an index
        if (key == '-') {
            object.push(value);
        }
        else {
            var index = parseInt(key, 10);
            object.splice(index, 0, value);
        }
    }
    else {
        object[key] = value;
    }
}
function _remove(object, key) {
    if (Array.isArray(object)) {
        // '-' syntax doesn't make sense when removing
        var index = parseInt(key, 10);
        object.splice(index, 1);
    }
    else {
        // not sure what the proper behavior is when path = ''
        delete object[key];
    }
}
/**
>  o  If the target location specifies an array index, a new value is
>     inserted into the array at the specified index.
>  o  If the target location specifies an object member that does not
>     already exist, a new member is added to the object.
>  o  If the target location specifies an object member that does exist,
>     that member's value is replaced.
*/
function add(object, operation) {
    var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
    // it's not exactly a "MissingError" in the same way that `remove` is -- more like a MissingParent, or something
    if (endpoint.parent === undefined) {
        return new MissingError(operation.path);
    }
    _add(endpoint.parent, endpoint.key, util$1.clone(operation.value));
    return null;
}
exports.add = add;
/**
> The "remove" operation removes the value at the target location.
> The target location MUST exist for the operation to be successful.
*/
function remove(object, operation) {
    // endpoint has parent, key, and value properties
    var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
    if (endpoint.value === undefined) {
        return new MissingError(operation.path);
    }
    // not sure what the proper behavior is when path = ''
    _remove(endpoint.parent, endpoint.key);
    return null;
}
exports.remove = remove;
/**
> The "replace" operation replaces the value at the target location
> with a new value.  The operation object MUST contain a "value" member
> whose content specifies the replacement value.
> The target location MUST exist for the operation to be successful.

> This operation is functionally identical to a "remove" operation for
> a value, followed immediately by an "add" operation at the same
> location with the replacement value.

Even more simply, it's like the add operation with an existence check.
*/
function replace(object, operation) {
    var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
    if (endpoint.parent === null) {
        return new MissingError(operation.path);
    }
    // this existence check treats arrays as a special case
    if (Array.isArray(endpoint.parent)) {
        if (parseInt(endpoint.key, 10) >= endpoint.parent.length) {
            return new MissingError(operation.path);
        }
    }
    else if (endpoint.value === undefined) {
        return new MissingError(operation.path);
    }
    endpoint.parent[endpoint.key] = operation.value;
    return null;
}
exports.replace = replace;
/**
> The "move" operation removes the value at a specified location and
> adds it to the target location.
> The operation object MUST contain a "from" member, which is a string
> containing a JSON Pointer value that references the location in the
> target document to move the value from.
> This operation is functionally identical to a "remove" operation on
> the "from" location, followed immediately by an "add" operation at
> the target location with the value that was just removed.

> The "from" location MUST NOT be a proper prefix of the "path"
> location; i.e., a location cannot be moved into one of its children.

TODO: throw if the check described in the previous paragraph fails.
*/
function move(object, operation) {
    var from_endpoint = pointer.Pointer.fromJSON(operation.from).evaluate(object);
    if (from_endpoint.value === undefined) {
        return new MissingError(operation.from);
    }
    var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
    if (endpoint.parent === undefined) {
        return new MissingError(operation.path);
    }
    _remove(from_endpoint.parent, from_endpoint.key);
    _add(endpoint.parent, endpoint.key, from_endpoint.value);
    return null;
}
exports.move = move;
/**
> The "copy" operation copies the value at a specified location to the
> target location.
> The operation object MUST contain a "from" member, which is a string
> containing a JSON Pointer value that references the location in the
> target document to copy the value from.
> The "from" location MUST exist for the operation to be successful.

> This operation is functionally identical to an "add" operation at the
> target location using the value specified in the "from" member.

Alternatively, it's like 'move' without the 'remove'.
*/
function copy(object, operation) {
    var from_endpoint = pointer.Pointer.fromJSON(operation.from).evaluate(object);
    if (from_endpoint.value === undefined) {
        return new MissingError(operation.from);
    }
    var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
    if (endpoint.parent === undefined) {
        return new MissingError(operation.path);
    }
    _add(endpoint.parent, endpoint.key, util$1.clone(from_endpoint.value));
    return null;
}
exports.copy = copy;
/**
> The "test" operation tests that a value at the target location is
> equal to a specified value.
> The operation object MUST contain a "value" member that conveys the
> value to be compared to the target location's value.
> The target location MUST be equal to the "value" value for the
> operation to be considered successful.
*/
function test(object, operation) {
    var endpoint = pointer.Pointer.fromJSON(operation.path).evaluate(object);
    var result = equal.compare(endpoint.value, operation.value);
    if (!result) {
        return new TestError(endpoint.value, operation.value);
    }
    return null;
}
exports.test = test;
var InvalidOperationError = /** @class */ (function (_super) {
    __extends(InvalidOperationError, _super);
    function InvalidOperationError(operation) {
        var _this = _super.call(this, "Invalid operation: " + operation.op) || this;
        _this.operation = operation;
        _this.name = 'InvalidOperationError';
        return _this;
    }
    return InvalidOperationError;
}(Error));
exports.InvalidOperationError = InvalidOperationError;
/**
Switch on `operation.op`, applying the corresponding patch function for each
case to `object`.
*/
function apply(object, operation) {
    // not sure why TypeScript can't infer typesafety of:
    //   {add, remove, replace, move, copy, test}[operation.op](object, operation)
    // (seems like a bug)
    switch (operation.op) {
        case 'add': return add(object, operation);
        case 'remove': return remove(object, operation);
        case 'replace': return replace(object, operation);
        case 'move': return move(object, operation);
        case 'copy': return copy(object, operation);
        case 'test': return test(object, operation);
    }
    return new InvalidOperationError(operation);
}
exports.apply = apply;
});

unwrapExports(patch$1);
var patch_1 = patch$1.MissingError;
var patch_2 = patch$1.TestError;
var patch_3 = patch$1.add;
var patch_4 = patch$1.remove;
var patch_5 = patch$1.replace;
var patch_6 = patch$1.move;
var patch_7 = patch$1.copy;
var patch_8 = patch$1.test;
var patch_9 = patch$1.InvalidOperationError;
var patch_10 = patch$1.apply;

var diff = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

var hasOwnProperty = Object.prototype.hasOwnProperty;
function isDestructive(_a) {
    var op = _a.op;
    return op === 'remove' || op === 'replace' || op === 'copy' || op === 'move';
}
exports.isDestructive = isDestructive;
/**
List the keys in `minuend` that are not in `subtrahend`.

A key is only considered if it is both 1) an own-property (o.hasOwnProperty(k))
of the object, and 2) has a value that is not undefined. This is to match JSON
semantics, where JSON object serialization drops keys with undefined values.

@param minuend Object of interest
@param subtrahend Object of comparison
@returns Array of keys that are in `minuend` but not in `subtrahend`.
*/
function subtract(minuend, subtrahend) {
    // initialize empty object; we only care about the keys, the values can be anything
    var obj = {};
    // build up obj with all the properties of minuend
    for (var add_key in minuend) {
        if (hasOwnProperty.call(minuend, add_key) && minuend[add_key] !== undefined) {
            obj[add_key] = 1;
        }
    }
    // now delete all the properties of subtrahend from obj
    // (deleting a missing key has no effect)
    for (var del_key in subtrahend) {
        if (hasOwnProperty.call(subtrahend, del_key) && subtrahend[del_key] !== undefined) {
            delete obj[del_key];
        }
    }
    // finally, extract whatever keys remain in obj
    return Object.keys(obj);
}
exports.subtract = subtract;
/**
List the keys that shared by all `objects`.

The semantics of what constitutes a "key" is described in {@link subtract}.

@param objects Array of objects to compare
@returns Array of keys that are in ("own-properties" of) every object in `objects`.
*/
function intersection(objects) {
    var length = objects.length;
    // prepare empty counter to keep track of how many objects each key occurred in
    var counter = {};
    // go through each object and increment the counter for each key in that object
    for (var i = 0; i < length; i++) {
        var object = objects[i];
        for (var key in object) {
            if (hasOwnProperty.call(object, key) && object[key] !== undefined) {
                counter[key] = (counter[key] || 0) + 1;
            }
        }
    }
    // now delete all keys from the counter that were not seen in every object
    for (var key in counter) {
        if (counter[key] < length) {
            delete counter[key];
        }
    }
    // finally, extract whatever keys remain in the counter
    return Object.keys(counter);
}
exports.intersection = intersection;
function isArrayAdd(array_operation) {
    return array_operation.op === 'add';
}
function isArrayRemove(array_operation) {
    return array_operation.op === 'remove';
}
function appendArrayOperation(base, operation) {
    return {
        // the new operation must be pushed on the end
        operations: base.operations.concat(operation),
        cost: base.cost + 1,
    };
}
/**
Calculate the shortest sequence of operations to get from `input` to `output`,
using a dynamic programming implementation of the Levenshtein distance algorithm.

To get from the input ABC to the output AZ we could just delete all the input
and say "insert A, insert Z" and be done with it. That's what we do if the
input is empty. But we can be smarter.

          output
               A   Z
               -   -
          [0]  1   2
input A |  1  [0]  1
      B |  2  [1]  1
      C |  3   2  [2]

1) start at 0,0 (+0)
2) keep A (+0)
3) remove B (+1)
4) replace C with Z (+1)

If the `input` (source) is empty, they'll all be in the top row, resulting in an
array of 'add' operations.
If the `output` (target) is empty, everything will be in the left column,
resulting in an array of 'remove' operations.

@returns A list of add/remove/replace operations.
*/
function diffArrays(input, output, ptr, diff) {
    if (diff === void 0) { diff = diffAny; }
    // set up cost matrix (very simple initialization: just a map)
    var memo = {
        '0,0': { operations: [], cost: 0 },
    };
    /**
    Calculate the cheapest sequence of operations required to get from
    input.slice(0, i) to output.slice(0, j).
    There may be other valid sequences with the same cost, but none cheaper.
  
    @param i The row in the layout above
    @param j The column in the layout above
    @returns An object containing a list of operations, along with the total cost
             of applying them (+1 for each add/remove/replace operation)
    */
    function dist(i, j) {
        // memoized
        var memo_key = i + "," + j;
        var memoized = memo[memo_key];
        if (memoized === undefined) {
            if (i > 0 && j > 0 && equal.compare(input[i - 1], output[j - 1])) {
                // equal (no operations => no cost)
                memoized = dist(i - 1, j - 1);
            }
            else {
                var alternatives = [];
                if (i > 0) {
                    // NOT topmost row
                    var remove_base = dist(i - 1, j);
                    var remove_operation = {
                        op: 'remove',
                        index: i - 1,
                    };
                    alternatives.push(appendArrayOperation(remove_base, remove_operation));
                }
                if (j > 0) {
                    // NOT leftmost column
                    var add_base = dist(i, j - 1);
                    var add_operation = {
                        op: 'add',
                        index: i - 1,
                        value: output[j - 1],
                    };
                    alternatives.push(appendArrayOperation(add_base, add_operation));
                }
                if (i > 0 && j > 0) {
                    // TABLE MIDDLE
                    // supposing we replaced it, compute the rest of the costs:
                    var replace_base = dist(i - 1, j - 1);
                    // okay, the general plan is to replace it, but we can be smarter,
                    // recursing into the structure and replacing only part of it if
                    // possible, but to do so we'll need the original value
                    var replace_operation = {
                        op: 'replace',
                        index: i - 1,
                        original: input[i - 1],
                        value: output[j - 1],
                    };
                    alternatives.push(appendArrayOperation(replace_base, replace_operation));
                }
                // the only other case, i === 0 && j === 0, has already been memoized
                // the meat of the algorithm:
                // sort by cost to find the lowest one (might be several ties for lowest)
                // [4, 6, 7, 1, 2].sort((a, b) => a - b) -> [ 1, 2, 4, 6, 7 ]
                var best = alternatives.sort(function (a, b) { return a.cost - b.cost; })[0];
                memoized = best;
            }
            memo[memo_key] = memoized;
        }
        return memoized;
    }
    // handle weird objects masquerading as Arrays that don't have proper length
    // properties by using 0 for everything but positive numbers
    var input_length = (isNaN(input.length) || input.length <= 0) ? 0 : input.length;
    var output_length = (isNaN(output.length) || output.length <= 0) ? 0 : output.length;
    var array_operations = dist(input_length, output_length).operations;
    var padded_operations = array_operations.reduce(function (_a, array_operation) {
        var operations = _a[0], padding = _a[1];
        if (isArrayAdd(array_operation)) {
            var padded_index = array_operation.index + 1 + padding;
            var index_token = padded_index < (input_length + padding) ? String(padded_index) : '-';
            var operation = {
                op: array_operation.op,
                path: ptr.add(index_token).toString(),
                value: array_operation.value,
            };
            // padding++ // maybe only if array_operation.index > -1 ?
            return [operations.concat(operation), padding + 1];
        }
        else if (isArrayRemove(array_operation)) {
            var operation = {
                op: array_operation.op,
                path: ptr.add(String(array_operation.index + padding)).toString(),
            };
            // padding--
            return [operations.concat(operation), padding - 1];
        }
        else { // replace
            var replace_ptr = ptr.add(String(array_operation.index + padding));
            var replace_operations = diff(array_operation.original, array_operation.value, replace_ptr);
            return [operations.concat.apply(operations, replace_operations), padding];
        }
    }, [[], 0])[0];
    return padded_operations;
}
exports.diffArrays = diffArrays;
function diffObjects(input, output, ptr, diff) {
    if (diff === void 0) { diff = diffAny; }
    // if a key is in input but not output -> remove it
    var operations = [];
    subtract(input, output).forEach(function (key) {
        operations.push({ op: 'remove', path: ptr.add(key).toString() });
    });
    // if a key is in output but not input -> add it
    subtract(output, input).forEach(function (key) {
        operations.push({ op: 'add', path: ptr.add(key).toString(), value: output[key] });
    });
    // if a key is in both, diff it recursively
    intersection([input, output]).forEach(function (key) {
        operations.push.apply(operations, diff(input[key], output[key], ptr.add(key)));
    });
    return operations;
}
exports.diffObjects = diffObjects;
function diffValues(input, output, ptr) {
    if (!equal.compare(input, output)) {
        return [{ op: 'replace', path: ptr.toString(), value: output }];
    }
    return [];
}
exports.diffValues = diffValues;
function diffAny(input, output, ptr, diff) {
    if (diff === void 0) { diff = diffAny; }
    var input_type = equal.objectType(input);
    var output_type = equal.objectType(output);
    if (input_type == 'array' && output_type == 'array') {
        return diffArrays(input, output, ptr, diff);
    }
    if (input_type == 'object' && output_type == 'object') {
        return diffObjects(input, output, ptr, diff);
    }
    // only pairs of arrays and objects can go down a path to produce a smaller
    // diff; everything else must be wholesale replaced if inequal
    return diffValues(input, output, ptr);
}
exports.diffAny = diffAny;
});

unwrapExports(diff);
var diff_1 = diff.isDestructive;
var diff_2 = diff.subtract;
var diff_3 = diff.intersection;
var diff_4 = diff.diffArrays;
var diff_5 = diff.diffObjects;
var diff_6 = diff.diffValues;
var diff_7 = diff.diffAny;

var rfc6902 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



/**
Apply a 'application/json-patch+json'-type patch to an object.

`patch` *must* be an array of operations.

> Operation objects MUST have exactly one "op" member, whose value
> indicates the operation to perform.  Its value MUST be one of "add",
> "remove", "replace", "move", "copy", or "test"; other values are
> errors.

This method mutates the target object in-place.

@returns list of results, one for each operation: `null` indicated success,
         otherwise, the result will be an instance of one of the Error classes:
         MissingError, InvalidOperationError, or TestError.
*/
function applyPatch(object, patch) {
    return patch.map(function (operation) { return patch$1.apply(object, operation); });
}
exports.applyPatch = applyPatch;
function wrapVoidableDiff(diff$$1) {
    function wrappedDiff(input, output, ptr) {
        var custom_patch = diff$$1(input, output, ptr);
        // ensure an array is always returned
        return Array.isArray(custom_patch) ? custom_patch : diff.diffAny(input, output, ptr, wrappedDiff);
    }
    return wrappedDiff;
}
/**
Produce a 'application/json-patch+json'-type patch to get from one object to
another.

This does not alter `input` or `output` unless they have a property getter with
side-effects (which is not a good idea anyway).

`diff` is called on each pair of comparable non-primitive nodes in the
`input`/`output` object trees, producing nested patches. Return `undefined`
to fall back to default behaviour.

Returns list of operations to perform on `input` to produce `output`.
*/
function createPatch(input, output, diff$$1) {
    var ptr = new pointer.Pointer();
    // a new Pointer gets a default path of [''] if not specified
    return (diff$$1 ? wrapVoidableDiff(diff$$1) : diff.diffAny)(input, output, ptr);
}
exports.createPatch = createPatch;
/**
Create a test operation based on `input`'s current evaluation of the JSON
Pointer `path`; if such a pointer cannot be resolved, returns undefined.
*/
function createTest(input, path$$1) {
    var endpoint = pointer.Pointer.fromJSON(path$$1).evaluate(input);
    if (endpoint !== undefined) {
        return { op: 'test', path: path$$1, value: endpoint.value };
    }
}
/**
Produce an 'application/json-patch+json'-type list of tests, to verify that
existing values in an object are identical to the those captured at some
checkpoint (whenever this function is called).

This does not alter `input` or `output` unless they have a property getter with
side-effects (which is not a good idea anyway).

Returns list of test operations.
*/
function createTests(input, patch) {
    var tests = new Array();
    patch.filter(diff.isDestructive).forEach(function (operation) {
        var pathTest = createTest(input, operation.path);
        if (pathTest)
            { tests.push(pathTest); }
        if ('from' in operation) {
            var fromTest = createTest(input, operation.from);
            if (fromTest)
                { tests.push(fromTest); }
        }
    });
    return tests;
}
exports.createTests = createTests;
});

unwrapExports(rfc6902);
var rfc6902_1 = rfc6902.applyPatch;
var rfc6902_2 = rfc6902.createPatch;
var rfc6902_3 = rfc6902.createTests;

var objectPath = createCommonjsModule(function (module) {
(function (root, factory){

  /*istanbul ignore next:cant test*/
  {
    module.exports = factory();
  }
})(commonjsGlobal, function(){

  var toStr = Object.prototype.toString;
  function hasOwnProperty(obj, prop) {
    if(obj == null) {
      return false
    }
    //to handle objects with null prototypes (too edge case?)
    return Object.prototype.hasOwnProperty.call(obj, prop)
  }

  function isEmpty(value){
    if (!value) {
      return true;
    }
    if (isArray(value) && value.length === 0) {
        return true;
    } else if (typeof value !== 'string') {
        for (var i in value) {
            if (hasOwnProperty(value, i)) {
                return false;
            }
        }
        return true;
    }
    return false;
  }

  function toString(type){
    return toStr.call(type);
  }

  function isObject(obj){
    return typeof obj === 'object' && toString(obj) === "[object Object]";
  }

  var isArray = Array.isArray || function(obj){
    /*istanbul ignore next:cant test*/
    return toStr.call(obj) === '[object Array]';
  };

  function isBoolean(obj){
    return typeof obj === 'boolean' || toString(obj) === '[object Boolean]';
  }

  function getKey(key){
    var intKey = parseInt(key);
    if (intKey.toString() === key) {
      return intKey;
    }
    return key;
  }

  function factory(options) {
    options = options || {};

    var objectPath = function(obj) {
      return Object.keys(objectPath).reduce(function(proxy, prop) {
        if(prop === 'create') {
          return proxy;
        }

        /*istanbul ignore else*/
        if (typeof objectPath[prop] === 'function') {
          proxy[prop] = objectPath[prop].bind(objectPath, obj);
        }

        return proxy;
      }, {});
    };

    function hasShallowProperty(obj, prop) {
      return (options.includeInheritedProps || (typeof prop === 'number' && Array.isArray(obj)) || hasOwnProperty(obj, prop))
    }

    function getShallowProperty(obj, prop) {
      if (hasShallowProperty(obj, prop)) {
        return obj[prop];
      }
    }

    function set(obj, path$$1, value, doNotReplace){
      if (typeof path$$1 === 'number') {
        path$$1 = [path$$1];
      }
      if (!path$$1 || path$$1.length === 0) {
        return obj;
      }
      if (typeof path$$1 === 'string') {
        return set(obj, path$$1.split('.').map(getKey), value, doNotReplace);
      }
      var currentPath = path$$1[0];
      var currentValue = getShallowProperty(obj, currentPath);
      if (path$$1.length === 1) {
        if (currentValue === void 0 || !doNotReplace) {
          obj[currentPath] = value;
        }
        return currentValue;
      }

      if (currentValue === void 0) {
        //check if we assume an array
        if(typeof path$$1[1] === 'number') {
          obj[currentPath] = [];
        } else {
          obj[currentPath] = {};
        }
      }

      return set(obj[currentPath], path$$1.slice(1), value, doNotReplace);
    }

    objectPath.has = function (obj, path$$1) {
      if (typeof path$$1 === 'number') {
        path$$1 = [path$$1];
      } else if (typeof path$$1 === 'string') {
        path$$1 = path$$1.split('.');
      }

      if (!path$$1 || path$$1.length === 0) {
        return !!obj;
      }

      for (var i = 0; i < path$$1.length; i++) {
        var j = getKey(path$$1[i]);

        if((typeof j === 'number' && isArray(obj) && j < obj.length) ||
          (options.includeInheritedProps ? (j in Object(obj)) : hasOwnProperty(obj, j))) {
          obj = obj[j];
        } else {
          return false;
        }
      }

      return true;
    };

    objectPath.ensureExists = function (obj, path$$1, value){
      return set(obj, path$$1, value, true);
    };

    objectPath.set = function (obj, path$$1, value, doNotReplace){
      return set(obj, path$$1, value, doNotReplace);
    };

    objectPath.insert = function (obj, path$$1, value, at){
      var arr = objectPath.get(obj, path$$1);
      at = ~~at;
      if (!isArray(arr)) {
        arr = [];
        objectPath.set(obj, path$$1, arr);
      }
      arr.splice(at, 0, value);
    };

    objectPath.empty = function(obj, path$$1) {
      if (isEmpty(path$$1)) {
        return void 0;
      }
      if (obj == null) {
        return void 0;
      }

      var value, i;
      if (!(value = objectPath.get(obj, path$$1))) {
        return void 0;
      }

      if (typeof value === 'string') {
        return objectPath.set(obj, path$$1, '');
      } else if (isBoolean(value)) {
        return objectPath.set(obj, path$$1, false);
      } else if (typeof value === 'number') {
        return objectPath.set(obj, path$$1, 0);
      } else if (isArray(value)) {
        value.length = 0;
      } else if (isObject(value)) {
        for (i in value) {
          if (hasShallowProperty(value, i)) {
            delete value[i];
          }
        }
      } else {
        return objectPath.set(obj, path$$1, null);
      }
    };

    objectPath.push = function (obj, path$$1 /*, values */){
      var arr = objectPath.get(obj, path$$1);
      if (!isArray(arr)) {
        arr = [];
        objectPath.set(obj, path$$1, arr);
      }

      arr.push.apply(arr, Array.prototype.slice.call(arguments, 2));
    };

    objectPath.coalesce = function (obj, paths, defaultValue) {
      var value;

      for (var i = 0, len = paths.length; i < len; i++) {
        if ((value = objectPath.get(obj, paths[i])) !== void 0) {
          return value;
        }
      }

      return defaultValue;
    };

    objectPath.get = function (obj, path$$1, defaultValue){
      if (typeof path$$1 === 'number') {
        path$$1 = [path$$1];
      }
      if (!path$$1 || path$$1.length === 0) {
        return obj;
      }
      if (obj == null) {
        return defaultValue;
      }
      if (typeof path$$1 === 'string') {
        return objectPath.get(obj, path$$1.split('.'), defaultValue);
      }

      var currentPath = getKey(path$$1[0]);
      var nextObj = getShallowProperty(obj, currentPath);
      if (nextObj === void 0) {
        return defaultValue;
      }

      if (path$$1.length === 1) {
        return nextObj;
      }

      return objectPath.get(obj[currentPath], path$$1.slice(1), defaultValue);
    };

    objectPath.del = function del(obj, path$$1) {
      if (typeof path$$1 === 'number') {
        path$$1 = [path$$1];
      }

      if (obj == null) {
        return obj;
      }

      if (isEmpty(path$$1)) {
        return obj;
      }
      if(typeof path$$1 === 'string') {
        return objectPath.del(obj, path$$1.split('.'));
      }

      var currentPath = getKey(path$$1[0]);
      if (!hasShallowProperty(obj, currentPath)) {
        return obj;
      }

      if(path$$1.length === 1) {
        if (isArray(obj)) {
          obj.splice(currentPath, 1);
        } else {
          delete obj[currentPath];
        }
      } else {
        return objectPath.del(obj[currentPath], path$$1.slice(1));
      }

      return obj;
    };

    return objectPath;
  }

  var mod = factory();
  mod.create = factory;
  mod.withInheritedProps = factory({includeInheritedProps: true});
  return mod;
});
});

var walk = function (ref) {
  var dir = ref.dir;
  var filter = ref.filter;
  var relativeTo = ref.relativeTo;
  var list = ref.list; if ( list === void 0 ) list = {};
  var depth = ref.depth; if ( depth === void 0 ) depth = 0;

  var files = fs.readdirSync(dir);
  ++depth;
  for (var i in files) {
    var file = files[i];
    var _file = path.join(dir, file);
    if (fs.statSync(_file).isDirectory()) {
      walk({
        dir: _file,
        filter: filter,
        relativeTo: depth === 1 ? _file : relativeTo,
        depth: depth,
        list: depth === 1 ? list[file] = {} : list
      });
    } else if ((filter.indexOf(path.extname(_file)) > -1) && depth > 1) {
      list[path.relative(relativeTo, _file)] = JSON.parse(fs.readFileSync(_file, 'utf-8'));
    }
  }
  return list
};

var i18n = function (options) {
  var target = options.target;
  var baseLanguage = options.baseLanguage;
  var transformer = options.transformer;

  var transform = transformer || (function (lang, data) {
    return { translations: data }
  });

  var data = walk({
    dir: target,
    filter: ['.json'],
    relativeTo: target,
    base: baseLanguage
  });

  var base = data[baseLanguage];

  var patches = {};
  var result = {};

  for (var lang in data) {
    var langJson = data[lang];
    if (baseLanguage !== lang) {
      var patch = rfc6902_2(langJson, base);
      patch = patch.filter(function (change) {
        return change.op !== 'replace'
      });
      patches[lang] = patch;
      rfc6902_1(langJson, patch);
    }

    var translations = {};

    for (var file in langJson) {
      var parsed = path.parse(file);
      var key = path.join(parsed.dir, parsed.name).split(path.sep);
      objectPath.set(translations, key, langJson[file]);
    }

    result[lang] = transform(lang, translations);
  }

  var languageList = Object.keys(result).join(', ');

  console.log(ansiColors.bold('\nLanguages found:'), ansiColors.green(("" + languageList)));

  for (var lang$1 in patches) {
    if (patches[lang$1].length > 0) {
      console.log(ansiColors.bold(("\nLanguage: \"" + lang$1 + "\" changes report")));
    }

    for (var i = 0; i < patches[lang$1].length; i++) {
      var patch$1 = patches[lang$1][i];
      var message = '';

      var key$1 = null;
      var location = patch$1.path.substring(1).replace(/(~1)/g, '/');
      var split = location.split('.json');
      if (split[1]) {
        key$1 = split[1].substring(1);
      }

      location = path.join(target, lang$1, ((split[0]) + ".json"));
      location = path.join(target, path.relative(target, location));

      var content = (void 0);
      if (patch$1.op === 'add') {
        var value = patch$1.value;
        if (key$1 && value) {
          content = lib.readJsonSync(location);
          objectPath.set(content, key$1.split('/'), value);
          message = (logUtils.success) + " " + key$1 + " with the value from " + baseLanguage + " is added to the file: " + location;
        } else {
          message = (logUtils.success) + " " + location + " is created. Used the content from base language: " + baseLanguage;
          content = value;
        }
        lib.writeJSONSync(location, content, { spaces: '\t' });
      } else if (patch$1.op === 'remove') {
        if (key$1) {
          message = (logUtils.error) + " The key " + key$1 + " is deleted from the file: " + location;
          content = lib.readJsonSync(location);
          objectPath.del(content, key$1.split('/'));
          lib.writeJSONSync(location, content, { spaces: '\t' });
        } else {
          message = (logUtils.error) + " Removing the file " + location + ". It does not exist in base language(" + baseLanguage + ") folder";
          fs.unlinkSync(location);
        }
      }

      console.log(ansiColors.grey(("   " + message)));
    }
  }

  var patchedLanguages = Object.keys(patches);
  if (patchedLanguages.length > 0) {
    console.log(ansiColors.bold(("\nFiles at \"" + (patchedLanguages.join(', ')) + "\" are updated to match \"" + baseLanguage + "\"")));
  }

  return result
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
          ansiColors.underline.cyan('\ni18n bundler'), ansiColors.grey((": Target: " + (options.target) + ", Base language: " + (options.baseLanguage)))
        );
        if (!generated) {
          generated = i18n(options);
          generated = 'export default ' + JSON.stringify(generated);
        }
        console.log(
          ansiColors.bold('\nImport translations using: ') + ansiColors.bold.green(("import translations from '" + moduleName + "'"))
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
      console.log(ansiColors.bold.underline.cyan('\nCopying assets'));
      for (var p in obj) {
        lib.copySync(p, obj[p], filterConfig);
        console.log(ansiColors.green(("  " + (logUtils.success) + " " + p + " -> " + (obj[p]))));
      }
    }
  }
};

var index$1 = {
  emptyDirectories: emptyDirectories,
  prepareDirectories: prepareDirectories,
  htmlInjector: htmlInjector,
  i18nBundler: i18nBundler,
  copyAssets: copyAssets
};

export default index$1;
export { emptyDirectories, prepareDirectories, htmlInjector, i18nBundler, copyAssets };
//# sourceMappingURL=rollup-plugin-app-utils.es.js.map
