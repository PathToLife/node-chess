(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * assertion-error
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Return a function that will copy properties from
 * one object to another excluding any originally
 * listed. Returned function will create a new `{}`.
 *
 * @param {String} excluded properties ...
 * @return {Function}
 */

function exclude () {
  var excludes = [].slice.call(arguments);

  function excludeProps (res, obj) {
    Object.keys(obj).forEach(function (key) {
      if (!~excludes.indexOf(key)) res[key] = obj[key];
    });
  }

  return function extendExclude () {
    var args = [].slice.call(arguments)
      , i = 0
      , res = {};

    for (; i < args.length; i++) {
      excludeProps(res, args[i]);
    }

    return res;
  };
};

/*!
 * Primary Exports
 */

module.exports = AssertionError;

/**
 * ### AssertionError
 *
 * An extension of the JavaScript `Error` constructor for
 * assertion and validation scenarios.
 *
 * @param {String} message
 * @param {Object} properties to include (optional)
 * @param {callee} start stack function (optional)
 */

function AssertionError (message, _props, ssf) {
  var extend = exclude('name', 'message', 'stack', 'constructor', 'toJSON')
    , props = extend(_props || {});

  // default values
  this.message = message || 'Unspecified AssertionError';
  this.showDiff = false;

  // copy from properties
  for (var key in props) {
    this[key] = props[key];
  }

  // capture stack trace
  ssf = ssf || arguments.callee;
  if (ssf && Error.captureStackTrace) {
    Error.captureStackTrace(this, ssf);
  }
}

/*!
 * Inherit from Error.prototype
 */

AssertionError.prototype = Object.create(Error.prototype);

/*!
 * Statically set name
 */

AssertionError.prototype.name = 'AssertionError';

/*!
 * Ensure correct constructor
 */

AssertionError.prototype.constructor = AssertionError;

/**
 * Allow errors to be converted to JSON for static transfer.
 *
 * @param {Boolean} include stack (default: `true`)
 * @return {Object} object that can be `JSON.stringify`
 */

AssertionError.prototype.toJSON = function (stack) {
  var extend = exclude('constructor', 'toJSON', 'stack')
    , props = extend({ name: this.name }, this);

  // include stack if exists and not turned off
  if (false !== stack && this.stack) {
    props.stack = this.stack;
  }

  return props;
};

},{}],2:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],3:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

function typedArraySupport () {
  function Bar () {}
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    arr.constructor = Bar
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Bar && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    this.length = 0
    this.parent = undefined
  }

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
} else {
  // pre-set for values that may exist in the future
  Buffer.prototype.length = undefined
  Buffer.prototype.parent = undefined
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"base64-js":2,"ieee754":36,"isarray":4}],4:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],5:[function(require,module,exports){
module.exports = require('./lib/chai');

},{"./lib/chai":6}],6:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var used = []
  , exports = module.exports = {};

/*!
 * Chai version
 */

exports.version = '2.3.0';

/*!
 * Assertion Error
 */

exports.AssertionError = require('assertion-error');

/*!
 * Utils for plugins (not exported)
 */

var util = require('./chai/utils');

/**
 * # .use(function)
 *
 * Provides a way to extend the internals of Chai
 *
 * @param {Function}
 * @returns {this} for chaining
 * @api public
 */

exports.use = function (fn) {
  if (!~used.indexOf(fn)) {
    fn(this, util);
    used.push(fn);
  }

  return this;
};

/*!
 * Utility Functions
 */

exports.util = util;

/*!
 * Configuration
 */

var config = require('./chai/config');
exports.config = config;

/*!
 * Primary `Assertion` prototype
 */

var assertion = require('./chai/assertion');
exports.use(assertion);

/*!
 * Core Assertions
 */

var core = require('./chai/core/assertions');
exports.use(core);

/*!
 * Expect interface
 */

var expect = require('./chai/interface/expect');
exports.use(expect);

/*!
 * Should interface
 */

var should = require('./chai/interface/should');
exports.use(should);

/*!
 * Assert interface
 */

var assert = require('./chai/interface/assert');
exports.use(assert);

},{"./chai/assertion":7,"./chai/config":8,"./chai/core/assertions":9,"./chai/interface/assert":10,"./chai/interface/expect":11,"./chai/interface/should":12,"./chai/utils":25,"assertion-error":1}],7:[function(require,module,exports){
/*!
 * chai
 * http://chaijs.com
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var config = require('./config');

module.exports = function (_chai, util) {
  /*!
   * Module dependencies.
   */

  var AssertionError = _chai.AssertionError
    , flag = util.flag;

  /*!
   * Module export.
   */

  _chai.Assertion = Assertion;

  /*!
   * Assertion Constructor
   *
   * Creates object for chaining.
   *
   * @api private
   */

  function Assertion (obj, msg, stack) {
    flag(this, 'ssfi', stack || arguments.callee);
    flag(this, 'object', obj);
    flag(this, 'message', msg);
  }

  Object.defineProperty(Assertion, 'includeStack', {
    get: function() {
      console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');
      return config.includeStack;
    },
    set: function(value) {
      console.warn('Assertion.includeStack is deprecated, use chai.config.includeStack instead.');
      config.includeStack = value;
    }
  });

  Object.defineProperty(Assertion, 'showDiff', {
    get: function() {
      console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');
      return config.showDiff;
    },
    set: function(value) {
      console.warn('Assertion.showDiff is deprecated, use chai.config.showDiff instead.');
      config.showDiff = value;
    }
  });

  Assertion.addProperty = function (name, fn) {
    util.addProperty(this.prototype, name, fn);
  };

  Assertion.addMethod = function (name, fn) {
    util.addMethod(this.prototype, name, fn);
  };

  Assertion.addChainableMethod = function (name, fn, chainingBehavior) {
    util.addChainableMethod(this.prototype, name, fn, chainingBehavior);
  };

  Assertion.overwriteProperty = function (name, fn) {
    util.overwriteProperty(this.prototype, name, fn);
  };

  Assertion.overwriteMethod = function (name, fn) {
    util.overwriteMethod(this.prototype, name, fn);
  };

  Assertion.overwriteChainableMethod = function (name, fn, chainingBehavior) {
    util.overwriteChainableMethod(this.prototype, name, fn, chainingBehavior);
  };

  /*!
   * ### .assert(expression, message, negateMessage, expected, actual)
   *
   * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.
   *
   * @name assert
   * @param {Philosophical} expression to be tested
   * @param {String or Function} message or function that returns message to display if expression fails
   * @param {String or Function} negatedMessage or function that returns negatedMessage to display if negated expression fails
   * @param {Mixed} expected value (remember to check for negation)
   * @param {Mixed} actual (optional) will default to `this.obj`
   * @param {Boolean} showDiff (optional) when set to `true`, assert will display a diff in addition to the message if expression fails
   * @api private
   */

  Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {
    var ok = util.test(this, arguments);
    if (true !== showDiff) showDiff = false;
    if (true !== config.showDiff) showDiff = false;

    if (!ok) {
      var msg = util.getMessage(this, arguments)
        , actual = util.getActual(this, arguments);
      throw new AssertionError(msg, {
          actual: actual
        , expected: expected
        , showDiff: showDiff
      }, (config.includeStack) ? this.assert : flag(this, 'ssfi'));
    }
  };

  /*!
   * ### ._obj
   *
   * Quick reference to stored `actual` value for plugin developers.
   *
   * @api private
   */

  Object.defineProperty(Assertion.prototype, '_obj',
    { get: function () {
        return flag(this, 'object');
      }
    , set: function (val) {
        flag(this, 'object', val);
      }
  });
};

},{"./config":8}],8:[function(require,module,exports){
module.exports = {

  /**
   * ### config.includeStack
   *
   * User configurable property, influences whether stack trace
   * is included in Assertion error message. Default of false
   * suppresses stack trace in the error message.
   *
   *     chai.config.includeStack = true;  // enable stack on error
   *
   * @param {Boolean}
   * @api public
   */

   includeStack: false,

  /**
   * ### config.showDiff
   *
   * User configurable property, influences whether or not
   * the `showDiff` flag should be included in the thrown
   * AssertionErrors. `false` will always be `false`; `true`
   * will be true when the assertion has requested a diff
   * be shown.
   *
   * @param {Boolean}
   * @api public
   */

  showDiff: true,

  /**
   * ### config.truncateThreshold
   *
   * User configurable property, sets length threshold for actual and
   * expected values in assertion errors. If this threshold is exceeded, for
   * example for large data structures, the value is replaced with something
   * like `[ Array(3) ]` or `{ Object (prop1, prop2) }`.
   *
   * Set it to zero if you want to disable truncating altogether.
   *
   * This is especially userful when doing assertions on arrays: having this
   * set to a reasonable large value makes the failure messages readily
   * inspectable.
   *
   *     chai.config.truncateThreshold = 0;  // disable truncating
   *
   * @param {Number}
   * @api public
   */

  truncateThreshold: 40

};

},{}],9:[function(require,module,exports){
/*!
 * chai
 * http://chaijs.com
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, _) {
  var Assertion = chai.Assertion
    , toString = Object.prototype.toString
    , flag = _.flag;

  /**
   * ### Language Chains
   *
   * The following are provided as chainable getters to
   * improve the readability of your assertions. They
   * do not provide testing capabilities unless they
   * have been overwritten by a plugin.
   *
   * **Chains**
   *
   * - to
   * - be
   * - been
   * - is
   * - that
   * - which
   * - and
   * - has
   * - have
   * - with
   * - at
   * - of
   * - same
   *
   * @name language chains
   * @api public
   */

  [ 'to', 'be', 'been'
  , 'is', 'and', 'has', 'have'
  , 'with', 'that', 'which', 'at'
  , 'of', 'same' ].forEach(function (chain) {
    Assertion.addProperty(chain, function () {
      return this;
    });
  });

  /**
   * ### .not
   *
   * Negates any of assertions following in the chain.
   *
   *     expect(foo).to.not.equal('bar');
   *     expect(goodFn).to.not.throw(Error);
   *     expect({ foo: 'baz' }).to.have.property('foo')
   *       .and.not.equal('bar');
   *
   * @name not
   * @api public
   */

  Assertion.addProperty('not', function () {
    flag(this, 'negate', true);
  });

  /**
   * ### .deep
   *
   * Sets the `deep` flag, later used by the `equal` and
   * `property` assertions.
   *
   *     expect(foo).to.deep.equal({ bar: 'baz' });
   *     expect({ foo: { bar: { baz: 'quux' } } })
   *       .to.have.deep.property('foo.bar.baz', 'quux');
   *
   * `.deep.property` special characters can be escaped
   * by adding two slashes before the `.` or `[]`.
   *
   *     var deepCss = { '.link': { '[target]': 42 }};
   *     expect(deepCss).to.have.deep.property('\\.link.\\[target\\]', 42);
   *
   * @name deep
   * @api public
   */

  Assertion.addProperty('deep', function () {
    flag(this, 'deep', true);
  });

  /**
   * ### .any
   *
   * Sets the `any` flag, (opposite of the `all` flag)
   * later used in the `keys` assertion.
   *
   *     expect(foo).to.have.any.keys('bar', 'baz');
   *
   * @name any
   * @api public
   */

  Assertion.addProperty('any', function () {
    flag(this, 'any', true);
    flag(this, 'all', false)
  });


  /**
   * ### .all
   *
   * Sets the `all` flag (opposite of the `any` flag)
   * later used by the `keys` assertion.
   *
   *     expect(foo).to.have.all.keys('bar', 'baz');
   *
   * @name all
   * @api public
   */

  Assertion.addProperty('all', function () {
    flag(this, 'all', true);
    flag(this, 'any', false);
  });

  /**
   * ### .a(type)
   *
   * The `a` and `an` assertions are aliases that can be
   * used either as language chains or to assert a value's
   * type.
   *
   *     // typeof
   *     expect('test').to.be.a('string');
   *     expect({ foo: 'bar' }).to.be.an('object');
   *     expect(null).to.be.a('null');
   *     expect(undefined).to.be.an('undefined');
   *
   *     // language chain
   *     expect(foo).to.be.an.instanceof(Foo);
   *
   * @name a
   * @alias an
   * @param {String} type
   * @param {String} message _optional_
   * @api public
   */

  function an (type, msg) {
    if (msg) flag(this, 'message', msg);
    type = type.toLowerCase();
    var obj = flag(this, 'object')
      , article = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(type.charAt(0)) ? 'an ' : 'a ';

    this.assert(
        type === _.type(obj)
      , 'expected #{this} to be ' + article + type
      , 'expected #{this} not to be ' + article + type
    );
  }

  Assertion.addChainableMethod('an', an);
  Assertion.addChainableMethod('a', an);

  /**
   * ### .include(value)
   *
   * The `include` and `contain` assertions can be used as either property
   * based language chains or as methods to assert the inclusion of an object
   * in an array or a substring in a string. When used as language chains,
   * they toggle the `contains` flag for the `keys` assertion.
   *
   *     expect([1,2,3]).to.include(2);
   *     expect('foobar').to.contain('foo');
   *     expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');
   *
   * @name include
   * @alias contain
   * @alias includes
   * @alias contains
   * @param {Object|String|Number} obj
   * @param {String} message _optional_
   * @api public
   */

  function includeChainingBehavior () {
    flag(this, 'contains', true);
  }

  function include (val, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    var expected = false;
    if (_.type(obj) === 'array' && _.type(val) === 'object') {
      for (var i in obj) {
        if (_.eql(obj[i], val)) {
          expected = true;
          break;
        }
      }
    } else if (_.type(val) === 'object') {
      if (!flag(this, 'negate')) {
        for (var k in val) new Assertion(obj).property(k, val[k]);
        return;
      }
      var subset = {};
      for (var k in val) subset[k] = obj[k];
      expected = _.eql(subset, val);
    } else {
      expected = obj && ~obj.indexOf(val);
    }
    this.assert(
        expected
      , 'expected #{this} to include ' + _.inspect(val)
      , 'expected #{this} to not include ' + _.inspect(val));
  }

  Assertion.addChainableMethod('include', include, includeChainingBehavior);
  Assertion.addChainableMethod('contain', include, includeChainingBehavior);
  Assertion.addChainableMethod('contains', include, includeChainingBehavior);
  Assertion.addChainableMethod('includes', include, includeChainingBehavior);

  /**
   * ### .ok
   *
   * Asserts that the target is truthy.
   *
   *     expect('everthing').to.be.ok;
   *     expect(1).to.be.ok;
   *     expect(false).to.not.be.ok;
   *     expect(undefined).to.not.be.ok;
   *     expect(null).to.not.be.ok;
   *
   * @name ok
   * @api public
   */

  Assertion.addProperty('ok', function () {
    this.assert(
        flag(this, 'object')
      , 'expected #{this} to be truthy'
      , 'expected #{this} to be falsy');
  });

  /**
   * ### .true
   *
   * Asserts that the target is `true`.
   *
   *     expect(true).to.be.true;
   *     expect(1).to.not.be.true;
   *
   * @name true
   * @api public
   */

  Assertion.addProperty('true', function () {
    this.assert(
        true === flag(this, 'object')
      , 'expected #{this} to be true'
      , 'expected #{this} to be false'
      , this.negate ? false : true
    );
  });

  /**
   * ### .false
   *
   * Asserts that the target is `false`.
   *
   *     expect(false).to.be.false;
   *     expect(0).to.not.be.false;
   *
   * @name false
   * @api public
   */

  Assertion.addProperty('false', function () {
    this.assert(
        false === flag(this, 'object')
      , 'expected #{this} to be false'
      , 'expected #{this} to be true'
      , this.negate ? true : false
    );
  });

  /**
   * ### .null
   *
   * Asserts that the target is `null`.
   *
   *     expect(null).to.be.null;
   *     expect(undefined).to.not.be.null;
   *
   * @name null
   * @api public
   */

  Assertion.addProperty('null', function () {
    this.assert(
        null === flag(this, 'object')
      , 'expected #{this} to be null'
      , 'expected #{this} not to be null'
    );
  });

  /**
   * ### .undefined
   *
   * Asserts that the target is `undefined`.
   *
   *     expect(undefined).to.be.undefined;
   *     expect(null).to.not.be.undefined;
   *
   * @name undefined
   * @api public
   */

  Assertion.addProperty('undefined', function () {
    this.assert(
        undefined === flag(this, 'object')
      , 'expected #{this} to be undefined'
      , 'expected #{this} not to be undefined'
    );
  });

  /**
   * ### .exist
   *
   * Asserts that the target is neither `null` nor `undefined`.
   *
   *     var foo = 'hi'
   *       , bar = null
   *       , baz;
   *
   *     expect(foo).to.exist;
   *     expect(bar).to.not.exist;
   *     expect(baz).to.not.exist;
   *
   * @name exist
   * @api public
   */

  Assertion.addProperty('exist', function () {
    this.assert(
        null != flag(this, 'object')
      , 'expected #{this} to exist'
      , 'expected #{this} to not exist'
    );
  });


  /**
   * ### .empty
   *
   * Asserts that the target's length is `0`. For arrays and strings, it checks
   * the `length` property. For objects, it gets the count of
   * enumerable keys.
   *
   *     expect([]).to.be.empty;
   *     expect('').to.be.empty;
   *     expect({}).to.be.empty;
   *
   * @name empty
   * @api public
   */

  Assertion.addProperty('empty', function () {
    var obj = flag(this, 'object')
      , expected = obj;

    if (Array.isArray(obj) || 'string' === typeof object) {
      expected = obj.length;
    } else if (typeof obj === 'object') {
      expected = Object.keys(obj).length;
    }

    this.assert(
        !expected
      , 'expected #{this} to be empty'
      , 'expected #{this} not to be empty'
    );
  });

  /**
   * ### .arguments
   *
   * Asserts that the target is an arguments object.
   *
   *     function test () {
   *       expect(arguments).to.be.arguments;
   *     }
   *
   * @name arguments
   * @alias Arguments
   * @api public
   */

  function checkArguments () {
    var obj = flag(this, 'object')
      , type = Object.prototype.toString.call(obj);
    this.assert(
        '[object Arguments]' === type
      , 'expected #{this} to be arguments but got ' + type
      , 'expected #{this} to not be arguments'
    );
  }

  Assertion.addProperty('arguments', checkArguments);
  Assertion.addProperty('Arguments', checkArguments);

  /**
   * ### .equal(value)
   *
   * Asserts that the target is strictly equal (`===`) to `value`.
   * Alternately, if the `deep` flag is set, asserts that
   * the target is deeply equal to `value`.
   *
   *     expect('hello').to.equal('hello');
   *     expect(42).to.equal(42);
   *     expect(1).to.not.equal(true);
   *     expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });
   *     expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });
   *
   * @name equal
   * @alias equals
   * @alias eq
   * @alias deep.equal
   * @param {Mixed} value
   * @param {String} message _optional_
   * @api public
   */

  function assertEqual (val, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'deep')) {
      return this.eql(val);
    } else {
      this.assert(
          val === obj
        , 'expected #{this} to equal #{exp}'
        , 'expected #{this} to not equal #{exp}'
        , val
        , this._obj
        , true
      );
    }
  }

  Assertion.addMethod('equal', assertEqual);
  Assertion.addMethod('equals', assertEqual);
  Assertion.addMethod('eq', assertEqual);

  /**
   * ### .eql(value)
   *
   * Asserts that the target is deeply equal to `value`.
   *
   *     expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
   *     expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);
   *
   * @name eql
   * @alias eqls
   * @param {Mixed} value
   * @param {String} message _optional_
   * @api public
   */

  function assertEql(obj, msg) {
    if (msg) flag(this, 'message', msg);
    this.assert(
        _.eql(obj, flag(this, 'object'))
      , 'expected #{this} to deeply equal #{exp}'
      , 'expected #{this} to not deeply equal #{exp}'
      , obj
      , this._obj
      , true
    );
  }

  Assertion.addMethod('eql', assertEql);
  Assertion.addMethod('eqls', assertEql);

  /**
   * ### .above(value)
   *
   * Asserts that the target is greater than `value`.
   *
   *     expect(10).to.be.above(5);
   *
   * Can also be used in conjunction with `length` to
   * assert a minimum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.above(2);
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
   *
   * @name above
   * @alias gt
   * @alias greaterThan
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertAbove (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len > n
        , 'expected #{this} to have a length above #{exp} but got #{act}'
        , 'expected #{this} to not have a length above #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj > n
        , 'expected #{this} to be above ' + n
        , 'expected #{this} to be at most ' + n
      );
    }
  }

  Assertion.addMethod('above', assertAbove);
  Assertion.addMethod('gt', assertAbove);
  Assertion.addMethod('greaterThan', assertAbove);

  /**
   * ### .least(value)
   *
   * Asserts that the target is greater than or equal to `value`.
   *
   *     expect(10).to.be.at.least(10);
   *
   * Can also be used in conjunction with `length` to
   * assert a minimum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.of.at.least(2);
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.least(3);
   *
   * @name least
   * @alias gte
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertLeast (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len >= n
        , 'expected #{this} to have a length at least #{exp} but got #{act}'
        , 'expected #{this} to have a length below #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj >= n
        , 'expected #{this} to be at least ' + n
        , 'expected #{this} to be below ' + n
      );
    }
  }

  Assertion.addMethod('least', assertLeast);
  Assertion.addMethod('gte', assertLeast);

  /**
   * ### .below(value)
   *
   * Asserts that the target is less than `value`.
   *
   *     expect(5).to.be.below(10);
   *
   * Can also be used in conjunction with `length` to
   * assert a maximum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.below(4);
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
   *
   * @name below
   * @alias lt
   * @alias lessThan
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertBelow (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len < n
        , 'expected #{this} to have a length below #{exp} but got #{act}'
        , 'expected #{this} to not have a length below #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj < n
        , 'expected #{this} to be below ' + n
        , 'expected #{this} to be at least ' + n
      );
    }
  }

  Assertion.addMethod('below', assertBelow);
  Assertion.addMethod('lt', assertBelow);
  Assertion.addMethod('lessThan', assertBelow);

  /**
   * ### .most(value)
   *
   * Asserts that the target is less than or equal to `value`.
   *
   *     expect(5).to.be.at.most(5);
   *
   * Can also be used in conjunction with `length` to
   * assert a maximum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.of.at.most(4);
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.most(3);
   *
   * @name most
   * @alias lte
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertMost (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len <= n
        , 'expected #{this} to have a length at most #{exp} but got #{act}'
        , 'expected #{this} to have a length above #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj <= n
        , 'expected #{this} to be at most ' + n
        , 'expected #{this} to be above ' + n
      );
    }
  }

  Assertion.addMethod('most', assertMost);
  Assertion.addMethod('lte', assertMost);

  /**
   * ### .within(start, finish)
   *
   * Asserts that the target is within a range.
   *
   *     expect(7).to.be.within(5,10);
   *
   * Can also be used in conjunction with `length` to
   * assert a length range. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.within(2,4);
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
   *
   * @name within
   * @param {Number} start lowerbound inclusive
   * @param {Number} finish upperbound inclusive
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('within', function (start, finish, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
      , range = start + '..' + finish;
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len >= start && len <= finish
        , 'expected #{this} to have a length within ' + range
        , 'expected #{this} to not have a length within ' + range
      );
    } else {
      this.assert(
          obj >= start && obj <= finish
        , 'expected #{this} to be within ' + range
        , 'expected #{this} to not be within ' + range
      );
    }
  });

  /**
   * ### .instanceof(constructor)
   *
   * Asserts that the target is an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , Chai = new Tea('chai');
   *
   *     expect(Chai).to.be.an.instanceof(Tea);
   *     expect([ 1, 2, 3 ]).to.be.instanceof(Array);
   *
   * @name instanceof
   * @param {Constructor} constructor
   * @param {String} message _optional_
   * @alias instanceOf
   * @api public
   */

  function assertInstanceOf (constructor, msg) {
    if (msg) flag(this, 'message', msg);
    var name = _.getName(constructor);
    this.assert(
        flag(this, 'object') instanceof constructor
      , 'expected #{this} to be an instance of ' + name
      , 'expected #{this} to not be an instance of ' + name
    );
  };

  Assertion.addMethod('instanceof', assertInstanceOf);
  Assertion.addMethod('instanceOf', assertInstanceOf);

  /**
   * ### .property(name, [value])
   *
   * Asserts that the target has a property `name`, optionally asserting that
   * the value of that property is strictly equal to  `value`.
   * If the `deep` flag is set, you can use dot- and bracket-notation for deep
   * references into objects and arrays.
   *
   *     // simple referencing
   *     var obj = { foo: 'bar' };
   *     expect(obj).to.have.property('foo');
   *     expect(obj).to.have.property('foo', 'bar');
   *
   *     // deep referencing
   *     var deepObj = {
   *         green: { tea: 'matcha' }
   *       , teas: [ 'chai', 'matcha', { tea: 'konacha' } ]
   *     };
   *
   *     expect(deepObj).to.have.deep.property('green.tea', 'matcha');
   *     expect(deepObj).to.have.deep.property('teas[1]', 'matcha');
   *     expect(deepObj).to.have.deep.property('teas[2].tea', 'konacha');
   *
   * You can also use an array as the starting point of a `deep.property`
   * assertion, or traverse nested arrays.
   *
   *     var arr = [
   *         [ 'chai', 'matcha', 'konacha' ]
   *       , [ { tea: 'chai' }
   *         , { tea: 'matcha' }
   *         , { tea: 'konacha' } ]
   *     ];
   *
   *     expect(arr).to.have.deep.property('[0][1]', 'matcha');
   *     expect(arr).to.have.deep.property('[1][2].tea', 'konacha');
   *
   * Furthermore, `property` changes the subject of the assertion
   * to be the value of that property from the original object. This
   * permits for further chainable assertions on that property.
   *
   *     expect(obj).to.have.property('foo')
   *       .that.is.a('string');
   *     expect(deepObj).to.have.property('green')
   *       .that.is.an('object')
   *       .that.deep.equals({ tea: 'matcha' });
   *     expect(deepObj).to.have.property('teas')
   *       .that.is.an('array')
   *       .with.deep.property('[2]')
   *         .that.deep.equals({ tea: 'konacha' });
   *
   * Note that dots and bracket in `name` must be backslash-escaped when
   * the `deep` flag is set, while they must NOT be escaped when the `deep`
   * flag is not set.
   *
   *     // simple referencing
   *     var css = { '.link[target]': 42 };
   *     expect(css).to.have.property('.link[target]', 42);
   *
   *     // deep referencing
   *     var deepCss = { '.link': { '[target]': 42 }};
   *     expect(deepCss).to.have.deep.property('\\.link.\\[target\\]', 42);
   *
   * @name property
   * @alias deep.property
   * @param {String} name
   * @param {Mixed} value (optional)
   * @param {String} message _optional_
   * @returns value of property for chaining
   * @api public
   */

  Assertion.addMethod('property', function (name, val, msg) {
    if (msg) flag(this, 'message', msg);

    var isDeep = !!flag(this, 'deep')
      , descriptor = isDeep ? 'deep property ' : 'property '
      , negate = flag(this, 'negate')
      , obj = flag(this, 'object')
      , pathInfo = isDeep ? _.getPathInfo(name, obj) : null
      , hasProperty = isDeep
        ? pathInfo.exists
        : _.hasProperty(name, obj)
      , value = isDeep
        ? pathInfo.value
        : obj[name];

    if (negate && undefined !== val) {
      if (undefined === value) {
        msg = (msg != null) ? msg + ': ' : '';
        throw new Error(msg + _.inspect(obj) + ' has no ' + descriptor + _.inspect(name));
      }
    } else {
      this.assert(
          hasProperty
        , 'expected #{this} to have a ' + descriptor + _.inspect(name)
        , 'expected #{this} to not have ' + descriptor + _.inspect(name));
    }

    if (undefined !== val) {
      this.assert(
          val === value
        , 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}'
        , 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}'
        , val
        , value
      );
    }

    flag(this, 'object', value);
  });


  /**
   * ### .ownProperty(name)
   *
   * Asserts that the target has an own property `name`.
   *
   *     expect('test').to.have.ownProperty('length');
   *
   * @name ownProperty
   * @alias haveOwnProperty
   * @param {String} name
   * @param {String} message _optional_
   * @api public
   */

  function assertOwnProperty (name, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        obj.hasOwnProperty(name)
      , 'expected #{this} to have own property ' + _.inspect(name)
      , 'expected #{this} to not have own property ' + _.inspect(name)
    );
  }

  Assertion.addMethod('ownProperty', assertOwnProperty);
  Assertion.addMethod('haveOwnProperty', assertOwnProperty);

  /**
   * ### .ownPropertyDescriptor(name[, descriptor[, message]])
   *
   * Asserts that the target has an own property descriptor `name`, that optionally matches `descriptor`.
   *
   *     expect('test').to.have.ownPropertyDescriptor('length');
   *     expect('test').to.have.ownPropertyDescriptor('length', { enumerable: false, configurable: false, writable: false, value: 4 });
   *     expect('test').not.to.have.ownPropertyDescriptor('length', { enumerable: false, configurable: false, writable: false, value: 3 });
   *     expect('test').ownPropertyDescriptor('length').to.have.property('enumerable', false);
   *     expect('test').ownPropertyDescriptor('length').to.have.keys('value');
   *
   * @name ownPropertyDescriptor
   * @alias haveOwnPropertyDescriptor
   * @param {String} name
   * @param {Object} descriptor _optional_
   * @param {String} message _optional_
   * @api public
   */

  function assertOwnPropertyDescriptor (name, descriptor, msg) {
    if (typeof descriptor === 'string') {
      msg = descriptor;
      descriptor = null;
    }
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    var actualDescriptor = Object.getOwnPropertyDescriptor(Object(obj), name);
    if (actualDescriptor && descriptor) {
      this.assert(
          _.eql(descriptor, actualDescriptor)
        , 'expected the own property descriptor for ' + _.inspect(name) + ' on #{this} to match ' + _.inspect(descriptor) + ', got ' + _.inspect(actualDescriptor)
        , 'expected the own property descriptor for ' + _.inspect(name) + ' on #{this} to not match ' + _.inspect(descriptor)
        , descriptor
        , actualDescriptor
        , true
      );
    } else {
      this.assert(
          actualDescriptor
        , 'expected #{this} to have an own property descriptor for ' + _.inspect(name)
        , 'expected #{this} to not have an own property descriptor for ' + _.inspect(name)
      );
    }
    flag(this, 'object', actualDescriptor);
  }

  Assertion.addMethod('ownPropertyDescriptor', assertOwnPropertyDescriptor);
  Assertion.addMethod('haveOwnPropertyDescriptor', assertOwnPropertyDescriptor);

  /**
   * ### .length(value)
   *
   * Asserts that the target's `length` property has
   * the expected value.
   *
   *     expect([ 1, 2, 3]).to.have.length(3);
   *     expect('foobar').to.have.length(6);
   *
   * Can also be used as a chain precursor to a value
   * comparison for the length property.
   *
   *     expect('foo').to.have.length.above(2);
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
   *     expect('foo').to.have.length.below(4);
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
   *     expect('foo').to.have.length.within(2,4);
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
   *
   * @name length
   * @alias lengthOf
   * @param {Number} length
   * @param {String} message _optional_
   * @api public
   */

  function assertLengthChain () {
    flag(this, 'doLength', true);
  }

  function assertLength (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).to.have.property('length');
    var len = obj.length;

    this.assert(
        len == n
      , 'expected #{this} to have a length of #{exp} but got #{act}'
      , 'expected #{this} to not have a length of #{act}'
      , n
      , len
    );
  }

  Assertion.addChainableMethod('length', assertLength, assertLengthChain);
  Assertion.addMethod('lengthOf', assertLength);

  /**
   * ### .match(regexp)
   *
   * Asserts that the target matches a regular expression.
   *
   *     expect('foobar').to.match(/^foo/);
   *
   * @name match
   * @param {RegExp} RegularExpression
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('match', function (re, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        re.exec(obj)
      , 'expected #{this} to match ' + re
      , 'expected #{this} not to match ' + re
    );
  });

  /**
   * ### .string(string)
   *
   * Asserts that the string target contains another string.
   *
   *     expect('foobar').to.have.string('bar');
   *
   * @name string
   * @param {String} string
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('string', function (str, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).is.a('string');

    this.assert(
        ~obj.indexOf(str)
      , 'expected #{this} to contain ' + _.inspect(str)
      , 'expected #{this} to not contain ' + _.inspect(str)
    );
  });


  /**
   * ### .keys(key1, [key2], [...])
   *
   * Asserts that the target contains any or all of the passed-in keys.
   * Use in combination with `any`, `all`, `contains`, or `have` will affect
   * what will pass.
   *
   * When used in conjunction with `any`, at least one key that is passed
   * in must exist in the target object. This is regardless whether or not
   * the `have` or `contain` qualifiers are used. Note, either `any` or `all`
   * should be used in the assertion. If neither are used, the assertion is
   * defaulted to `all`.
   *
   * When both `all` and `contain` are used, the target object must have at
   * least all of the passed-in keys but may have more keys not listed.
   *
   * When both `all` and `have` are used, the target object must both contain
   * all of the passed-in keys AND the number of keys in the target object must
   * match the number of keys passed in (in other words, a target object must
   * have all and only all of the passed-in keys).
   *
   *     expect({ foo: 1, bar: 2 }).to.have.any.keys('foo', 'baz');
   *     expect({ foo: 1, bar: 2 }).to.have.any.keys('foo');
   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys('bar', 'baz');
   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys(['foo']);
   *     expect({ foo: 1, bar: 2 }).to.contain.any.keys({'foo': 6});
   *     expect({ foo: 1, bar: 2 }).to.have.all.keys(['bar', 'foo']);
   *     expect({ foo: 1, bar: 2 }).to.have.all.keys({'bar': 6, 'foo': 7});
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys(['bar', 'foo']);
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.all.keys([{'bar': 6}}]);
   *
   *
   * @name keys
   * @alias key
   * @param {String...|Array|Object} keys
   * @api public
   */

  function assertKeys (keys) {
    var obj = flag(this, 'object')
      , str
      , ok = true
      , mixedArgsMsg = 'keys must be given single argument of Array|Object|String, or multiple String arguments';

    switch (_.type(keys)) {
      case "array":
        if (arguments.length > 1) throw (new Error(mixedArgsMsg));
        break;
      case "object":
        if (arguments.length > 1) throw (new Error(mixedArgsMsg));
        keys = Object.keys(keys);
        break;
      default:
        keys = Array.prototype.slice.call(arguments);
    }

    if (!keys.length) throw new Error('keys required');

    var actual = Object.keys(obj)
      , expected = keys
      , len = keys.length
      , any = flag(this, 'any')
      , all = flag(this, 'all');

    if (!any && !all) {
      all = true;
    }

    // Has any
    if (any) {
      var intersection = expected.filter(function(key) {
        return ~actual.indexOf(key);
      });
      ok = intersection.length > 0;
    }

    // Has all
    if (all) {
      ok = keys.every(function(key){
        return ~actual.indexOf(key);
      });
      if (!flag(this, 'negate') && !flag(this, 'contains')) {
        ok = ok && keys.length == actual.length;
      }
    }

    // Key string
    if (len > 1) {
      keys = keys.map(function(key){
        return _.inspect(key);
      });
      var last = keys.pop();
      if (all) {
        str = keys.join(', ') + ', and ' + last;
      }
      if (any) {
        str = keys.join(', ') + ', or ' + last;
      }
    } else {
      str = _.inspect(keys[0]);
    }

    // Form
    str = (len > 1 ? 'keys ' : 'key ') + str;

    // Have / include
    str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;

    // Assertion
    this.assert(
        ok
      , 'expected #{this} to ' + str
      , 'expected #{this} to not ' + str
      , expected.slice(0).sort()
      , actual.sort()
      , true
    );
  }

  Assertion.addMethod('keys', assertKeys);
  Assertion.addMethod('key', assertKeys);

  /**
   * ### .throw(constructor)
   *
   * Asserts that the function target will throw a specific error, or specific type of error
   * (as determined using `instanceof`), optionally with a RegExp or string inclusion test
   * for the error's message.
   *
   *     var err = new ReferenceError('This is a bad function.');
   *     var fn = function () { throw err; }
   *     expect(fn).to.throw(ReferenceError);
   *     expect(fn).to.throw(Error);
   *     expect(fn).to.throw(/bad function/);
   *     expect(fn).to.not.throw('good function');
   *     expect(fn).to.throw(ReferenceError, /bad function/);
   *     expect(fn).to.throw(err);
   *     expect(fn).to.not.throw(new RangeError('Out of range.'));
   *
   * Please note that when a throw expectation is negated, it will check each
   * parameter independently, starting with error constructor type. The appropriate way
   * to check for the existence of a type of error but for a message that does not match
   * is to use `and`.
   *
   *     expect(fn).to.throw(ReferenceError)
   *        .and.not.throw(/good function/);
   *
   * @name throw
   * @alias throws
   * @alias Throw
   * @param {ErrorConstructor} constructor
   * @param {String|RegExp} expected error message
   * @param {String} message _optional_
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @returns error for chaining (null if no error)
   * @api public
   */

  function assertThrows (constructor, errMsg, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).is.a('function');

    var thrown = false
      , desiredError = null
      , name = null
      , thrownError = null;

    if (arguments.length === 0) {
      errMsg = null;
      constructor = null;
    } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {
      errMsg = constructor;
      constructor = null;
    } else if (constructor && constructor instanceof Error) {
      desiredError = constructor;
      constructor = null;
      errMsg = null;
    } else if (typeof constructor === 'function') {
      name = constructor.prototype.name || constructor.name;
      if (name === 'Error' && constructor !== Error) {
        name = (new constructor()).name;
      }
    } else {
      constructor = null;
    }

    try {
      obj();
    } catch (err) {
      // first, check desired error
      if (desiredError) {
        this.assert(
            err === desiredError
          , 'expected #{this} to throw #{exp} but #{act} was thrown'
          , 'expected #{this} to not throw #{exp}'
          , (desiredError instanceof Error ? desiredError.toString() : desiredError)
          , (err instanceof Error ? err.toString() : err)
        );

        flag(this, 'object', err);
        return this;
      }

      // next, check constructor
      if (constructor) {
        this.assert(
            err instanceof constructor
          , 'expected #{this} to throw #{exp} but #{act} was thrown'
          , 'expected #{this} to not throw #{exp} but #{act} was thrown'
          , name
          , (err instanceof Error ? err.toString() : err)
        );

        if (!errMsg) {
          flag(this, 'object', err);
          return this;
        }
      }

      // next, check message
      var message = 'object' === _.type(err) && "message" in err
        ? err.message
        : '' + err;

      if ((message != null) && errMsg && errMsg instanceof RegExp) {
        this.assert(
            errMsg.exec(message)
          , 'expected #{this} to throw error matching #{exp} but got #{act}'
          , 'expected #{this} to throw error not matching #{exp}'
          , errMsg
          , message
        );

        flag(this, 'object', err);
        return this;
      } else if ((message != null) && errMsg && 'string' === typeof errMsg) {
        this.assert(
            ~message.indexOf(errMsg)
          , 'expected #{this} to throw error including #{exp} but got #{act}'
          , 'expected #{this} to throw error not including #{act}'
          , errMsg
          , message
        );

        flag(this, 'object', err);
        return this;
      } else {
        thrown = true;
        thrownError = err;
      }
    }

    var actuallyGot = ''
      , expectedThrown = name !== null
        ? name
        : desiredError
          ? '#{exp}' //_.inspect(desiredError)
          : 'an error';

    if (thrown) {
      actuallyGot = ' but #{act} was thrown'
    }

    this.assert(
        thrown === true
      , 'expected #{this} to throw ' + expectedThrown + actuallyGot
      , 'expected #{this} to not throw ' + expectedThrown + actuallyGot
      , (desiredError instanceof Error ? desiredError.toString() : desiredError)
      , (thrownError instanceof Error ? thrownError.toString() : thrownError)
    );

    flag(this, 'object', thrownError);
  };

  Assertion.addMethod('throw', assertThrows);
  Assertion.addMethod('throws', assertThrows);
  Assertion.addMethod('Throw', assertThrows);

  /**
   * ### .respondTo(method)
   *
   * Asserts that the object or class target will respond to a method.
   *
   *     Klass.prototype.bar = function(){};
   *     expect(Klass).to.respondTo('bar');
   *     expect(obj).to.respondTo('bar');
   *
   * To check if a constructor will respond to a static function,
   * set the `itself` flag.
   *
   *     Klass.baz = function(){};
   *     expect(Klass).itself.to.respondTo('baz');
   *
   * @name respondTo
   * @param {String} method
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('respondTo', function (method, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
      , itself = flag(this, 'itself')
      , context = ('function' === _.type(obj) && !itself)
        ? obj.prototype[method]
        : obj[method];

    this.assert(
        'function' === typeof context
      , 'expected #{this} to respond to ' + _.inspect(method)
      , 'expected #{this} to not respond to ' + _.inspect(method)
    );
  });

  /**
   * ### .itself
   *
   * Sets the `itself` flag, later used by the `respondTo` assertion.
   *
   *     function Foo() {}
   *     Foo.bar = function() {}
   *     Foo.prototype.baz = function() {}
   *
   *     expect(Foo).itself.to.respondTo('bar');
   *     expect(Foo).itself.not.to.respondTo('baz');
   *
   * @name itself
   * @api public
   */

  Assertion.addProperty('itself', function () {
    flag(this, 'itself', true);
  });

  /**
   * ### .satisfy(method)
   *
   * Asserts that the target passes a given truth test.
   *
   *     expect(1).to.satisfy(function(num) { return num > 0; });
   *
   * @name satisfy
   * @param {Function} matcher
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('satisfy', function (matcher, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    var result = matcher(obj);
    this.assert(
        result
      , 'expected #{this} to satisfy ' + _.objDisplay(matcher)
      , 'expected #{this} to not satisfy' + _.objDisplay(matcher)
      , this.negate ? false : true
      , result
    );
  });

  /**
   * ### .closeTo(expected, delta)
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     expect(1.5).to.be.closeTo(1, 0.5);
   *
   * @name closeTo
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('closeTo', function (expected, delta, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');

    new Assertion(obj, msg).is.a('number');
    if (_.type(expected) !== 'number' || _.type(delta) !== 'number') {
      throw new Error('the arguments to closeTo must be numbers');
    }

    this.assert(
        Math.abs(obj - expected) <= delta
      , 'expected #{this} to be close to ' + expected + ' +/- ' + delta
      , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta
    );
  });

  function isSubsetOf(subset, superset, cmp) {
    return subset.every(function(elem) {
      if (!cmp) return superset.indexOf(elem) !== -1;

      return superset.some(function(elem2) {
        return cmp(elem, elem2);
      });
    })
  }

  /**
   * ### .members(set)
   *
   * Asserts that the target is a superset of `set`,
   * or that the target and `set` have the same strictly-equal (===) members.
   * Alternately, if the `deep` flag is set, set members are compared for deep
   * equality.
   *
   *     expect([1, 2, 3]).to.include.members([3, 2]);
   *     expect([1, 2, 3]).to.not.include.members([3, 2, 8]);
   *
   *     expect([4, 2]).to.have.members([2, 4]);
   *     expect([5, 2]).to.not.have.members([5, 2, 1]);
   *
   *     expect([{ id: 1 }]).to.deep.include.members([{ id: 1 }]);
   *
   * @name members
   * @param {Array} set
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('members', function (subset, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');

    new Assertion(obj).to.be.an('array');
    new Assertion(subset).to.be.an('array');

    var cmp = flag(this, 'deep') ? _.eql : undefined;

    if (flag(this, 'contains')) {
      return this.assert(
          isSubsetOf(subset, obj, cmp)
        , 'expected #{this} to be a superset of #{act}'
        , 'expected #{this} to not be a superset of #{act}'
        , obj
        , subset
      );
    }

    this.assert(
        isSubsetOf(obj, subset, cmp) && isSubsetOf(subset, obj, cmp)
        , 'expected #{this} to have the same members as #{act}'
        , 'expected #{this} to not have the same members as #{act}'
        , obj
        , subset
    );
  });

  /**
   * ### .change(function)
   *
   * Asserts that a function changes an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val += 3 };
   *     var noChangeFn = function() { return 'foo' + 'bar'; }
   *     expect(fn).to.change(obj, 'val');
   *     expect(noChangFn).to.not.change(obj, 'val')
   *
   * @name change
   * @alias changes
   * @alias Change
   * @param {String} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  function assertChanges (object, prop, msg) {
    if (msg) flag(this, 'message', msg);
    var fn = flag(this, 'object');
    new Assertion(object, msg).to.have.property(prop);
    new Assertion(fn).is.a('function');

    var initial = object[prop];
    fn();

    this.assert(
      initial !== object[prop]
      , 'expected .' + prop + ' to change'
      , 'expected .' + prop + ' to not change'
    );
  }

  Assertion.addChainableMethod('change', assertChanges);
  Assertion.addChainableMethod('changes', assertChanges);

  /**
   * ### .increase(function)
   *
   * Asserts that a function increases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 15 };
   *     expect(fn).to.increase(obj, 'val');
   *
   * @name increase
   * @alias increases
   * @alias Increase
   * @param {String} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  function assertIncreases (object, prop, msg) {
    if (msg) flag(this, 'message', msg);
    var fn = flag(this, 'object');
    new Assertion(object, msg).to.have.property(prop);
    new Assertion(fn).is.a('function');

    var initial = object[prop];
    fn();

    this.assert(
      object[prop] - initial > 0
      , 'expected .' + prop + ' to increase'
      , 'expected .' + prop + ' to not increase'
    );
  }

  Assertion.addChainableMethod('increase', assertIncreases);
  Assertion.addChainableMethod('increases', assertIncreases);

  /**
   * ### .decrease(function)
   *
   * Asserts that a function decreases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 5 };
   *     expect(fn).to.decrease(obj, 'val');
   *
   * @name decrease
   * @alias decreases
   * @alias Decrease
   * @param {String} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  function assertDecreases (object, prop, msg) {
    if (msg) flag(this, 'message', msg);
    var fn = flag(this, 'object');
    new Assertion(object, msg).to.have.property(prop);
    new Assertion(fn).is.a('function');

    var initial = object[prop];
    fn();

    this.assert(
      object[prop] - initial < 0
      , 'expected .' + prop + ' to decrease'
      , 'expected .' + prop + ' to not decrease'
    );
  }

  Assertion.addChainableMethod('decrease', assertDecreases);
  Assertion.addChainableMethod('decreases', assertDecreases);

};

},{}],10:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */


module.exports = function (chai, util) {

  /*!
   * Chai dependencies.
   */

  var Assertion = chai.Assertion
    , flag = util.flag;

  /*!
   * Module export.
   */

  /**
   * ### assert(expression, message)
   *
   * Write your own test expressions.
   *
   *     assert('foo' !== 'bar', 'foo is not bar');
   *     assert(Array.isArray([]), 'empty arrays are arrays');
   *
   * @param {Mixed} expression to test for truthiness
   * @param {String} message to display on error
   * @name assert
   * @api public
   */

  var assert = chai.assert = function (express, errmsg) {
    var test = new Assertion(null, null, chai.assert);
    test.assert(
        express
      , errmsg
      , '[ negation message unavailable ]'
    );
  };

  /**
   * ### .fail(actual, expected, [message], [operator])
   *
   * Throw a failure. Node.js `assert` module-compatible.
   *
   * @name fail
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @param {String} operator
   * @api public
   */

  assert.fail = function (actual, expected, message, operator) {
    message = message || 'assert.fail()';
    throw new chai.AssertionError(message, {
        actual: actual
      , expected: expected
      , operator: operator
    }, assert.fail);
  };

  /**
   * ### .ok(object, [message])
   *
   * Asserts that `object` is truthy.
   *
   *     assert.ok('everything', 'everything is ok');
   *     assert.ok(false, 'this will fail');
   *
   * @name ok
   * @param {Mixed} object to test
   * @param {String} message
   * @api public
   */

  assert.ok = function (val, msg) {
    new Assertion(val, msg).is.ok;
  };

  /**
   * ### .notOk(object, [message])
   *
   * Asserts that `object` is falsy.
   *
   *     assert.notOk('everything', 'this will fail');
   *     assert.notOk(false, 'this will pass');
   *
   * @name notOk
   * @param {Mixed} object to test
   * @param {String} message
   * @api public
   */

  assert.notOk = function (val, msg) {
    new Assertion(val, msg).is.not.ok;
  };

  /**
   * ### .equal(actual, expected, [message])
   *
   * Asserts non-strict equality (`==`) of `actual` and `expected`.
   *
   *     assert.equal(3, '3', '== coerces values to strings');
   *
   * @name equal
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.equal = function (act, exp, msg) {
    var test = new Assertion(act, msg, assert.equal);

    test.assert(
        exp == flag(test, 'object')
      , 'expected #{this} to equal #{exp}'
      , 'expected #{this} to not equal #{act}'
      , exp
      , act
    );
  };

  /**
   * ### .notEqual(actual, expected, [message])
   *
   * Asserts non-strict inequality (`!=`) of `actual` and `expected`.
   *
   *     assert.notEqual(3, 4, 'these numbers are not equal');
   *
   * @name notEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notEqual = function (act, exp, msg) {
    var test = new Assertion(act, msg, assert.notEqual);

    test.assert(
        exp != flag(test, 'object')
      , 'expected #{this} to not equal #{exp}'
      , 'expected #{this} to equal #{act}'
      , exp
      , act
    );
  };

  /**
   * ### .strictEqual(actual, expected, [message])
   *
   * Asserts strict equality (`===`) of `actual` and `expected`.
   *
   *     assert.strictEqual(true, true, 'these booleans are strictly equal');
   *
   * @name strictEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.strictEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.equal(exp);
  };

  /**
   * ### .notStrictEqual(actual, expected, [message])
   *
   * Asserts strict inequality (`!==`) of `actual` and `expected`.
   *
   *     assert.notStrictEqual(3, '3', 'no coercion for strict equality');
   *
   * @name notStrictEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notStrictEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.not.equal(exp);
  };

  /**
   * ### .deepEqual(actual, expected, [message])
   *
   * Asserts that `actual` is deeply equal to `expected`.
   *
   *     assert.deepEqual({ tea: 'green' }, { tea: 'green' });
   *
   * @name deepEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.deepEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.eql(exp);
  };

  /**
   * ### .notDeepEqual(actual, expected, [message])
   *
   * Assert that `actual` is not deeply equal to `expected`.
   *
   *     assert.notDeepEqual({ tea: 'green' }, { tea: 'jasmine' });
   *
   * @name notDeepEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notDeepEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.not.eql(exp);
  };

  /**
   * ### .isTrue(value, [message])
   *
   * Asserts that `value` is true.
   *
   *     var teaServed = true;
   *     assert.isTrue(teaServed, 'the tea has been served');
   *
   * @name isTrue
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isAbove = function (val, abv, msg) {
    new Assertion(val, msg).to.be.above(abv);
  };

   /**
   * ### .isAbove(valueToCheck, valueToBeAbove, [message])
   *
   * Asserts `valueToCheck` is strictly greater than (>) `valueToBeAbove`
   *
   *     assert.isAbove(5, 2, '5 is strictly greater than 2');
   *
   * @name isAbove
   * @param {Mixed} valueToCheck
   * @param {Mixed} valueToBeAbove
   * @param {String} message
   * @api public
   */

  assert.isBelow = function (val, blw, msg) {
    new Assertion(val, msg).to.be.below(blw);
  };

   /**
   * ### .isBelow(valueToCheck, valueToBeBelow, [message])
   *
   * Asserts `valueToCheck` is strictly less than (<) `valueToBeBelow`
   *
   *     assert.isBelow(3, 6, '3 is strictly less than 6');
   *
   * @name isBelow
   * @param {Mixed} valueToCheck
   * @param {Mixed} valueToBeBelow
   * @param {String} message
   * @api public
   */

  assert.isTrue = function (val, msg) {
    new Assertion(val, msg).is['true'];
  };

  /**
   * ### .isFalse(value, [message])
   *
   * Asserts that `value` is false.
   *
   *     var teaServed = false;
   *     assert.isFalse(teaServed, 'no tea yet? hmm...');
   *
   * @name isFalse
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isFalse = function (val, msg) {
    new Assertion(val, msg).is['false'];
  };

  /**
   * ### .isNull(value, [message])
   *
   * Asserts that `value` is null.
   *
   *     assert.isNull(err, 'there was no error');
   *
   * @name isNull
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNull = function (val, msg) {
    new Assertion(val, msg).to.equal(null);
  };

  /**
   * ### .isNotNull(value, [message])
   *
   * Asserts that `value` is not null.
   *
   *     var tea = 'tasty chai';
   *     assert.isNotNull(tea, 'great, time for tea!');
   *
   * @name isNotNull
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotNull = function (val, msg) {
    new Assertion(val, msg).to.not.equal(null);
  };

  /**
   * ### .isUndefined(value, [message])
   *
   * Asserts that `value` is `undefined`.
   *
   *     var tea;
   *     assert.isUndefined(tea, 'no tea defined');
   *
   * @name isUndefined
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isUndefined = function (val, msg) {
    new Assertion(val, msg).to.equal(undefined);
  };

  /**
   * ### .isDefined(value, [message])
   *
   * Asserts that `value` is not `undefined`.
   *
   *     var tea = 'cup of chai';
   *     assert.isDefined(tea, 'tea has been defined');
   *
   * @name isDefined
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isDefined = function (val, msg) {
    new Assertion(val, msg).to.not.equal(undefined);
  };

  /**
   * ### .isFunction(value, [message])
   *
   * Asserts that `value` is a function.
   *
   *     function serveTea() { return 'cup of tea'; };
   *     assert.isFunction(serveTea, 'great, we can have tea now');
   *
   * @name isFunction
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isFunction = function (val, msg) {
    new Assertion(val, msg).to.be.a('function');
  };

  /**
   * ### .isNotFunction(value, [message])
   *
   * Asserts that `value` is _not_ a function.
   *
   *     var serveTea = [ 'heat', 'pour', 'sip' ];
   *     assert.isNotFunction(serveTea, 'great, we have listed the steps');
   *
   * @name isNotFunction
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotFunction = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('function');
  };

  /**
   * ### .isObject(value, [message])
   *
   * Asserts that `value` is an object (as revealed by
   * `Object.prototype.toString`).
   *
   *     var selection = { name: 'Chai', serve: 'with spices' };
   *     assert.isObject(selection, 'tea selection is an object');
   *
   * @name isObject
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isObject = function (val, msg) {
    new Assertion(val, msg).to.be.a('object');
  };

  /**
   * ### .isNotObject(value, [message])
   *
   * Asserts that `value` is _not_ an object.
   *
   *     var selection = 'chai'
   *     assert.isNotObject(selection, 'tea selection is not an object');
   *     assert.isNotObject(null, 'null is not an object');
   *
   * @name isNotObject
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotObject = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('object');
  };

  /**
   * ### .isArray(value, [message])
   *
   * Asserts that `value` is an array.
   *
   *     var menu = [ 'green', 'chai', 'oolong' ];
   *     assert.isArray(menu, 'what kind of tea do we want?');
   *
   * @name isArray
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isArray = function (val, msg) {
    new Assertion(val, msg).to.be.an('array');
  };

  /**
   * ### .isNotArray(value, [message])
   *
   * Asserts that `value` is _not_ an array.
   *
   *     var menu = 'green|chai|oolong';
   *     assert.isNotArray(menu, 'what kind of tea do we want?');
   *
   * @name isNotArray
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotArray = function (val, msg) {
    new Assertion(val, msg).to.not.be.an('array');
  };

  /**
   * ### .isString(value, [message])
   *
   * Asserts that `value` is a string.
   *
   *     var teaOrder = 'chai';
   *     assert.isString(teaOrder, 'order placed');
   *
   * @name isString
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isString = function (val, msg) {
    new Assertion(val, msg).to.be.a('string');
  };

  /**
   * ### .isNotString(value, [message])
   *
   * Asserts that `value` is _not_ a string.
   *
   *     var teaOrder = 4;
   *     assert.isNotString(teaOrder, 'order placed');
   *
   * @name isNotString
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotString = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('string');
  };

  /**
   * ### .isNumber(value, [message])
   *
   * Asserts that `value` is a number.
   *
   *     var cups = 2;
   *     assert.isNumber(cups, 'how many cups');
   *
   * @name isNumber
   * @param {Number} value
   * @param {String} message
   * @api public
   */

  assert.isNumber = function (val, msg) {
    new Assertion(val, msg).to.be.a('number');
  };

  /**
   * ### .isNotNumber(value, [message])
   *
   * Asserts that `value` is _not_ a number.
   *
   *     var cups = '2 cups please';
   *     assert.isNotNumber(cups, 'how many cups');
   *
   * @name isNotNumber
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotNumber = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('number');
  };

  /**
   * ### .isBoolean(value, [message])
   *
   * Asserts that `value` is a boolean.
   *
   *     var teaReady = true
   *       , teaServed = false;
   *
   *     assert.isBoolean(teaReady, 'is the tea ready');
   *     assert.isBoolean(teaServed, 'has tea been served');
   *
   * @name isBoolean
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isBoolean = function (val, msg) {
    new Assertion(val, msg).to.be.a('boolean');
  };

  /**
   * ### .isNotBoolean(value, [message])
   *
   * Asserts that `value` is _not_ a boolean.
   *
   *     var teaReady = 'yep'
   *       , teaServed = 'nope';
   *
   *     assert.isNotBoolean(teaReady, 'is the tea ready');
   *     assert.isNotBoolean(teaServed, 'has tea been served');
   *
   * @name isNotBoolean
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotBoolean = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('boolean');
  };

  /**
   * ### .typeOf(value, name, [message])
   *
   * Asserts that `value`'s type is `name`, as determined by
   * `Object.prototype.toString`.
   *
   *     assert.typeOf({ tea: 'chai' }, 'object', 'we have an object');
   *     assert.typeOf(['chai', 'jasmine'], 'array', 'we have an array');
   *     assert.typeOf('tea', 'string', 'we have a string');
   *     assert.typeOf(/tea/, 'regexp', 'we have a regular expression');
   *     assert.typeOf(null, 'null', 'we have a null');
   *     assert.typeOf(undefined, 'undefined', 'we have an undefined');
   *
   * @name typeOf
   * @param {Mixed} value
   * @param {String} name
   * @param {String} message
   * @api public
   */

  assert.typeOf = function (val, type, msg) {
    new Assertion(val, msg).to.be.a(type);
  };

  /**
   * ### .notTypeOf(value, name, [message])
   *
   * Asserts that `value`'s type is _not_ `name`, as determined by
   * `Object.prototype.toString`.
   *
   *     assert.notTypeOf('tea', 'number', 'strings are not numbers');
   *
   * @name notTypeOf
   * @param {Mixed} value
   * @param {String} typeof name
   * @param {String} message
   * @api public
   */

  assert.notTypeOf = function (val, type, msg) {
    new Assertion(val, msg).to.not.be.a(type);
  };

  /**
   * ### .instanceOf(object, constructor, [message])
   *
   * Asserts that `value` is an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , chai = new Tea('chai');
   *
   *     assert.instanceOf(chai, Tea, 'chai is an instance of tea');
   *
   * @name instanceOf
   * @param {Object} object
   * @param {Constructor} constructor
   * @param {String} message
   * @api public
   */

  assert.instanceOf = function (val, type, msg) {
    new Assertion(val, msg).to.be.instanceOf(type);
  };

  /**
   * ### .notInstanceOf(object, constructor, [message])
   *
   * Asserts `value` is not an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , chai = new String('chai');
   *
   *     assert.notInstanceOf(chai, Tea, 'chai is not an instance of tea');
   *
   * @name notInstanceOf
   * @param {Object} object
   * @param {Constructor} constructor
   * @param {String} message
   * @api public
   */

  assert.notInstanceOf = function (val, type, msg) {
    new Assertion(val, msg).to.not.be.instanceOf(type);
  };

  /**
   * ### .include(haystack, needle, [message])
   *
   * Asserts that `haystack` includes `needle`. Works
   * for strings and arrays.
   *
   *     assert.include('foobar', 'bar', 'foobar contains string "bar"');
   *     assert.include([ 1, 2, 3 ], 3, 'array contains value');
   *
   * @name include
   * @param {Array|String} haystack
   * @param {Mixed} needle
   * @param {String} message
   * @api public
   */

  assert.include = function (exp, inc, msg) {
    new Assertion(exp, msg, assert.include).include(inc);
  };

  /**
   * ### .notInclude(haystack, needle, [message])
   *
   * Asserts that `haystack` does not include `needle`. Works
   * for strings and arrays.
   *i
   *     assert.notInclude('foobar', 'baz', 'string not include substring');
   *     assert.notInclude([ 1, 2, 3 ], 4, 'array not include contain value');
   *
   * @name notInclude
   * @param {Array|String} haystack
   * @param {Mixed} needle
   * @param {String} message
   * @api public
   */

  assert.notInclude = function (exp, inc, msg) {
    new Assertion(exp, msg, assert.notInclude).not.include(inc);
  };

  /**
   * ### .match(value, regexp, [message])
   *
   * Asserts that `value` matches the regular expression `regexp`.
   *
   *     assert.match('foobar', /^foo/, 'regexp matches');
   *
   * @name match
   * @param {Mixed} value
   * @param {RegExp} regexp
   * @param {String} message
   * @api public
   */

  assert.match = function (exp, re, msg) {
    new Assertion(exp, msg).to.match(re);
  };

  /**
   * ### .notMatch(value, regexp, [message])
   *
   * Asserts that `value` does not match the regular expression `regexp`.
   *
   *     assert.notMatch('foobar', /^foo/, 'regexp does not match');
   *
   * @name notMatch
   * @param {Mixed} value
   * @param {RegExp} regexp
   * @param {String} message
   * @api public
   */

  assert.notMatch = function (exp, re, msg) {
    new Assertion(exp, msg).to.not.match(re);
  };

  /**
   * ### .property(object, property, [message])
   *
   * Asserts that `object` has a property named by `property`.
   *
   *     assert.property({ tea: { green: 'matcha' }}, 'tea');
   *
   * @name property
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.property = function (obj, prop, msg) {
    new Assertion(obj, msg).to.have.property(prop);
  };

  /**
   * ### .notProperty(object, property, [message])
   *
   * Asserts that `object` does _not_ have a property named by `property`.
   *
   *     assert.notProperty({ tea: { green: 'matcha' }}, 'coffee');
   *
   * @name notProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.notProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.not.have.property(prop);
  };

  /**
   * ### .deepProperty(object, property, [message])
   *
   * Asserts that `object` has a property named by `property`, which can be a
   * string using dot- and bracket-notation for deep reference.
   *
   *     assert.deepProperty({ tea: { green: 'matcha' }}, 'tea.green');
   *
   * @name deepProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.deepProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.have.deep.property(prop);
  };

  /**
   * ### .notDeepProperty(object, property, [message])
   *
   * Asserts that `object` does _not_ have a property named by `property`, which
   * can be a string using dot- and bracket-notation for deep reference.
   *
   *     assert.notDeepProperty({ tea: { green: 'matcha' }}, 'tea.oolong');
   *
   * @name notDeepProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.notDeepProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.not.have.deep.property(prop);
  };

  /**
   * ### .propertyVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property` with value given
   * by `value`.
   *
   *     assert.propertyVal({ tea: 'is good' }, 'tea', 'is good');
   *
   * @name propertyVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.propertyVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.have.property(prop, val);
  };

  /**
   * ### .propertyNotVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property`, but with a value
   * different from that given by `value`.
   *
   *     assert.propertyNotVal({ tea: 'is good' }, 'tea', 'is bad');
   *
   * @name propertyNotVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.propertyNotVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.not.have.property(prop, val);
  };

  /**
   * ### .deepPropertyVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property` with value given
   * by `value`. `property` can use dot- and bracket-notation for deep
   * reference.
   *
   *     assert.deepPropertyVal({ tea: { green: 'matcha' }}, 'tea.green', 'matcha');
   *
   * @name deepPropertyVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.deepPropertyVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.have.deep.property(prop, val);
  };

  /**
   * ### .deepPropertyNotVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property`, but with a value
   * different from that given by `value`. `property` can use dot- and
   * bracket-notation for deep reference.
   *
   *     assert.deepPropertyNotVal({ tea: { green: 'matcha' }}, 'tea.green', 'konacha');
   *
   * @name deepPropertyNotVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.deepPropertyNotVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.not.have.deep.property(prop, val);
  };

  /**
   * ### .lengthOf(object, length, [message])
   *
   * Asserts that `object` has a `length` property with the expected value.
   *
   *     assert.lengthOf([1,2,3], 3, 'array has length of 3');
   *     assert.lengthOf('foobar', 5, 'string has length of 6');
   *
   * @name lengthOf
   * @param {Mixed} object
   * @param {Number} length
   * @param {String} message
   * @api public
   */

  assert.lengthOf = function (exp, len, msg) {
    new Assertion(exp, msg).to.have.length(len);
  };

  /**
   * ### .throws(function, [constructor/string/regexp], [string/regexp], [message])
   *
   * Asserts that `function` will throw an error that is an instance of
   * `constructor`, or alternately that it will throw an error with message
   * matching `regexp`.
   *
   *     assert.throw(fn, 'function throws a reference error');
   *     assert.throw(fn, /function throws a reference error/);
   *     assert.throw(fn, ReferenceError);
   *     assert.throw(fn, ReferenceError, 'function throws a reference error');
   *     assert.throw(fn, ReferenceError, /function throws a reference error/);
   *
   * @name throws
   * @alias throw
   * @alias Throw
   * @param {Function} function
   * @param {ErrorConstructor} constructor
   * @param {RegExp} regexp
   * @param {String} message
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @api public
   */

  assert.Throw = function (fn, errt, errs, msg) {
    if ('string' === typeof errt || errt instanceof RegExp) {
      errs = errt;
      errt = null;
    }

    var assertErr = new Assertion(fn, msg).to.Throw(errt, errs);
    return flag(assertErr, 'object');
  };

  /**
   * ### .doesNotThrow(function, [constructor/regexp], [message])
   *
   * Asserts that `function` will _not_ throw an error that is an instance of
   * `constructor`, or alternately that it will not throw an error with message
   * matching `regexp`.
   *
   *     assert.doesNotThrow(fn, Error, 'function does not throw');
   *
   * @name doesNotThrow
   * @param {Function} function
   * @param {ErrorConstructor} constructor
   * @param {RegExp} regexp
   * @param {String} message
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @api public
   */

  assert.doesNotThrow = function (fn, type, msg) {
    if ('string' === typeof type) {
      msg = type;
      type = null;
    }

    new Assertion(fn, msg).to.not.Throw(type);
  };

  /**
   * ### .operator(val1, operator, val2, [message])
   *
   * Compares two values using `operator`.
   *
   *     assert.operator(1, '<', 2, 'everything is ok');
   *     assert.operator(1, '>', 2, 'this will fail');
   *
   * @name operator
   * @param {Mixed} val1
   * @param {String} operator
   * @param {Mixed} val2
   * @param {String} message
   * @api public
   */

  assert.operator = function (val, operator, val2, msg) {
    var ok;
    switch(operator) {
      case '==':
        ok = val == val2;
        break;
      case '===':
        ok = val === val2;
        break;
      case '>':
        ok = val > val2;
        break;
      case '>=':
        ok = val >= val2;
        break;
      case '<':
        ok = val < val2;
        break;
      case '<=':
        ok = val <= val2;
        break;
      case '!=':
        ok = val != val2;
        break;
      case '!==':
        ok = val !== val2;
        break;
      default:
        throw new Error('Invalid operator "' + operator + '"');
    }
    var test = new Assertion(ok, msg);
    test.assert(
        true === flag(test, 'object')
      , 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2)
      , 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2) );
  };

  /**
   * ### .closeTo(actual, expected, delta, [message])
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     assert.closeTo(1.5, 1, 0.5, 'numbers are close');
   *
   * @name closeTo
   * @param {Number} actual
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message
   * @api public
   */

  assert.closeTo = function (act, exp, delta, msg) {
    new Assertion(act, msg).to.be.closeTo(exp, delta);
  };

  /**
   * ### .sameMembers(set1, set2, [message])
   *
   * Asserts that `set1` and `set2` have the same members.
   * Order is not taken into account.
   *
   *     assert.sameMembers([ 1, 2, 3 ], [ 2, 1, 3 ], 'same members');
   *
   * @name sameMembers
   * @param {Array} set1
   * @param {Array} set2
   * @param {String} message
   * @api public
   */

  assert.sameMembers = function (set1, set2, msg) {
    new Assertion(set1, msg).to.have.same.members(set2);
  }

  /**
   * ### .sameDeepMembers(set1, set2, [message])
   *
   * Asserts that `set1` and `set2` have the same members - using a deep equality checking.
   * Order is not taken into account.
   *
   *     assert.sameDeepMembers([ {b: 3}, {a: 2}, {c: 5} ], [ {c: 5}, {b: 3}, {a: 2} ], 'same deep members');
   *
   * @name sameDeepMembers
   * @param {Array} set1
   * @param {Array} set2
   * @param {String} message
   * @api public
   */

  assert.sameDeepMembers = function (set1, set2, msg) {
    new Assertion(set1, msg).to.have.same.deep.members(set2);
  }

  /**
   * ### .includeMembers(superset, subset, [message])
   *
   * Asserts that `subset` is included in `superset`.
   * Order is not taken into account.
   *
   *     assert.includeMembers([ 1, 2, 3 ], [ 2, 1 ], 'include members');
   *
   * @name includeMembers
   * @param {Array} superset
   * @param {Array} subset
   * @param {String} message
   * @api public
   */

  assert.includeMembers = function (superset, subset, msg) {
    new Assertion(superset, msg).to.include.members(subset);
  }

   /**
   * ### .changes(function, object, property)
   *
   * Asserts that a function changes the value of a property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 22 };
   *     assert.changes(fn, obj, 'val');
   *
   * @name changes
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.changes = function (fn, obj, prop) {
    new Assertion(fn).to.change(obj, prop);
  }

   /**
   * ### .doesNotChange(function, object, property)
   *
   * Asserts that a function does not changes the value of a property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { console.log('foo'); };
   *     assert.doesNotChange(fn, obj, 'val');
   *
   * @name doesNotChange
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.doesNotChange = function (fn, obj, prop) {
    new Assertion(fn).to.not.change(obj, prop);
  }

   /**
   * ### .increases(function, object, property)
   *
   * Asserts that a function increases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 13 };
   *     assert.increases(fn, obj, 'val');
   *
   * @name increases
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.increases = function (fn, obj, prop) {
    new Assertion(fn).to.increase(obj, prop);
  }

   /**
   * ### .doesNotIncrease(function, object, property)
   *
   * Asserts that a function does not increase object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 8 };
   *     assert.doesNotIncrease(fn, obj, 'val');
   *
   * @name doesNotIncrease
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.doesNotIncrease = function (fn, obj, prop) {
    new Assertion(fn).to.not.increase(obj, prop);
  }

   /**
   * ### .decreases(function, object, property)
   *
   * Asserts that a function decreases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 5 };
   *     assert.decreases(fn, obj, 'val');
   *
   * @name decreases
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.decreases = function (fn, obj, prop) {
    new Assertion(fn).to.decrease(obj, prop);
  }

   /**
   * ### .doesNotDecrease(function, object, property)
   *
   * Asserts that a function does not decreases an object property
   *
   *     var obj = { val: 10 };
   *     var fn = function() { obj.val = 15 };
   *     assert.doesNotDecrease(fn, obj, 'val');
   *
   * @name doesNotDecrease
   * @param {Function} modifier function
   * @param {Object} object
   * @param {String} property name
   * @param {String} message _optional_
   * @api public
   */

  assert.doesNotDecrease = function (fn, obj, prop) {
    new Assertion(fn).to.not.decrease(obj, prop);
  }

  /*!
   * Undocumented / untested
   */

  assert.ifError = function (val, msg) {
    new Assertion(val, msg).to.not.be.ok;
  };

  /*!
   * Aliases.
   */

  (function alias(name, as){
    assert[as] = assert[name];
    return alias;
  })
  ('Throw', 'throw')
  ('Throw', 'throws');
};

},{}],11:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, util) {
  chai.expect = function (val, message) {
    return new chai.Assertion(val, message);
  };

  /**
   * ### .fail(actual, expected, [message], [operator])
   *
   * Throw a failure.
   *
   * @name fail
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @param {String} operator
   * @api public
   */

  chai.expect.fail = function (actual, expected, message, operator) {
    message = message || 'expect.fail()';
    throw new chai.AssertionError(message, {
        actual: actual
      , expected: expected
      , operator: operator
    }, chai.expect.fail);
  };
};

},{}],12:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, util) {
  var Assertion = chai.Assertion;

  function loadShould () {
    // explicitly define this method as function as to have it's name to include as `ssfi`
    function shouldGetter() {
      if (this instanceof String || this instanceof Number || this instanceof Boolean ) {
        return new Assertion(this.valueOf(), null, shouldGetter);
      }
      return new Assertion(this, null, shouldGetter);
    }
    function shouldSetter(value) {
      // See https://github.com/chaijs/chai/issues/86: this makes
      // `whatever.should = someValue` actually set `someValue`, which is
      // especially useful for `global.should = require('chai').should()`.
      //
      // Note that we have to use [[DefineProperty]] instead of [[Put]]
      // since otherwise we would trigger this very setter!
      Object.defineProperty(this, 'should', {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    }
    // modify Object.prototype to have `should`
    Object.defineProperty(Object.prototype, 'should', {
      set: shouldSetter
      , get: shouldGetter
      , configurable: true
    });

    var should = {};

    /**
     * ### .fail(actual, expected, [message], [operator])
     *
     * Throw a failure.
     *
     * @name fail
     * @param {Mixed} actual
     * @param {Mixed} expected
     * @param {String} message
     * @param {String} operator
     * @api public
     */

    should.fail = function (actual, expected, message, operator) {
      message = message || 'should.fail()';
      throw new chai.AssertionError(message, {
          actual: actual
        , expected: expected
        , operator: operator
      }, should.fail);
    };

    should.equal = function (val1, val2, msg) {
      new Assertion(val1, msg).to.equal(val2);
    };

    should.Throw = function (fn, errt, errs, msg) {
      new Assertion(fn, msg).to.Throw(errt, errs);
    };

    should.exist = function (val, msg) {
      new Assertion(val, msg).to.exist;
    }

    // negation
    should.not = {}

    should.not.equal = function (val1, val2, msg) {
      new Assertion(val1, msg).to.not.equal(val2);
    };

    should.not.Throw = function (fn, errt, errs, msg) {
      new Assertion(fn, msg).to.not.Throw(errt, errs);
    };

    should.not.exist = function (val, msg) {
      new Assertion(val, msg).to.not.exist;
    }

    should['throw'] = should['Throw'];
    should.not['throw'] = should.not['Throw'];

    return should;
  };

  chai.should = loadShould;
  chai.Should = loadShould;
};

},{}],13:[function(require,module,exports){
/*!
 * Chai - addChainingMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var transferFlags = require('./transferFlags');
var flag = require('./flag');
var config = require('../config');

/*!
 * Module variables
 */

// Check whether `__proto__` is supported
var hasProtoSupport = '__proto__' in Object;

// Without `__proto__` support, this module will need to add properties to a function.
// However, some Function.prototype methods cannot be overwritten,
// and there seems no easy cross-platform way to detect them (@see chaijs/chai/issues/69).
var excludeNames = /^(?:length|name|arguments|caller)$/;

// Cache `Function` properties
var call  = Function.prototype.call,
    apply = Function.prototype.apply;

/**
 * ### addChainableMethod (ctx, name, method, chainingBehavior)
 *
 * Adds a method to an object, such that the method can also be chained.
 *
 *     utils.addChainableMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addChainableMethod('foo', fn, chainingBehavior);
 *
 * The result can then be used as both a method assertion, executing both `method` and
 * `chainingBehavior`, or as a language chain, which only executes `chainingBehavior`.
 *
 *     expect(fooStr).to.be.foo('bar');
 *     expect(fooStr).to.be.foo.equal('foo');
 *
 * @param {Object} ctx object to which the method is added
 * @param {String} name of method to add
 * @param {Function} method function to be used for `name`, when called
 * @param {Function} chainingBehavior function to be called every time the property is accessed
 * @name addChainableMethod
 * @api public
 */

module.exports = function (ctx, name, method, chainingBehavior) {
  if (typeof chainingBehavior !== 'function') {
    chainingBehavior = function () { };
  }

  var chainableBehavior = {
      method: method
    , chainingBehavior: chainingBehavior
  };

  // save the methods so we can overwrite them later, if we need to.
  if (!ctx.__methods) {
    ctx.__methods = {};
  }
  ctx.__methods[name] = chainableBehavior;

  Object.defineProperty(ctx, name,
    { get: function () {
        chainableBehavior.chainingBehavior.call(this);

        var assert = function assert() {
          var old_ssfi = flag(this, 'ssfi');
          if (old_ssfi && config.includeStack === false)
            flag(this, 'ssfi', assert);
          var result = chainableBehavior.method.apply(this, arguments);
          return result === undefined ? this : result;
        };

        // Use `__proto__` if available
        if (hasProtoSupport) {
          // Inherit all properties from the object by replacing the `Function` prototype
          var prototype = assert.__proto__ = Object.create(this);
          // Restore the `call` and `apply` methods from `Function`
          prototype.call = call;
          prototype.apply = apply;
        }
        // Otherwise, redefine all properties (slow!)
        else {
          var asserterNames = Object.getOwnPropertyNames(ctx);
          asserterNames.forEach(function (asserterName) {
            if (!excludeNames.test(asserterName)) {
              var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);
              Object.defineProperty(assert, asserterName, pd);
            }
          });
        }

        transferFlags(this, assert);
        return assert;
      }
    , configurable: true
  });
};

},{"../config":8,"./flag":16,"./transferFlags":32}],14:[function(require,module,exports){
/*!
 * Chai - addMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var config = require('../config');

/**
 * ### .addMethod (ctx, name, method)
 *
 * Adds a method to the prototype of an object.
 *
 *     utils.addMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addMethod('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(fooStr).to.be.foo('bar');
 *
 * @param {Object} ctx object to which the method is added
 * @param {String} name of method to add
 * @param {Function} method function to be used for name
 * @name addMethod
 * @api public
 */
var flag = require('./flag');

module.exports = function (ctx, name, method) {
  ctx[name] = function () {
    var old_ssfi = flag(this, 'ssfi');
    if (old_ssfi && config.includeStack === false)
      flag(this, 'ssfi', ctx[name]);
    var result = method.apply(this, arguments);
    return result === undefined ? this : result;
  };
};

},{"../config":8,"./flag":16}],15:[function(require,module,exports){
/*!
 * Chai - addProperty utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### addProperty (ctx, name, getter)
 *
 * Adds a property to the prototype of an object.
 *
 *     utils.addProperty(chai.Assertion.prototype, 'foo', function () {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.instanceof(Foo);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addProperty('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.be.foo;
 *
 * @param {Object} ctx object to which the property is added
 * @param {String} name of property to add
 * @param {Function} getter function to be used for name
 * @name addProperty
 * @api public
 */

module.exports = function (ctx, name, getter) {
  Object.defineProperty(ctx, name,
    { get: function () {
        var result = getter.call(this);
        return result === undefined ? this : result;
      }
    , configurable: true
  });
};

},{}],16:[function(require,module,exports){
/*!
 * Chai - flag utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### flag(object, key, [value])
 *
 * Get or set a flag value on an object. If a
 * value is provided it will be set, else it will
 * return the currently set value or `undefined` if
 * the value is not set.
 *
 *     utils.flag(this, 'foo', 'bar'); // setter
 *     utils.flag(this, 'foo'); // getter, returns `bar`
 *
 * @param {Object} object constructed Assertion
 * @param {String} key
 * @param {Mixed} value (optional)
 * @name flag
 * @api private
 */

module.exports = function (obj, key, value) {
  var flags = obj.__flags || (obj.__flags = Object.create(null));
  if (arguments.length === 3) {
    flags[key] = value;
  } else {
    return flags[key];
  }
};

},{}],17:[function(require,module,exports){
/*!
 * Chai - getActual utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * # getActual(object, [actual])
 *
 * Returns the `actual` value for an Assertion
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 */

module.exports = function (obj, args) {
  return args.length > 4 ? args[4] : obj._obj;
};

},{}],18:[function(require,module,exports){
/*!
 * Chai - getEnumerableProperties utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .getEnumerableProperties(object)
 *
 * This allows the retrieval of enumerable property names of an object,
 * inherited or not.
 *
 * @param {Object} object
 * @returns {Array}
 * @name getEnumerableProperties
 * @api public
 */

module.exports = function getEnumerableProperties(object) {
  var result = [];
  for (var name in object) {
    result.push(name);
  }
  return result;
};

},{}],19:[function(require,module,exports){
/*!
 * Chai - message composition utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var flag = require('./flag')
  , getActual = require('./getActual')
  , inspect = require('./inspect')
  , objDisplay = require('./objDisplay');

/**
 * ### .getMessage(object, message, negateMessage)
 *
 * Construct the error message based on flags
 * and template tags. Template tags will return
 * a stringified inspection of the object referenced.
 *
 * Message template tags:
 * - `#{this}` current asserted object
 * - `#{act}` actual value
 * - `#{exp}` expected value
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 * @name getMessage
 * @api public
 */

module.exports = function (obj, args) {
  var negate = flag(obj, 'negate')
    , val = flag(obj, 'object')
    , expected = args[3]
    , actual = getActual(obj, args)
    , msg = negate ? args[2] : args[1]
    , flagMsg = flag(obj, 'message');

  if(typeof msg === "function") msg = msg();
  msg = msg || '';
  msg = msg
    .replace(/#{this}/g, objDisplay(val))
    .replace(/#{act}/g, objDisplay(actual))
    .replace(/#{exp}/g, objDisplay(expected));

  return flagMsg ? flagMsg + ': ' + msg : msg;
};

},{"./flag":16,"./getActual":17,"./inspect":26,"./objDisplay":27}],20:[function(require,module,exports){
/*!
 * Chai - getName utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * # getName(func)
 *
 * Gets the name of a function, in a cross-browser way.
 *
 * @param {Function} a function (usually a constructor)
 */

module.exports = function (func) {
  if (func.name) return func.name;

  var match = /^\s?function ([^(]*)\(/.exec(func);
  return match && match[1] ? match[1] : "";
};

},{}],21:[function(require,module,exports){
/*!
 * Chai - getPathInfo utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var hasProperty = require('./hasProperty');

/**
 * ### .getPathInfo(path, object)
 *
 * This allows the retrieval of property info in an
 * object given a string path.
 *
 * The path info consists of an object with the
 * following properties:
 *
 * * parent - The parent object of the property referenced by `path`
 * * name - The name of the final property, a number if it was an array indexer
 * * value - The value of the property, if it exists, otherwise `undefined`
 * * exists - Whether the property exists or not
 *
 * @param {String} path
 * @param {Object} object
 * @returns {Object} info
 * @name getPathInfo
 * @api public
 */

module.exports = function getPathInfo(path, obj) {
  var parsed = parsePath(path),
      last = parsed[parsed.length - 1];

  var info = {
    parent: parsed.length > 1 ? _getPathValue(parsed, obj, parsed.length - 1) : obj,
    name: last.p || last.i,
    value: _getPathValue(parsed, obj),
  };
  info.exists = hasProperty(info.name, info.parent);

  return info;
};


/*!
 * ## parsePath(path)
 *
 * Helper function used to parse string object
 * paths. Use in conjunction with `_getPathValue`.
 *
 *      var parsed = parsePath('myobject.property.subprop');
 *
 * ### Paths:
 *
 * * Can be as near infinitely deep and nested
 * * Arrays are also valid using the formal `myobject.document[3].property`.
 * * Literal dots and brackets (not delimiter) must be backslash-escaped.
 *
 * @param {String} path
 * @returns {Object} parsed
 * @api private
 */

function parsePath (path) {
  var str = path.replace(/([^\\])\[/g, '$1.[')
    , parts = str.match(/(\\\.|[^.]+?)+/g);
  return parts.map(function (value) {
    var re = /^\[(\d+)\]$/
      , mArr = re.exec(value);
    if (mArr) return { i: parseFloat(mArr[1]) };
    else return { p: value.replace(/\\([.\[\]])/g, '$1') };
  });
}


/*!
 * ## _getPathValue(parsed, obj)
 *
 * Helper companion function for `.parsePath` that returns
 * the value located at the parsed address.
 *
 *      var value = getPathValue(parsed, obj);
 *
 * @param {Object} parsed definition from `parsePath`.
 * @param {Object} object to search against
 * @param {Number} object to search against
 * @returns {Object|Undefined} value
 * @api private
 */

function _getPathValue (parsed, obj, index) {
  var tmp = obj
    , res;

  index = (index === undefined ? parsed.length : index);

  for (var i = 0, l = index; i < l; i++) {
    var part = parsed[i];
    if (tmp) {
      if ('undefined' !== typeof part.p)
        tmp = tmp[part.p];
      else if ('undefined' !== typeof part.i)
        tmp = tmp[part.i];
      if (i == (l - 1)) res = tmp;
    } else {
      res = undefined;
    }
  }
  return res;
}

},{"./hasProperty":24}],22:[function(require,module,exports){
/*!
 * Chai - getPathValue utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * @see https://github.com/logicalparadox/filtr
 * MIT Licensed
 */

var getPathInfo = require('./getPathInfo');

/**
 * ### .getPathValue(path, object)
 *
 * This allows the retrieval of values in an
 * object given a string path.
 *
 *     var obj = {
 *         prop1: {
 *             arr: ['a', 'b', 'c']
 *           , str: 'Hello'
 *         }
 *       , prop2: {
 *             arr: [ { nested: 'Universe' } ]
 *           , str: 'Hello again!'
 *         }
 *     }
 *
 * The following would be the results.
 *
 *     getPathValue('prop1.str', obj); // Hello
 *     getPathValue('prop1.att[2]', obj); // b
 *     getPathValue('prop2.arr[0].nested', obj); // Universe
 *
 * @param {String} path
 * @param {Object} object
 * @returns {Object} value or `undefined`
 * @name getPathValue
 * @api public
 */
module.exports = function(path, obj) {
  var info = getPathInfo(path, obj);
  return info.value;
}; 

},{"./getPathInfo":21}],23:[function(require,module,exports){
/*!
 * Chai - getProperties utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .getProperties(object)
 *
 * This allows the retrieval of property names of an object, enumerable or not,
 * inherited or not.
 *
 * @param {Object} object
 * @returns {Array}
 * @name getProperties
 * @api public
 */

module.exports = function getProperties(object) {
  var result = Object.getOwnPropertyNames(subject);

  function addProperty(property) {
    if (result.indexOf(property) === -1) {
      result.push(property);
    }
  }

  var proto = Object.getPrototypeOf(subject);
  while (proto !== null) {
    Object.getOwnPropertyNames(proto).forEach(addProperty);
    proto = Object.getPrototypeOf(proto);
  }

  return result;
};

},{}],24:[function(require,module,exports){
/*!
 * Chai - hasProperty utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var type = require('./type');

/**
 * ### .hasProperty(object, name)
 *
 * This allows checking whether an object has
 * named property or numeric array index.
 *
 * Basically does the same thing as the `in`
 * operator but works properly with natives
 * and null/undefined values.
 *
 *     var obj = {
 *         arr: ['a', 'b', 'c']
 *       , str: 'Hello'
 *     }
 *
 * The following would be the results.
 *
 *     hasProperty('str', obj);  // true
 *     hasProperty('constructor', obj);  // true
 *     hasProperty('bar', obj);  // false
 *     
 *     hasProperty('length', obj.str); // true
 *     hasProperty(1, obj.str);  // true
 *     hasProperty(5, obj.str);  // false
 *
 *     hasProperty('length', obj.arr);  // true
 *     hasProperty(2, obj.arr);  // true
 *     hasProperty(3, obj.arr);  // false
 *
 * @param {Objuect} object
 * @param {String|Number} name
 * @returns {Boolean} whether it exists
 * @name getPathInfo
 * @api public
 */

var literals = {
    'number': Number
  , 'string': String
};

module.exports = function hasProperty(name, obj) {
  var ot = type(obj);

  // Bad Object, obviously no props at all
  if(ot === 'null' || ot === 'undefined')
    return false;

  // The `in` operator does not work with certain literals
  // box these before the check
  if(literals[ot] && typeof obj !== 'object')
    obj = new literals[ot](obj);

  return name in obj;
};

},{"./type":33}],25:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Main exports
 */

var exports = module.exports = {};

/*!
 * test utility
 */

exports.test = require('./test');

/*!
 * type utility
 */

exports.type = require('./type');

/*!
 * message utility
 */

exports.getMessage = require('./getMessage');

/*!
 * actual utility
 */

exports.getActual = require('./getActual');

/*!
 * Inspect util
 */

exports.inspect = require('./inspect');

/*!
 * Object Display util
 */

exports.objDisplay = require('./objDisplay');

/*!
 * Flag utility
 */

exports.flag = require('./flag');

/*!
 * Flag transferring utility
 */

exports.transferFlags = require('./transferFlags');

/*!
 * Deep equal utility
 */

exports.eql = require('deep-eql');

/*!
 * Deep path value
 */

exports.getPathValue = require('./getPathValue');

/*!
 * Deep path info
 */

exports.getPathInfo = require('./getPathInfo');

/*!
 * Check if a property exists
 */

exports.hasProperty = require('./hasProperty');

/*!
 * Function name
 */

exports.getName = require('./getName');

/*!
 * add Property
 */

exports.addProperty = require('./addProperty');

/*!
 * add Method
 */

exports.addMethod = require('./addMethod');

/*!
 * overwrite Property
 */

exports.overwriteProperty = require('./overwriteProperty');

/*!
 * overwrite Method
 */

exports.overwriteMethod = require('./overwriteMethod');

/*!
 * Add a chainable method
 */

exports.addChainableMethod = require('./addChainableMethod');

/*!
 * Overwrite chainable method
 */

exports.overwriteChainableMethod = require('./overwriteChainableMethod');


},{"./addChainableMethod":13,"./addMethod":14,"./addProperty":15,"./flag":16,"./getActual":17,"./getMessage":19,"./getName":20,"./getPathInfo":21,"./getPathValue":22,"./hasProperty":24,"./inspect":26,"./objDisplay":27,"./overwriteChainableMethod":28,"./overwriteMethod":29,"./overwriteProperty":30,"./test":31,"./transferFlags":32,"./type":33,"deep-eql":34}],26:[function(require,module,exports){
// This is (almost) directly from Node.js utils
// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/util.js

var getName = require('./getName');
var getProperties = require('./getProperties');
var getEnumerableProperties = require('./getEnumerableProperties');

module.exports = inspect;

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)
 *    properties of objects.
 * @param {Number} depth Depth in which to descend in object. Default is 2.
 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the
 *    output. Default is false (no coloring).
 */
function inspect(obj, showHidden, depth, colors) {
  var ctx = {
    showHidden: showHidden,
    seen: [],
    stylize: function (str) { return str; }
  };
  return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));
}

// Returns true if object is a DOM element.
var isDOMElement = function (object) {
  if (typeof HTMLElement === 'object') {
    return object instanceof HTMLElement;
  } else {
    return object &&
      typeof object === 'object' &&
      object.nodeType === 1 &&
      typeof object.nodeName === 'string';
  }
};

function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (value && typeof value.inspect === 'function' &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (typeof ret !== 'string') {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // If this is a DOM element, try to get the outer HTML.
  if (isDOMElement(value)) {
    if ('outerHTML' in value) {
      return value.outerHTML;
      // This value does not have an outerHTML attribute,
      //   it could still be an XML element
    } else {
      // Attempt to serialize it
      try {
        if (document.xmlVersion) {
          var xmlSerializer = new XMLSerializer();
          return xmlSerializer.serializeToString(value);
        } else {
          // Firefox 11- do not support outerHTML
          //   It does, however, support innerHTML
          //   Use the following to render the element
          var ns = "http://www.w3.org/1999/xhtml";
          var container = document.createElementNS(ns, '_');

          container.appendChild(value.cloneNode(false));
          html = container.innerHTML
            .replace('><', '>' + value.innerHTML + '<');
          container.innerHTML = '';
          return html;
        }
      } catch (err) {
        // This could be a non-native DOM implementation,
        //   continue with the normal flow:
        //   printing the element as if it is an object.
      }
    }
  }

  // Look up the keys of the object.
  var visibleKeys = getEnumerableProperties(value);
  var keys = ctx.showHidden ? getProperties(value) : visibleKeys;

  // Some type of object without properties can be shortcutted.
  // In IE, errors have a single `stack` property, or if they are vanilla `Error`,
  // a `stack` plus `description` property; ignore those for consistency.
  if (keys.length === 0 || (isError(value) && (
      (keys.length === 1 && keys[0] === 'stack') ||
      (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')
     ))) {
    if (typeof value === 'function') {
      var name = getName(value);
      var nameSuffix = name ? ': ' + name : '';
      return ctx.stylize('[Function' + nameSuffix + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (typeof value === 'function') {
    var name = getName(value);
    var nameSuffix = name ? ': ' + name : '';
    base = ' [Function' + nameSuffix + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    return formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  switch (typeof value) {
    case 'undefined':
      return ctx.stylize('undefined', 'undefined');

    case 'string':
      var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                               .replace(/'/g, "\\'")
                                               .replace(/\\"/g, '"') + '\'';
      return ctx.stylize(simple, 'string');

    case 'number':
      if (value === 0 && (1/value) === -Infinity) {
        return ctx.stylize('-0', 'number');
      }
      return ctx.stylize('' + value, 'number');

    case 'boolean':
      return ctx.stylize('' + value, 'boolean');
  }
  // For some reason typeof null is "object", so special case here.
  if (value === null) {
    return ctx.stylize('null', 'null');
  }
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (Object.prototype.hasOwnProperty.call(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str;
  if (value.__lookupGetter__) {
    if (value.__lookupGetter__(key)) {
      if (value.__lookupSetter__(key)) {
        str = ctx.stylize('[Getter/Setter]', 'special');
      } else {
        str = ctx.stylize('[Getter]', 'special');
      }
    } else {
      if (value.__lookupSetter__(key)) {
        str = ctx.stylize('[Setter]', 'special');
      }
    }
  }
  if (visibleKeys.indexOf(key) < 0) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(value[key]) < 0) {
      if (recurseTimes === null) {
        str = formatValue(ctx, value[key], null);
      } else {
        str = formatValue(ctx, value[key], recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (typeof name === 'undefined') {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}

function isArray(ar) {
  return Array.isArray(ar) ||
         (typeof ar === 'object' && objectToString(ar) === '[object Array]');
}

function isRegExp(re) {
  return typeof re === 'object' && objectToString(re) === '[object RegExp]';
}

function isDate(d) {
  return typeof d === 'object' && objectToString(d) === '[object Date]';
}

function isError(e) {
  return typeof e === 'object' && objectToString(e) === '[object Error]';
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

},{"./getEnumerableProperties":18,"./getName":20,"./getProperties":23}],27:[function(require,module,exports){
/*!
 * Chai - flag utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var inspect = require('./inspect');
var config = require('../config');

/**
 * ### .objDisplay (object)
 *
 * Determines if an object or an array matches
 * criteria to be inspected in-line for error
 * messages or should be truncated.
 *
 * @param {Mixed} javascript object to inspect
 * @name objDisplay
 * @api public
 */

module.exports = function (obj) {
  var str = inspect(obj)
    , type = Object.prototype.toString.call(obj);

  if (config.truncateThreshold && str.length >= config.truncateThreshold) {
    if (type === '[object Function]') {
      return !obj.name || obj.name === ''
        ? '[Function]'
        : '[Function: ' + obj.name + ']';
    } else if (type === '[object Array]') {
      return '[ Array(' + obj.length + ') ]';
    } else if (type === '[object Object]') {
      var keys = Object.keys(obj)
        , kstr = keys.length > 2
          ? keys.splice(0, 2).join(', ') + ', ...'
          : keys.join(', ');
      return '{ Object (' + kstr + ') }';
    } else {
      return str;
    }
  } else {
    return str;
  }
};

},{"../config":8,"./inspect":26}],28:[function(require,module,exports){
/*!
 * Chai - overwriteChainableMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteChainableMethod (ctx, name, method, chainingBehavior)
 *
 * Overwites an already existing chainable method
 * and provides access to the previous function or
 * property.  Must return functions to be used for
 * name.
 *
 *     utils.overwriteChainableMethod(chai.Assertion.prototype, 'length',
 *       function (_super) {
 *       }
 *     , function (_super) {
 *       }
 *     );
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteChainableMethod('foo', fn, fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.have.length(3);
 *     expect(myFoo).to.have.length.above(3);
 *
 * @param {Object} ctx object whose method / property is to be overwritten
 * @param {String} name of method / property to overwrite
 * @param {Function} method function that returns a function to be used for name
 * @param {Function} chainingBehavior function that returns a function to be used for property
 * @name overwriteChainableMethod
 * @api public
 */

module.exports = function (ctx, name, method, chainingBehavior) {
  var chainableBehavior = ctx.__methods[name];

  var _chainingBehavior = chainableBehavior.chainingBehavior;
  chainableBehavior.chainingBehavior = function () {
    var result = chainingBehavior(_chainingBehavior).call(this);
    return result === undefined ? this : result;
  };

  var _method = chainableBehavior.method;
  chainableBehavior.method = function () {
    var result = method(_method).apply(this, arguments);
    return result === undefined ? this : result;
  };
};

},{}],29:[function(require,module,exports){
/*!
 * Chai - overwriteMethod utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteMethod (ctx, name, fn)
 *
 * Overwites an already existing method and provides
 * access to previous function. Must return function
 * to be used for name.
 *
 *     utils.overwriteMethod(chai.Assertion.prototype, 'equal', function (_super) {
 *       return function (str) {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.value).to.equal(str);
 *         } else {
 *           _super.apply(this, arguments);
 *         }
 *       }
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteMethod('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.equal('bar');
 *
 * @param {Object} ctx object whose method is to be overwritten
 * @param {String} name of method to overwrite
 * @param {Function} method function that returns a function to be used for name
 * @name overwriteMethod
 * @api public
 */

module.exports = function (ctx, name, method) {
  var _method = ctx[name]
    , _super = function () { return this; };

  if (_method && 'function' === typeof _method)
    _super = _method;

  ctx[name] = function () {
    var result = method(_super).apply(this, arguments);
    return result === undefined ? this : result;
  }
};

},{}],30:[function(require,module,exports){
/*!
 * Chai - overwriteProperty utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteProperty (ctx, name, fn)
 *
 * Overwites an already existing property getter and provides
 * access to previous value. Must return function to use as getter.
 *
 *     utils.overwriteProperty(chai.Assertion.prototype, 'ok', function (_super) {
 *       return function () {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.name).to.equal('bar');
 *         } else {
 *           _super.call(this);
 *         }
 *       }
 *     });
 *
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteProperty('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.be.ok;
 *
 * @param {Object} ctx object whose property is to be overwritten
 * @param {String} name of property to overwrite
 * @param {Function} getter function that returns a getter function to be used for name
 * @name overwriteProperty
 * @api public
 */

module.exports = function (ctx, name, getter) {
  var _get = Object.getOwnPropertyDescriptor(ctx, name)
    , _super = function () {};

  if (_get && 'function' === typeof _get.get)
    _super = _get.get

  Object.defineProperty(ctx, name,
    { get: function () {
        var result = getter(_super).call(this);
        return result === undefined ? this : result;
      }
    , configurable: true
  });
};

},{}],31:[function(require,module,exports){
/*!
 * Chai - test utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var flag = require('./flag');

/**
 * # test(object, expression)
 *
 * Test and object for expression.
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 */

module.exports = function (obj, args) {
  var negate = flag(obj, 'negate')
    , expr = args[0];
  return negate ? !expr : expr;
};

},{"./flag":16}],32:[function(require,module,exports){
/*!
 * Chai - transferFlags utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### transferFlags(assertion, object, includeAll = true)
 *
 * Transfer all the flags for `assertion` to `object`. If
 * `includeAll` is set to `false`, then the base Chai
 * assertion flags (namely `object`, `ssfi`, and `message`)
 * will not be transferred.
 *
 *
 *     var newAssertion = new Assertion();
 *     utils.transferFlags(assertion, newAssertion);
 *
 *     var anotherAsseriton = new Assertion(myObj);
 *     utils.transferFlags(assertion, anotherAssertion, false);
 *
 * @param {Assertion} assertion the assertion to transfer the flags from
 * @param {Object} object the object to transfer the flags to; usually a new assertion
 * @param {Boolean} includeAll
 * @name transferFlags
 * @api private
 */

module.exports = function (assertion, object, includeAll) {
  var flags = assertion.__flags || (assertion.__flags = Object.create(null));

  if (!object.__flags) {
    object.__flags = Object.create(null);
  }

  includeAll = arguments.length === 3 ? includeAll : true;

  for (var flag in flags) {
    if (includeAll ||
        (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {
      object.__flags[flag] = flags[flag];
    }
  }
};

},{}],33:[function(require,module,exports){
/*!
 * Chai - type utility
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Detectable javascript natives
 */

var natives = {
    '[object Arguments]': 'arguments'
  , '[object Array]': 'array'
  , '[object Date]': 'date'
  , '[object Function]': 'function'
  , '[object Number]': 'number'
  , '[object RegExp]': 'regexp'
  , '[object String]': 'string'
};

/**
 * ### type(object)
 *
 * Better implementation of `typeof` detection that can
 * be used cross-browser. Handles the inconsistencies of
 * Array, `null`, and `undefined` detection.
 *
 *     utils.type({}) // 'object'
 *     utils.type(null) // `null'
 *     utils.type(undefined) // `undefined`
 *     utils.type([]) // `array`
 *
 * @param {Mixed} object to detect type of
 * @name type
 * @api private
 */

module.exports = function (obj) {
  var str = Object.prototype.toString.call(obj);
  if (natives[str]) return natives[str];
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (obj === Object(obj)) return 'object';
  return typeof obj;
};

},{}],34:[function(require,module,exports){
module.exports = require('./lib/eql');

},{"./lib/eql":35}],35:[function(require,module,exports){
/*!
 * deep-eql
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var type = require('type-detect');

/*!
 * Buffer.isBuffer browser shim
 */

var Buffer;
try { Buffer = require('buffer').Buffer; }
catch(ex) {
  Buffer = {};
  Buffer.isBuffer = function() { return false; }
}

/*!
 * Primary Export
 */

module.exports = deepEqual;

/**
 * Assert super-strict (egal) equality between
 * two objects of any type.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @param {Array} memoised (optional)
 * @return {Boolean} equal match
 */

function deepEqual(a, b, m) {
  if (sameValue(a, b)) {
    return true;
  } else if ('date' === type(a)) {
    return dateEqual(a, b);
  } else if ('regexp' === type(a)) {
    return regexpEqual(a, b);
  } else if (Buffer.isBuffer(a)) {
    return bufferEqual(a, b);
  } else if ('arguments' === type(a)) {
    return argumentsEqual(a, b, m);
  } else if (!typeEqual(a, b)) {
    return false;
  } else if (('object' !== type(a) && 'object' !== type(b))
  && ('array' !== type(a) && 'array' !== type(b))) {
    return sameValue(a, b);
  } else {
    return objectEqual(a, b, m);
  }
}

/*!
 * Strict (egal) equality test. Ensures that NaN always
 * equals NaN and `-0` does not equal `+0`.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} equal match
 */

function sameValue(a, b) {
  if (a === b) return a !== 0 || 1 / a === 1 / b;
  return a !== a && b !== b;
}

/*!
 * Compare the types of two given objects and
 * return if they are equal. Note that an Array
 * has a type of `array` (not `object`) and arguments
 * have a type of `arguments` (not `array`/`object`).
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function typeEqual(a, b) {
  return type(a) === type(b);
}

/*!
 * Compare two Date objects by asserting that
 * the time values are equal using `saveValue`.
 *
 * @param {Date} a
 * @param {Date} b
 * @return {Boolean} result
 */

function dateEqual(a, b) {
  if ('date' !== type(b)) return false;
  return sameValue(a.getTime(), b.getTime());
}

/*!
 * Compare two regular expressions by converting them
 * to string and checking for `sameValue`.
 *
 * @param {RegExp} a
 * @param {RegExp} b
 * @return {Boolean} result
 */

function regexpEqual(a, b) {
  if ('regexp' !== type(b)) return false;
  return sameValue(a.toString(), b.toString());
}

/*!
 * Assert deep equality of two `arguments` objects.
 * Unfortunately, these must be sliced to arrays
 * prior to test to ensure no bad behavior.
 *
 * @param {Arguments} a
 * @param {Arguments} b
 * @param {Array} memoize (optional)
 * @return {Boolean} result
 */

function argumentsEqual(a, b, m) {
  if ('arguments' !== type(b)) return false;
  a = [].slice.call(a);
  b = [].slice.call(b);
  return deepEqual(a, b, m);
}

/*!
 * Get enumerable properties of a given object.
 *
 * @param {Object} a
 * @return {Array} property names
 */

function enumerable(a) {
  var res = [];
  for (var key in a) res.push(key);
  return res;
}

/*!
 * Simple equality for flat iterable objects
 * such as Arrays or Node.js buffers.
 *
 * @param {Iterable} a
 * @param {Iterable} b
 * @return {Boolean} result
 */

function iterableEqual(a, b) {
  if (a.length !==  b.length) return false;

  var i = 0;
  var match = true;

  for (; i < a.length; i++) {
    if (a[i] !== b[i]) {
      match = false;
      break;
    }
  }

  return match;
}

/*!
 * Extension to `iterableEqual` specifically
 * for Node.js Buffers.
 *
 * @param {Buffer} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function bufferEqual(a, b) {
  if (!Buffer.isBuffer(b)) return false;
  return iterableEqual(a, b);
}

/*!
 * Block for `objectEqual` ensuring non-existing
 * values don't get in.
 *
 * @param {Mixed} object
 * @return {Boolean} result
 */

function isValue(a) {
  return a !== null && a !== undefined;
}

/*!
 * Recursively check the equality of two objects.
 * Once basic sameness has been established it will
 * defer to `deepEqual` for each enumerable key
 * in the object.
 *
 * @param {Mixed} a
 * @param {Mixed} b
 * @return {Boolean} result
 */

function objectEqual(a, b, m) {
  if (!isValue(a) || !isValue(b)) {
    return false;
  }

  if (a.prototype !== b.prototype) {
    return false;
  }

  var i;
  if (m) {
    for (i = 0; i < m.length; i++) {
      if ((m[i][0] === a && m[i][1] === b)
      ||  (m[i][0] === b && m[i][1] === a)) {
        return true;
      }
    }
  } else {
    m = [];
  }

  try {
    var ka = enumerable(a);
    var kb = enumerable(b);
  } catch (ex) {
    return false;
  }

  ka.sort();
  kb.sort();

  if (!iterableEqual(ka, kb)) {
    return false;
  }

  m.push([ a, b ]);

  var key;
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], m)) {
      return false;
    }
  }

  return true;
}

},{"buffer":3,"type-detect":56}],36:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],37:[function(require,module,exports){
"use strict";

var arrays  = require("../utils/arrays"),
    visitor = require("./visitor");

/* AST utilities. */
var asts = {
  findRule: function(ast, name) {
    return arrays.find(ast.rules, function(r) { return r.name === name; });
  },

  indexOfRule: function(ast, name) {
    return arrays.indexOf(ast.rules, function(r) { return r.name === name; });
  },

  alwaysConsumesOnSuccess: function(ast, node) {
    function consumesTrue()  { return true;  }
    function consumesFalse() { return false; }

    function consumesExpression(node) {
      return consumes(node.expression);
    }

    var consumes = visitor.build({
      rule:  consumesExpression,
      named: consumesExpression,

      choice: function(node) {
        return arrays.every(node.alternatives, consumes);
      },

      action: consumesExpression,

      sequence: function(node) {
        return arrays.some(node.elements, consumes);
      },

      labeled:      consumesExpression,
      text:         consumesExpression,
      simple_and:   consumesFalse,
      simple_not:   consumesFalse,
      optional:     consumesFalse,
      zero_or_more: consumesFalse,
      one_or_more:  consumesExpression,
      group:        consumesExpression,
      semantic_and: consumesFalse,
      semantic_not: consumesFalse,

      rule_ref: function(node) {
        return consumes(asts.findRule(ast, node.name));
      },

      literal: function(node) {
        return node.value !== "";
      },

      "class": consumesTrue,
      any:     consumesTrue
    });

    return consumes(node);
  }
};

module.exports = asts;

},{"../utils/arrays":53,"./visitor":49}],38:[function(require,module,exports){
"use strict";

var arrays  = require("../utils/arrays"),
    objects = require("../utils/objects");

var compiler = {
  /*
   * AST node visitor builder. Useful mainly for plugins which manipulate the
   * AST.
   */
  visitor: require("./visitor"),

  /*
   * Compiler passes.
   *
   * Each pass is a function that is passed the AST. It can perform checks on it
   * or modify it as needed. If the pass encounters a semantic error, it throws
   * |peg.GrammarError|.
   */
  passes: {
    check: {
      reportUndefinedRules:     require("./passes/report-undefined-rules"),
      reportDuplicateRules:     require("./passes/report-duplicate-rules"),
      reportDuplicateLabels:    require("./passes/report-duplicate-labels"),
      reportInfiniteRecursion:  require("./passes/report-infinite-recursion"),
      reportInfiniteRepetition: require("./passes/report-infinite-repetition")
    },
    transform: {
      removeProxyRules:         require("./passes/remove-proxy-rules")
    },
    generate: {
      generateBytecode:         require("./passes/generate-bytecode"),
      generateJS:               require("./passes/generate-js")
    }
  },

  /*
   * Generates a parser from a specified grammar AST. Throws |peg.GrammarError|
   * if the AST contains a semantic error. Note that not all errors are detected
   * during the generation and some may protrude to the generated parser and
   * cause its malfunction.
   */
  compile: function(ast, passes, options) {
    options = options !== void 0 ? options : {};

    var stage;

    options = objects.clone(options);
    objects.defaults(options, {
      allowedStartRules: [ast.rules[0].name],
      cache:             false,
      dependencies:      {},
      exportVar:         null,
      format:            "bare",
      optimize:          "speed",
      output:            "parser",
      trace:             false
    });

    for (stage in passes) {
      if (passes.hasOwnProperty(stage)) {
        arrays.each(passes[stage], function(p) { p(ast, options); });
      }
    }

    switch (options.output) {
      case "parser": return eval(ast.code);
      case "source": return ast.code;
    }
  }
};

module.exports = compiler;

},{"../utils/arrays":53,"../utils/objects":55,"./passes/generate-bytecode":41,"./passes/generate-js":42,"./passes/remove-proxy-rules":43,"./passes/report-duplicate-labels":44,"./passes/report-duplicate-rules":45,"./passes/report-infinite-recursion":46,"./passes/report-infinite-repetition":47,"./passes/report-undefined-rules":48,"./visitor":49}],39:[function(require,module,exports){
"use strict";

function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

/* JavaScript code generation helpers. */
var js = {
  stringEscape: function(s) {
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a string
     * literal except for the closing quote character, backslash, carriage
     * return, line separator, paragraph separator, and line feed. Any character
     * may appear in the form of an escape sequence.
     *
     * For portability, we also escape all control and non-ASCII characters.
     * Note that the "\v" escape sequence is not used because IE does not like
     * it.
     */
    return s
      .replace(/\\/g,   '\\\\')   // backslash
      .replace(/"/g,    '\\"')    // closing double quote
      .replace(/\0/g,   '\\0')    // null
      .replace(/\x08/g, '\\b')    // backspace
      .replace(/\t/g,   '\\t')    // horizontal tab
      .replace(/\n/g,   '\\n')    // line feed
      .replace(/\f/g,   '\\f')    // form feed
      .replace(/\r/g,   '\\r')    // carriage return
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\xFF]/g, function(ch) { return '\\x'  + hex(ch); })
      .replace(/[\u0100-\u0FFF]/g,      function(ch) { return '\\u0' + hex(ch); })
      .replace(/[\u1000-\uFFFF]/g,      function(ch) { return '\\u'  + hex(ch); });
  },

  regexpClassEscape: function(s) {
    /*
     * Based on ECMA-262, 5th ed., 7.8.5 & 15.10.1.
     *
     * For portability, we also escape all control and non-ASCII characters.
     */
    return s
      .replace(/\\/g, '\\\\')    // backslash
      .replace(/\//g, '\\/')     // closing slash
      .replace(/\]/g, '\\]')     // closing bracket
      .replace(/\^/g, '\\^')     // caret
      .replace(/-/g,  '\\-')     // dash
      .replace(/\0/g, '\\0')     // null
      .replace(/\t/g, '\\t')     // horizontal tab
      .replace(/\n/g, '\\n')     // line feed
      .replace(/\v/g, '\\x0B')   // vertical tab
      .replace(/\f/g, '\\f')     // form feed
      .replace(/\r/g, '\\r')     // carriage return
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\xFF]/g, function(ch) { return '\\x'  + hex(ch); })
      .replace(/[\u0100-\u0FFF]/g,      function(ch) { return '\\u0' + hex(ch); })
      .replace(/[\u1000-\uFFFF]/g,      function(ch) { return '\\u'  + hex(ch); });
  }
};

module.exports = js;

},{}],40:[function(require,module,exports){
"use strict";

/* Bytecode instruction opcodes. */
var opcodes = {
  /* Stack Manipulation */

  PUSH:             0,    // PUSH c
  PUSH_UNDEFINED:   1,    // PUSH_UNDEFINED
  PUSH_NULL:        2,    // PUSH_NULL
  PUSH_FAILED:      3,    // PUSH_FAILED
  PUSH_EMPTY_ARRAY: 4,    // PUSH_EMPTY_ARRAY
  PUSH_CURR_POS:    5,    // PUSH_CURR_POS
  POP:              6,    // POP
  POP_CURR_POS:     7,    // POP_CURR_POS
  POP_N:            8,    // POP_N n
  NIP:              9,    // NIP
  APPEND:           10,   // APPEND
  WRAP:             11,   // WRAP n
  TEXT:             12,   // TEXT

  /* Conditions and Loops */

  IF:               13,   // IF t, f
  IF_ERROR:         14,   // IF_ERROR t, f
  IF_NOT_ERROR:     15,   // IF_NOT_ERROR t, f
  WHILE_NOT_ERROR:  16,   // WHILE_NOT_ERROR b

  /* Matching */

  MATCH_ANY:        17,   // MATCH_ANY a, f, ...
  MATCH_STRING:     18,   // MATCH_STRING s, a, f, ...
  MATCH_STRING_IC:  19,   // MATCH_STRING_IC s, a, f, ...
  MATCH_REGEXP:     20,   // MATCH_REGEXP r, a, f, ...
  ACCEPT_N:         21,   // ACCEPT_N n
  ACCEPT_STRING:    22,   // ACCEPT_STRING s
  FAIL:             23,   // FAIL e

  /* Calls */

  LOAD_SAVED_POS:   24,   // LOAD_SAVED_POS p
  UPDATE_SAVED_POS: 25,   // UPDATE_SAVED_POS
  CALL:             26,   // CALL f, n, pc, p1, p2, ..., pN

  /* Rules */

  RULE:             27,   // RULE r

  /* Failure Reporting */

  SILENT_FAILS_ON:  28,   // SILENT_FAILS_ON
  SILENT_FAILS_OFF: 29    // SILENT_FAILS_OFF
};

module.exports = opcodes;

},{}],41:[function(require,module,exports){
"use strict";

var arrays  = require("../../utils/arrays"),
    objects = require("../../utils/objects"),
    asts    = require("../asts"),
    visitor = require("../visitor"),
    op      = require("../opcodes"),
    js      = require("../js");

/* Generates bytecode.
 *
 * Instructions
 * ============
 *
 * Stack Manipulation
 * ------------------
 *
 *  [0] PUSH c
 *
 *        stack.push(consts[c]);
 *
 *  [1] PUSH_UNDEFINED
 *
 *        stack.push(undefined);
 *
 *  [2] PUSH_NULL
 *
 *        stack.push(null);
 *
 *  [3] PUSH_FAILED
 *
 *        stack.push(FAILED);
 *
 *  [4] PUSH_EMPTY_ARRAY
 *
 *        stack.push([]);
 *
 *  [5] PUSH_CURR_POS
 *
 *        stack.push(currPos);
 *
 *  [6] POP
 *
 *        stack.pop();
 *
 *  [7] POP_CURR_POS
 *
 *        currPos = stack.pop();
 *
 *  [8] POP_N n
 *
 *        stack.pop(n);
 *
 *  [9] NIP
 *
 *        value = stack.pop();
 *        stack.pop();
 *        stack.push(value);
 *
 * [10] APPEND
 *
 *        value = stack.pop();
 *        array = stack.pop();
 *        array.push(value);
 *        stack.push(array);
 *
 * [11] WRAP n
 *
 *        stack.push(stack.pop(n));
 *
 * [12] TEXT
 *
 *        stack.push(input.substring(stack.pop(), currPos));
 *
 * Conditions and Loops
 * --------------------
 *
 * [13] IF t, f
 *
 *        if (stack.top()) {
 *          interpret(ip + 3, ip + 3 + t);
 *        } else {
 *          interpret(ip + 3 + t, ip + 3 + t + f);
 *        }
 *
 * [14] IF_ERROR t, f
 *
 *        if (stack.top() === FAILED) {
 *          interpret(ip + 3, ip + 3 + t);
 *        } else {
 *          interpret(ip + 3 + t, ip + 3 + t + f);
 *        }
 *
 * [15] IF_NOT_ERROR t, f
 *
 *        if (stack.top() !== FAILED) {
 *          interpret(ip + 3, ip + 3 + t);
 *        } else {
 *          interpret(ip + 3 + t, ip + 3 + t + f);
 *        }
 *
 * [16] WHILE_NOT_ERROR b
 *
 *        while(stack.top() !== FAILED) {
 *          interpret(ip + 2, ip + 2 + b);
 *        }
 *
 * Matching
 * --------
 *
 * [17] MATCH_ANY a, f, ...
 *
 *        if (input.length > currPos) {
 *          interpret(ip + 3, ip + 3 + a);
 *        } else {
 *          interpret(ip + 3 + a, ip + 3 + a + f);
 *        }
 *
 * [18] MATCH_STRING s, a, f, ...
 *
 *        if (input.substr(currPos, consts[s].length) === consts[s]) {
 *          interpret(ip + 4, ip + 4 + a);
 *        } else {
 *          interpret(ip + 4 + a, ip + 4 + a + f);
 *        }
 *
 * [19] MATCH_STRING_IC s, a, f, ...
 *
 *        if (input.substr(currPos, consts[s].length).toLowerCase() === consts[s]) {
 *          interpret(ip + 4, ip + 4 + a);
 *        } else {
 *          interpret(ip + 4 + a, ip + 4 + a + f);
 *        }
 *
 * [20] MATCH_REGEXP r, a, f, ...
 *
 *        if (consts[r].test(input.charAt(currPos))) {
 *          interpret(ip + 4, ip + 4 + a);
 *        } else {
 *          interpret(ip + 4 + a, ip + 4 + a + f);
 *        }
 *
 * [21] ACCEPT_N n
 *
 *        stack.push(input.substring(currPos, n));
 *        currPos += n;
 *
 * [22] ACCEPT_STRING s
 *
 *        stack.push(consts[s]);
 *        currPos += consts[s].length;
 *
 * [23] FAIL e
 *
 *        stack.push(FAILED);
 *        fail(consts[e]);
 *
 * Calls
 * -----
 *
 * [24] LOAD_SAVED_POS p
 *
 *        savedPos = stack[p];
 *
 * [25] UPDATE_SAVED_POS
 *
 *        savedPos = currPos;
 *
 * [26] CALL f, n, pc, p1, p2, ..., pN
 *
 *        value = consts[f](stack[p1], ..., stack[pN]);
 *        stack.pop(n);
 *        stack.push(value);
 *
 * Rules
 * -----
 *
 * [27] RULE r
 *
 *        stack.push(parseRule(r));
 *
 * Failure Reporting
 * -----------------
 *
 * [28] SILENT_FAILS_ON
 *
 *        silentFails++;
 *
 * [29] SILENT_FAILS_OFF
 *
 *        silentFails--;
 */
function generateBytecode(ast) {
  var consts = [];

  function addConst(value) {
    var index = arrays.indexOf(consts, value);

    return index === -1 ? consts.push(value) - 1 : index;
  }

  function addFunctionConst(params, code) {
    return addConst(
      "function(" + params.join(", ") + ") {" + code + "}"
    );
  }

  function buildSequence() {
    return Array.prototype.concat.apply([], arguments);
  }

  function buildCondition(condCode, thenCode, elseCode) {
    return condCode.concat(
      [thenCode.length, elseCode.length],
      thenCode,
      elseCode
    );
  }

  function buildLoop(condCode, bodyCode) {
    return condCode.concat([bodyCode.length], bodyCode);
  }

  function buildCall(functionIndex, delta, env, sp) {
    var params = arrays.map(objects.values(env), function(p) { return sp - p; });

    return [op.CALL, functionIndex, delta, params.length].concat(params);
  }

  function buildSimplePredicate(expression, negative, context) {
    return buildSequence(
      [op.PUSH_CURR_POS],
      [op.SILENT_FAILS_ON],
      generate(expression, {
        sp:     context.sp + 1,
        env:    objects.clone(context.env),
        action: null
      }),
      [op.SILENT_FAILS_OFF],
      buildCondition(
        [negative ? op.IF_ERROR : op.IF_NOT_ERROR],
        buildSequence(
          [op.POP],
          [negative ? op.POP : op.POP_CURR_POS],
          [op.PUSH_UNDEFINED]
        ),
        buildSequence(
          [op.POP],
          [negative ? op.POP_CURR_POS : op.POP],
          [op.PUSH_FAILED]
        )
      )
    );
  }

  function buildSemanticPredicate(code, negative, context) {
    var functionIndex = addFunctionConst(objects.keys(context.env), code);

    return buildSequence(
      [op.UPDATE_SAVED_POS],
      buildCall(functionIndex, 0, context.env, context.sp),
      buildCondition(
        [op.IF],
        buildSequence(
          [op.POP],
          negative ? [op.PUSH_FAILED] : [op.PUSH_UNDEFINED]
        ),
        buildSequence(
          [op.POP],
          negative ? [op.PUSH_UNDEFINED] : [op.PUSH_FAILED]
        )
      )
    );
  }

  function buildAppendLoop(expressionCode) {
    return buildLoop(
      [op.WHILE_NOT_ERROR],
      buildSequence([op.APPEND], expressionCode)
    );
  }

  var generate = visitor.build({
    grammar: function(node) {
      arrays.each(node.rules, generate);

      node.consts = consts;
    },

    rule: function(node) {
      node.bytecode = generate(node.expression, {
        sp:     -1,    // stack pointer
        env:    { },   // mapping of label names to stack positions
        action: null   // action nodes pass themselves to children here
      });
    },

    named: function(node, context) {
      var nameIndex = addConst(
        'peg$otherExpectation("' + js.stringEscape(node.name) + '")'
      );

      /*
       * The code generated below is slightly suboptimal because |FAIL| pushes
       * to the stack, so we need to stick a |POP| in front of it. We lack a
       * dedicated instruction that would just report the failure and not touch
       * the stack.
       */
      return buildSequence(
        [op.SILENT_FAILS_ON],
        generate(node.expression, context),
        [op.SILENT_FAILS_OFF],
        buildCondition([op.IF_ERROR], [op.FAIL, nameIndex], [])
      );
    },

    choice: function(node, context) {
      function buildAlternativesCode(alternatives, context) {
        return buildSequence(
          generate(alternatives[0], {
            sp:     context.sp,
            env:    objects.clone(context.env),
            action: null
          }),
          alternatives.length > 1
            ? buildCondition(
                [op.IF_ERROR],
                buildSequence(
                  [op.POP],
                  buildAlternativesCode(alternatives.slice(1), context)
                ),
                []
              )
            : []
        );
      }

      return buildAlternativesCode(node.alternatives, context);
    },

    action: function(node, context) {
      var env            = objects.clone(context.env),
          emitCall       = node.expression.type !== "sequence"
                        || node.expression.elements.length === 0,
          expressionCode = generate(node.expression, {
            sp:     context.sp + (emitCall ? 1 : 0),
            env:    env,
            action: node
          }),
          functionIndex  = addFunctionConst(objects.keys(env), node.code);

      return emitCall
        ? buildSequence(
            [op.PUSH_CURR_POS],
            expressionCode,
            buildCondition(
              [op.IF_NOT_ERROR],
              buildSequence(
                [op.LOAD_SAVED_POS, 1],
                buildCall(functionIndex, 1, env, context.sp + 2)
              ),
              []
            ),
            [op.NIP]
          )
        : expressionCode;
    },

    sequence: function(node, context) {
      function buildElementsCode(elements, context) {
        var processedCount, functionIndex;

        if (elements.length > 0) {
          processedCount = node.elements.length - elements.slice(1).length;

          return buildSequence(
            generate(elements[0], {
              sp:     context.sp,
              env:    context.env,
              action: null
            }),
            buildCondition(
              [op.IF_NOT_ERROR],
              buildElementsCode(elements.slice(1), {
                sp:     context.sp + 1,
                env:    context.env,
                action: context.action
              }),
              buildSequence(
                processedCount > 1 ? [op.POP_N, processedCount] : [op.POP],
                [op.POP_CURR_POS],
                [op.PUSH_FAILED]
              )
            )
          );
        } else {
          if (context.action) {
            functionIndex = addFunctionConst(
              objects.keys(context.env),
              context.action.code
            );

            return buildSequence(
              [op.LOAD_SAVED_POS, node.elements.length],
              buildCall(
                functionIndex,
                node.elements.length,
                context.env,
                context.sp
              ),
              [op.NIP]
            );
          } else {
            return buildSequence([op.WRAP, node.elements.length], [op.NIP]);
          }
        }
      }

      return buildSequence(
        [op.PUSH_CURR_POS],
        buildElementsCode(node.elements, {
          sp:     context.sp + 1,
          env:    context.env,
          action: context.action
        })
      );
    },

    labeled: function(node, context) {
      var env = objects.clone(context.env);

      context.env[node.label] = context.sp + 1;

      return generate(node.expression, {
        sp:     context.sp,
        env:    env,
        action: null
      });
    },

    text: function(node, context) {
      return buildSequence(
        [op.PUSH_CURR_POS],
        generate(node.expression, {
          sp:     context.sp + 1,
          env:    objects.clone(context.env),
          action: null
        }),
        buildCondition(
          [op.IF_NOT_ERROR],
          buildSequence([op.POP], [op.TEXT]),
          [op.NIP]
        )
      );
    },

    simple_and: function(node, context) {
      return buildSimplePredicate(node.expression, false, context);
    },

    simple_not: function(node, context) {
      return buildSimplePredicate(node.expression, true, context);
    },

    optional: function(node, context) {
      return buildSequence(
        generate(node.expression, {
          sp:     context.sp,
          env:    objects.clone(context.env),
          action: null
        }),
        buildCondition(
          [op.IF_ERROR],
          buildSequence([op.POP], [op.PUSH_NULL]),
          []
        )
      );
    },

    zero_or_more: function(node, context) {
      var expressionCode = generate(node.expression, {
            sp:     context.sp + 1,
            env:    objects.clone(context.env),
            action: null
          });

      return buildSequence(
        [op.PUSH_EMPTY_ARRAY],
        expressionCode,
        buildAppendLoop(expressionCode),
        [op.POP]
      );
    },

    one_or_more: function(node, context) {
      var expressionCode = generate(node.expression, {
            sp:     context.sp + 1,
            env:    objects.clone(context.env),
            action: null
          });

      return buildSequence(
        [op.PUSH_EMPTY_ARRAY],
        expressionCode,
        buildCondition(
          [op.IF_NOT_ERROR],
          buildSequence(buildAppendLoop(expressionCode), [op.POP]),
          buildSequence([op.POP], [op.POP], [op.PUSH_FAILED])
        )
      );
    },

    group: function(node, context) {
      return generate(node.expression, {
        sp:     context.sp,
        env:    objects.clone(context.env),
        action: null
      });
    },

    semantic_and: function(node, context) {
      return buildSemanticPredicate(node.code, false, context);
    },

    semantic_not: function(node, context) {
      return buildSemanticPredicate(node.code, true, context);
    },

    rule_ref: function(node) {
      return [op.RULE, asts.indexOfRule(ast, node.name)];
    },

    literal: function(node) {
      var stringIndex, expectedIndex;

      if (node.value.length > 0) {
        stringIndex = addConst('"'
          + js.stringEscape(
              node.ignoreCase ? node.value.toLowerCase() : node.value
            )
          + '"'
        );
        expectedIndex = addConst(
          'peg$literalExpectation('
            + '"' + js.stringEscape(node.value) + '", '
            + node.ignoreCase
            + ')'
        );

        /*
         * For case-sensitive strings the value must match the beginning of the
         * remaining input exactly. As a result, we can use |ACCEPT_STRING| and
         * save one |substr| call that would be needed if we used |ACCEPT_N|.
         */
        return buildCondition(
          node.ignoreCase
            ? [op.MATCH_STRING_IC, stringIndex]
            : [op.MATCH_STRING, stringIndex],
          node.ignoreCase
            ? [op.ACCEPT_N, node.value.length]
            : [op.ACCEPT_STRING, stringIndex],
          [op.FAIL, expectedIndex]
        );
      } else {
        stringIndex = addConst('""');

        return [op.PUSH, stringIndex];
      }
    },

    "class": function(node) {
      var regexp, parts, regexpIndex, expectedIndex;

      if (node.parts.length > 0) {
        regexp = '/^['
          + (node.inverted ? '^' : '')
          + arrays.map(node.parts, function(part) {
              return part instanceof Array
                ? js.regexpClassEscape(part[0])
                  + '-'
                  + js.regexpClassEscape(part[1])
                : js.regexpClassEscape(part);
            }).join('')
          + ']/' + (node.ignoreCase ? 'i' : '');
      } else {
        /*
         * IE considers regexps /[]/ and /[^]/ as syntactically invalid, so we
         * translate them into equivalents it can handle.
         */
        regexp = node.inverted ? '/^[\\S\\s]/' : '/^(?!)/';
      }

      parts = '['
        + arrays.map(node.parts, function(part) {
            return part instanceof Array
              ? '["' + js.stringEscape(part[0]) + '", "' + js.stringEscape(part[1]) + '"]'
              : '"' + js.stringEscape(part) + '"';
          }).join(', ')
        + ']';

      regexpIndex   = addConst(regexp);
      expectedIndex = addConst(
        'peg$classExpectation('
          + parts + ', '
          + node.inverted + ', '
          + node.ignoreCase
          + ')'
      );

      return buildCondition(
        [op.MATCH_REGEXP, regexpIndex],
        [op.ACCEPT_N, 1],
        [op.FAIL, expectedIndex]
      );
    },

    any: function() {
      var expectedIndex = addConst('peg$anyExpectation()');

      return buildCondition(
        [op.MATCH_ANY],
        [op.ACCEPT_N, 1],
        [op.FAIL, expectedIndex]
      );
    }
  });

  generate(ast);
}

module.exports = generateBytecode;

},{"../../utils/arrays":53,"../../utils/objects":55,"../asts":37,"../js":39,"../opcodes":40,"../visitor":49}],42:[function(require,module,exports){
"use strict";

var arrays  = require("../../utils/arrays"),
    objects = require("../../utils/objects"),
    asts    = require("../asts"),
    op      = require("../opcodes"),
    js      = require("../js");

/* Generates parser JavaScript code. */
function generateJS(ast, options) {
  /* These only indent non-empty lines to avoid trailing whitespace. */
  function indent2(code)  { return code.replace(/^(.+)$/gm, '  $1');         }
  function indent6(code)  { return code.replace(/^(.+)$/gm, '      $1');     }
  function indent10(code) { return code.replace(/^(.+)$/gm, '          $1'); }

  function generateTables() {
    if (options.optimize === "size") {
      return [
        'peg$consts = [',
           indent2(ast.consts.join(',\n')),
        '],',
        '',
        'peg$bytecode = [',
           indent2(arrays.map(ast.rules, function(rule) {
             return 'peg$decode("'
                   + js.stringEscape(arrays.map(
                       rule.bytecode,
                       function(b) { return String.fromCharCode(b + 32); }
                     ).join(''))
                   + '")';
           }).join(',\n')),
        '],'
      ].join('\n');
    } else {
      return arrays.map(
        ast.consts,
        function(c, i) { return 'peg$c' + i + ' = ' + c + ','; }
      ).join('\n');
    }
  }

  function generateRuleHeader(ruleNameCode, ruleIndexCode) {
    var parts = [];

    parts.push('');

    if (options.trace) {
      parts.push([
        'peg$tracer.trace({',
        '  type:     "rule.enter",',
        '  rule:     ' + ruleNameCode + ',',
        '  location: peg$computeLocation(startPos, startPos)',
        '});',
        ''
      ].join('\n'));
    }

    if (options.cache) {
      parts.push([
        'var key    = peg$currPos * ' + ast.rules.length + ' + ' + ruleIndexCode + ',',
        '    cached = peg$resultsCache[key];',
        '',
        'if (cached) {',
        '  peg$currPos = cached.nextPos;',
        ''
      ].join('\n'));

      if (options.trace) {
        parts.push([
          'if (cached.result !== peg$FAILED) {',
          '  peg$tracer.trace({',
          '    type:   "rule.match",',
          '    rule:   ' + ruleNameCode + ',',
          '    result: cached.result,',
          '    location: peg$computeLocation(startPos, peg$currPos)',
          '  });',
          '} else {',
          '  peg$tracer.trace({',
          '    type: "rule.fail",',
          '    rule: ' + ruleNameCode + ',',
          '    location: peg$computeLocation(startPos, startPos)',
          '  });',
          '}',
          ''
        ].join('\n'));
      }

      parts.push([
        '  return cached.result;',
        '}',
        ''
      ].join('\n'));
    }

    return parts.join('\n');
  }

  function generateRuleFooter(ruleNameCode, resultCode) {
    var parts = [];

    if (options.cache) {
      parts.push([
        '',
        'peg$resultsCache[key] = { nextPos: peg$currPos, result: ' + resultCode + ' };'
      ].join('\n'));
    }

    if (options.trace) {
      parts.push([
          '',
          'if (' + resultCode + ' !== peg$FAILED) {',
          '  peg$tracer.trace({',
          '    type:   "rule.match",',
          '    rule:   ' + ruleNameCode + ',',
          '    result: ' + resultCode + ',',
          '    location: peg$computeLocation(startPos, peg$currPos)',
          '  });',
          '} else {',
          '  peg$tracer.trace({',
          '    type: "rule.fail",',
          '    rule: ' + ruleNameCode + ',',
          '    location: peg$computeLocation(startPos, startPos)',
          '  });',
          '}'
      ].join('\n'));
    }

    parts.push([
      '',
      'return ' + resultCode + ';'
    ].join('\n'));

    return parts.join('\n');
  }

  function generateInterpreter() {
    var parts = [];

    function generateCondition(cond, argsLength) {
      var baseLength      = argsLength + 3,
          thenLengthCode = 'bc[ip + ' + (baseLength - 2) + ']',
          elseLengthCode = 'bc[ip + ' + (baseLength - 1) + ']';

      return [
        'ends.push(end);',
        'ips.push(ip + ' + baseLength + ' + ' + thenLengthCode + ' + ' + elseLengthCode + ');',
        '',
        'if (' + cond + ') {',
        '  end = ip + ' + baseLength + ' + ' + thenLengthCode + ';',
        '  ip += ' + baseLength + ';',
        '} else {',
        '  end = ip + ' + baseLength + ' + ' + thenLengthCode + ' + ' + elseLengthCode + ';',
        '  ip += ' + baseLength + ' + ' + thenLengthCode + ';',
        '}',
        '',
        'break;'
      ].join('\n');
    }

    function generateLoop(cond) {
      var baseLength     = 2,
          bodyLengthCode = 'bc[ip + ' + (baseLength - 1) + ']';

      return [
        'if (' + cond + ') {',
        '  ends.push(end);',
        '  ips.push(ip);',
        '',
        '  end = ip + ' + baseLength + ' + ' + bodyLengthCode + ';',
        '  ip += ' + baseLength + ';',
        '} else {',
        '  ip += ' + baseLength + ' + ' + bodyLengthCode + ';',
        '}',
        '',
        'break;'
      ].join('\n');
    }

    function generateCall() {
      var baseLength       = 4,
          paramsLengthCode = 'bc[ip + ' + (baseLength - 1) + ']';

      return [
        'params = bc.slice(ip + ' + baseLength + ', ip + ' + baseLength + ' + ' + paramsLengthCode + ');',
        'for (i = 0; i < ' + paramsLengthCode + '; i++) {',
        '  params[i] = stack[stack.length - 1 - params[i]];',
        '}',
        '',
        'stack.splice(',
        '  stack.length - bc[ip + 2],',
        '  bc[ip + 2],',
        '  peg$consts[bc[ip + 1]].apply(null, params)',
        ');',
        '',
        'ip += ' + baseLength + ' + ' + paramsLengthCode + ';',
        'break;'
      ].join('\n');
    }

    parts.push([
      'function peg$decode(s) {',
      '  var bc = new Array(s.length), i;',
      '',
      '  for (i = 0; i < s.length; i++) {',
      '    bc[i] = s.charCodeAt(i) - 32;',
      '  }',
      '',
      '  return bc;',
      '}',
      '',
      'function peg$parseRule(index) {'
    ].join('\n'));

    if (options.trace) {
      parts.push([
        '  var bc       = peg$bytecode[index],',
        '      ip       = 0,',
        '      ips      = [],',
        '      end      = bc.length,',
        '      ends     = [],',
        '      stack    = [],',
        '      startPos = peg$currPos,',
        '      params, i;'
      ].join('\n'));
    } else {
      parts.push([
        '  var bc    = peg$bytecode[index],',
        '      ip    = 0,',
        '      ips   = [],',
        '      end   = bc.length,',
        '      ends  = [],',
        '      stack = [],',
        '      params, i;'
      ].join('\n'));
    }

    parts.push(indent2(generateRuleHeader('peg$ruleNames[index]', 'index')));

    parts.push([
      /*
       * The point of the outer loop and the |ips| & |ends| stacks is to avoid
       * recursive calls for interpreting parts of bytecode. In other words, we
       * implement the |interpret| operation of the abstract machine without
       * function calls. Such calls would likely slow the parser down and more
       * importantly cause stack overflows for complex grammars.
       */
      '  while (true) {',
      '    while (ip < end) {',
      '      switch (bc[ip]) {',
      '        case ' + op.PUSH + ':',               // PUSH c
      '          stack.push(peg$consts[bc[ip + 1]]);',
      '          ip += 2;',
      '          break;',
      '',
      '        case ' + op.PUSH_UNDEFINED + ':',     // PUSH_UNDEFINED
      '          stack.push(void 0);',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.PUSH_NULL + ':',          // PUSH_NULL
      '          stack.push(null);',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.PUSH_FAILED + ':',        // PUSH_FAILED
      '          stack.push(peg$FAILED);',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.PUSH_EMPTY_ARRAY + ':',   // PUSH_EMPTY_ARRAY
      '          stack.push([]);',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.PUSH_CURR_POS + ':',      // PUSH_CURR_POS
      '          stack.push(peg$currPos);',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.POP + ':',                // POP
      '          stack.pop();',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.POP_CURR_POS + ':',       // POP_CURR_POS
      '          peg$currPos = stack.pop();',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.POP_N + ':',              // POP_N n
      '          stack.length -= bc[ip + 1];',
      '          ip += 2;',
      '          break;',
      '',
      '        case ' + op.NIP + ':',                // NIP
      '          stack.splice(-2, 1);',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.APPEND + ':',             // APPEND
      '          stack[stack.length - 2].push(stack.pop());',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.WRAP + ':',               // WRAP n
      '          stack.push(stack.splice(stack.length - bc[ip + 1], bc[ip + 1]));',
      '          ip += 2;',
      '          break;',
      '',
      '        case ' + op.TEXT + ':',               // TEXT
      '          stack.push(input.substring(stack.pop(), peg$currPos));',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.IF + ':',                 // IF t, f
                 indent10(generateCondition('stack[stack.length - 1]', 0)),
      '',
      '        case ' + op.IF_ERROR + ':',           // IF_ERROR t, f
                 indent10(generateCondition(
                   'stack[stack.length - 1] === peg$FAILED',
                   0
                 )),
      '',
      '        case ' + op.IF_NOT_ERROR + ':',       // IF_NOT_ERROR t, f
                 indent10(
                   generateCondition('stack[stack.length - 1] !== peg$FAILED',
                   0
                 )),
      '',
      '        case ' + op.WHILE_NOT_ERROR + ':',    // WHILE_NOT_ERROR b
                 indent10(generateLoop('stack[stack.length - 1] !== peg$FAILED')),
      '',
      '        case ' + op.MATCH_ANY + ':',          // MATCH_ANY a, f, ...
                 indent10(generateCondition('input.length > peg$currPos', 0)),
      '',
      '        case ' + op.MATCH_STRING + ':',       // MATCH_STRING s, a, f, ...
                 indent10(generateCondition(
                   'input.substr(peg$currPos, peg$consts[bc[ip + 1]].length) === peg$consts[bc[ip + 1]]',
                   1
                 )),
      '',
      '        case ' + op.MATCH_STRING_IC + ':',    // MATCH_STRING_IC s, a, f, ...
                 indent10(generateCondition(
                   'input.substr(peg$currPos, peg$consts[bc[ip + 1]].length).toLowerCase() === peg$consts[bc[ip + 1]]',
                   1
                 )),
      '',
      '        case ' + op.MATCH_REGEXP + ':',       // MATCH_REGEXP r, a, f, ...
                 indent10(generateCondition(
                   'peg$consts[bc[ip + 1]].test(input.charAt(peg$currPos))',
                   1
                 )),
      '',
      '        case ' + op.ACCEPT_N + ':',           // ACCEPT_N n
      '          stack.push(input.substr(peg$currPos, bc[ip + 1]));',
      '          peg$currPos += bc[ip + 1];',
      '          ip += 2;',
      '          break;',
      '',
      '        case ' + op.ACCEPT_STRING + ':',      // ACCEPT_STRING s
      '          stack.push(peg$consts[bc[ip + 1]]);',
      '          peg$currPos += peg$consts[bc[ip + 1]].length;',
      '          ip += 2;',
      '          break;',
      '',
      '        case ' + op.FAIL + ':',               // FAIL e
      '          stack.push(peg$FAILED);',
      '          if (peg$silentFails === 0) {',
      '            peg$fail(peg$consts[bc[ip + 1]]);',
      '          }',
      '          ip += 2;',
      '          break;',
      '',
      '        case ' + op.LOAD_SAVED_POS + ':',     // LOAD_SAVED_POS p
      '          peg$savedPos = stack[stack.length - 1 - bc[ip + 1]];',
      '          ip += 2;',
      '          break;',
      '',
      '        case ' + op.UPDATE_SAVED_POS + ':',   // UPDATE_SAVED_POS
      '          peg$savedPos = peg$currPos;',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.CALL + ':',               // CALL f, n, pc, p1, p2, ..., pN
                 indent10(generateCall()),
      '',
      '        case ' + op.RULE + ':',               // RULE r
      '          stack.push(peg$parseRule(bc[ip + 1]));',
      '          ip += 2;',
      '          break;',
      '',
      '        case ' + op.SILENT_FAILS_ON + ':',    // SILENT_FAILS_ON
      '          peg$silentFails++;',
      '          ip++;',
      '          break;',
      '',
      '        case ' + op.SILENT_FAILS_OFF + ':',   // SILENT_FAILS_OFF
      '          peg$silentFails--;',
      '          ip++;',
      '          break;',
      '',
      '        default:',
      '          throw new Error("Invalid opcode: " + bc[ip] + ".");',
      '      }',
      '    }',
      '',
      '    if (ends.length > 0) {',
      '      end = ends.pop();',
      '      ip = ips.pop();',
      '    } else {',
      '      break;',
      '    }',
      '  }'
    ].join('\n'));

    parts.push(indent2(generateRuleFooter('peg$ruleNames[index]', 'stack[0]')));
    parts.push('}');

    return parts.join('\n');
  }

  function generateRuleFunction(rule) {
    var parts = [], code;

    function c(i) { return "peg$c" + i; } // |consts[i]| of the abstract machine
    function s(i) { return "s"     + i; } // |stack[i]| of the abstract machine

    var stack = {
          sp:    -1,
          maxSp: -1,

          push: function(exprCode) {
            var code = s(++this.sp) + ' = ' + exprCode + ';';

            if (this.sp > this.maxSp) { this.maxSp = this.sp; }

            return code;
          },

          pop: function(n) {
            var values;

            if (n === void 0) {
              return s(this.sp--);
            } else {
              values = arrays.map(arrays.range(this.sp - n + 1, this.sp + 1), s);
              this.sp -= n;

              return values;
            }
          },

          top: function() {
            return s(this.sp);
          },

          index: function(i) {
            return s(this.sp - i);
          }
        };

    function compile(bc) {
      var ip    = 0,
          end   = bc.length,
          parts = [],
          value;

      function compileCondition(cond, argCount) {
        var baseLength = argCount + 3,
            thenLength = bc[ip + baseLength - 2],
            elseLength = bc[ip + baseLength - 1],
            baseSp     = stack.sp,
            thenCode, elseCode, thenSp, elseSp;

        ip += baseLength;
        thenCode = compile(bc.slice(ip, ip + thenLength));
        thenSp = stack.sp;
        ip += thenLength;

        if (elseLength > 0) {
          stack.sp = baseSp;
          elseCode = compile(bc.slice(ip, ip + elseLength));
          elseSp = stack.sp;
          ip += elseLength;

          if (thenSp !== elseSp) {
            throw new Error(
              "Branches of a condition must move the stack pointer in the same way."
            );
          }
        }

        parts.push('if (' + cond + ') {');
        parts.push(indent2(thenCode));
        if (elseLength > 0) {
          parts.push('} else {');
          parts.push(indent2(elseCode));
        }
        parts.push('}');
      }

      function compileLoop(cond) {
        var baseLength = 2,
            bodyLength = bc[ip + baseLength - 1],
            baseSp     = stack.sp,
            bodyCode, bodySp;

        ip += baseLength;
        bodyCode = compile(bc.slice(ip, ip + bodyLength));
        bodySp = stack.sp;
        ip += bodyLength;

        if (bodySp !== baseSp) {
          throw new Error("Body of a loop can't move the stack pointer.");
        }

        parts.push('while (' + cond + ') {');
        parts.push(indent2(bodyCode));
        parts.push('}');
      }

      function compileCall() {
        var baseLength   = 4,
            paramsLength = bc[ip + baseLength - 1];

        var value = c(bc[ip + 1]) + '('
              + arrays.map(
                  bc.slice(ip + baseLength, ip + baseLength + paramsLength),
                  function(p) { return stack.index(p); }
                ).join(', ')
              + ')';
        stack.pop(bc[ip + 2]);
        parts.push(stack.push(value));
        ip += baseLength + paramsLength;
      }

      while (ip < end) {
        switch (bc[ip]) {
          case op.PUSH:               // PUSH c
            parts.push(stack.push(c(bc[ip + 1])));
            ip += 2;
            break;

          case op.PUSH_CURR_POS:      // PUSH_CURR_POS
            parts.push(stack.push('peg$currPos'));
            ip++;
            break;

          case op.PUSH_UNDEFINED:      // PUSH_UNDEFINED
            parts.push(stack.push('void 0'));
            ip++;
            break;

          case op.PUSH_NULL:          // PUSH_NULL
            parts.push(stack.push('null'));
            ip++;
            break;

          case op.PUSH_FAILED:        // PUSH_FAILED
            parts.push(stack.push('peg$FAILED'));
            ip++;
            break;

          case op.PUSH_EMPTY_ARRAY:   // PUSH_EMPTY_ARRAY
            parts.push(stack.push('[]'));
            ip++;
            break;

          case op.POP:                // POP
            stack.pop();
            ip++;
            break;

          case op.POP_CURR_POS:       // POP_CURR_POS
            parts.push('peg$currPos = ' + stack.pop() + ';');
            ip++;
            break;

          case op.POP_N:              // POP_N n
            stack.pop(bc[ip + 1]);
            ip += 2;
            break;

          case op.NIP:                // NIP
            value = stack.pop();
            stack.pop();
            parts.push(stack.push(value));
            ip++;
            break;

          case op.APPEND:             // APPEND
            value = stack.pop();
            parts.push(stack.top() + '.push(' + value + ');');
            ip++;
            break;

          case op.WRAP:               // WRAP n
            parts.push(
              stack.push('[' + stack.pop(bc[ip + 1]).join(', ') + ']')
            );
            ip += 2;
            break;

          case op.TEXT:               // TEXT
            parts.push(
              stack.push('input.substring(' + stack.pop() + ', peg$currPos)')
            );
            ip++;
            break;

          case op.IF:                 // IF t, f
            compileCondition(stack.top(), 0);
            break;

          case op.IF_ERROR:           // IF_ERROR t, f
            compileCondition(stack.top() + ' === peg$FAILED', 0);
            break;

          case op.IF_NOT_ERROR:       // IF_NOT_ERROR t, f
            compileCondition(stack.top() + ' !== peg$FAILED', 0);
            break;

          case op.WHILE_NOT_ERROR:    // WHILE_NOT_ERROR b
            compileLoop(stack.top() + ' !== peg$FAILED', 0);
            break;

          case op.MATCH_ANY:          // MATCH_ANY a, f, ...
            compileCondition('input.length > peg$currPos', 0);
            break;

          case op.MATCH_STRING:       // MATCH_STRING s, a, f, ...
            compileCondition(
              eval(ast.consts[bc[ip + 1]]).length > 1
                ? 'input.substr(peg$currPos, '
                    + eval(ast.consts[bc[ip + 1]]).length
                    + ') === '
                    + c(bc[ip + 1])
                : 'input.charCodeAt(peg$currPos) === '
                    + eval(ast.consts[bc[ip + 1]]).charCodeAt(0),
              1
            );
            break;

          case op.MATCH_STRING_IC:    // MATCH_STRING_IC s, a, f, ...
            compileCondition(
              'input.substr(peg$currPos, '
                + eval(ast.consts[bc[ip + 1]]).length
                + ').toLowerCase() === '
                + c(bc[ip + 1]),
              1
            );
            break;

          case op.MATCH_REGEXP:       // MATCH_REGEXP r, a, f, ...
            compileCondition(
              c(bc[ip + 1]) + '.test(input.charAt(peg$currPos))',
              1
            );
            break;

          case op.ACCEPT_N:           // ACCEPT_N n
            parts.push(stack.push(
              bc[ip + 1] > 1
                ? 'input.substr(peg$currPos, ' + bc[ip + 1] + ')'
                : 'input.charAt(peg$currPos)'
            ));
            parts.push(
              bc[ip + 1] > 1
                ? 'peg$currPos += ' + bc[ip + 1] + ';'
                : 'peg$currPos++;'
            );
            ip += 2;
            break;

          case op.ACCEPT_STRING:      // ACCEPT_STRING s
            parts.push(stack.push(c(bc[ip + 1])));
            parts.push(
              eval(ast.consts[bc[ip + 1]]).length > 1
                ? 'peg$currPos += ' + eval(ast.consts[bc[ip + 1]]).length + ';'
                : 'peg$currPos++;'
            );
            ip += 2;
            break;

          case op.FAIL:               // FAIL e
            parts.push(stack.push('peg$FAILED'));
            parts.push('if (peg$silentFails === 0) { peg$fail(' + c(bc[ip + 1]) + '); }');
            ip += 2;
            break;

          case op.LOAD_SAVED_POS:     // LOAD_SAVED_POS p
            parts.push('peg$savedPos = ' + stack.index(bc[ip + 1]) + ';');
            ip += 2;
            break;

          case op.UPDATE_SAVED_POS:   // UPDATE_SAVED_POS
            parts.push('peg$savedPos = peg$currPos;');
            ip++;
            break;

          case op.CALL:               // CALL f, n, pc, p1, p2, ..., pN
            compileCall();
            break;

          case op.RULE:               // RULE r
            parts.push(stack.push("peg$parse" + ast.rules[bc[ip + 1]].name + "()"));
            ip += 2;
            break;

          case op.SILENT_FAILS_ON:    // SILENT_FAILS_ON
            parts.push('peg$silentFails++;');
            ip++;
            break;

          case op.SILENT_FAILS_OFF:   // SILENT_FAILS_OFF
            parts.push('peg$silentFails--;');
            ip++;
            break;

          default:
            throw new Error("Invalid opcode: " + bc[ip] + ".");
        }
      }

      return parts.join('\n');
    }

    code = compile(rule.bytecode);

    parts.push('function peg$parse' + rule.name + '() {');

    if (options.trace) {
      parts.push([
        '  var ' + arrays.map(arrays.range(0, stack.maxSp + 1), s).join(', ') + ',',
        '      startPos = peg$currPos;'
      ].join('\n'));
    } else {
      parts.push(
        '  var ' + arrays.map(arrays.range(0, stack.maxSp + 1), s).join(', ') + ';'
      );
    }

    parts.push(indent2(generateRuleHeader(
      '"' + js.stringEscape(rule.name) + '"',
      asts.indexOfRule(ast, rule.name)
    )));
    parts.push(indent2(code));
    parts.push(indent2(generateRuleFooter(
      '"' + js.stringEscape(rule.name) + '"',
      s(0)
    )));

    parts.push('}');

    return parts.join('\n');
  }

  function generateToplevel() {
    var parts = [],
        startRuleIndices,   startRuleIndex,
        startRuleFunctions, startRuleFunction,
        ruleNames;

    parts.push([
      'function peg$subclass(child, parent) {',
      '  function ctor() { this.constructor = child; }',
      '  ctor.prototype = parent.prototype;',
      '  child.prototype = new ctor();',
      '}',
      '',
      'function peg$SyntaxError(message, expected, found, location) {',
      '  this.message  = message;',
      '  this.expected = expected;',
      '  this.found    = found;',
      '  this.location = location;',
      '  this.name     = "SyntaxError";',
      '',
      '  if (typeof Error.captureStackTrace === "function") {',
      '    Error.captureStackTrace(this, peg$SyntaxError);',
      '  }',
      '}',
      '',
      'peg$subclass(peg$SyntaxError, Error);',
      '',
      'peg$SyntaxError.buildMessage = function(expected, found) {',
      '  var DESCRIBE_EXPECTATION_FNS = {',
      '        literal: function(expectation) {',
      '          return "\\\"" + literalEscape(expectation.text) + "\\\"";',
      '        },',
      '',
      '        "class": function(expectation) {',
      '          var escapedParts = "",',
      '              i;',
      '',
      '          for (i = 0; i < expectation.parts.length; i++) {',
      '            escapedParts += expectation.parts[i] instanceof Array',
      '              ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])',
      '              : classEscape(expectation.parts[i]);',
      '          }',
      '',
      '          return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";',
      '        },',
      '',
      '        any: function(expectation) {',
      '          return "any character";',
      '        },',
      '',
      '        end: function(expectation) {',
      '          return "end of input";',
      '        },',
      '',
      '        other: function(expectation) {',
      '          return expectation.description;',
      '        }',
      '      };',
      '',
      '  function hex(ch) {',
      '    return ch.charCodeAt(0).toString(16).toUpperCase();',
      '  }',
      '',
      '  function literalEscape(s) {',
      '    return s',
      '      .replace(/\\\\/g, \'\\\\\\\\\')',   // backslash
      '      .replace(/"/g,  \'\\\\"\')',        // closing double quote
      '      .replace(/\\0/g, \'\\\\0\')',       // null
      '      .replace(/\\t/g, \'\\\\t\')',       // horizontal tab
      '      .replace(/\\n/g, \'\\\\n\')',       // line feed
      '      .replace(/\\r/g, \'\\\\r\')',       // carriage return
      '      .replace(/[\\x00-\\x0F]/g,          function(ch) { return \'\\\\x0\' + hex(ch); })',
      '      .replace(/[\\x10-\\x1F\\x7F-\\x9F]/g, function(ch) { return \'\\\\x\'  + hex(ch); });',
      '  }',
      '',
      '  function classEscape(s) {',
      '    return s',
      '      .replace(/\\\\/g, \'\\\\\\\\\')',   // backslash
      '      .replace(/\\]/g, \'\\\\]\')',       // closing bracket
      '      .replace(/\\^/g, \'\\\\^\')',       // caret
      '      .replace(/-/g,  \'\\\\-\')',        // dash
      '      .replace(/\\0/g, \'\\\\0\')',       // null
      '      .replace(/\\t/g, \'\\\\t\')',       // horizontal tab
      '      .replace(/\\n/g, \'\\\\n\')',       // line feed
      '      .replace(/\\r/g, \'\\\\r\')',       // carriage return
      '      .replace(/[\\x00-\\x0F]/g,          function(ch) { return \'\\\\x0\' + hex(ch); })',
      '      .replace(/[\\x10-\\x1F\\x7F-\\x9F]/g, function(ch) { return \'\\\\x\'  + hex(ch); });',
      '  }',
      '',
      '  function describeExpectation(expectation) {',
      '    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);',
      '  }',
      '',
      '  function describeExpected(expected) {',
      '    var descriptions = new Array(expected.length),',
      '        i, j;',
      '',
      '    for (i = 0; i < expected.length; i++) {',
      '      descriptions[i] = describeExpectation(expected[i]);',
      '    }',
      '',
      '    descriptions.sort();',
      '',
      '    if (descriptions.length > 0) {',
      '      for (i = 1, j = 1; i < descriptions.length; i++) {',
      '        if (descriptions[i - 1] !== descriptions[i]) {',
      '          descriptions[j] = descriptions[i];',
      '          j++;',
      '        }',
      '      }',
      '      descriptions.length = j;',
      '    }',
      '',
      '    switch (descriptions.length) {',
      '      case 1:',
      '        return descriptions[0];',
      '',
      '      case 2:',
      '        return descriptions[0] + " or " + descriptions[1];',
      '',
      '      default:',
      '        return descriptions.slice(0, -1).join(", ")',
      '          + ", or "',
      '          + descriptions[descriptions.length - 1];',
      '    }',
      '  }',
      '',
      '  function describeFound(found) {',
      '    return found ? "\\"" + literalEscape(found) + "\\"" : "end of input";',
      '  }',
      '',
      '  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";',
      '};',
      ''
    ].join('\n'));

    if (options.trace) {
      parts.push([
        'function peg$DefaultTracer() {',
        '  this.indentLevel = 0;',
        '}',
        '',
        'peg$DefaultTracer.prototype.trace = function(event) {',
        '  var that = this;',
        '',
        '  function log(event) {',
        '    function repeat(string, n) {',
        '       var result = "", i;',
        '',
        '       for (i = 0; i < n; i++) {',
        '         result += string;',
        '       }',
        '',
        '       return result;',
        '    }',
        '',
        '    function pad(string, length) {',
        '      return string + repeat(" ", length - string.length);',
        '    }',
        '',
        '    if (typeof console === "object") {',   // IE 8-10
        '      console.log(',
        '        event.location.start.line + ":" + event.location.start.column + "-"',
        '          + event.location.end.line + ":" + event.location.end.column + " "',
        '          + pad(event.type, 10) + " "',
        '          + repeat("  ", that.indentLevel) + event.rule',
        '      );',
        '    }',
        '  }',
        '',
        '  switch (event.type) {',
        '    case "rule.enter":',
        '      log(event);',
        '      this.indentLevel++;',
        '      break;',
        '',
        '    case "rule.match":',
        '      this.indentLevel--;',
        '      log(event);',
        '      break;',
        '',
        '    case "rule.fail":',
        '      this.indentLevel--;',
        '      log(event);',
        '      break;',
        '',
        '    default:',
        '      throw new Error("Invalid event type: " + event.type + ".");',
        '  }',
        '};',
        ''
      ].join('\n'));
    }

    parts.push([
      'function peg$parse(input, options) {',
      '  options = options !== void 0 ? options : {};',
      '',
      '  var peg$FAILED = {},',
      ''
    ].join('\n'));

    if (options.optimize === "size") {
      startRuleIndices = '{ '
                       + arrays.map(
                           options.allowedStartRules,
                           function(r) { return r + ': ' + asts.indexOfRule(ast, r); }
                         ).join(', ')
                       + ' }';
      startRuleIndex = asts.indexOfRule(ast, options.allowedStartRules[0]);

      parts.push([
        '      peg$startRuleIndices = ' + startRuleIndices + ',',
        '      peg$startRuleIndex   = ' + startRuleIndex + ','
      ].join('\n'));
    } else {
      startRuleFunctions = '{ '
                       + arrays.map(
                           options.allowedStartRules,
                           function(r) { return r + ': peg$parse' + r; }
                         ).join(', ')
                       + ' }';
      startRuleFunction = 'peg$parse' + options.allowedStartRules[0];

      parts.push([
        '      peg$startRuleFunctions = ' + startRuleFunctions + ',',
        '      peg$startRuleFunction  = ' + startRuleFunction + ','
      ].join('\n'));
    }

    parts.push('');

    parts.push(indent6(generateTables()));

    parts.push([
      '',
      '      peg$currPos          = 0,',
      '      peg$savedPos         = 0,',
      '      peg$posDetailsCache  = [{ line: 1, column: 1 }],',
      '      peg$maxFailPos       = 0,',
      '      peg$maxFailExpected  = [],',
      '      peg$silentFails      = 0,',   // 0 = report failures, > 0 = silence failures
      ''
    ].join('\n'));

    if (options.cache) {
      parts.push([
        '      peg$resultsCache = {},',
        ''
      ].join('\n'));
    }

    if (options.trace) {
      if (options.optimize === "size") {
        ruleNames = '['
                  + arrays.map(
                      ast.rules,
                      function(r) { return '"' + js.stringEscape(r.name) + '"'; }
                    ).join(', ')
                  + ']';

        parts.push([
          '      peg$ruleNames = ' + ruleNames + ',',
          ''
        ].join('\n'));
      }

      parts.push([
        '      peg$tracer = "tracer" in options ? options.tracer : new peg$DefaultTracer(),',
        ''
      ].join('\n'));
    }

    parts.push([
      '      peg$result;',
      ''
    ].join('\n'));

    if (options.optimize === "size") {
      parts.push([
        '  if ("startRule" in options) {',
        '    if (!(options.startRule in peg$startRuleIndices)) {',
        '      throw new Error("Can\'t start parsing from rule \\"" + options.startRule + "\\".");',
        '    }',
        '',
        '    peg$startRuleIndex = peg$startRuleIndices[options.startRule];',
        '  }'
      ].join('\n'));
    } else {
      parts.push([
        '  if ("startRule" in options) {',
        '    if (!(options.startRule in peg$startRuleFunctions)) {',
        '      throw new Error("Can\'t start parsing from rule \\"" + options.startRule + "\\".");',
        '    }',
        '',
        '    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];',
        '  }'
      ].join('\n'));
    }

    parts.push([
      '',
      '  function text() {',
      '    return input.substring(peg$savedPos, peg$currPos);',
      '  }',
      '',
      '  function location() {',
      '    return peg$computeLocation(peg$savedPos, peg$currPos);',
      '  }',
      '',
      '  function expected(description, location) {',
      '    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)',
      '',
      '    throw peg$buildStructuredError(',
      '      [peg$otherExpectation(description)],',
      '      input.substring(peg$savedPos, peg$currPos),',
      '      location',
      '    );',
      '  }',
      '',
      '  function error(message, location) {',
      '    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)',
      '',
      '    throw peg$buildSimpleError(message, location);',
      '  }',
      '',
      '  function peg$literalExpectation(text, ignoreCase) {',
      '    return { type: "literal", text: text, ignoreCase: ignoreCase };',
      '  }',
      '',
      '  function peg$classExpectation(parts, inverted, ignoreCase) {',
      '    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };',
      '  }',
      '',
      '  function peg$anyExpectation() {',
      '    return { type: "any" };',
      '  }',
      '',
      '  function peg$endExpectation() {',
      '    return { type: "end" };',
      '  }',
      '',
      '  function peg$otherExpectation(description) {',
      '    return { type: "other", description: description };',
      '  }',
      '',
      '  function peg$computePosDetails(pos) {',
      '    var details = peg$posDetailsCache[pos], p;',
      '',
      '    if (details) {',
      '      return details;',
      '    } else {',
      '      p = pos - 1;',
      '      while (!peg$posDetailsCache[p]) {',
      '        p--;',
      '      }',
      '',
      '      details = peg$posDetailsCache[p];',
      '      details = {',
      '        line:   details.line,',
      '        column: details.column',
      '      };',
      '',
      '      while (p < pos) {',
      '        if (input.charCodeAt(p) === 10) {',
      '          details.line++;',
      '          details.column = 1;',
      '        } else {',
      '          details.column++;',
      '        }',
      '',
      '        p++;',
      '      }',
      '',
      '      peg$posDetailsCache[pos] = details;',
      '      return details;',
      '    }',
      '  }',
      '',
      '  function peg$computeLocation(startPos, endPos) {',
      '    var startPosDetails = peg$computePosDetails(startPos),',
      '        endPosDetails   = peg$computePosDetails(endPos);',
      '',
      '    return {',
      '      start: {',
      '        offset: startPos,',
      '        line:   startPosDetails.line,',
      '        column: startPosDetails.column',
      '      },',
      '      end: {',
      '        offset: endPos,',
      '        line:   endPosDetails.line,',
      '        column: endPosDetails.column',
      '      }',
      '    };',
      '  }',
      '',
      '  function peg$fail(expected) {',
      '    if (peg$currPos < peg$maxFailPos) { return; }',
      '',
      '    if (peg$currPos > peg$maxFailPos) {',
      '      peg$maxFailPos = peg$currPos;',
      '      peg$maxFailExpected = [];',
      '    }',
      '',
      '    peg$maxFailExpected.push(expected);',
      '  }',
      '',
      '  function peg$buildSimpleError(message, location) {',
      '    return new peg$SyntaxError(message, null, null, location);',
      '  }',
      '',
      '  function peg$buildStructuredError(expected, found, location) {',
      '    return new peg$SyntaxError(',
      '      peg$SyntaxError.buildMessage(expected, found),',
      '      expected,',
      '      found,',
      '      location',
      '    );',
      '  }',
      ''
    ].join('\n'));

    if (options.optimize === "size") {
      parts.push(indent2(generateInterpreter()));
      parts.push('');
    } else {
      arrays.each(ast.rules, function(rule) {
        parts.push(indent2(generateRuleFunction(rule)));
        parts.push('');
      });
    }

    if (ast.initializer) {
      parts.push(indent2(ast.initializer.code));
      parts.push('');
    }

    if (options.optimize === "size") {
      parts.push('  peg$result = peg$parseRule(peg$startRuleIndex);');
    } else {
      parts.push('  peg$result = peg$startRuleFunction();');
    }

    parts.push([
      '',
      '  if (peg$result !== peg$FAILED && peg$currPos === input.length) {',
      '    return peg$result;',
      '  } else {',
      '    if (peg$result !== peg$FAILED && peg$currPos < input.length) {',
      '      peg$fail(peg$endExpectation());',
      '    }',
      '',
      '    throw peg$buildStructuredError(',
      '      peg$maxFailExpected,',
      '      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,',
      '      peg$maxFailPos < input.length',
      '        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)',
      '        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)',
      '    );',
      '  }',
      '}'
    ].join('\n'));

    return parts.join('\n');
  }

  function generateWrapper(toplevelCode) {
    function generateGeneratedByComment() {
      return [
        '/*',
        ' * Generated by PEG.js 0.10.0.',
        ' *',
        ' * http://pegjs.org/',
        ' */'
      ].join('\n');
    }

    function generateParserObject() {
      return options.trace
        ? [
            '{',
            '  SyntaxError:   peg$SyntaxError,',
            '  DefaultTracer: peg$DefaultTracer,',
            '  parse:         peg$parse',
            '}'
          ].join('\n')
        : [
            '{',
            '  SyntaxError: peg$SyntaxError,',
            '  parse:       peg$parse',
            '}'
          ].join('\n');
    }

    var generators = {
      bare: function() {
        return [
          generateGeneratedByComment(),
          '(function() {',
          '  "use strict";',
          '',
             indent2(toplevelCode),
          '',
             indent2('return ' + generateParserObject() + ';'),
          '})()'
        ].join('\n');
      },

      commonjs: function() {
        var parts          = [],
            dependencyVars = objects.keys(options.dependencies),
            requires       = arrays.map(
              dependencyVars,
              function(variable) {
                return variable
                  + ' = require("'
                  + js.stringEscape(options.dependencies[variable])
                  + '")';
              }
            );

        parts.push([
          generateGeneratedByComment(),
          '',
          '"use strict";',
          ''
        ].join('\n'));

        if (requires.length > 0) {
          parts.push('var ' + requires.join(', ') + ';');
          parts.push('');
        }

        parts.push([
          toplevelCode,
          '',
          'module.exports = ' + generateParserObject() + ';',
          ''
        ].join('\n'));

        return parts.join('\n');
      },

      amd: function() {
        var dependencyIds  = objects.values(options.dependencies),
            dependencyVars = objects.keys(options.dependencies),
            dependencies   = '['
              + arrays.map(
                  dependencyIds,
                  function(id) { return '"' + js.stringEscape(id) + '"'; }
                ).join(', ')
              + ']',
            params         = dependencyVars.join(', ');

        return [
          generateGeneratedByComment(),
          'define(' + dependencies + ', function(' + params + ') {',
          '  "use strict";',
          '',
             indent2(toplevelCode),
          '',
             indent2('return ' + generateParserObject() + ';'),
          '});',
          ''
        ].join('\n');
      },

      globals: function() {
        return [
          generateGeneratedByComment(),
          '(function(root) {',
          '  "use strict";',
          '',
             indent2(toplevelCode),
          '',
             indent2('root.' + options.exportVar + ' = ' + generateParserObject() + ';'),
          '})(this);',
          ''
        ].join('\n');
      },

      umd: function() {
        var parts          = [],
            dependencyIds  = objects.values(options.dependencies),
            dependencyVars = objects.keys(options.dependencies),
            dependencies   = '['
              + arrays.map(
                  dependencyIds,
                  function(id) { return '"' + js.stringEscape(id) + '"'; }
                ).join(', ')
              + ']',
            requires       = arrays.map(
              dependencyIds,
              function(id) { return 'require("' + js.stringEscape(id) + '")'; }
            ).join(', '),
            params         = dependencyVars.join(', ');

        parts.push([
          generateGeneratedByComment(),
          '(function(root, factory) {',
          '  if (typeof define === "function" && define.amd) {',
          '    define(' + dependencies + ', factory);',
          '  } else if (typeof module === "object" && module.exports) {',
          '    module.exports = factory(' + requires + ');'
        ].join('\n'));

        if (options.exportVar !== null) {
          parts.push([
            '  } else {',
            '    root.' + options.exportVar + ' = factory();'
          ].join('\n'));
        }

        parts.push([
          '  }',
          '})(this, function(' + params + ') {',
          '  "use strict";',
          '',
             indent2(toplevelCode),
          '',
             indent2('return ' + generateParserObject() + ';'),
          '});',
          ''
        ].join('\n'));

        return parts.join('\n');
      }
    };

    return generators[options.format]();
  }

  ast.code = generateWrapper(generateToplevel());
}

module.exports = generateJS;

},{"../../utils/arrays":53,"../../utils/objects":55,"../asts":37,"../js":39,"../opcodes":40}],43:[function(require,module,exports){
"use strict";

var arrays  = require("../../utils/arrays"),
    visitor = require("../visitor");

/*
 * Removes proxy rules -- that is, rules that only delegate to other rule.
 */
function removeProxyRules(ast, options) {
  function isProxyRule(node) {
    return node.type === "rule" && node.expression.type === "rule_ref";
  }

  function replaceRuleRefs(ast, from, to) {
    var replace = visitor.build({
      rule_ref: function(node) {
        if (node.name === from) {
          node.name = to;
        }
      }
    });

    replace(ast);
  }

  var indices = [];

  arrays.each(ast.rules, function(rule, i) {
    if (isProxyRule(rule)) {
      replaceRuleRefs(ast, rule.name, rule.expression.name);
      if (!arrays.contains(options.allowedStartRules, rule.name)) {
        indices.push(i);
      }
    }
  });

  indices.reverse();

  arrays.each(indices, function(i) { ast.rules.splice(i, 1); });
}

module.exports = removeProxyRules;

},{"../../utils/arrays":53,"../visitor":49}],44:[function(require,module,exports){
"use strict";

var GrammarError = require("../../grammar-error"),
    arrays       = require("../../utils/arrays"),
    objects      = require("../../utils/objects"),
    visitor      = require("../visitor");

/* Checks that each label is defined only once within each scope. */
function reportDuplicateLabels(ast) {
  function checkExpressionWithClonedEnv(node, env) {
    check(node.expression, objects.clone(env));
  }

  var check = visitor.build({
    rule: function(node) {
      check(node.expression, { });
    },

    choice: function(node, env) {
      arrays.each(node.alternatives, function(alternative) {
        check(alternative, objects.clone(env));
      });
    },

    action: checkExpressionWithClonedEnv,

    labeled: function(node, env) {
      if (env.hasOwnProperty(node.label)) {
        throw new GrammarError(
          "Label \"" + node.label + "\" is already defined "
            + "at line " + env[node.label].start.line + ", "
            + "column " + env[node.label].start.column + ".",
          node.location
        );
      }

      check(node.expression, env);

      env[node.label] = node.location;
    },

    text:         checkExpressionWithClonedEnv,
    simple_and:   checkExpressionWithClonedEnv,
    simple_not:   checkExpressionWithClonedEnv,
    optional:     checkExpressionWithClonedEnv,
    zero_or_more: checkExpressionWithClonedEnv,
    one_or_more:  checkExpressionWithClonedEnv,
    group:        checkExpressionWithClonedEnv
  });

  check(ast);
}

module.exports = reportDuplicateLabels;

},{"../../grammar-error":50,"../../utils/arrays":53,"../../utils/objects":55,"../visitor":49}],45:[function(require,module,exports){
"use strict";

var GrammarError = require("../../grammar-error"),
    visitor      = require("../visitor");

/* Checks that each rule is defined only once. */
function reportDuplicateRules(ast) {
  var rules = {};

  var check = visitor.build({
    rule: function(node) {
      if (rules.hasOwnProperty(node.name)) {
        throw new GrammarError(
          "Rule \"" + node.name + "\" is already defined "
            + "at line " + rules[node.name].start.line + ", "
            + "column " + rules[node.name].start.column + ".",
          node.location
        );
      }

      rules[node.name] = node.location;
    }
  });

  check(ast);
}

module.exports = reportDuplicateRules;

},{"../../grammar-error":50,"../visitor":49}],46:[function(require,module,exports){
"use strict";

var arrays       = require("../../utils/arrays"),
    GrammarError = require("../../grammar-error"),
    asts         = require("../asts"),
    visitor      = require("../visitor");

/*
 * Reports left recursion in the grammar, which prevents infinite recursion in
 * the generated parser.
 *
 * Both direct and indirect recursion is detected. The pass also correctly
 * reports cases like this:
 *
 *   start = "a"? start
 *
 * In general, if a rule reference can be reached without consuming any input,
 * it can lead to left recursion.
 */
function reportInfiniteRecursion(ast) {
  var visitedRules = [];

  var check = visitor.build({
    rule: function(node) {
      visitedRules.push(node.name);
      check(node.expression);
      visitedRules.pop(node.name);
    },

    sequence: function(node) {
      arrays.every(node.elements, function(element) {
        check(element);

        return !asts.alwaysConsumesOnSuccess(ast, element);
      });
    },

    rule_ref: function(node) {
      if (arrays.contains(visitedRules, node.name)) {
        visitedRules.push(node.name);

        throw new GrammarError(
          "Possible infinite loop when parsing (left recursion: "
            + visitedRules.join(" -> ")
            + ").",
          node.location
        );
      }

      check(asts.findRule(ast, node.name));
    }
  });

  check(ast);
}

module.exports = reportInfiniteRecursion;

},{"../../grammar-error":50,"../../utils/arrays":53,"../asts":37,"../visitor":49}],47:[function(require,module,exports){
"use strict";

var GrammarError = require("../../grammar-error"),
    asts         = require("../asts"),
    visitor      = require("../visitor");

/*
 * Reports expressions that don't consume any input inside |*| or |+| in the
 * grammar, which prevents infinite loops in the generated parser.
 */
function reportInfiniteRepetition(ast) {
  var check = visitor.build({
    zero_or_more: function(node) {
      if (!asts.alwaysConsumesOnSuccess(ast, node.expression)) {
        throw new GrammarError(
          "Possible infinite loop when parsing (repetition used with an expression that may not consume any input).",
          node.location
        );
      }
    },

    one_or_more: function(node) {
      if (!asts.alwaysConsumesOnSuccess(ast, node.expression)) {
        throw new GrammarError(
          "Possible infinite loop when parsing (repetition used with an expression that may not consume any input).",
          node.location
        );
      }
    }
  });

  check(ast);
}

module.exports = reportInfiniteRepetition;

},{"../../grammar-error":50,"../asts":37,"../visitor":49}],48:[function(require,module,exports){
"use strict";

var GrammarError = require("../../grammar-error"),
    asts         = require("../asts"),
    visitor      = require("../visitor");

/* Checks that all referenced rules exist. */
function reportUndefinedRules(ast) {
  var check = visitor.build({
    rule_ref: function(node) {
      if (!asts.findRule(ast, node.name)) {
        throw new GrammarError(
          "Rule \"" + node.name + "\" is not defined.",
          node.location
        );
      }
    }
  });

  check(ast);
}

module.exports = reportUndefinedRules;

},{"../../grammar-error":50,"../asts":37,"../visitor":49}],49:[function(require,module,exports){
"use strict";

var objects = require("../utils/objects"),
    arrays  = require("../utils/arrays");

/* Simple AST node visitor builder. */
var visitor = {
  build: function(functions) {
    function visit(node) {
      return functions[node.type].apply(null, arguments);
    }

    function visitNop() { }

    function visitExpression(node) {
      var extraArgs = Array.prototype.slice.call(arguments, 1);

      visit.apply(null, [node.expression].concat(extraArgs));
    }

    function visitChildren(property) {
      return function(node) {
        var extraArgs = Array.prototype.slice.call(arguments, 1);

        arrays.each(node[property], function(child) {
          visit.apply(null, [child].concat(extraArgs));
        });
      };
    }

    var DEFAULT_FUNCTIONS = {
          grammar: function(node) {
            var extraArgs = Array.prototype.slice.call(arguments, 1);

            if (node.initializer) {
              visit.apply(null, [node.initializer].concat(extraArgs));
            }

            arrays.each(node.rules, function(rule) {
              visit.apply(null, [rule].concat(extraArgs));
            });
          },

          initializer:  visitNop,
          rule:         visitExpression,
          named:        visitExpression,
          choice:       visitChildren("alternatives"),
          action:       visitExpression,
          sequence:     visitChildren("elements"),
          labeled:      visitExpression,
          text:         visitExpression,
          simple_and:   visitExpression,
          simple_not:   visitExpression,
          optional:     visitExpression,
          zero_or_more: visitExpression,
          one_or_more:  visitExpression,
          group:        visitExpression,
          semantic_and: visitNop,
          semantic_not: visitNop,
          rule_ref:     visitNop,
          literal:      visitNop,
          "class":      visitNop,
          any:          visitNop
        };

    objects.defaults(functions, DEFAULT_FUNCTIONS);

    return visit;
  }
};

module.exports = visitor;

},{"../utils/arrays":53,"../utils/objects":55}],50:[function(require,module,exports){
"use strict";

var classes = require("./utils/classes");

/* Thrown when the grammar contains an error. */
function GrammarError(message, location) {
  this.name = "GrammarError";
  this.message = message;
  this.location = location;

  if (typeof Error.captureStackTrace === "function") {
    Error.captureStackTrace(this, GrammarError);
  }
}

classes.subclass(GrammarError, Error);

module.exports = GrammarError;

},{"./utils/classes":54}],51:[function(require,module,exports){
/* eslint-env node, amd */
/* eslint no-unused-vars: 0 */

/*
 * Generated by PEG.js 0.10.0.
 *
 * http://pegjs.org/
 */

"use strict";

function peg$subclass(child, parent) {
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor();
}

function peg$SyntaxError(message, expected, found, location) {
  this.message  = message;
  this.expected = expected;
  this.found    = found;
  this.location = location;
  this.name     = "SyntaxError";

  if (typeof Error.captureStackTrace === "function") {
    Error.captureStackTrace(this, peg$SyntaxError);
  }
}

peg$subclass(peg$SyntaxError, Error);

peg$SyntaxError.buildMessage = function(expected, found) {
  var DESCRIBE_EXPECTATION_FNS = {
        literal: function(expectation) {
          return "\"" + literalEscape(expectation.text) + "\"";
        },

        "class": function(expectation) {
          var escapedParts = "",
              i;

          for (i = 0; i < expectation.parts.length; i++) {
            escapedParts += expectation.parts[i] instanceof Array
              ? classEscape(expectation.parts[i][0]) + "-" + classEscape(expectation.parts[i][1])
              : classEscape(expectation.parts[i]);
          }

          return "[" + (expectation.inverted ? "^" : "") + escapedParts + "]";
        },

        any: function(expectation) {
          return "any character";
        },

        end: function(expectation) {
          return "end of input";
        },

        other: function(expectation) {
          return expectation.description;
        }
      };

  function hex(ch) {
    return ch.charCodeAt(0).toString(16).toUpperCase();
  }

  function literalEscape(s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/"/g,  '\\"')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
  }

  function classEscape(s) {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/\]/g, '\\]')
      .replace(/\^/g, '\\^')
      .replace(/-/g,  '\\-')
      .replace(/\0/g, '\\0')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/[\x00-\x0F]/g,          function(ch) { return '\\x0' + hex(ch); })
      .replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) { return '\\x'  + hex(ch); });
  }

  function describeExpectation(expectation) {
    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
  }

  function describeExpected(expected) {
    var descriptions = new Array(expected.length),
        i, j;

    for (i = 0; i < expected.length; i++) {
      descriptions[i] = describeExpectation(expected[i]);
    }

    descriptions.sort();

    if (descriptions.length > 0) {
      for (i = 1, j = 1; i < descriptions.length; i++) {
        if (descriptions[i - 1] !== descriptions[i]) {
          descriptions[j] = descriptions[i];
          j++;
        }
      }
      descriptions.length = j;
    }

    switch (descriptions.length) {
      case 1:
        return descriptions[0];

      case 2:
        return descriptions[0] + " or " + descriptions[1];

      default:
        return descriptions.slice(0, -1).join(", ")
          + ", or "
          + descriptions[descriptions.length - 1];
    }
  }

  function describeFound(found) {
    return found ? "\"" + literalEscape(found) + "\"" : "end of input";
  }

  return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
};

function peg$parse(input, options) {
  options = options !== void 0 ? options : {};

  var peg$FAILED = {},

      peg$startRuleFunctions = { Grammar: peg$parseGrammar },
      peg$startRuleFunction  = peg$parseGrammar,

      peg$c0 = function(initializer, rules) {
            return {
              type:        "grammar",
              initializer: extractOptional(initializer, 0),
              rules:       extractList(rules, 0),
              location:    location()
            };
          },
      peg$c1 = function(code) {
            return { type: "initializer", code: code, location: location() };
          },
      peg$c2 = "=",
      peg$c3 = peg$literalExpectation("=", false),
      peg$c4 = function(name, displayName, expression) {
            return {
              type:        "rule",
              name:        name,
              expression:  displayName !== null
                ? {
                    type:       "named",
                    name:       displayName[0],
                    expression: expression,
                    location:   location()
                  }
                : expression,
              location:    location()
            };
          },
      peg$c5 = "/",
      peg$c6 = peg$literalExpectation("/", false),
      peg$c7 = function(head, tail) {
            return tail.length > 0
              ? {
                  type:         "choice",
                  alternatives: buildList(head, tail, 3),
                  location:     location()
                }
              : head;
          },
      peg$c8 = function(expression, code) {
            return code !== null
              ? {
                  type:       "action",
                  expression: expression,
                  code:       code[1],
                  location:   location()
                }
              : expression;
          },
      peg$c9 = function(head, tail) {
            return tail.length > 0
              ? {
                  type:     "sequence",
                  elements: buildList(head, tail, 1),
                  location: location()
                }
              : head;
          },
      peg$c10 = ":",
      peg$c11 = peg$literalExpectation(":", false),
      peg$c12 = function(label, expression) {
            return {
              type:       "labeled",
              label:      label,
              expression: expression,
              location:   location()
            };
          },
      peg$c13 = function(operator, expression) {
            return {
              type:       OPS_TO_PREFIXED_TYPES[operator],
              expression: expression,
              location:   location()
            };
          },
      peg$c14 = "$",
      peg$c15 = peg$literalExpectation("$", false),
      peg$c16 = "&",
      peg$c17 = peg$literalExpectation("&", false),
      peg$c18 = "!",
      peg$c19 = peg$literalExpectation("!", false),
      peg$c20 = function(expression, operator) {
            return {
              type:       OPS_TO_SUFFIXED_TYPES[operator],
              expression: expression,
              location:   location()
            };
          },
      peg$c21 = "?",
      peg$c22 = peg$literalExpectation("?", false),
      peg$c23 = "*",
      peg$c24 = peg$literalExpectation("*", false),
      peg$c25 = "+",
      peg$c26 = peg$literalExpectation("+", false),
      peg$c27 = "(",
      peg$c28 = peg$literalExpectation("(", false),
      peg$c29 = ")",
      peg$c30 = peg$literalExpectation(")", false),
      peg$c31 = function(expression) {
            /*
             * The purpose of the "group" AST node is just to isolate label scope. We
             * don't need to put it around nodes that can't contain any labels or
             * nodes that already isolate label scope themselves. This leaves us with
             * "labeled" and "sequence".
             */
            return expression.type === 'labeled' || expression.type === 'sequence'
                ? { type: "group", expression: expression }
                : expression;
          },
      peg$c32 = function(name) {
            return { type: "rule_ref", name: name, location: location() };
          },
      peg$c33 = function(operator, code) {
            return {
              type:     OPS_TO_SEMANTIC_PREDICATE_TYPES[operator],
              code:     code,
              location: location()
            };
          },
      peg$c34 = peg$anyExpectation(),
      peg$c35 = peg$otherExpectation("whitespace"),
      peg$c36 = "\t",
      peg$c37 = peg$literalExpectation("\t", false),
      peg$c38 = "\x0B",
      peg$c39 = peg$literalExpectation("\x0B", false),
      peg$c40 = "\f",
      peg$c41 = peg$literalExpectation("\f", false),
      peg$c42 = " ",
      peg$c43 = peg$literalExpectation(" ", false),
      peg$c44 = "\xA0",
      peg$c45 = peg$literalExpectation("\xA0", false),
      peg$c46 = "\uFEFF",
      peg$c47 = peg$literalExpectation("\uFEFF", false),
      peg$c48 = /^[\n\r\u2028\u2029]/,
      peg$c49 = peg$classExpectation(["\n", "\r", "\u2028", "\u2029"], false, false),
      peg$c50 = peg$otherExpectation("end of line"),
      peg$c51 = "\n",
      peg$c52 = peg$literalExpectation("\n", false),
      peg$c53 = "\r\n",
      peg$c54 = peg$literalExpectation("\r\n", false),
      peg$c55 = "\r",
      peg$c56 = peg$literalExpectation("\r", false),
      peg$c57 = "\u2028",
      peg$c58 = peg$literalExpectation("\u2028", false),
      peg$c59 = "\u2029",
      peg$c60 = peg$literalExpectation("\u2029", false),
      peg$c61 = peg$otherExpectation("comment"),
      peg$c62 = "/*",
      peg$c63 = peg$literalExpectation("/*", false),
      peg$c64 = "*/",
      peg$c65 = peg$literalExpectation("*/", false),
      peg$c66 = "//",
      peg$c67 = peg$literalExpectation("//", false),
      peg$c68 = function(name) { return name; },
      peg$c69 = peg$otherExpectation("identifier"),
      peg$c70 = function(head, tail) { return head + tail.join(""); },
      peg$c71 = "_",
      peg$c72 = peg$literalExpectation("_", false),
      peg$c73 = "\\",
      peg$c74 = peg$literalExpectation("\\", false),
      peg$c75 = function(sequence) { return sequence; },
      peg$c76 = "\u200C",
      peg$c77 = peg$literalExpectation("\u200C", false),
      peg$c78 = "\u200D",
      peg$c79 = peg$literalExpectation("\u200D", false),
      peg$c80 = peg$otherExpectation("literal"),
      peg$c81 = "i",
      peg$c82 = peg$literalExpectation("i", false),
      peg$c83 = function(value, ignoreCase) {
            return {
              type:       "literal",
              value:      value,
              ignoreCase: ignoreCase !== null,
              location:   location()
            };
          },
      peg$c84 = peg$otherExpectation("string"),
      peg$c85 = "\"",
      peg$c86 = peg$literalExpectation("\"", false),
      peg$c87 = function(chars) { return chars.join(""); },
      peg$c88 = "'",
      peg$c89 = peg$literalExpectation("'", false),
      peg$c90 = function() { return text(); },
      peg$c91 = peg$otherExpectation("character class"),
      peg$c92 = "[",
      peg$c93 = peg$literalExpectation("[", false),
      peg$c94 = "^",
      peg$c95 = peg$literalExpectation("^", false),
      peg$c96 = "]",
      peg$c97 = peg$literalExpectation("]", false),
      peg$c98 = function(inverted, parts, ignoreCase) {
            return {
              type:       "class",
              parts:      filterEmptyStrings(parts),
              inverted:   inverted !== null,
              ignoreCase: ignoreCase !== null,
              location:   location()
            };
          },
      peg$c99 = "-",
      peg$c100 = peg$literalExpectation("-", false),
      peg$c101 = function(begin, end) {
            if (begin.charCodeAt(0) > end.charCodeAt(0)) {
              error(
                "Invalid character range: " + text() + "."
              );
            }

            return [begin, end];
          },
      peg$c102 = function() { return ""; },
      peg$c103 = "0",
      peg$c104 = peg$literalExpectation("0", false),
      peg$c105 = function() { return "\0"; },
      peg$c106 = "b",
      peg$c107 = peg$literalExpectation("b", false),
      peg$c108 = function() { return "\b";   },
      peg$c109 = "f",
      peg$c110 = peg$literalExpectation("f", false),
      peg$c111 = function() { return "\f";   },
      peg$c112 = "n",
      peg$c113 = peg$literalExpectation("n", false),
      peg$c114 = function() { return "\n";   },
      peg$c115 = "r",
      peg$c116 = peg$literalExpectation("r", false),
      peg$c117 = function() { return "\r";   },
      peg$c118 = "t",
      peg$c119 = peg$literalExpectation("t", false),
      peg$c120 = function() { return "\t";   },
      peg$c121 = "v",
      peg$c122 = peg$literalExpectation("v", false),
      peg$c123 = function() { return "\x0B"; },
      peg$c124 = "x",
      peg$c125 = peg$literalExpectation("x", false),
      peg$c126 = "u",
      peg$c127 = peg$literalExpectation("u", false),
      peg$c128 = function(digits) {
            return String.fromCharCode(parseInt(digits, 16));
          },
      peg$c129 = /^[0-9]/,
      peg$c130 = peg$classExpectation([["0", "9"]], false, false),
      peg$c131 = /^[0-9a-f]/i,
      peg$c132 = peg$classExpectation([["0", "9"], ["a", "f"]], false, true),
      peg$c133 = ".",
      peg$c134 = peg$literalExpectation(".", false),
      peg$c135 = function() { return { type: "any", location: location() }; },
      peg$c136 = peg$otherExpectation("code block"),
      peg$c137 = "{",
      peg$c138 = peg$literalExpectation("{", false),
      peg$c139 = "}",
      peg$c140 = peg$literalExpectation("}", false),
      peg$c141 = function(code) { return code; },
      peg$c142 = /^[{}]/,
      peg$c143 = peg$classExpectation(["{", "}"], false, false),
      peg$c144 = /^[a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137-\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148-\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C-\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA-\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9-\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC-\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF-\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F-\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0-\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB-\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE-\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0561-\u0587\u13F8-\u13FD\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6-\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FC7\u1FD0-\u1FD3\u1FD6-\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6-\u1FF7\u210A\u210E-\u210F\u2113\u212F\u2134\u2139\u213C-\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65-\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73-\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3-\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7B5\uA7B7\uA7FA\uAB30-\uAB5A\uAB60-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A]/,
      peg$c145 = peg$classExpectation([["a", "z"], "\xB5", ["\xDF", "\xF6"], ["\xF8", "\xFF"], "\u0101", "\u0103", "\u0105", "\u0107", "\u0109", "\u010B", "\u010D", "\u010F", "\u0111", "\u0113", "\u0115", "\u0117", "\u0119", "\u011B", "\u011D", "\u011F", "\u0121", "\u0123", "\u0125", "\u0127", "\u0129", "\u012B", "\u012D", "\u012F", "\u0131", "\u0133", "\u0135", ["\u0137", "\u0138"], "\u013A", "\u013C", "\u013E", "\u0140", "\u0142", "\u0144", "\u0146", ["\u0148", "\u0149"], "\u014B", "\u014D", "\u014F", "\u0151", "\u0153", "\u0155", "\u0157", "\u0159", "\u015B", "\u015D", "\u015F", "\u0161", "\u0163", "\u0165", "\u0167", "\u0169", "\u016B", "\u016D", "\u016F", "\u0171", "\u0173", "\u0175", "\u0177", "\u017A", "\u017C", ["\u017E", "\u0180"], "\u0183", "\u0185", "\u0188", ["\u018C", "\u018D"], "\u0192", "\u0195", ["\u0199", "\u019B"], "\u019E", "\u01A1", "\u01A3", "\u01A5", "\u01A8", ["\u01AA", "\u01AB"], "\u01AD", "\u01B0", "\u01B4", "\u01B6", ["\u01B9", "\u01BA"], ["\u01BD", "\u01BF"], "\u01C6", "\u01C9", "\u01CC", "\u01CE", "\u01D0", "\u01D2", "\u01D4", "\u01D6", "\u01D8", "\u01DA", ["\u01DC", "\u01DD"], "\u01DF", "\u01E1", "\u01E3", "\u01E5", "\u01E7", "\u01E9", "\u01EB", "\u01ED", ["\u01EF", "\u01F0"], "\u01F3", "\u01F5", "\u01F9", "\u01FB", "\u01FD", "\u01FF", "\u0201", "\u0203", "\u0205", "\u0207", "\u0209", "\u020B", "\u020D", "\u020F", "\u0211", "\u0213", "\u0215", "\u0217", "\u0219", "\u021B", "\u021D", "\u021F", "\u0221", "\u0223", "\u0225", "\u0227", "\u0229", "\u022B", "\u022D", "\u022F", "\u0231", ["\u0233", "\u0239"], "\u023C", ["\u023F", "\u0240"], "\u0242", "\u0247", "\u0249", "\u024B", "\u024D", ["\u024F", "\u0293"], ["\u0295", "\u02AF"], "\u0371", "\u0373", "\u0377", ["\u037B", "\u037D"], "\u0390", ["\u03AC", "\u03CE"], ["\u03D0", "\u03D1"], ["\u03D5", "\u03D7"], "\u03D9", "\u03DB", "\u03DD", "\u03DF", "\u03E1", "\u03E3", "\u03E5", "\u03E7", "\u03E9", "\u03EB", "\u03ED", ["\u03EF", "\u03F3"], "\u03F5", "\u03F8", ["\u03FB", "\u03FC"], ["\u0430", "\u045F"], "\u0461", "\u0463", "\u0465", "\u0467", "\u0469", "\u046B", "\u046D", "\u046F", "\u0471", "\u0473", "\u0475", "\u0477", "\u0479", "\u047B", "\u047D", "\u047F", "\u0481", "\u048B", "\u048D", "\u048F", "\u0491", "\u0493", "\u0495", "\u0497", "\u0499", "\u049B", "\u049D", "\u049F", "\u04A1", "\u04A3", "\u04A5", "\u04A7", "\u04A9", "\u04AB", "\u04AD", "\u04AF", "\u04B1", "\u04B3", "\u04B5", "\u04B7", "\u04B9", "\u04BB", "\u04BD", "\u04BF", "\u04C2", "\u04C4", "\u04C6", "\u04C8", "\u04CA", "\u04CC", ["\u04CE", "\u04CF"], "\u04D1", "\u04D3", "\u04D5", "\u04D7", "\u04D9", "\u04DB", "\u04DD", "\u04DF", "\u04E1", "\u04E3", "\u04E5", "\u04E7", "\u04E9", "\u04EB", "\u04ED", "\u04EF", "\u04F1", "\u04F3", "\u04F5", "\u04F7", "\u04F9", "\u04FB", "\u04FD", "\u04FF", "\u0501", "\u0503", "\u0505", "\u0507", "\u0509", "\u050B", "\u050D", "\u050F", "\u0511", "\u0513", "\u0515", "\u0517", "\u0519", "\u051B", "\u051D", "\u051F", "\u0521", "\u0523", "\u0525", "\u0527", "\u0529", "\u052B", "\u052D", "\u052F", ["\u0561", "\u0587"], ["\u13F8", "\u13FD"], ["\u1D00", "\u1D2B"], ["\u1D6B", "\u1D77"], ["\u1D79", "\u1D9A"], "\u1E01", "\u1E03", "\u1E05", "\u1E07", "\u1E09", "\u1E0B", "\u1E0D", "\u1E0F", "\u1E11", "\u1E13", "\u1E15", "\u1E17", "\u1E19", "\u1E1B", "\u1E1D", "\u1E1F", "\u1E21", "\u1E23", "\u1E25", "\u1E27", "\u1E29", "\u1E2B", "\u1E2D", "\u1E2F", "\u1E31", "\u1E33", "\u1E35", "\u1E37", "\u1E39", "\u1E3B", "\u1E3D", "\u1E3F", "\u1E41", "\u1E43", "\u1E45", "\u1E47", "\u1E49", "\u1E4B", "\u1E4D", "\u1E4F", "\u1E51", "\u1E53", "\u1E55", "\u1E57", "\u1E59", "\u1E5B", "\u1E5D", "\u1E5F", "\u1E61", "\u1E63", "\u1E65", "\u1E67", "\u1E69", "\u1E6B", "\u1E6D", "\u1E6F", "\u1E71", "\u1E73", "\u1E75", "\u1E77", "\u1E79", "\u1E7B", "\u1E7D", "\u1E7F", "\u1E81", "\u1E83", "\u1E85", "\u1E87", "\u1E89", "\u1E8B", "\u1E8D", "\u1E8F", "\u1E91", "\u1E93", ["\u1E95", "\u1E9D"], "\u1E9F", "\u1EA1", "\u1EA3", "\u1EA5", "\u1EA7", "\u1EA9", "\u1EAB", "\u1EAD", "\u1EAF", "\u1EB1", "\u1EB3", "\u1EB5", "\u1EB7", "\u1EB9", "\u1EBB", "\u1EBD", "\u1EBF", "\u1EC1", "\u1EC3", "\u1EC5", "\u1EC7", "\u1EC9", "\u1ECB", "\u1ECD", "\u1ECF", "\u1ED1", "\u1ED3", "\u1ED5", "\u1ED7", "\u1ED9", "\u1EDB", "\u1EDD", "\u1EDF", "\u1EE1", "\u1EE3", "\u1EE5", "\u1EE7", "\u1EE9", "\u1EEB", "\u1EED", "\u1EEF", "\u1EF1", "\u1EF3", "\u1EF5", "\u1EF7", "\u1EF9", "\u1EFB", "\u1EFD", ["\u1EFF", "\u1F07"], ["\u1F10", "\u1F15"], ["\u1F20", "\u1F27"], ["\u1F30", "\u1F37"], ["\u1F40", "\u1F45"], ["\u1F50", "\u1F57"], ["\u1F60", "\u1F67"], ["\u1F70", "\u1F7D"], ["\u1F80", "\u1F87"], ["\u1F90", "\u1F97"], ["\u1FA0", "\u1FA7"], ["\u1FB0", "\u1FB4"], ["\u1FB6", "\u1FB7"], "\u1FBE", ["\u1FC2", "\u1FC4"], ["\u1FC6", "\u1FC7"], ["\u1FD0", "\u1FD3"], ["\u1FD6", "\u1FD7"], ["\u1FE0", "\u1FE7"], ["\u1FF2", "\u1FF4"], ["\u1FF6", "\u1FF7"], "\u210A", ["\u210E", "\u210F"], "\u2113", "\u212F", "\u2134", "\u2139", ["\u213C", "\u213D"], ["\u2146", "\u2149"], "\u214E", "\u2184", ["\u2C30", "\u2C5E"], "\u2C61", ["\u2C65", "\u2C66"], "\u2C68", "\u2C6A", "\u2C6C", "\u2C71", ["\u2C73", "\u2C74"], ["\u2C76", "\u2C7B"], "\u2C81", "\u2C83", "\u2C85", "\u2C87", "\u2C89", "\u2C8B", "\u2C8D", "\u2C8F", "\u2C91", "\u2C93", "\u2C95", "\u2C97", "\u2C99", "\u2C9B", "\u2C9D", "\u2C9F", "\u2CA1", "\u2CA3", "\u2CA5", "\u2CA7", "\u2CA9", "\u2CAB", "\u2CAD", "\u2CAF", "\u2CB1", "\u2CB3", "\u2CB5", "\u2CB7", "\u2CB9", "\u2CBB", "\u2CBD", "\u2CBF", "\u2CC1", "\u2CC3", "\u2CC5", "\u2CC7", "\u2CC9", "\u2CCB", "\u2CCD", "\u2CCF", "\u2CD1", "\u2CD3", "\u2CD5", "\u2CD7", "\u2CD9", "\u2CDB", "\u2CDD", "\u2CDF", "\u2CE1", ["\u2CE3", "\u2CE4"], "\u2CEC", "\u2CEE", "\u2CF3", ["\u2D00", "\u2D25"], "\u2D27", "\u2D2D", "\uA641", "\uA643", "\uA645", "\uA647", "\uA649", "\uA64B", "\uA64D", "\uA64F", "\uA651", "\uA653", "\uA655", "\uA657", "\uA659", "\uA65B", "\uA65D", "\uA65F", "\uA661", "\uA663", "\uA665", "\uA667", "\uA669", "\uA66B", "\uA66D", "\uA681", "\uA683", "\uA685", "\uA687", "\uA689", "\uA68B", "\uA68D", "\uA68F", "\uA691", "\uA693", "\uA695", "\uA697", "\uA699", "\uA69B", "\uA723", "\uA725", "\uA727", "\uA729", "\uA72B", "\uA72D", ["\uA72F", "\uA731"], "\uA733", "\uA735", "\uA737", "\uA739", "\uA73B", "\uA73D", "\uA73F", "\uA741", "\uA743", "\uA745", "\uA747", "\uA749", "\uA74B", "\uA74D", "\uA74F", "\uA751", "\uA753", "\uA755", "\uA757", "\uA759", "\uA75B", "\uA75D", "\uA75F", "\uA761", "\uA763", "\uA765", "\uA767", "\uA769", "\uA76B", "\uA76D", "\uA76F", ["\uA771", "\uA778"], "\uA77A", "\uA77C", "\uA77F", "\uA781", "\uA783", "\uA785", "\uA787", "\uA78C", "\uA78E", "\uA791", ["\uA793", "\uA795"], "\uA797", "\uA799", "\uA79B", "\uA79D", "\uA79F", "\uA7A1", "\uA7A3", "\uA7A5", "\uA7A7", "\uA7A9", "\uA7B5", "\uA7B7", "\uA7FA", ["\uAB30", "\uAB5A"], ["\uAB60", "\uAB65"], ["\uAB70", "\uABBF"], ["\uFB00", "\uFB06"], ["\uFB13", "\uFB17"], ["\uFF41", "\uFF5A"]], false, false),
      peg$c146 = /^[\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0374\u037A\u0559\u0640\u06E5-\u06E6\u07F4-\u07F5\u07FA\u081A\u0824\u0828\u0971\u0E46\u0EC6\u10FC\u17D7\u1843\u1AA7\u1C78-\u1C7D\u1D2C-\u1D6A\u1D78\u1D9B-\u1DBF\u2071\u207F\u2090-\u209C\u2C7C-\u2C7D\u2D6F\u2E2F\u3005\u3031-\u3035\u303B\u309D-\u309E\u30FC-\u30FE\uA015\uA4F8-\uA4FD\uA60C\uA67F\uA69C-\uA69D\uA717-\uA71F\uA770\uA788\uA7F8-\uA7F9\uA9CF\uA9E6\uAA70\uAADD\uAAF3-\uAAF4\uAB5C-\uAB5F\uFF70\uFF9E-\uFF9F]/,
      peg$c147 = peg$classExpectation([["\u02B0", "\u02C1"], ["\u02C6", "\u02D1"], ["\u02E0", "\u02E4"], "\u02EC", "\u02EE", "\u0374", "\u037A", "\u0559", "\u0640", ["\u06E5", "\u06E6"], ["\u07F4", "\u07F5"], "\u07FA", "\u081A", "\u0824", "\u0828", "\u0971", "\u0E46", "\u0EC6", "\u10FC", "\u17D7", "\u1843", "\u1AA7", ["\u1C78", "\u1C7D"], ["\u1D2C", "\u1D6A"], "\u1D78", ["\u1D9B", "\u1DBF"], "\u2071", "\u207F", ["\u2090", "\u209C"], ["\u2C7C", "\u2C7D"], "\u2D6F", "\u2E2F", "\u3005", ["\u3031", "\u3035"], "\u303B", ["\u309D", "\u309E"], ["\u30FC", "\u30FE"], "\uA015", ["\uA4F8", "\uA4FD"], "\uA60C", "\uA67F", ["\uA69C", "\uA69D"], ["\uA717", "\uA71F"], "\uA770", "\uA788", ["\uA7F8", "\uA7F9"], "\uA9CF", "\uA9E6", "\uAA70", "\uAADD", ["\uAAF3", "\uAAF4"], ["\uAB5C", "\uAB5F"], "\uFF70", ["\uFF9E", "\uFF9F"]], false, false),
      peg$c148 = /^[\xAA\xBA\u01BB\u01C0-\u01C3\u0294\u05D0-\u05EA\u05F0-\u05F2\u0620-\u063F\u0641-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06EE-\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u0800-\u0815\u0840-\u0858\u08A0-\u08B4\u0904-\u0939\u093D\u0950\u0958-\u0961\u0972-\u0980\u0985-\u098C\u098F-\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC-\u09DD\u09DF-\u09E1\u09F0-\u09F1\u0A05-\u0A0A\u0A0F-\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32-\u0A33\u0A35-\u0A36\u0A38-\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2-\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0-\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F-\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32-\u0B33\u0B35-\u0B39\u0B3D\u0B5C-\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99-\u0B9A\u0B9C\u0B9E-\u0B9F\u0BA3-\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60-\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0-\u0CE1\u0CF1-\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32-\u0E33\u0E40-\u0E45\u0E81-\u0E82\u0E84\u0E87-\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA-\u0EAB\u0EAD-\u0EB0\u0EB2-\u0EB3\u0EBD\u0EC0-\u0EC4\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065-\u1066\u106E-\u1070\u1075-\u1081\u108E\u10D0-\u10FA\u10FD-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17DC\u1820-\u1842\u1844-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE-\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C77\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5-\u1CF6\u2135-\u2138\u2D30-\u2D67\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3006\u303C\u3041-\u3096\u309F\u30A1-\u30FA\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA014\uA016-\uA48C\uA4D0-\uA4F7\uA500-\uA60B\uA610-\uA61F\uA62A-\uA62B\uA66E\uA6A0-\uA6E5\uA78F\uA7F7\uA7FB-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9E0-\uA9E4\uA9E7-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA6F\uAA71-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5-\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADC\uAAE0-\uAAEA\uAAF2\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40-\uFB41\uFB43-\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF66-\uFF6F\uFF71-\uFF9D\uFFA0-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
      peg$c149 = peg$classExpectation(["\xAA", "\xBA", "\u01BB", ["\u01C0", "\u01C3"], "\u0294", ["\u05D0", "\u05EA"], ["\u05F0", "\u05F2"], ["\u0620", "\u063F"], ["\u0641", "\u064A"], ["\u066E", "\u066F"], ["\u0671", "\u06D3"], "\u06D5", ["\u06EE", "\u06EF"], ["\u06FA", "\u06FC"], "\u06FF", "\u0710", ["\u0712", "\u072F"], ["\u074D", "\u07A5"], "\u07B1", ["\u07CA", "\u07EA"], ["\u0800", "\u0815"], ["\u0840", "\u0858"], ["\u08A0", "\u08B4"], ["\u0904", "\u0939"], "\u093D", "\u0950", ["\u0958", "\u0961"], ["\u0972", "\u0980"], ["\u0985", "\u098C"], ["\u098F", "\u0990"], ["\u0993", "\u09A8"], ["\u09AA", "\u09B0"], "\u09B2", ["\u09B6", "\u09B9"], "\u09BD", "\u09CE", ["\u09DC", "\u09DD"], ["\u09DF", "\u09E1"], ["\u09F0", "\u09F1"], ["\u0A05", "\u0A0A"], ["\u0A0F", "\u0A10"], ["\u0A13", "\u0A28"], ["\u0A2A", "\u0A30"], ["\u0A32", "\u0A33"], ["\u0A35", "\u0A36"], ["\u0A38", "\u0A39"], ["\u0A59", "\u0A5C"], "\u0A5E", ["\u0A72", "\u0A74"], ["\u0A85", "\u0A8D"], ["\u0A8F", "\u0A91"], ["\u0A93", "\u0AA8"], ["\u0AAA", "\u0AB0"], ["\u0AB2", "\u0AB3"], ["\u0AB5", "\u0AB9"], "\u0ABD", "\u0AD0", ["\u0AE0", "\u0AE1"], "\u0AF9", ["\u0B05", "\u0B0C"], ["\u0B0F", "\u0B10"], ["\u0B13", "\u0B28"], ["\u0B2A", "\u0B30"], ["\u0B32", "\u0B33"], ["\u0B35", "\u0B39"], "\u0B3D", ["\u0B5C", "\u0B5D"], ["\u0B5F", "\u0B61"], "\u0B71", "\u0B83", ["\u0B85", "\u0B8A"], ["\u0B8E", "\u0B90"], ["\u0B92", "\u0B95"], ["\u0B99", "\u0B9A"], "\u0B9C", ["\u0B9E", "\u0B9F"], ["\u0BA3", "\u0BA4"], ["\u0BA8", "\u0BAA"], ["\u0BAE", "\u0BB9"], "\u0BD0", ["\u0C05", "\u0C0C"], ["\u0C0E", "\u0C10"], ["\u0C12", "\u0C28"], ["\u0C2A", "\u0C39"], "\u0C3D", ["\u0C58", "\u0C5A"], ["\u0C60", "\u0C61"], ["\u0C85", "\u0C8C"], ["\u0C8E", "\u0C90"], ["\u0C92", "\u0CA8"], ["\u0CAA", "\u0CB3"], ["\u0CB5", "\u0CB9"], "\u0CBD", "\u0CDE", ["\u0CE0", "\u0CE1"], ["\u0CF1", "\u0CF2"], ["\u0D05", "\u0D0C"], ["\u0D0E", "\u0D10"], ["\u0D12", "\u0D3A"], "\u0D3D", "\u0D4E", ["\u0D5F", "\u0D61"], ["\u0D7A", "\u0D7F"], ["\u0D85", "\u0D96"], ["\u0D9A", "\u0DB1"], ["\u0DB3", "\u0DBB"], "\u0DBD", ["\u0DC0", "\u0DC6"], ["\u0E01", "\u0E30"], ["\u0E32", "\u0E33"], ["\u0E40", "\u0E45"], ["\u0E81", "\u0E82"], "\u0E84", ["\u0E87", "\u0E88"], "\u0E8A", "\u0E8D", ["\u0E94", "\u0E97"], ["\u0E99", "\u0E9F"], ["\u0EA1", "\u0EA3"], "\u0EA5", "\u0EA7", ["\u0EAA", "\u0EAB"], ["\u0EAD", "\u0EB0"], ["\u0EB2", "\u0EB3"], "\u0EBD", ["\u0EC0", "\u0EC4"], ["\u0EDC", "\u0EDF"], "\u0F00", ["\u0F40", "\u0F47"], ["\u0F49", "\u0F6C"], ["\u0F88", "\u0F8C"], ["\u1000", "\u102A"], "\u103F", ["\u1050", "\u1055"], ["\u105A", "\u105D"], "\u1061", ["\u1065", "\u1066"], ["\u106E", "\u1070"], ["\u1075", "\u1081"], "\u108E", ["\u10D0", "\u10FA"], ["\u10FD", "\u1248"], ["\u124A", "\u124D"], ["\u1250", "\u1256"], "\u1258", ["\u125A", "\u125D"], ["\u1260", "\u1288"], ["\u128A", "\u128D"], ["\u1290", "\u12B0"], ["\u12B2", "\u12B5"], ["\u12B8", "\u12BE"], "\u12C0", ["\u12C2", "\u12C5"], ["\u12C8", "\u12D6"], ["\u12D8", "\u1310"], ["\u1312", "\u1315"], ["\u1318", "\u135A"], ["\u1380", "\u138F"], ["\u1401", "\u166C"], ["\u166F", "\u167F"], ["\u1681", "\u169A"], ["\u16A0", "\u16EA"], ["\u16F1", "\u16F8"], ["\u1700", "\u170C"], ["\u170E", "\u1711"], ["\u1720", "\u1731"], ["\u1740", "\u1751"], ["\u1760", "\u176C"], ["\u176E", "\u1770"], ["\u1780", "\u17B3"], "\u17DC", ["\u1820", "\u1842"], ["\u1844", "\u1877"], ["\u1880", "\u18A8"], "\u18AA", ["\u18B0", "\u18F5"], ["\u1900", "\u191E"], ["\u1950", "\u196D"], ["\u1970", "\u1974"], ["\u1980", "\u19AB"], ["\u19B0", "\u19C9"], ["\u1A00", "\u1A16"], ["\u1A20", "\u1A54"], ["\u1B05", "\u1B33"], ["\u1B45", "\u1B4B"], ["\u1B83", "\u1BA0"], ["\u1BAE", "\u1BAF"], ["\u1BBA", "\u1BE5"], ["\u1C00", "\u1C23"], ["\u1C4D", "\u1C4F"], ["\u1C5A", "\u1C77"], ["\u1CE9", "\u1CEC"], ["\u1CEE", "\u1CF1"], ["\u1CF5", "\u1CF6"], ["\u2135", "\u2138"], ["\u2D30", "\u2D67"], ["\u2D80", "\u2D96"], ["\u2DA0", "\u2DA6"], ["\u2DA8", "\u2DAE"], ["\u2DB0", "\u2DB6"], ["\u2DB8", "\u2DBE"], ["\u2DC0", "\u2DC6"], ["\u2DC8", "\u2DCE"], ["\u2DD0", "\u2DD6"], ["\u2DD8", "\u2DDE"], "\u3006", "\u303C", ["\u3041", "\u3096"], "\u309F", ["\u30A1", "\u30FA"], "\u30FF", ["\u3105", "\u312D"], ["\u3131", "\u318E"], ["\u31A0", "\u31BA"], ["\u31F0", "\u31FF"], ["\u3400", "\u4DB5"], ["\u4E00", "\u9FD5"], ["\uA000", "\uA014"], ["\uA016", "\uA48C"], ["\uA4D0", "\uA4F7"], ["\uA500", "\uA60B"], ["\uA610", "\uA61F"], ["\uA62A", "\uA62B"], "\uA66E", ["\uA6A0", "\uA6E5"], "\uA78F", "\uA7F7", ["\uA7FB", "\uA801"], ["\uA803", "\uA805"], ["\uA807", "\uA80A"], ["\uA80C", "\uA822"], ["\uA840", "\uA873"], ["\uA882", "\uA8B3"], ["\uA8F2", "\uA8F7"], "\uA8FB", "\uA8FD", ["\uA90A", "\uA925"], ["\uA930", "\uA946"], ["\uA960", "\uA97C"], ["\uA984", "\uA9B2"], ["\uA9E0", "\uA9E4"], ["\uA9E7", "\uA9EF"], ["\uA9FA", "\uA9FE"], ["\uAA00", "\uAA28"], ["\uAA40", "\uAA42"], ["\uAA44", "\uAA4B"], ["\uAA60", "\uAA6F"], ["\uAA71", "\uAA76"], "\uAA7A", ["\uAA7E", "\uAAAF"], "\uAAB1", ["\uAAB5", "\uAAB6"], ["\uAAB9", "\uAABD"], "\uAAC0", "\uAAC2", ["\uAADB", "\uAADC"], ["\uAAE0", "\uAAEA"], "\uAAF2", ["\uAB01", "\uAB06"], ["\uAB09", "\uAB0E"], ["\uAB11", "\uAB16"], ["\uAB20", "\uAB26"], ["\uAB28", "\uAB2E"], ["\uABC0", "\uABE2"], ["\uAC00", "\uD7A3"], ["\uD7B0", "\uD7C6"], ["\uD7CB", "\uD7FB"], ["\uF900", "\uFA6D"], ["\uFA70", "\uFAD9"], "\uFB1D", ["\uFB1F", "\uFB28"], ["\uFB2A", "\uFB36"], ["\uFB38", "\uFB3C"], "\uFB3E", ["\uFB40", "\uFB41"], ["\uFB43", "\uFB44"], ["\uFB46", "\uFBB1"], ["\uFBD3", "\uFD3D"], ["\uFD50", "\uFD8F"], ["\uFD92", "\uFDC7"], ["\uFDF0", "\uFDFB"], ["\uFE70", "\uFE74"], ["\uFE76", "\uFEFC"], ["\uFF66", "\uFF6F"], ["\uFF71", "\uFF9D"], ["\uFFA0", "\uFFBE"], ["\uFFC2", "\uFFC7"], ["\uFFCA", "\uFFCF"], ["\uFFD2", "\uFFD7"], ["\uFFDA", "\uFFDC"]], false, false),
      peg$c150 = /^[\u01C5\u01C8\u01CB\u01F2\u1F88-\u1F8F\u1F98-\u1F9F\u1FA8-\u1FAF\u1FBC\u1FCC\u1FFC]/,
      peg$c151 = peg$classExpectation(["\u01C5", "\u01C8", "\u01CB", "\u01F2", ["\u1F88", "\u1F8F"], ["\u1F98", "\u1F9F"], ["\u1FA8", "\u1FAF"], "\u1FBC", "\u1FCC", "\u1FFC"], false, false),
      peg$c152 = /^[A-Z\xC0-\xD6\xD8-\xDE\u0100\u0102\u0104\u0106\u0108\u010A\u010C\u010E\u0110\u0112\u0114\u0116\u0118\u011A\u011C\u011E\u0120\u0122\u0124\u0126\u0128\u012A\u012C\u012E\u0130\u0132\u0134\u0136\u0139\u013B\u013D\u013F\u0141\u0143\u0145\u0147\u014A\u014C\u014E\u0150\u0152\u0154\u0156\u0158\u015A\u015C\u015E\u0160\u0162\u0164\u0166\u0168\u016A\u016C\u016E\u0170\u0172\u0174\u0176\u0178-\u0179\u017B\u017D\u0181-\u0182\u0184\u0186-\u0187\u0189-\u018B\u018E-\u0191\u0193-\u0194\u0196-\u0198\u019C-\u019D\u019F-\u01A0\u01A2\u01A4\u01A6-\u01A7\u01A9\u01AC\u01AE-\u01AF\u01B1-\u01B3\u01B5\u01B7-\u01B8\u01BC\u01C4\u01C7\u01CA\u01CD\u01CF\u01D1\u01D3\u01D5\u01D7\u01D9\u01DB\u01DE\u01E0\u01E2\u01E4\u01E6\u01E8\u01EA\u01EC\u01EE\u01F1\u01F4\u01F6-\u01F8\u01FA\u01FC\u01FE\u0200\u0202\u0204\u0206\u0208\u020A\u020C\u020E\u0210\u0212\u0214\u0216\u0218\u021A\u021C\u021E\u0220\u0222\u0224\u0226\u0228\u022A\u022C\u022E\u0230\u0232\u023A-\u023B\u023D-\u023E\u0241\u0243-\u0246\u0248\u024A\u024C\u024E\u0370\u0372\u0376\u037F\u0386\u0388-\u038A\u038C\u038E-\u038F\u0391-\u03A1\u03A3-\u03AB\u03CF\u03D2-\u03D4\u03D8\u03DA\u03DC\u03DE\u03E0\u03E2\u03E4\u03E6\u03E8\u03EA\u03EC\u03EE\u03F4\u03F7\u03F9-\u03FA\u03FD-\u042F\u0460\u0462\u0464\u0466\u0468\u046A\u046C\u046E\u0470\u0472\u0474\u0476\u0478\u047A\u047C\u047E\u0480\u048A\u048C\u048E\u0490\u0492\u0494\u0496\u0498\u049A\u049C\u049E\u04A0\u04A2\u04A4\u04A6\u04A8\u04AA\u04AC\u04AE\u04B0\u04B2\u04B4\u04B6\u04B8\u04BA\u04BC\u04BE\u04C0-\u04C1\u04C3\u04C5\u04C7\u04C9\u04CB\u04CD\u04D0\u04D2\u04D4\u04D6\u04D8\u04DA\u04DC\u04DE\u04E0\u04E2\u04E4\u04E6\u04E8\u04EA\u04EC\u04EE\u04F0\u04F2\u04F4\u04F6\u04F8\u04FA\u04FC\u04FE\u0500\u0502\u0504\u0506\u0508\u050A\u050C\u050E\u0510\u0512\u0514\u0516\u0518\u051A\u051C\u051E\u0520\u0522\u0524\u0526\u0528\u052A\u052C\u052E\u0531-\u0556\u10A0-\u10C5\u10C7\u10CD\u13A0-\u13F5\u1E00\u1E02\u1E04\u1E06\u1E08\u1E0A\u1E0C\u1E0E\u1E10\u1E12\u1E14\u1E16\u1E18\u1E1A\u1E1C\u1E1E\u1E20\u1E22\u1E24\u1E26\u1E28\u1E2A\u1E2C\u1E2E\u1E30\u1E32\u1E34\u1E36\u1E38\u1E3A\u1E3C\u1E3E\u1E40\u1E42\u1E44\u1E46\u1E48\u1E4A\u1E4C\u1E4E\u1E50\u1E52\u1E54\u1E56\u1E58\u1E5A\u1E5C\u1E5E\u1E60\u1E62\u1E64\u1E66\u1E68\u1E6A\u1E6C\u1E6E\u1E70\u1E72\u1E74\u1E76\u1E78\u1E7A\u1E7C\u1E7E\u1E80\u1E82\u1E84\u1E86\u1E88\u1E8A\u1E8C\u1E8E\u1E90\u1E92\u1E94\u1E9E\u1EA0\u1EA2\u1EA4\u1EA6\u1EA8\u1EAA\u1EAC\u1EAE\u1EB0\u1EB2\u1EB4\u1EB6\u1EB8\u1EBA\u1EBC\u1EBE\u1EC0\u1EC2\u1EC4\u1EC6\u1EC8\u1ECA\u1ECC\u1ECE\u1ED0\u1ED2\u1ED4\u1ED6\u1ED8\u1EDA\u1EDC\u1EDE\u1EE0\u1EE2\u1EE4\u1EE6\u1EE8\u1EEA\u1EEC\u1EEE\u1EF0\u1EF2\u1EF4\u1EF6\u1EF8\u1EFA\u1EFC\u1EFE\u1F08-\u1F0F\u1F18-\u1F1D\u1F28-\u1F2F\u1F38-\u1F3F\u1F48-\u1F4D\u1F59\u1F5B\u1F5D\u1F5F\u1F68-\u1F6F\u1FB8-\u1FBB\u1FC8-\u1FCB\u1FD8-\u1FDB\u1FE8-\u1FEC\u1FF8-\u1FFB\u2102\u2107\u210B-\u210D\u2110-\u2112\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u2130-\u2133\u213E-\u213F\u2145\u2183\u2C00-\u2C2E\u2C60\u2C62-\u2C64\u2C67\u2C69\u2C6B\u2C6D-\u2C70\u2C72\u2C75\u2C7E-\u2C80\u2C82\u2C84\u2C86\u2C88\u2C8A\u2C8C\u2C8E\u2C90\u2C92\u2C94\u2C96\u2C98\u2C9A\u2C9C\u2C9E\u2CA0\u2CA2\u2CA4\u2CA6\u2CA8\u2CAA\u2CAC\u2CAE\u2CB0\u2CB2\u2CB4\u2CB6\u2CB8\u2CBA\u2CBC\u2CBE\u2CC0\u2CC2\u2CC4\u2CC6\u2CC8\u2CCA\u2CCC\u2CCE\u2CD0\u2CD2\u2CD4\u2CD6\u2CD8\u2CDA\u2CDC\u2CDE\u2CE0\u2CE2\u2CEB\u2CED\u2CF2\uA640\uA642\uA644\uA646\uA648\uA64A\uA64C\uA64E\uA650\uA652\uA654\uA656\uA658\uA65A\uA65C\uA65E\uA660\uA662\uA664\uA666\uA668\uA66A\uA66C\uA680\uA682\uA684\uA686\uA688\uA68A\uA68C\uA68E\uA690\uA692\uA694\uA696\uA698\uA69A\uA722\uA724\uA726\uA728\uA72A\uA72C\uA72E\uA732\uA734\uA736\uA738\uA73A\uA73C\uA73E\uA740\uA742\uA744\uA746\uA748\uA74A\uA74C\uA74E\uA750\uA752\uA754\uA756\uA758\uA75A\uA75C\uA75E\uA760\uA762\uA764\uA766\uA768\uA76A\uA76C\uA76E\uA779\uA77B\uA77D-\uA77E\uA780\uA782\uA784\uA786\uA78B\uA78D\uA790\uA792\uA796\uA798\uA79A\uA79C\uA79E\uA7A0\uA7A2\uA7A4\uA7A6\uA7A8\uA7AA-\uA7AD\uA7B0-\uA7B4\uA7B6\uFF21-\uFF3A]/,
      peg$c153 = peg$classExpectation([["A", "Z"], ["\xC0", "\xD6"], ["\xD8", "\xDE"], "\u0100", "\u0102", "\u0104", "\u0106", "\u0108", "\u010A", "\u010C", "\u010E", "\u0110", "\u0112", "\u0114", "\u0116", "\u0118", "\u011A", "\u011C", "\u011E", "\u0120", "\u0122", "\u0124", "\u0126", "\u0128", "\u012A", "\u012C", "\u012E", "\u0130", "\u0132", "\u0134", "\u0136", "\u0139", "\u013B", "\u013D", "\u013F", "\u0141", "\u0143", "\u0145", "\u0147", "\u014A", "\u014C", "\u014E", "\u0150", "\u0152", "\u0154", "\u0156", "\u0158", "\u015A", "\u015C", "\u015E", "\u0160", "\u0162", "\u0164", "\u0166", "\u0168", "\u016A", "\u016C", "\u016E", "\u0170", "\u0172", "\u0174", "\u0176", ["\u0178", "\u0179"], "\u017B", "\u017D", ["\u0181", "\u0182"], "\u0184", ["\u0186", "\u0187"], ["\u0189", "\u018B"], ["\u018E", "\u0191"], ["\u0193", "\u0194"], ["\u0196", "\u0198"], ["\u019C", "\u019D"], ["\u019F", "\u01A0"], "\u01A2", "\u01A4", ["\u01A6", "\u01A7"], "\u01A9", "\u01AC", ["\u01AE", "\u01AF"], ["\u01B1", "\u01B3"], "\u01B5", ["\u01B7", "\u01B8"], "\u01BC", "\u01C4", "\u01C7", "\u01CA", "\u01CD", "\u01CF", "\u01D1", "\u01D3", "\u01D5", "\u01D7", "\u01D9", "\u01DB", "\u01DE", "\u01E0", "\u01E2", "\u01E4", "\u01E6", "\u01E8", "\u01EA", "\u01EC", "\u01EE", "\u01F1", "\u01F4", ["\u01F6", "\u01F8"], "\u01FA", "\u01FC", "\u01FE", "\u0200", "\u0202", "\u0204", "\u0206", "\u0208", "\u020A", "\u020C", "\u020E", "\u0210", "\u0212", "\u0214", "\u0216", "\u0218", "\u021A", "\u021C", "\u021E", "\u0220", "\u0222", "\u0224", "\u0226", "\u0228", "\u022A", "\u022C", "\u022E", "\u0230", "\u0232", ["\u023A", "\u023B"], ["\u023D", "\u023E"], "\u0241", ["\u0243", "\u0246"], "\u0248", "\u024A", "\u024C", "\u024E", "\u0370", "\u0372", "\u0376", "\u037F", "\u0386", ["\u0388", "\u038A"], "\u038C", ["\u038E", "\u038F"], ["\u0391", "\u03A1"], ["\u03A3", "\u03AB"], "\u03CF", ["\u03D2", "\u03D4"], "\u03D8", "\u03DA", "\u03DC", "\u03DE", "\u03E0", "\u03E2", "\u03E4", "\u03E6", "\u03E8", "\u03EA", "\u03EC", "\u03EE", "\u03F4", "\u03F7", ["\u03F9", "\u03FA"], ["\u03FD", "\u042F"], "\u0460", "\u0462", "\u0464", "\u0466", "\u0468", "\u046A", "\u046C", "\u046E", "\u0470", "\u0472", "\u0474", "\u0476", "\u0478", "\u047A", "\u047C", "\u047E", "\u0480", "\u048A", "\u048C", "\u048E", "\u0490", "\u0492", "\u0494", "\u0496", "\u0498", "\u049A", "\u049C", "\u049E", "\u04A0", "\u04A2", "\u04A4", "\u04A6", "\u04A8", "\u04AA", "\u04AC", "\u04AE", "\u04B0", "\u04B2", "\u04B4", "\u04B6", "\u04B8", "\u04BA", "\u04BC", "\u04BE", ["\u04C0", "\u04C1"], "\u04C3", "\u04C5", "\u04C7", "\u04C9", "\u04CB", "\u04CD", "\u04D0", "\u04D2", "\u04D4", "\u04D6", "\u04D8", "\u04DA", "\u04DC", "\u04DE", "\u04E0", "\u04E2", "\u04E4", "\u04E6", "\u04E8", "\u04EA", "\u04EC", "\u04EE", "\u04F0", "\u04F2", "\u04F4", "\u04F6", "\u04F8", "\u04FA", "\u04FC", "\u04FE", "\u0500", "\u0502", "\u0504", "\u0506", "\u0508", "\u050A", "\u050C", "\u050E", "\u0510", "\u0512", "\u0514", "\u0516", "\u0518", "\u051A", "\u051C", "\u051E", "\u0520", "\u0522", "\u0524", "\u0526", "\u0528", "\u052A", "\u052C", "\u052E", ["\u0531", "\u0556"], ["\u10A0", "\u10C5"], "\u10C7", "\u10CD", ["\u13A0", "\u13F5"], "\u1E00", "\u1E02", "\u1E04", "\u1E06", "\u1E08", "\u1E0A", "\u1E0C", "\u1E0E", "\u1E10", "\u1E12", "\u1E14", "\u1E16", "\u1E18", "\u1E1A", "\u1E1C", "\u1E1E", "\u1E20", "\u1E22", "\u1E24", "\u1E26", "\u1E28", "\u1E2A", "\u1E2C", "\u1E2E", "\u1E30", "\u1E32", "\u1E34", "\u1E36", "\u1E38", "\u1E3A", "\u1E3C", "\u1E3E", "\u1E40", "\u1E42", "\u1E44", "\u1E46", "\u1E48", "\u1E4A", "\u1E4C", "\u1E4E", "\u1E50", "\u1E52", "\u1E54", "\u1E56", "\u1E58", "\u1E5A", "\u1E5C", "\u1E5E", "\u1E60", "\u1E62", "\u1E64", "\u1E66", "\u1E68", "\u1E6A", "\u1E6C", "\u1E6E", "\u1E70", "\u1E72", "\u1E74", "\u1E76", "\u1E78", "\u1E7A", "\u1E7C", "\u1E7E", "\u1E80", "\u1E82", "\u1E84", "\u1E86", "\u1E88", "\u1E8A", "\u1E8C", "\u1E8E", "\u1E90", "\u1E92", "\u1E94", "\u1E9E", "\u1EA0", "\u1EA2", "\u1EA4", "\u1EA6", "\u1EA8", "\u1EAA", "\u1EAC", "\u1EAE", "\u1EB0", "\u1EB2", "\u1EB4", "\u1EB6", "\u1EB8", "\u1EBA", "\u1EBC", "\u1EBE", "\u1EC0", "\u1EC2", "\u1EC4", "\u1EC6", "\u1EC8", "\u1ECA", "\u1ECC", "\u1ECE", "\u1ED0", "\u1ED2", "\u1ED4", "\u1ED6", "\u1ED8", "\u1EDA", "\u1EDC", "\u1EDE", "\u1EE0", "\u1EE2", "\u1EE4", "\u1EE6", "\u1EE8", "\u1EEA", "\u1EEC", "\u1EEE", "\u1EF0", "\u1EF2", "\u1EF4", "\u1EF6", "\u1EF8", "\u1EFA", "\u1EFC", "\u1EFE", ["\u1F08", "\u1F0F"], ["\u1F18", "\u1F1D"], ["\u1F28", "\u1F2F"], ["\u1F38", "\u1F3F"], ["\u1F48", "\u1F4D"], "\u1F59", "\u1F5B", "\u1F5D", "\u1F5F", ["\u1F68", "\u1F6F"], ["\u1FB8", "\u1FBB"], ["\u1FC8", "\u1FCB"], ["\u1FD8", "\u1FDB"], ["\u1FE8", "\u1FEC"], ["\u1FF8", "\u1FFB"], "\u2102", "\u2107", ["\u210B", "\u210D"], ["\u2110", "\u2112"], "\u2115", ["\u2119", "\u211D"], "\u2124", "\u2126", "\u2128", ["\u212A", "\u212D"], ["\u2130", "\u2133"], ["\u213E", "\u213F"], "\u2145", "\u2183", ["\u2C00", "\u2C2E"], "\u2C60", ["\u2C62", "\u2C64"], "\u2C67", "\u2C69", "\u2C6B", ["\u2C6D", "\u2C70"], "\u2C72", "\u2C75", ["\u2C7E", "\u2C80"], "\u2C82", "\u2C84", "\u2C86", "\u2C88", "\u2C8A", "\u2C8C", "\u2C8E", "\u2C90", "\u2C92", "\u2C94", "\u2C96", "\u2C98", "\u2C9A", "\u2C9C", "\u2C9E", "\u2CA0", "\u2CA2", "\u2CA4", "\u2CA6", "\u2CA8", "\u2CAA", "\u2CAC", "\u2CAE", "\u2CB0", "\u2CB2", "\u2CB4", "\u2CB6", "\u2CB8", "\u2CBA", "\u2CBC", "\u2CBE", "\u2CC0", "\u2CC2", "\u2CC4", "\u2CC6", "\u2CC8", "\u2CCA", "\u2CCC", "\u2CCE", "\u2CD0", "\u2CD2", "\u2CD4", "\u2CD6", "\u2CD8", "\u2CDA", "\u2CDC", "\u2CDE", "\u2CE0", "\u2CE2", "\u2CEB", "\u2CED", "\u2CF2", "\uA640", "\uA642", "\uA644", "\uA646", "\uA648", "\uA64A", "\uA64C", "\uA64E", "\uA650", "\uA652", "\uA654", "\uA656", "\uA658", "\uA65A", "\uA65C", "\uA65E", "\uA660", "\uA662", "\uA664", "\uA666", "\uA668", "\uA66A", "\uA66C", "\uA680", "\uA682", "\uA684", "\uA686", "\uA688", "\uA68A", "\uA68C", "\uA68E", "\uA690", "\uA692", "\uA694", "\uA696", "\uA698", "\uA69A", "\uA722", "\uA724", "\uA726", "\uA728", "\uA72A", "\uA72C", "\uA72E", "\uA732", "\uA734", "\uA736", "\uA738", "\uA73A", "\uA73C", "\uA73E", "\uA740", "\uA742", "\uA744", "\uA746", "\uA748", "\uA74A", "\uA74C", "\uA74E", "\uA750", "\uA752", "\uA754", "\uA756", "\uA758", "\uA75A", "\uA75C", "\uA75E", "\uA760", "\uA762", "\uA764", "\uA766", "\uA768", "\uA76A", "\uA76C", "\uA76E", "\uA779", "\uA77B", ["\uA77D", "\uA77E"], "\uA780", "\uA782", "\uA784", "\uA786", "\uA78B", "\uA78D", "\uA790", "\uA792", "\uA796", "\uA798", "\uA79A", "\uA79C", "\uA79E", "\uA7A0", "\uA7A2", "\uA7A4", "\uA7A6", "\uA7A8", ["\uA7AA", "\uA7AD"], ["\uA7B0", "\uA7B4"], "\uA7B6", ["\uFF21", "\uFF3A"]], false, false),
      peg$c154 = /^[\u0903\u093B\u093E-\u0940\u0949-\u094C\u094E-\u094F\u0982-\u0983\u09BE-\u09C0\u09C7-\u09C8\u09CB-\u09CC\u09D7\u0A03\u0A3E-\u0A40\u0A83\u0ABE-\u0AC0\u0AC9\u0ACB-\u0ACC\u0B02-\u0B03\u0B3E\u0B40\u0B47-\u0B48\u0B4B-\u0B4C\u0B57\u0BBE-\u0BBF\u0BC1-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCC\u0BD7\u0C01-\u0C03\u0C41-\u0C44\u0C82-\u0C83\u0CBE\u0CC0-\u0CC4\u0CC7-\u0CC8\u0CCA-\u0CCB\u0CD5-\u0CD6\u0D02-\u0D03\u0D3E-\u0D40\u0D46-\u0D48\u0D4A-\u0D4C\u0D57\u0D82-\u0D83\u0DCF-\u0DD1\u0DD8-\u0DDF\u0DF2-\u0DF3\u0F3E-\u0F3F\u0F7F\u102B-\u102C\u1031\u1038\u103B-\u103C\u1056-\u1057\u1062-\u1064\u1067-\u106D\u1083-\u1084\u1087-\u108C\u108F\u109A-\u109C\u17B6\u17BE-\u17C5\u17C7-\u17C8\u1923-\u1926\u1929-\u192B\u1930-\u1931\u1933-\u1938\u1A19-\u1A1A\u1A55\u1A57\u1A61\u1A63-\u1A64\u1A6D-\u1A72\u1B04\u1B35\u1B3B\u1B3D-\u1B41\u1B43-\u1B44\u1B82\u1BA1\u1BA6-\u1BA7\u1BAA\u1BE7\u1BEA-\u1BEC\u1BEE\u1BF2-\u1BF3\u1C24-\u1C2B\u1C34-\u1C35\u1CE1\u1CF2-\u1CF3\u302E-\u302F\uA823-\uA824\uA827\uA880-\uA881\uA8B4-\uA8C3\uA952-\uA953\uA983\uA9B4-\uA9B5\uA9BA-\uA9BB\uA9BD-\uA9C0\uAA2F-\uAA30\uAA33-\uAA34\uAA4D\uAA7B\uAA7D\uAAEB\uAAEE-\uAAEF\uAAF5\uABE3-\uABE4\uABE6-\uABE7\uABE9-\uABEA\uABEC]/,
      peg$c155 = peg$classExpectation(["\u0903", "\u093B", ["\u093E", "\u0940"], ["\u0949", "\u094C"], ["\u094E", "\u094F"], ["\u0982", "\u0983"], ["\u09BE", "\u09C0"], ["\u09C7", "\u09C8"], ["\u09CB", "\u09CC"], "\u09D7", "\u0A03", ["\u0A3E", "\u0A40"], "\u0A83", ["\u0ABE", "\u0AC0"], "\u0AC9", ["\u0ACB", "\u0ACC"], ["\u0B02", "\u0B03"], "\u0B3E", "\u0B40", ["\u0B47", "\u0B48"], ["\u0B4B", "\u0B4C"], "\u0B57", ["\u0BBE", "\u0BBF"], ["\u0BC1", "\u0BC2"], ["\u0BC6", "\u0BC8"], ["\u0BCA", "\u0BCC"], "\u0BD7", ["\u0C01", "\u0C03"], ["\u0C41", "\u0C44"], ["\u0C82", "\u0C83"], "\u0CBE", ["\u0CC0", "\u0CC4"], ["\u0CC7", "\u0CC8"], ["\u0CCA", "\u0CCB"], ["\u0CD5", "\u0CD6"], ["\u0D02", "\u0D03"], ["\u0D3E", "\u0D40"], ["\u0D46", "\u0D48"], ["\u0D4A", "\u0D4C"], "\u0D57", ["\u0D82", "\u0D83"], ["\u0DCF", "\u0DD1"], ["\u0DD8", "\u0DDF"], ["\u0DF2", "\u0DF3"], ["\u0F3E", "\u0F3F"], "\u0F7F", ["\u102B", "\u102C"], "\u1031", "\u1038", ["\u103B", "\u103C"], ["\u1056", "\u1057"], ["\u1062", "\u1064"], ["\u1067", "\u106D"], ["\u1083", "\u1084"], ["\u1087", "\u108C"], "\u108F", ["\u109A", "\u109C"], "\u17B6", ["\u17BE", "\u17C5"], ["\u17C7", "\u17C8"], ["\u1923", "\u1926"], ["\u1929", "\u192B"], ["\u1930", "\u1931"], ["\u1933", "\u1938"], ["\u1A19", "\u1A1A"], "\u1A55", "\u1A57", "\u1A61", ["\u1A63", "\u1A64"], ["\u1A6D", "\u1A72"], "\u1B04", "\u1B35", "\u1B3B", ["\u1B3D", "\u1B41"], ["\u1B43", "\u1B44"], "\u1B82", "\u1BA1", ["\u1BA6", "\u1BA7"], "\u1BAA", "\u1BE7", ["\u1BEA", "\u1BEC"], "\u1BEE", ["\u1BF2", "\u1BF3"], ["\u1C24", "\u1C2B"], ["\u1C34", "\u1C35"], "\u1CE1", ["\u1CF2", "\u1CF3"], ["\u302E", "\u302F"], ["\uA823", "\uA824"], "\uA827", ["\uA880", "\uA881"], ["\uA8B4", "\uA8C3"], ["\uA952", "\uA953"], "\uA983", ["\uA9B4", "\uA9B5"], ["\uA9BA", "\uA9BB"], ["\uA9BD", "\uA9C0"], ["\uAA2F", "\uAA30"], ["\uAA33", "\uAA34"], "\uAA4D", "\uAA7B", "\uAA7D", "\uAAEB", ["\uAAEE", "\uAAEF"], "\uAAF5", ["\uABE3", "\uABE4"], ["\uABE6", "\uABE7"], ["\uABE9", "\uABEA"], "\uABEC"], false, false),
      peg$c156 = /^[\u0300-\u036F\u0483-\u0487\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962-\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2-\u09E3\u0A01-\u0A02\u0A3C\u0A41-\u0A42\u0A47-\u0A48\u0A4B-\u0A4D\u0A51\u0A70-\u0A71\u0A75\u0A81-\u0A82\u0ABC\u0AC1-\u0AC5\u0AC7-\u0AC8\u0ACD\u0AE2-\u0AE3\u0B01\u0B3C\u0B3F\u0B41-\u0B44\u0B4D\u0B56\u0B62-\u0B63\u0B82\u0BC0\u0BCD\u0C00\u0C3E-\u0C40\u0C46-\u0C48\u0C4A-\u0C4D\u0C55-\u0C56\u0C62-\u0C63\u0C81\u0CBC\u0CBF\u0CC6\u0CCC-\u0CCD\u0CE2-\u0CE3\u0D01\u0D41-\u0D44\u0D4D\u0D62-\u0D63\u0DCA\u0DD2-\u0DD4\u0DD6\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB-\u0EBC\u0EC8-\u0ECD\u0F18-\u0F19\u0F35\u0F37\u0F39\u0F71-\u0F7E\u0F80-\u0F84\u0F86-\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102D-\u1030\u1032-\u1037\u1039-\u103A\u103D-\u103E\u1058-\u1059\u105E-\u1060\u1071-\u1074\u1082\u1085-\u1086\u108D\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752-\u1753\u1772-\u1773\u17B4-\u17B5\u17B7-\u17BD\u17C6\u17C9-\u17D3\u17DD\u180B-\u180D\u18A9\u1920-\u1922\u1927-\u1928\u1932\u1939-\u193B\u1A17-\u1A18\u1A1B\u1A56\u1A58-\u1A5E\u1A60\u1A62\u1A65-\u1A6C\u1A73-\u1A7C\u1A7F\u1AB0-\u1ABD\u1B00-\u1B03\u1B34\u1B36-\u1B3A\u1B3C\u1B42\u1B6B-\u1B73\u1B80-\u1B81\u1BA2-\u1BA5\u1BA8-\u1BA9\u1BAB-\u1BAD\u1BE6\u1BE8-\u1BE9\u1BED\u1BEF-\u1BF1\u1C2C-\u1C33\u1C36-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE0\u1CE2-\u1CE8\u1CED\u1CF4\u1CF8-\u1CF9\u1DC0-\u1DF5\u1DFC-\u1DFF\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302D\u3099-\u309A\uA66F\uA674-\uA67D\uA69E-\uA69F\uA6F0-\uA6F1\uA802\uA806\uA80B\uA825-\uA826\uA8C4\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA951\uA980-\uA982\uA9B3\uA9B6-\uA9B9\uA9BC\uA9E5\uAA29-\uAA2E\uAA31-\uAA32\uAA35-\uAA36\uAA43\uAA4C\uAA7C\uAAB0\uAAB2-\uAAB4\uAAB7-\uAAB8\uAABE-\uAABF\uAAC1\uAAEC-\uAAED\uAAF6\uABE5\uABE8\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F]/,
      peg$c157 = peg$classExpectation([["\u0300", "\u036F"], ["\u0483", "\u0487"], ["\u0591", "\u05BD"], "\u05BF", ["\u05C1", "\u05C2"], ["\u05C4", "\u05C5"], "\u05C7", ["\u0610", "\u061A"], ["\u064B", "\u065F"], "\u0670", ["\u06D6", "\u06DC"], ["\u06DF", "\u06E4"], ["\u06E7", "\u06E8"], ["\u06EA", "\u06ED"], "\u0711", ["\u0730", "\u074A"], ["\u07A6", "\u07B0"], ["\u07EB", "\u07F3"], ["\u0816", "\u0819"], ["\u081B", "\u0823"], ["\u0825", "\u0827"], ["\u0829", "\u082D"], ["\u0859", "\u085B"], ["\u08E3", "\u0902"], "\u093A", "\u093C", ["\u0941", "\u0948"], "\u094D", ["\u0951", "\u0957"], ["\u0962", "\u0963"], "\u0981", "\u09BC", ["\u09C1", "\u09C4"], "\u09CD", ["\u09E2", "\u09E3"], ["\u0A01", "\u0A02"], "\u0A3C", ["\u0A41", "\u0A42"], ["\u0A47", "\u0A48"], ["\u0A4B", "\u0A4D"], "\u0A51", ["\u0A70", "\u0A71"], "\u0A75", ["\u0A81", "\u0A82"], "\u0ABC", ["\u0AC1", "\u0AC5"], ["\u0AC7", "\u0AC8"], "\u0ACD", ["\u0AE2", "\u0AE3"], "\u0B01", "\u0B3C", "\u0B3F", ["\u0B41", "\u0B44"], "\u0B4D", "\u0B56", ["\u0B62", "\u0B63"], "\u0B82", "\u0BC0", "\u0BCD", "\u0C00", ["\u0C3E", "\u0C40"], ["\u0C46", "\u0C48"], ["\u0C4A", "\u0C4D"], ["\u0C55", "\u0C56"], ["\u0C62", "\u0C63"], "\u0C81", "\u0CBC", "\u0CBF", "\u0CC6", ["\u0CCC", "\u0CCD"], ["\u0CE2", "\u0CE3"], "\u0D01", ["\u0D41", "\u0D44"], "\u0D4D", ["\u0D62", "\u0D63"], "\u0DCA", ["\u0DD2", "\u0DD4"], "\u0DD6", "\u0E31", ["\u0E34", "\u0E3A"], ["\u0E47", "\u0E4E"], "\u0EB1", ["\u0EB4", "\u0EB9"], ["\u0EBB", "\u0EBC"], ["\u0EC8", "\u0ECD"], ["\u0F18", "\u0F19"], "\u0F35", "\u0F37", "\u0F39", ["\u0F71", "\u0F7E"], ["\u0F80", "\u0F84"], ["\u0F86", "\u0F87"], ["\u0F8D", "\u0F97"], ["\u0F99", "\u0FBC"], "\u0FC6", ["\u102D", "\u1030"], ["\u1032", "\u1037"], ["\u1039", "\u103A"], ["\u103D", "\u103E"], ["\u1058", "\u1059"], ["\u105E", "\u1060"], ["\u1071", "\u1074"], "\u1082", ["\u1085", "\u1086"], "\u108D", "\u109D", ["\u135D", "\u135F"], ["\u1712", "\u1714"], ["\u1732", "\u1734"], ["\u1752", "\u1753"], ["\u1772", "\u1773"], ["\u17B4", "\u17B5"], ["\u17B7", "\u17BD"], "\u17C6", ["\u17C9", "\u17D3"], "\u17DD", ["\u180B", "\u180D"], "\u18A9", ["\u1920", "\u1922"], ["\u1927", "\u1928"], "\u1932", ["\u1939", "\u193B"], ["\u1A17", "\u1A18"], "\u1A1B", "\u1A56", ["\u1A58", "\u1A5E"], "\u1A60", "\u1A62", ["\u1A65", "\u1A6C"], ["\u1A73", "\u1A7C"], "\u1A7F", ["\u1AB0", "\u1ABD"], ["\u1B00", "\u1B03"], "\u1B34", ["\u1B36", "\u1B3A"], "\u1B3C", "\u1B42", ["\u1B6B", "\u1B73"], ["\u1B80", "\u1B81"], ["\u1BA2", "\u1BA5"], ["\u1BA8", "\u1BA9"], ["\u1BAB", "\u1BAD"], "\u1BE6", ["\u1BE8", "\u1BE9"], "\u1BED", ["\u1BEF", "\u1BF1"], ["\u1C2C", "\u1C33"], ["\u1C36", "\u1C37"], ["\u1CD0", "\u1CD2"], ["\u1CD4", "\u1CE0"], ["\u1CE2", "\u1CE8"], "\u1CED", "\u1CF4", ["\u1CF8", "\u1CF9"], ["\u1DC0", "\u1DF5"], ["\u1DFC", "\u1DFF"], ["\u20D0", "\u20DC"], "\u20E1", ["\u20E5", "\u20F0"], ["\u2CEF", "\u2CF1"], "\u2D7F", ["\u2DE0", "\u2DFF"], ["\u302A", "\u302D"], ["\u3099", "\u309A"], "\uA66F", ["\uA674", "\uA67D"], ["\uA69E", "\uA69F"], ["\uA6F0", "\uA6F1"], "\uA802", "\uA806", "\uA80B", ["\uA825", "\uA826"], "\uA8C4", ["\uA8E0", "\uA8F1"], ["\uA926", "\uA92D"], ["\uA947", "\uA951"], ["\uA980", "\uA982"], "\uA9B3", ["\uA9B6", "\uA9B9"], "\uA9BC", "\uA9E5", ["\uAA29", "\uAA2E"], ["\uAA31", "\uAA32"], ["\uAA35", "\uAA36"], "\uAA43", "\uAA4C", "\uAA7C", "\uAAB0", ["\uAAB2", "\uAAB4"], ["\uAAB7", "\uAAB8"], ["\uAABE", "\uAABF"], "\uAAC1", ["\uAAEC", "\uAAED"], "\uAAF6", "\uABE5", "\uABE8", "\uABED", "\uFB1E", ["\uFE00", "\uFE0F"], ["\uFE20", "\uFE2F"]], false, false),
      peg$c158 = /^[0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]/,
      peg$c159 = peg$classExpectation([["0", "9"], ["\u0660", "\u0669"], ["\u06F0", "\u06F9"], ["\u07C0", "\u07C9"], ["\u0966", "\u096F"], ["\u09E6", "\u09EF"], ["\u0A66", "\u0A6F"], ["\u0AE6", "\u0AEF"], ["\u0B66", "\u0B6F"], ["\u0BE6", "\u0BEF"], ["\u0C66", "\u0C6F"], ["\u0CE6", "\u0CEF"], ["\u0D66", "\u0D6F"], ["\u0DE6", "\u0DEF"], ["\u0E50", "\u0E59"], ["\u0ED0", "\u0ED9"], ["\u0F20", "\u0F29"], ["\u1040", "\u1049"], ["\u1090", "\u1099"], ["\u17E0", "\u17E9"], ["\u1810", "\u1819"], ["\u1946", "\u194F"], ["\u19D0", "\u19D9"], ["\u1A80", "\u1A89"], ["\u1A90", "\u1A99"], ["\u1B50", "\u1B59"], ["\u1BB0", "\u1BB9"], ["\u1C40", "\u1C49"], ["\u1C50", "\u1C59"], ["\uA620", "\uA629"], ["\uA8D0", "\uA8D9"], ["\uA900", "\uA909"], ["\uA9D0", "\uA9D9"], ["\uA9F0", "\uA9F9"], ["\uAA50", "\uAA59"], ["\uABF0", "\uABF9"], ["\uFF10", "\uFF19"]], false, false),
      peg$c160 = /^[\u16EE-\u16F0\u2160-\u2182\u2185-\u2188\u3007\u3021-\u3029\u3038-\u303A\uA6E6-\uA6EF]/,
      peg$c161 = peg$classExpectation([["\u16EE", "\u16F0"], ["\u2160", "\u2182"], ["\u2185", "\u2188"], "\u3007", ["\u3021", "\u3029"], ["\u3038", "\u303A"], ["\uA6E6", "\uA6EF"]], false, false),
      peg$c162 = /^[_\u203F-\u2040\u2054\uFE33-\uFE34\uFE4D-\uFE4F\uFF3F]/,
      peg$c163 = peg$classExpectation(["_", ["\u203F", "\u2040"], "\u2054", ["\uFE33", "\uFE34"], ["\uFE4D", "\uFE4F"], "\uFF3F"], false, false),
      peg$c164 = /^[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/,
      peg$c165 = peg$classExpectation([" ", "\xA0", "\u1680", ["\u2000", "\u200A"], "\u202F", "\u205F", "\u3000"], false, false),
      peg$c166 = "break",
      peg$c167 = peg$literalExpectation("break", false),
      peg$c168 = "case",
      peg$c169 = peg$literalExpectation("case", false),
      peg$c170 = "catch",
      peg$c171 = peg$literalExpectation("catch", false),
      peg$c172 = "class",
      peg$c173 = peg$literalExpectation("class", false),
      peg$c174 = "const",
      peg$c175 = peg$literalExpectation("const", false),
      peg$c176 = "continue",
      peg$c177 = peg$literalExpectation("continue", false),
      peg$c178 = "debugger",
      peg$c179 = peg$literalExpectation("debugger", false),
      peg$c180 = "default",
      peg$c181 = peg$literalExpectation("default", false),
      peg$c182 = "delete",
      peg$c183 = peg$literalExpectation("delete", false),
      peg$c184 = "do",
      peg$c185 = peg$literalExpectation("do", false),
      peg$c186 = "else",
      peg$c187 = peg$literalExpectation("else", false),
      peg$c188 = "enum",
      peg$c189 = peg$literalExpectation("enum", false),
      peg$c190 = "export",
      peg$c191 = peg$literalExpectation("export", false),
      peg$c192 = "extends",
      peg$c193 = peg$literalExpectation("extends", false),
      peg$c194 = "false",
      peg$c195 = peg$literalExpectation("false", false),
      peg$c196 = "finally",
      peg$c197 = peg$literalExpectation("finally", false),
      peg$c198 = "for",
      peg$c199 = peg$literalExpectation("for", false),
      peg$c200 = "function",
      peg$c201 = peg$literalExpectation("function", false),
      peg$c202 = "if",
      peg$c203 = peg$literalExpectation("if", false),
      peg$c204 = "import",
      peg$c205 = peg$literalExpectation("import", false),
      peg$c206 = "instanceof",
      peg$c207 = peg$literalExpectation("instanceof", false),
      peg$c208 = "in",
      peg$c209 = peg$literalExpectation("in", false),
      peg$c210 = "new",
      peg$c211 = peg$literalExpectation("new", false),
      peg$c212 = "null",
      peg$c213 = peg$literalExpectation("null", false),
      peg$c214 = "return",
      peg$c215 = peg$literalExpectation("return", false),
      peg$c216 = "super",
      peg$c217 = peg$literalExpectation("super", false),
      peg$c218 = "switch",
      peg$c219 = peg$literalExpectation("switch", false),
      peg$c220 = "this",
      peg$c221 = peg$literalExpectation("this", false),
      peg$c222 = "throw",
      peg$c223 = peg$literalExpectation("throw", false),
      peg$c224 = "true",
      peg$c225 = peg$literalExpectation("true", false),
      peg$c226 = "try",
      peg$c227 = peg$literalExpectation("try", false),
      peg$c228 = "typeof",
      peg$c229 = peg$literalExpectation("typeof", false),
      peg$c230 = "var",
      peg$c231 = peg$literalExpectation("var", false),
      peg$c232 = "void",
      peg$c233 = peg$literalExpectation("void", false),
      peg$c234 = "while",
      peg$c235 = peg$literalExpectation("while", false),
      peg$c236 = "with",
      peg$c237 = peg$literalExpectation("with", false),
      peg$c238 = ";",
      peg$c239 = peg$literalExpectation(";", false),

      peg$currPos          = 0,
      peg$savedPos         = 0,
      peg$posDetailsCache  = [{ line: 1, column: 1 }],
      peg$maxFailPos       = 0,
      peg$maxFailExpected  = [],
      peg$silentFails      = 0,

      peg$result;

  if ("startRule" in options) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
    }

    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }

  function text() {
    return input.substring(peg$savedPos, peg$currPos);
  }

  function location() {
    return peg$computeLocation(peg$savedPos, peg$currPos);
  }

  function expected(description, location) {
    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location
    );
  }

  function error(message, location) {
    location = location !== void 0 ? location : peg$computeLocation(peg$savedPos, peg$currPos)

    throw peg$buildSimpleError(message, location);
  }

  function peg$literalExpectation(text, ignoreCase) {
    return { type: "literal", text: text, ignoreCase: ignoreCase };
  }

  function peg$classExpectation(parts, inverted, ignoreCase) {
    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
  }

  function peg$anyExpectation() {
    return { type: "any" };
  }

  function peg$endExpectation() {
    return { type: "end" };
  }

  function peg$otherExpectation(description) {
    return { type: "other", description: description };
  }

  function peg$computePosDetails(pos) {
    var details = peg$posDetailsCache[pos], p;

    if (details) {
      return details;
    } else {
      p = pos - 1;
      while (!peg$posDetailsCache[p]) {
        p--;
      }

      details = peg$posDetailsCache[p];
      details = {
        line:   details.line,
        column: details.column
      };

      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }

        p++;
      }

      peg$posDetailsCache[pos] = details;
      return details;
    }
  }

  function peg$computeLocation(startPos, endPos) {
    var startPosDetails = peg$computePosDetails(startPos),
        endPosDetails   = peg$computePosDetails(endPos);

    return {
      start: {
        offset: startPos,
        line:   startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line:   endPosDetails.line,
        column: endPosDetails.column
      }
    };
  }

  function peg$fail(expected) {
    if (peg$currPos < peg$maxFailPos) { return; }

    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }

    peg$maxFailExpected.push(expected);
  }

  function peg$buildSimpleError(message, location) {
    return new peg$SyntaxError(message, null, null, location);
  }

  function peg$buildStructuredError(expected, found, location) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected, found),
      expected,
      found,
      location
    );
  }

  function peg$parseGrammar() {
    var s0, s1, s2, s3, s4, s5, s6;

    s0 = peg$currPos;
    s1 = peg$parse__();
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$parseInitializer();
      if (s3 !== peg$FAILED) {
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$currPos;
        s5 = peg$parseRule();
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s5 = [s5, s6];
            s4 = s5;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$currPos;
            s5 = peg$parseRule();
            if (s5 !== peg$FAILED) {
              s6 = peg$parse__();
              if (s6 !== peg$FAILED) {
                s5 = [s5, s6];
                s4 = s5;
              } else {
                peg$currPos = s4;
                s4 = peg$FAILED;
              }
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          }
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c0(s2, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseInitializer() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$parseCodeBlock();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseEOS();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c1(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseRule() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseIdentifierName();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        s4 = peg$parseStringLiteral();
        if (s4 !== peg$FAILED) {
          s5 = peg$parse__();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        if (s3 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 61) {
            s4 = peg$c2;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c3); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parse__();
            if (s5 !== peg$FAILED) {
              s6 = peg$parseChoiceExpression();
              if (s6 !== peg$FAILED) {
                s7 = peg$parseEOS();
                if (s7 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c4(s1, s3, s6);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseChoiceExpression() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseActionExpression();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 47) {
          s5 = peg$c5;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c6); }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse__();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseActionExpression();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 47) {
            s5 = peg$c5;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c6); }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse__();
            if (s6 !== peg$FAILED) {
              s7 = peg$parseActionExpression();
              if (s7 !== peg$FAILED) {
                s4 = [s4, s5, s6, s7];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$FAILED;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c7(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseActionExpression() {
    var s0, s1, s2, s3, s4;

    s0 = peg$currPos;
    s1 = peg$parseSequenceExpression();
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$parse__();
      if (s3 !== peg$FAILED) {
        s4 = peg$parseCodeBlock();
        if (s4 !== peg$FAILED) {
          s3 = [s3, s4];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c8(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseSequenceExpression() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseLabeledExpression();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseLabeledExpression();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$parse__();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseLabeledExpression();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c9(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseLabeledExpression() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = peg$parseIdentifier();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 58) {
          s3 = peg$c10;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c11); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse__();
          if (s4 !== peg$FAILED) {
            s5 = peg$parsePrefixedExpression();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c12(s1, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parsePrefixedExpression();
    }

    return s0;
  }

  function peg$parsePrefixedExpression() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parsePrefixedOperator();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseSuffixedExpression();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c13(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parseSuffixedExpression();
    }

    return s0;
  }

  function peg$parsePrefixedOperator() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 36) {
      s0 = peg$c14;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c15); }
    }
    if (s0 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 38) {
        s0 = peg$c16;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c17); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 33) {
          s0 = peg$c18;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c19); }
        }
      }
    }

    return s0;
  }

  function peg$parseSuffixedExpression() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parsePrimaryExpression();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseSuffixedOperator();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c20(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$parsePrimaryExpression();
    }

    return s0;
  }

  function peg$parseSuffixedOperator() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 63) {
      s0 = peg$c21;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c22); }
    }
    if (s0 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 42) {
        s0 = peg$c23;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c24); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 43) {
          s0 = peg$c25;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c26); }
        }
      }
    }

    return s0;
  }

  function peg$parsePrimaryExpression() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$parseLiteralMatcher();
    if (s0 === peg$FAILED) {
      s0 = peg$parseCharacterClassMatcher();
      if (s0 === peg$FAILED) {
        s0 = peg$parseAnyMatcher();
        if (s0 === peg$FAILED) {
          s0 = peg$parseRuleReferenceExpression();
          if (s0 === peg$FAILED) {
            s0 = peg$parseSemanticPredicateExpression();
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 40) {
                s1 = peg$c27;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c28); }
              }
              if (s1 !== peg$FAILED) {
                s2 = peg$parse__();
                if (s2 !== peg$FAILED) {
                  s3 = peg$parseChoiceExpression();
                  if (s3 !== peg$FAILED) {
                    s4 = peg$parse__();
                    if (s4 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 41) {
                        s5 = peg$c29;
                        peg$currPos++;
                      } else {
                        s5 = peg$FAILED;
                        if (peg$silentFails === 0) { peg$fail(peg$c30); }
                      }
                      if (s5 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$c31(s3);
                        s0 = s1;
                      } else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$FAILED;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseRuleReferenceExpression() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    s1 = peg$parseIdentifierName();
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$currPos;
      s4 = peg$parse__();
      if (s4 !== peg$FAILED) {
        s5 = peg$currPos;
        s6 = peg$parseStringLiteral();
        if (s6 !== peg$FAILED) {
          s7 = peg$parse__();
          if (s7 !== peg$FAILED) {
            s6 = [s6, s7];
            s5 = s6;
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        if (s5 === peg$FAILED) {
          s5 = null;
        }
        if (s5 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 61) {
            s6 = peg$c2;
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c3); }
          }
          if (s6 !== peg$FAILED) {
            s4 = [s4, s5, s6];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c32(s1);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseSemanticPredicateExpression() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseSemanticPredicateOperator();
    if (s1 !== peg$FAILED) {
      s2 = peg$parse__();
      if (s2 !== peg$FAILED) {
        s3 = peg$parseCodeBlock();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c33(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseSemanticPredicateOperator() {
    var s0;

    if (input.charCodeAt(peg$currPos) === 38) {
      s0 = peg$c16;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c17); }
    }
    if (s0 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 33) {
        s0 = peg$c18;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c19); }
      }
    }

    return s0;
  }

  function peg$parseSourceCharacter() {
    var s0;

    if (input.length > peg$currPos) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c34); }
    }

    return s0;
  }

  function peg$parseWhiteSpace() {
    var s0, s1;

    peg$silentFails++;
    if (input.charCodeAt(peg$currPos) === 9) {
      s0 = peg$c36;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c37); }
    }
    if (s0 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 11) {
        s0 = peg$c38;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c39); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 12) {
          s0 = peg$c40;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c41); }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 32) {
            s0 = peg$c42;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c43); }
          }
          if (s0 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 160) {
              s0 = peg$c44;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c45); }
            }
            if (s0 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 65279) {
                s0 = peg$c46;
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c47); }
              }
              if (s0 === peg$FAILED) {
                s0 = peg$parseZs();
              }
            }
          }
        }
      }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c35); }
    }

    return s0;
  }

  function peg$parseLineTerminator() {
    var s0;

    if (peg$c48.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c49); }
    }

    return s0;
  }

  function peg$parseLineTerminatorSequence() {
    var s0, s1;

    peg$silentFails++;
    if (input.charCodeAt(peg$currPos) === 10) {
      s0 = peg$c51;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c52); }
    }
    if (s0 === peg$FAILED) {
      if (input.substr(peg$currPos, 2) === peg$c53) {
        s0 = peg$c53;
        peg$currPos += 2;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c54); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 13) {
          s0 = peg$c55;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c56); }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 8232) {
            s0 = peg$c57;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c58); }
          }
          if (s0 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 8233) {
              s0 = peg$c59;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c60); }
            }
          }
        }
      }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c50); }
    }

    return s0;
  }

  function peg$parseComment() {
    var s0, s1;

    peg$silentFails++;
    s0 = peg$parseMultiLineComment();
    if (s0 === peg$FAILED) {
      s0 = peg$parseSingleLineComment();
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c61); }
    }

    return s0;
  }

  function peg$parseMultiLineComment() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c62) {
      s1 = peg$c62;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c63); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      if (input.substr(peg$currPos, 2) === peg$c64) {
        s5 = peg$c64;
        peg$currPos += 2;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c65); }
      }
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseSourceCharacter();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        if (input.substr(peg$currPos, 2) === peg$c64) {
          s5 = peg$c64;
          peg$currPos += 2;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c65); }
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSourceCharacter();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c64) {
          s3 = peg$c64;
          peg$currPos += 2;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c65); }
        }
        if (s3 !== peg$FAILED) {
          s1 = [s1, s2, s3];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseMultiLineCommentNoLineTerminator() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c62) {
      s1 = peg$c62;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c63); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      if (input.substr(peg$currPos, 2) === peg$c64) {
        s5 = peg$c64;
        peg$currPos += 2;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c65); }
      }
      if (s5 === peg$FAILED) {
        s5 = peg$parseLineTerminator();
      }
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseSourceCharacter();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        if (input.substr(peg$currPos, 2) === peg$c64) {
          s5 = peg$c64;
          peg$currPos += 2;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c65); }
        }
        if (s5 === peg$FAILED) {
          s5 = peg$parseLineTerminator();
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSourceCharacter();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c64) {
          s3 = peg$c64;
          peg$currPos += 2;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c65); }
        }
        if (s3 !== peg$FAILED) {
          s1 = [s1, s2, s3];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseSingleLineComment() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c66) {
      s1 = peg$c66;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c67); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      s5 = peg$parseLineTerminator();
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseSourceCharacter();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = peg$parseLineTerminator();
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSourceCharacter();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseIdentifier() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$silentFails++;
    s2 = peg$parseReservedWord();
    peg$silentFails--;
    if (s2 === peg$FAILED) {
      s1 = void 0;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseIdentifierName();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c68(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseIdentifierName() {
    var s0, s1, s2, s3;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parseIdentifierStart();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parseIdentifierPart();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parseIdentifierPart();
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c70(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c69); }
    }

    return s0;
  }

  function peg$parseIdentifierStart() {
    var s0, s1, s2;

    s0 = peg$parseUnicodeLetter();
    if (s0 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 36) {
        s0 = peg$c14;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c15); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 95) {
          s0 = peg$c71;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c72); }
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 92) {
            s1 = peg$c73;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c74); }
          }
          if (s1 !== peg$FAILED) {
            s2 = peg$parseUnicodeEscapeSequence();
            if (s2 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c75(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        }
      }
    }

    return s0;
  }

  function peg$parseIdentifierPart() {
    var s0;

    s0 = peg$parseIdentifierStart();
    if (s0 === peg$FAILED) {
      s0 = peg$parseUnicodeCombiningMark();
      if (s0 === peg$FAILED) {
        s0 = peg$parseNd();
        if (s0 === peg$FAILED) {
          s0 = peg$parsePc();
          if (s0 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 8204) {
              s0 = peg$c76;
              peg$currPos++;
            } else {
              s0 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c77); }
            }
            if (s0 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 8205) {
                s0 = peg$c78;
                peg$currPos++;
              } else {
                s0 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c79); }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseUnicodeLetter() {
    var s0;

    s0 = peg$parseLu();
    if (s0 === peg$FAILED) {
      s0 = peg$parseLl();
      if (s0 === peg$FAILED) {
        s0 = peg$parseLt();
        if (s0 === peg$FAILED) {
          s0 = peg$parseLm();
          if (s0 === peg$FAILED) {
            s0 = peg$parseLo();
            if (s0 === peg$FAILED) {
              s0 = peg$parseNl();
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseUnicodeCombiningMark() {
    var s0;

    s0 = peg$parseMn();
    if (s0 === peg$FAILED) {
      s0 = peg$parseMc();
    }

    return s0;
  }

  function peg$parseReservedWord() {
    var s0;

    s0 = peg$parseKeyword();
    if (s0 === peg$FAILED) {
      s0 = peg$parseFutureReservedWord();
      if (s0 === peg$FAILED) {
        s0 = peg$parseNullToken();
        if (s0 === peg$FAILED) {
          s0 = peg$parseBooleanLiteral();
        }
      }
    }

    return s0;
  }

  function peg$parseKeyword() {
    var s0;

    s0 = peg$parseBreakToken();
    if (s0 === peg$FAILED) {
      s0 = peg$parseCaseToken();
      if (s0 === peg$FAILED) {
        s0 = peg$parseCatchToken();
        if (s0 === peg$FAILED) {
          s0 = peg$parseContinueToken();
          if (s0 === peg$FAILED) {
            s0 = peg$parseDebuggerToken();
            if (s0 === peg$FAILED) {
              s0 = peg$parseDefaultToken();
              if (s0 === peg$FAILED) {
                s0 = peg$parseDeleteToken();
                if (s0 === peg$FAILED) {
                  s0 = peg$parseDoToken();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parseElseToken();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parseFinallyToken();
                      if (s0 === peg$FAILED) {
                        s0 = peg$parseForToken();
                        if (s0 === peg$FAILED) {
                          s0 = peg$parseFunctionToken();
                          if (s0 === peg$FAILED) {
                            s0 = peg$parseIfToken();
                            if (s0 === peg$FAILED) {
                              s0 = peg$parseInstanceofToken();
                              if (s0 === peg$FAILED) {
                                s0 = peg$parseInToken();
                                if (s0 === peg$FAILED) {
                                  s0 = peg$parseNewToken();
                                  if (s0 === peg$FAILED) {
                                    s0 = peg$parseReturnToken();
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$parseSwitchToken();
                                      if (s0 === peg$FAILED) {
                                        s0 = peg$parseThisToken();
                                        if (s0 === peg$FAILED) {
                                          s0 = peg$parseThrowToken();
                                          if (s0 === peg$FAILED) {
                                            s0 = peg$parseTryToken();
                                            if (s0 === peg$FAILED) {
                                              s0 = peg$parseTypeofToken();
                                              if (s0 === peg$FAILED) {
                                                s0 = peg$parseVarToken();
                                                if (s0 === peg$FAILED) {
                                                  s0 = peg$parseVoidToken();
                                                  if (s0 === peg$FAILED) {
                                                    s0 = peg$parseWhileToken();
                                                    if (s0 === peg$FAILED) {
                                                      s0 = peg$parseWithToken();
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseFutureReservedWord() {
    var s0;

    s0 = peg$parseClassToken();
    if (s0 === peg$FAILED) {
      s0 = peg$parseConstToken();
      if (s0 === peg$FAILED) {
        s0 = peg$parseEnumToken();
        if (s0 === peg$FAILED) {
          s0 = peg$parseExportToken();
          if (s0 === peg$FAILED) {
            s0 = peg$parseExtendsToken();
            if (s0 === peg$FAILED) {
              s0 = peg$parseImportToken();
              if (s0 === peg$FAILED) {
                s0 = peg$parseSuperToken();
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseBooleanLiteral() {
    var s0;

    s0 = peg$parseTrueToken();
    if (s0 === peg$FAILED) {
      s0 = peg$parseFalseToken();
    }

    return s0;
  }

  function peg$parseLiteralMatcher() {
    var s0, s1, s2;

    peg$silentFails++;
    s0 = peg$currPos;
    s1 = peg$parseStringLiteral();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 105) {
        s2 = peg$c81;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c82); }
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c83(s1, s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c80); }
    }

    return s0;
  }

  function peg$parseStringLiteral() {
    var s0, s1, s2, s3;

    peg$silentFails++;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 34) {
      s1 = peg$c85;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c86); }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parseDoubleStringCharacter();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parseDoubleStringCharacter();
      }
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 34) {
          s3 = peg$c85;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c86); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c87(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 39) {
        s1 = peg$c88;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c89); }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$parseSingleStringCharacter();
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$parseSingleStringCharacter();
        }
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 39) {
            s3 = peg$c88;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c89); }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c87(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c84); }
    }

    return s0;
  }

  function peg$parseDoubleStringCharacter() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$silentFails++;
    if (input.charCodeAt(peg$currPos) === 34) {
      s2 = peg$c85;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c86); }
    }
    if (s2 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 92) {
        s2 = peg$c73;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c74); }
      }
      if (s2 === peg$FAILED) {
        s2 = peg$parseLineTerminator();
      }
    }
    peg$silentFails--;
    if (s2 === peg$FAILED) {
      s1 = void 0;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseSourceCharacter();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c90();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 92) {
        s1 = peg$c73;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c74); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseEscapeSequence();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c75(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseLineContinuation();
      }
    }

    return s0;
  }

  function peg$parseSingleStringCharacter() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$silentFails++;
    if (input.charCodeAt(peg$currPos) === 39) {
      s2 = peg$c88;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c89); }
    }
    if (s2 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 92) {
        s2 = peg$c73;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c74); }
      }
      if (s2 === peg$FAILED) {
        s2 = peg$parseLineTerminator();
      }
    }
    peg$silentFails--;
    if (s2 === peg$FAILED) {
      s1 = void 0;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseSourceCharacter();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c90();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 92) {
        s1 = peg$c73;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c74); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseEscapeSequence();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c75(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseLineContinuation();
      }
    }

    return s0;
  }

  function peg$parseCharacterClassMatcher() {
    var s0, s1, s2, s3, s4, s5;

    peg$silentFails++;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 91) {
      s1 = peg$c92;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c93); }
    }
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 94) {
        s2 = peg$c94;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c95); }
      }
      if (s2 === peg$FAILED) {
        s2 = null;
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parseClassCharacterRange();
        if (s4 === peg$FAILED) {
          s4 = peg$parseClassCharacter();
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$parseClassCharacterRange();
          if (s4 === peg$FAILED) {
            s4 = peg$parseClassCharacter();
          }
        }
        if (s3 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 93) {
            s4 = peg$c96;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c97); }
          }
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 105) {
              s5 = peg$c81;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c82); }
            }
            if (s5 === peg$FAILED) {
              s5 = null;
            }
            if (s5 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c98(s2, s3, s5);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c91); }
    }

    return s0;
  }

  function peg$parseClassCharacterRange() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parseClassCharacter();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 45) {
        s2 = peg$c99;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c100); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseClassCharacter();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c101(s1, s3);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseClassCharacter() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$silentFails++;
    if (input.charCodeAt(peg$currPos) === 93) {
      s2 = peg$c96;
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c97); }
    }
    if (s2 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 92) {
        s2 = peg$c73;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c74); }
      }
      if (s2 === peg$FAILED) {
        s2 = peg$parseLineTerminator();
      }
    }
    peg$silentFails--;
    if (s2 === peg$FAILED) {
      s1 = void 0;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseSourceCharacter();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c90();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 92) {
        s1 = peg$c73;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c74); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseEscapeSequence();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c75(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseLineContinuation();
      }
    }

    return s0;
  }

  function peg$parseLineContinuation() {
    var s0, s1, s2;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 92) {
      s1 = peg$c73;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c74); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseLineTerminatorSequence();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c102();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseEscapeSequence() {
    var s0, s1, s2, s3;

    s0 = peg$parseCharacterEscapeSequence();
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 48) {
        s1 = peg$c103;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c104); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        s3 = peg$parseDecimalDigit();
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = void 0;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c105();
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parseHexEscapeSequence();
        if (s0 === peg$FAILED) {
          s0 = peg$parseUnicodeEscapeSequence();
        }
      }
    }

    return s0;
  }

  function peg$parseCharacterEscapeSequence() {
    var s0;

    s0 = peg$parseSingleEscapeCharacter();
    if (s0 === peg$FAILED) {
      s0 = peg$parseNonEscapeCharacter();
    }

    return s0;
  }

  function peg$parseSingleEscapeCharacter() {
    var s0, s1;

    if (input.charCodeAt(peg$currPos) === 39) {
      s0 = peg$c88;
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c89); }
    }
    if (s0 === peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 34) {
        s0 = peg$c85;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c86); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 92) {
          s0 = peg$c73;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c74); }
        }
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 98) {
            s1 = peg$c106;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c107); }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$c108();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.charCodeAt(peg$currPos) === 102) {
              s1 = peg$c109;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c110); }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c111();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 110) {
                s1 = peg$c112;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c113); }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$c114();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.charCodeAt(peg$currPos) === 114) {
                  s1 = peg$c115;
                  peg$currPos++;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c116); }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$c117();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 116) {
                    s1 = peg$c118;
                    peg$currPos++;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c119); }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$c120();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 118) {
                      s1 = peg$c121;
                      peg$currPos++;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c122); }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$c123();
                    }
                    s0 = s1;
                  }
                }
              }
            }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseNonEscapeCharacter() {
    var s0, s1, s2;

    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$silentFails++;
    s2 = peg$parseEscapeCharacter();
    if (s2 === peg$FAILED) {
      s2 = peg$parseLineTerminator();
    }
    peg$silentFails--;
    if (s2 === peg$FAILED) {
      s1 = void 0;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseSourceCharacter();
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c90();
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseEscapeCharacter() {
    var s0;

    s0 = peg$parseSingleEscapeCharacter();
    if (s0 === peg$FAILED) {
      s0 = peg$parseDecimalDigit();
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 120) {
          s0 = peg$c124;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c125); }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 117) {
            s0 = peg$c126;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c127); }
          }
        }
      }
    }

    return s0;
  }

  function peg$parseHexEscapeSequence() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 120) {
      s1 = peg$c124;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c125); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$currPos;
      s4 = peg$parseHexDigit();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseHexDigit();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        s2 = input.substring(s2, peg$currPos);
      } else {
        s2 = s3;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c128(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseUnicodeEscapeSequence() {
    var s0, s1, s2, s3, s4, s5, s6, s7;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 117) {
      s1 = peg$c126;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c127); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      s3 = peg$currPos;
      s4 = peg$parseHexDigit();
      if (s4 !== peg$FAILED) {
        s5 = peg$parseHexDigit();
        if (s5 !== peg$FAILED) {
          s6 = peg$parseHexDigit();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseHexDigit();
            if (s7 !== peg$FAILED) {
              s4 = [s4, s5, s6, s7];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        s2 = input.substring(s2, peg$currPos);
      } else {
        s2 = s3;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c128(s2);
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseDecimalDigit() {
    var s0;

    if (peg$c129.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c130); }
    }

    return s0;
  }

  function peg$parseHexDigit() {
    var s0;

    if (peg$c131.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c132); }
    }

    return s0;
  }

  function peg$parseAnyMatcher() {
    var s0, s1;

    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 46) {
      s1 = peg$c133;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c134); }
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$c135();
    }
    s0 = s1;

    return s0;
  }

  function peg$parseCodeBlock() {
    var s0, s1, s2, s3;

    peg$silentFails++;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 123) {
      s1 = peg$c137;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c138); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseCode();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 125) {
          s3 = peg$c139;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c140); }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c141(s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    peg$silentFails--;
    if (s0 === peg$FAILED) {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c136); }
    }

    return s0;
  }

  function peg$parseCode() {
    var s0, s1, s2, s3, s4, s5;

    s0 = peg$currPos;
    s1 = [];
    s2 = [];
    s3 = peg$currPos;
    s4 = peg$currPos;
    peg$silentFails++;
    if (peg$c142.test(input.charAt(peg$currPos))) {
      s5 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s5 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c143); }
    }
    peg$silentFails--;
    if (s5 === peg$FAILED) {
      s4 = void 0;
    } else {
      peg$currPos = s4;
      s4 = peg$FAILED;
    }
    if (s4 !== peg$FAILED) {
      s5 = peg$parseSourceCharacter();
      if (s5 !== peg$FAILED) {
        s4 = [s4, s5];
        s3 = s4;
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
    } else {
      peg$currPos = s3;
      s3 = peg$FAILED;
    }
    if (s3 !== peg$FAILED) {
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        if (peg$c142.test(input.charAt(peg$currPos))) {
          s5 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c143); }
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseSourceCharacter();
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
    } else {
      s2 = peg$FAILED;
    }
    if (s2 === peg$FAILED) {
      s2 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s3 = peg$c137;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c138); }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parseCode();
        if (s4 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 125) {
            s5 = peg$c139;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c140); }
          }
          if (s5 !== peg$FAILED) {
            s3 = [s3, s4, s5];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    }
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      if (peg$c142.test(input.charAt(peg$currPos))) {
        s5 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c143); }
      }
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseSourceCharacter();
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          if (peg$c142.test(input.charAt(peg$currPos))) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c143); }
          }
          peg$silentFails--;
          if (s5 === peg$FAILED) {
            s4 = void 0;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseSourceCharacter();
            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 === peg$FAILED) {
        s2 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 123) {
          s3 = peg$c137;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c138); }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parseCode();
          if (s4 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 125) {
              s5 = peg$c139;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c140); }
            }
            if (s5 !== peg$FAILED) {
              s3 = [s3, s4, s5];
              s2 = s3;
            } else {
              peg$currPos = s2;
              s2 = peg$FAILED;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$FAILED;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      }
    }
    if (s1 !== peg$FAILED) {
      s0 = input.substring(s0, peg$currPos);
    } else {
      s0 = s1;
    }

    return s0;
  }

  function peg$parseLl() {
    var s0;

    if (peg$c144.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c145); }
    }

    return s0;
  }

  function peg$parseLm() {
    var s0;

    if (peg$c146.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c147); }
    }

    return s0;
  }

  function peg$parseLo() {
    var s0;

    if (peg$c148.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c149); }
    }

    return s0;
  }

  function peg$parseLt() {
    var s0;

    if (peg$c150.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c151); }
    }

    return s0;
  }

  function peg$parseLu() {
    var s0;

    if (peg$c152.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c153); }
    }

    return s0;
  }

  function peg$parseMc() {
    var s0;

    if (peg$c154.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c155); }
    }

    return s0;
  }

  function peg$parseMn() {
    var s0;

    if (peg$c156.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c157); }
    }

    return s0;
  }

  function peg$parseNd() {
    var s0;

    if (peg$c158.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c159); }
    }

    return s0;
  }

  function peg$parseNl() {
    var s0;

    if (peg$c160.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c161); }
    }

    return s0;
  }

  function peg$parsePc() {
    var s0;

    if (peg$c162.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c163); }
    }

    return s0;
  }

  function peg$parseZs() {
    var s0;

    if (peg$c164.test(input.charAt(peg$currPos))) {
      s0 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s0 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c165); }
    }

    return s0;
  }

  function peg$parseBreakToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c166) {
      s1 = peg$c166;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c167); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseCaseToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c168) {
      s1 = peg$c168;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c169); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseCatchToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c170) {
      s1 = peg$c170;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c171); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseClassToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c172) {
      s1 = peg$c172;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c173); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseConstToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c174) {
      s1 = peg$c174;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c175); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseContinueToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8) === peg$c176) {
      s1 = peg$c176;
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c177); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseDebuggerToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8) === peg$c178) {
      s1 = peg$c178;
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c179); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseDefaultToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7) === peg$c180) {
      s1 = peg$c180;
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c181); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseDeleteToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c182) {
      s1 = peg$c182;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c183); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseDoToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c184) {
      s1 = peg$c184;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c185); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseElseToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c186) {
      s1 = peg$c186;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c187); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseEnumToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c188) {
      s1 = peg$c188;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c189); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseExportToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c190) {
      s1 = peg$c190;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c191); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseExtendsToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7) === peg$c192) {
      s1 = peg$c192;
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c193); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseFalseToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c194) {
      s1 = peg$c194;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c195); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseFinallyToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 7) === peg$c196) {
      s1 = peg$c196;
      peg$currPos += 7;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c197); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseForToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3) === peg$c198) {
      s1 = peg$c198;
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c199); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseFunctionToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 8) === peg$c200) {
      s1 = peg$c200;
      peg$currPos += 8;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c201); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseIfToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c202) {
      s1 = peg$c202;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c203); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseImportToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c204) {
      s1 = peg$c204;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c205); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseInstanceofToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 10) === peg$c206) {
      s1 = peg$c206;
      peg$currPos += 10;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c207); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseInToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 2) === peg$c208) {
      s1 = peg$c208;
      peg$currPos += 2;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c209); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseNewToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3) === peg$c210) {
      s1 = peg$c210;
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c211); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseNullToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c212) {
      s1 = peg$c212;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c213); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseReturnToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c214) {
      s1 = peg$c214;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c215); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseSuperToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c216) {
      s1 = peg$c216;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c217); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseSwitchToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c218) {
      s1 = peg$c218;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c219); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseThisToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c220) {
      s1 = peg$c220;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c221); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseThrowToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c222) {
      s1 = peg$c222;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c223); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseTrueToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c224) {
      s1 = peg$c224;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c225); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseTryToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3) === peg$c226) {
      s1 = peg$c226;
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c227); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseTypeofToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 6) === peg$c228) {
      s1 = peg$c228;
      peg$currPos += 6;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c229); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseVarToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 3) === peg$c230) {
      s1 = peg$c230;
      peg$currPos += 3;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c231); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseVoidToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c232) {
      s1 = peg$c232;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c233); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseWhileToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 5) === peg$c234) {
      s1 = peg$c234;
      peg$currPos += 5;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c235); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parseWithToken() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    if (input.substr(peg$currPos, 4) === peg$c236) {
      s1 = peg$c236;
      peg$currPos += 4;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c237); }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$currPos;
      peg$silentFails++;
      s3 = peg$parseIdentifierPart();
      peg$silentFails--;
      if (s3 === peg$FAILED) {
        s2 = void 0;
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }

  function peg$parse__() {
    var s0, s1;

    s0 = [];
    s1 = peg$parseWhiteSpace();
    if (s1 === peg$FAILED) {
      s1 = peg$parseLineTerminatorSequence();
      if (s1 === peg$FAILED) {
        s1 = peg$parseComment();
      }
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      s1 = peg$parseWhiteSpace();
      if (s1 === peg$FAILED) {
        s1 = peg$parseLineTerminatorSequence();
        if (s1 === peg$FAILED) {
          s1 = peg$parseComment();
        }
      }
    }

    return s0;
  }

  function peg$parse_() {
    var s0, s1;

    s0 = [];
    s1 = peg$parseWhiteSpace();
    if (s1 === peg$FAILED) {
      s1 = peg$parseMultiLineCommentNoLineTerminator();
    }
    while (s1 !== peg$FAILED) {
      s0.push(s1);
      s1 = peg$parseWhiteSpace();
      if (s1 === peg$FAILED) {
        s1 = peg$parseMultiLineCommentNoLineTerminator();
      }
    }

    return s0;
  }

  function peg$parseEOS() {
    var s0, s1, s2, s3;

    s0 = peg$currPos;
    s1 = peg$parse__();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 59) {
        s2 = peg$c238;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c239); }
      }
      if (s2 !== peg$FAILED) {
        s1 = [s1, s2];
        s0 = s1;
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseSingleLineComment();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseLineTerminatorSequence();
          if (s3 !== peg$FAILED) {
            s1 = [s1, s2, s3];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parse__();
        if (s1 !== peg$FAILED) {
          s2 = peg$parseEOF();
          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      }
    }

    return s0;
  }

  function peg$parseEOF() {
    var s0, s1;

    s0 = peg$currPos;
    peg$silentFails++;
    if (input.length > peg$currPos) {
      s1 = input.charAt(peg$currPos);
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) { peg$fail(peg$c34); }
    }
    peg$silentFails--;
    if (s1 === peg$FAILED) {
      s0 = void 0;
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }

    return s0;
  }


    var OPS_TO_PREFIXED_TYPES = {
      "$": "text",
      "&": "simple_and",
      "!": "simple_not"
    };

    var OPS_TO_SUFFIXED_TYPES = {
      "?": "optional",
      "*": "zero_or_more",
      "+": "one_or_more"
    };

    var OPS_TO_SEMANTIC_PREDICATE_TYPES = {
      "&": "semantic_and",
      "!": "semantic_not"
    };

    function filterEmptyStrings(array) {
      var result = [], i;

      for (i = 0; i < array.length; i++) {
        if (array[i] !== "") {
          result.push(array[i]);
        }
      }

      return result;
    }

    function extractOptional(optional, index) {
      return optional ? optional[index] : null;
    }

    function extractList(list, index) {
      var result = new Array(list.length), i;

      for (i = 0; i < list.length; i++) {
        result[i] = list[i][index];
      }

      return result;
    }

    function buildList(head, tail, index) {
      return [head].concat(extractList(tail, index));
    }


  peg$result = peg$startRuleFunction();

  if (peg$result !== peg$FAILED && peg$currPos === input.length) {
    return peg$result;
  } else {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }

    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
      peg$maxFailPos < input.length
        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
}

module.exports = {
  SyntaxError: peg$SyntaxError,
  parse:       peg$parse
};

},{}],52:[function(require,module,exports){
"use strict";

var arrays  = require("./utils/arrays"),
    objects = require("./utils/objects");

var peg = {
  /* PEG.js version (uses semantic versioning). */
  VERSION: "0.10.0",

  GrammarError: require("./grammar-error"),
  parser:       require("./parser"),
  compiler:     require("./compiler"),

  /*
   * Generates a parser from a specified grammar and returns it.
   *
   * The grammar must be a string in the format described by the metagramar in
   * the parser.pegjs file.
   *
   * Throws |peg.parser.SyntaxError| if the grammar contains a syntax error or
   * |peg.GrammarError| if it contains a semantic error. Note that not all
   * errors are detected during the generation and some may protrude to the
   * generated parser and cause its malfunction.
   */
  generate: function(grammar, options) {
    options = options !== void 0 ? options : {};

    function convertPasses(passes) {
      var converted = {}, stage;

      for (stage in passes) {
        if (passes.hasOwnProperty(stage)) {
          converted[stage] = objects.values(passes[stage]);
        }
      }

      return converted;
    }

    options = objects.clone(options);

    var plugins = "plugins" in options ? options.plugins : [],
        config  = {
          parser: peg.parser,
          passes: convertPasses(peg.compiler.passes)
        };

    arrays.each(plugins, function(p) { p.use(config, options); });

    return peg.compiler.compile(
      config.parser.parse(grammar),
      config.passes,
      options
    );
  }
};

module.exports = peg;

},{"./compiler":38,"./grammar-error":50,"./parser":51,"./utils/arrays":53,"./utils/objects":55}],53:[function(require,module,exports){
"use strict";

/* Array utilities. */
var arrays = {
  range: function(start, stop) {
    var length = stop - start,
        result = new Array(length),
        i, j;

    for (i = 0, j = start; i < length; i++, j++) {
      result[i] = j;
    }

    return result;
  },

  find: function(array, valueOrPredicate) {
    var length = array.length, i;

    if (typeof valueOrPredicate === "function") {
      for (i = 0; i < length; i++) {
        if (valueOrPredicate(array[i])) {
          return array[i];
        }
      }
    } else {
      for (i = 0; i < length; i++) {
        if (array[i] === valueOrPredicate) {
          return array[i];
        }
      }
    }
  },

  indexOf: function(array, valueOrPredicate) {
    var length = array.length, i;

    if (typeof valueOrPredicate === "function") {
      for (i = 0; i < length; i++) {
        if (valueOrPredicate(array[i])) {
          return i;
        }
      }
    } else {
      for (i = 0; i < length; i++) {
        if (array[i] === valueOrPredicate) {
          return i;
        }
      }
    }

    return -1;
  },

  contains: function(array, valueOrPredicate) {
    return arrays.indexOf(array, valueOrPredicate) !== -1;
  },

  each: function(array, iterator) {
    var length = array.length, i;

    for (i = 0; i < length; i++) {
      iterator(array[i], i);
    }
  },

  map: function(array, iterator) {
    var length = array.length,
        result = new Array(length),
        i;

    for (i = 0; i < length; i++) {
      result[i] = iterator(array[i], i);
    }

    return result;
  },

  pluck: function(array, key) {
    return arrays.map(array, function (e) { return e[key]; });
  },

  every: function(array, predicate) {
    var length = array.length, i;

    for (i = 0; i < length; i++) {
      if (!predicate(array[i])) {
        return false;
      }
    }

    return true;
  },

  some: function(array, predicate) {
    var length = array.length, i;

    for (i = 0; i < length; i++) {
      if (predicate(array[i])) {
        return true;
      }
    }

    return false;
  }
};

module.exports = arrays;

},{}],54:[function(require,module,exports){
"use strict";

/* Class utilities */
var classes = {
  subclass: function(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }
};

module.exports = classes;

},{}],55:[function(require,module,exports){
"use strict";

/* Object utilities. */
var objects = {
  keys: function(object) {
    var result = [], key;

    for (key in object) {
      if (object.hasOwnProperty(key)) {
        result.push(key);
      }
    }

    return result;
  },

  values: function(object) {
    var result = [], key;

    for (key in object) {
      if (object.hasOwnProperty(key)) {
        result.push(object[key]);
      }
    }

    return result;
  },

  clone: function(object) {
    var result = {}, key;

    for (key in object) {
      if (object.hasOwnProperty(key)) {
        result[key] = object[key];
      }
    }

    return result;
  },

  defaults: function(object, defaults) {
    var key;

    for (key in defaults) {
      if (defaults.hasOwnProperty(key)) {
        if (!(key in object)) {
          object[key] = defaults[key];
        }
      }
    }
  }
};

module.exports = objects;

},{}],56:[function(require,module,exports){
module.exports = require('./lib/type');

},{"./lib/type":57}],57:[function(require,module,exports){
/*!
 * type-detect
 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Primary Exports
 */

var exports = module.exports = getType;

/*!
 * Detectable javascript natives
 */

var natives = {
    '[object Array]': 'array'
  , '[object RegExp]': 'regexp'
  , '[object Function]': 'function'
  , '[object Arguments]': 'arguments'
  , '[object Date]': 'date'
};

/**
 * ### typeOf (obj)
 *
 * Use several different techniques to determine
 * the type of object being tested.
 *
 *
 * @param {Mixed} object
 * @return {String} object type
 * @api public
 */

function getType (obj) {
  var str = Object.prototype.toString.call(obj);
  if (natives[str]) return natives[str];
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (obj === Object(obj)) return 'object';
  return typeof obj;
}

exports.Library = Library;

/**
 * ### Library
 *
 * Create a repository for custom type detection.
 *
 * ```js
 * var lib = new type.Library;
 * ```
 *
 */

function Library () {
  this.tests = {};
}

/**
 * #### .of (obj)
 *
 * Expose replacement `typeof` detection to the library.
 *
 * ```js
 * if ('string' === lib.of('hello world')) {
 *   // ...
 * }
 * ```
 *
 * @param {Mixed} object to test
 * @return {String} type
 */

Library.prototype.of = getType;

/**
 * #### .define (type, test)
 *
 * Add a test to for the `.test()` assertion.
 *
 * Can be defined as a regular expression:
 *
 * ```js
 * lib.define('int', /^[0-9]+$/);
 * ```
 *
 * ... or as a function:
 *
 * ```js
 * lib.define('bln', function (obj) {
 *   if ('boolean' === lib.of(obj)) return true;
 *   var blns = [ 'yes', 'no', 'true', 'false', 1, 0 ];
 *   if ('string' === lib.of(obj)) obj = obj.toLowerCase();
 *   return !! ~blns.indexOf(obj);
 * });
 * ```
 *
 * @param {String} type
 * @param {RegExp|Function} test
 * @api public
 */

Library.prototype.define = function (type, test) {
  if (arguments.length === 1) return this.tests[type];
  this.tests[type] = test;
  return this;
};

/**
 * #### .test (obj, test)
 *
 * Assert that an object is of type. Will first
 * check natives, and if that does not pass it will
 * use the user defined custom tests.
 *
 * ```js
 * assert(lib.test('1', 'int'));
 * assert(lib.test('yes', 'bln'));
 * ```
 *
 * @param {Mixed} object
 * @param {String} type
 * @return {Boolean} result
 * @api public
 */

Library.prototype.test = function (obj, type) {
  if (type === getType(obj)) return true;
  var test = this.tests[type];

  if (test && 'regexp' === getType(test)) {
    return test.test(obj);
  } else if (test && 'function' === getType(test)) {
    return test(obj);
  } else {
    throw new ReferenceError('Type test "' + type + '" not defined or invalid.');
  }
};

},{}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BasePiece {
    constructor(piece, notation) {
        this.id = 0;
        this.isWhite = notation === piece.notation.toUpperCase();
        this.name = piece.name;
        this.movement = piece.movement;
        this.canQueen = piece.canQueen;
        this.canSpawn = piece.canSpawn;
        this.value = piece.value;
        this.notation = notation;
        this.moveHistory = [];
        this.postMoveFunctions = piece.postMoveFunctions || [];
        this.location = { rank: 0, file: 0 };
    }
    getRelativeDestination(transform) {
        return applyTransform(transform, this.location, this.isWhite);
    }
    getAbsoluteDestination(transform) {
        return applyTransform(transform, this.location, true);
    }
}
exports.default = BasePiece;
function applyTransform(transform, position, isWhite) {
    const modifier = isWhite ? 1 : -1;
    return {
        file: position.file + (transform.file * modifier),
        rank: position.rank + (transform.rank * modifier)
    };
}

},{}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns all squares where pieces can be moved, for both white and black
 * @param boardState
 */
function availableMoves(boardState) {
    boardState = boardState || this.boardState;
    let moves = [];
    boardState.ranks.forEach(rank => {
        rank.squares.forEach(square => {
            if (square.piece == null)
                return;
            moves = moves.concat(this.inferMoves(square.piece, boardState));
        });
    });
    boardState.moves = moves;
}
exports.default = availableMoves;

},{}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Finds the piece in engine definition and initializes it at the given location
 * @throws Error piece not found
 * @param notation
 * @param location
 */
function createPiece(notation, location) {
    const matchingPiece = this.pieceDefinitions.filter(p => p.notation === notation.toLocaleLowerCase());
    if (matchingPiece.length === 0)
        throw Error('piece not found');
    // Update Piece Count on the boardState, and get ID of the piece
    let count = this.boardState.tags["pieceCount"] || 0;
    count++;
    this.boardState.tags["pieceCount"] = count;
    // Create the piece, set id to be the above
    const newPiece = new this.pieceFactory(matchingPiece[0], notation);
    newPiece.id = count;
    // Set location, no collision detection??
    newPiece.location = location;
    return newPiece;
}
exports.default = createPiece;

},{}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Init board size
 */
function createSquares() {
    this.boardState.ranks = [];
    for (let rank = 0; rank < this.rankCount; rank++) {
        const row = {
            rank: rank,
            squares: []
        };
        for (let file = 0; file < this.fileCount; file++) {
            row.squares[file + 1] = {
                rank: rank,
                file: file,
                piece: null,
                tags: {}
            };
        }
        this.boardState.ranks[rank + 1] = row;
    }
}
exports.default = createSquares;

},{}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Deep copies board state, ensures current & previous board state(s) are independent of each other
 * Can use R or Lodash instead..
 *
 * @param boardState
 */
function deepCopy(boardState) {
    const copy = {
        ranks: boardState.ranks.map(copyRank),
        tags: shallowCopy(boardState.tags),
        moveNumber: boardState.moveNumber,
        whitesTurn: boardState.whitesTurn,
        capturedPieces: boardState.capturedPieces.slice(),
        preMoveFunctions: boardState.preMoveFunctions.slice(),
        postMoveFunctions: boardState.postMoveFunctions.slice(),
        moves: boardState.moves.slice(),
        moveHistory: boardState.moveHistory.slice(),
    };
    return copy;
}
exports.default = deepCopy;
/**
 * Copies one row on the board, the row contains x,y position, piece, and arbitrary tags
 * @param rank
 */
function copyRank(rank) {
    const copy = {
        rank: rank.rank,
        squares: Array(rank.squares.length)
    };
    rank.squares.forEach((sq, i) => {
        copy.squares[i] = {
            rank: sq.rank,
            file: sq.file,
            piece: copyPiece(sq.piece),
            tags: shallowCopy(sq.tags),
        };
    });
    return copy;
}
/**
 * Shallow copies the tags object
 * @param object
 */
function shallowCopy(object) {
    const copy = {};
    if (!object)
        return copy;
    const keys = Object.keys(object);
    for (let x = 0; x < keys.length; x++) {
        const key = keys[x];
        copy[key] = object[key];
    }
    return copy;
}
/**
 * Copies a Piece, returns null if piece not found
 * @param piece
 */
function copyPiece(piece) {
    if (!piece)
        return null;
    const copy = shallowCopy(piece);
    copy.location = { rank: piece.location.rank, file: piece.location.file };
    copy.movement = piece.movement;
    copy.getRelativeDestination = piece.getRelativeDestination;
    copy.getAbsoluteDestination = piece.getAbsoluteDestination;
    copy.postMoveFunctions = piece.postMoveFunctions;
    return copy;
}

},{}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Get moves originating of the coordinate position
 * @param coordinate
 * @param boardState
 */
function getMoves(coordinate, boardState) {
    boardState = boardState || this.boardState;
    return boardState.moves
        .filter(move => move.from.file === coordinate.file && move.from.rank === coordinate.rank);
}
exports.default = getMoves;

},{}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns the square for the given coordinate, null if not found (index out of range perhaps?)
 * @param coordinate
 * @param boardState
 */
function getSquare(coordinate, boardState) {
    boardState = boardState || this.boardState;
    if (!boardState.ranks[coordinate.rank])
        throw Error(`unable to get square for ${coordinate.rank} ${coordinate.file}`);
    return boardState.ranks[coordinate.rank].squares[coordinate.file];
}
exports.default = getSquare;

},{}],65:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Intentionally not using any closures to improve performance
 * This code can potentially be called thousands of times after a single move has been played
 */
function infer(piece, state) {
    state = state || this.boardState;
    var moves = [];
    for (var key in piece.movement) {
        var move = piece.movement[key];
        var canProcess = true;
        if (move.preCondition)
            canProcess = move.preCondition(piece, state, this);
        if (move.transforms) {
            // Pre-conditions only apply to
            if (!canProcess)
                continue;
            var newMove = processTransform(move, piece, state, this);
            if (newMove)
                moves.push(newMove);
        }
        else {
            var newMoves = processIncrementer(move, piece, state, this);
            if (move.postMoveAction) {
                for (var x = 0; x < newMoves.length; x++) {
                    newMoves[x].postMoveActions = [move.postMoveAction];
                }
            }
            moves = moves.concat(newMoves);
        }
        ;
    }
    return moves;
}
exports.default = infer;
function processTransform(move, piece, boardState, board) {
    var modifier = piece.isWhite ? 1 : -1;
    var finalMove = {
        from: copyCoord(piece.location),
        to: copyCoord(piece.location),
        isWhite: piece.isWhite
    };
    var canSkipLogic = move.preCondition && !move.useDefaultConditions;
    if (move.postMoveAction)
        finalMove.postMoveActions = [move.postMoveAction];
    var steps = [piece.location];
    var transforms = move.transforms;
    if (!Array.isArray(transforms))
        transforms = [transforms];
    for (var x = 0; x < transforms.length; x++) {
        var transform = transforms[x];
        var appliedTransform = applyTransform(steps[x], transform, modifier);
        if (!isInBounds(appliedTransform))
            return null;
        steps.push(appliedTransform);
    }
    var finalCoord = steps[steps.length - 1];
    finalMove.to = finalCoord;
    // Pre-condition has passed and useDefaultConditions is false.
    if (canSkipLogic)
        return finalMove;
    var finalSquare = board.getSquare(finalCoord, boardState);
    if (!finalSquare)
        return null;
    var finalSquarePiece = finalSquare.piece;
    var canCaptureOnFinalSquare = move.canCapture && finalSquarePiece && finalSquarePiece.isWhite != piece.isWhite;
    if (canCaptureOnFinalSquare)
        return finalMove;
    var canMoveButSquareOccupied = move.canMove && finalSquarePiece;
    if (canMoveButSquareOccupied)
        return null;
    for (var x = 1; x < steps.length; x++) {
        var prev = steps[x - 1];
        var step = steps[x];
        var transform = transforms[x - 1];
        if (step !== finalCoord) {
            //TODO: Allow 'squaresBetween' here
            if (transform.canJump)
                continue;
            if (transform.squaresBetween) {
                var canMove = checkBetween(prev, step, piece, transform, boardState, board);
                if (!canMove)
                    return null;
            }
            continue;
        }
        // Logic when analyzing the final step in a MoveDefintion
        // If we can jump, don't checkBetween
        if (transform.canJump)
            return finalMove;
        if (transform.squaresBetween) {
            var canMove = checkBetween(prev, step, piece, transform, boardState, board);
            if (!canMove)
                return finalMove;
        }
        var isFinalSquareVacant = finalSquare.piece == null;
        if (move.canMove && isFinalSquareVacant)
            return finalMove;
        var isFinalSquareOccupiedByEnemy = finalSquare.piece && finalSquare.piece.isWhite !== piece.isWhite;
        if (move.canCapture && isFinalSquareOccupiedByEnemy)
            return finalMove;
    }
    return null;
}
function processIncrementer(move, piece, state, board) {
    if (!move.incrementer)
        return [];
    let currCoords = { file: piece.location.file, rank: piece.location.rank };
    var modifier = piece.isWhite || move.incrementer.absolute ? 1 : -1;
    var file = move.incrementer.file * modifier;
    var rank = move.incrementer.rank * modifier;
    var validMoves = [];
    while (true) {
        currCoords.file += file;
        currCoords.rank += rank;
        if (!isInBounds(currCoords))
            break;
        var square = board.getSquare(currCoords, state);
        if (square.piece) {
            if (square.piece.isWhite !== piece.isWhite) {
                if (!move.canCapture && !move.incrementer.canJump)
                    break;
                validMoves.push({ from: copyCoord(piece.location), to: { file: currCoords.file, rank: currCoords.rank }, isWhite: piece.isWhite });
                // If we can jump, we can possibly go to the next square, otherwise terminate the incrementer here.
                if (move.incrementer.canJump)
                    continue;
                else
                    break;
            }
            if (square.piece.isWhite === piece.isWhite) {
                if (!move.incrementer.canJump)
                    break;
                // Do not add the move here: we can jump, but we can't move to this square
                //validMoves.push({ from: copyCoord(piece.location), to: { file: current.file, rank: current.rank }, isWhite: piece.isWhite });
                continue;
            }
            if (move.canCapture) {
                validMoves.push({ from: copyCoord(piece.location), to: { file: currCoords.file, rank: currCoords.rank }, isWhite: piece.isWhite });
                continue;
            }
            break;
        }
        if (move.canMove) {
            validMoves.push({ from: copyCoord(piece.location), to: { file: currCoords.file, rank: currCoords.rank }, isWhite: piece.isWhite });
            continue;
        }
        break;
    }
    return validMoves;
}
function isInBounds(position) {
    return position.file > 0 && position.file <= 8
        && position.rank > 0 && position.rank <= 8;
}
exports.isInBounds = isInBounds;
// TODO: Shrink function signature. Take an object instead
function checkBetween(start, end, piece, transform, boardState, board) {
    var difference = {
        file: Math.abs(start.file - end.file),
        rank: Math.abs(start.rank - end.rank)
    };
    // If
    if (difference.file > 0 && difference.rank > 0)
        throw Error(`Invalid non-jumpable move in ${piece.name} definition: ${transform}`);
    if (difference.file === 1 || difference.rank === 1)
        return false;
    var dimension = difference.file > 0 ? "file" : "rank";
    var inc = end[dimension] > start[dimension] ? -1 : 1;
    // Ensure all squares between current and previous are vacant
    // Avoid closures to avoid heap allocations
    for (var y = end[dimension]; y !== start[dimension]; y += inc) {
        var between = { file: end.file, rank: end.rank };
        between[dimension] += inc;
        var sq = board.getSquare(between, boardState);
        // If a square is occupied, the move is not valid
        if (sq.piece)
            return false;
    }
    // All squares are vacant
    return true;
}
function applyTransform(coordinate, transform, modifier) {
    if (transform.absolute)
        modifier = 1;
    var file = coordinate.file + (transform.file * modifier);
    var rank = coordinate.rank + (transform.rank * modifier);
    return {
        file,
        rank
    };
}
function copyCoord(coord) {
    return {
        file: coord.file,
        rank: coord.rank
    };
}

},{}],66:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deepCopy_1 = require("./deepCopy");
function calculateMovePiece(move, _boardState) {
    const newBoardState = deepCopy_1.default(_boardState);
    const from = move.from;
    const to = move.to;
    // Check square exists, and has a piece
    const fromSquare = this.getSquare(from, newBoardState);
    if (!fromSquare || !fromSquare.piece)
        return null;
    // Enforce turn-based movement
    if (newBoardState.whitesTurn !== fromSquare.piece.isWhite)
        return null;
    // The 'destination' square must be in the square's list of available moves
    const moveDefinition = newBoardState.moves.filter(m => m.from.file === from.file && m.from.rank === from.rank &&
        m.to.file === to.file && m.to.rank === to.rank)[0];
    if (!moveDefinition)
        return null;
    // Check destination has a piece, if so, capture it
    const destination = this.getSquare(to, newBoardState);
    if (destination.piece)
        newBoardState.capturedPieces.push(destination.piece);
    // Update squares
    destination.piece = fromSquare.piece;
    fromSquare.piece = null;
    // Update piece location
    destination.piece.location = { file: to.file, rank: to.rank };
    // Update move history
    newBoardState.moveHistory.push({ from: from, to: to, piece: destination.piece });
    // Run other move logic, castle, upgrade etc
    const movePatternPostActions = moveDefinition.postMoveActions || [];
    movePatternPostActions.forEach(func => {
        if (destination.piece)
            func.action(destination.piece, newBoardState, this);
    });
    // Run other piece logic
    const pieceFunctions = destination.piece.postMoveFunctions || [];
    pieceFunctions.forEach(fn => {
        if (destination.piece)
            fn.action(destination.piece, newBoardState, this);
    });
    // Set turn
    newBoardState.whitesTurn = !newBoardState.whitesTurn;
    // Infer new moves
    this.populateAvailableMoves(newBoardState);
    // Run post move functions, includes things such as marking square as enpassant
    const enginePostMoveActions = newBoardState.postMoveFunctions || [];
    enginePostMoveActions.forEach(postMove => {
        if (!postMove.moveNumber || postMove.moveNumber === newBoardState.moveNumber) {
            if (destination.piece)
                postMove.action(destination.piece, newBoardState, this);
        }
    });
    // Update move count, perhaps length of moveHistory !== moveCount?
    newBoardState.moveNumber++;
    newBoardState.postMoveFunctions = enginePostMoveActions.filter(pmf => !pmf.moveNumber || pmf.moveNumber >= newBoardState.moveNumber);
    return {
        newBoardState,
        pieceAfterMove: destination.piece
    };
}
exports.calculateMovePiece = calculateMovePiece;
function movePiece(move) {
    const res = calculateMovePiece.bind(this)(move, this.boardState);
    if (res === null)
        return null;
    this.postMoveFunctions.forEach(moveFn => {
        moveFn.action(res.pieceAfterMove, res.newBoardState, this);
    });
    this.boardState = res.newBoardState;
    return res.newBoardState;
}
exports.default = movePiece;
// export default function movePiece(this: Engine, move: Move, boardState?: BoardState): BoardState | null {
// 	const from = move.from;
// 	const to = move.to;
//
// 	// TODO: Replace with better method
// 	// If no boardState is provided, the result of this function is stored as the calling engine's new board state
// 	const saveToBoard = !boardState;
// 	boardState = deepCopy(boardState || this.boardState);
//
// 	var origin: Square = this.getSquare(from, boardState);
// 	if (!origin || !origin.piece) return null;
//
// 	// Enforce turn-based movement
// 	if (boardState.whitesTurn !== origin.piece.isWhite) return null;
//
// 	// The 'destination' square must be in the square's list of available moves
// 	var pieceMove = boardState.moves.filter(m =>
// 		m.from.file === from.file && m.from.rank === from.rank &&
// 		m.to.file === to.file && m.to.rank === to.rank)[0];
// 	if (!pieceMove) return null;
//
// 	var destination: Square = this.getSquare(to, boardState);
// 	if (destination.piece) boardState.capturedPieces.push(destination.piece)
//
// 	destination.piece = origin.piece;
// 	destination.piece.location = { file: to.file, rank: to.rank };
// 	boardState.moveHistory.push({ from: from, to: to, piece: destination.piece });
//
// 	var movePatternPostActions = pieceMove.postMoveActions || [];
// 	movePatternPostActions.forEach(func => {
// 		func.action(destination.piece, boardState, this);
// 	});
//
// 	var pieceFunctions = destination.piece.postMoveFunctions || [];
// 	pieceFunctions.forEach(fn => fn.action(destination.piece, boardState, this));
//
// 	origin.piece = null;
//
// 	boardState.whitesTurn = !boardState.whitesTurn;
//
// 	this.populateAvailableMoves(boardState);
//
// 	var enginePostMoveActions: MoveFunction[] = boardState.postMoveFunctions || [];
//
// 	enginePostMoveActions.forEach(postMove => {
// 		if (!postMove.moveNumber || postMove.moveNumber === boardState.moveNumber)
// 			postMove.action(destination.piece, boardState, this);
// 	});
// 	boardState.moveNumber++;
// 	boardState.postMoveFunctions = enginePostMoveActions.filter(pmf => !pmf.moveNumber || pmf.moveNumber >= boardState.moveNumber);
//
// 	// We only call post move functions if we're saving state
// 	if (!saveToBoard) return boardState;
//
// 	this.postMoveFunctions.forEach(moveFn => {
// 		moveFn.action(destination.piece, boardState, this);
// 	});
// 	this.boardState = boardState;
//
// 	return boardState;
// }

},{"./deepCopy":62}],67:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function boardToString(board) {
    let rankString = [];
    // Generate Axis X String
    let ranks = board.ranks[1];
    const fileIndices = ranks.squares.length - 1;
    let axisXNumbers = [...Array(fileIndices).keys()].map(i => `_${i + 1}_`);
    rankString.push(['-', ...axisXNumbers].join('|'));
    // Bottom to Top of Board
    board.ranks.forEach((rank, i) => {
        let s = '';
        // Generate Axis Y String
        s += `${i}|`;
        const pieces = [];
        // Left to right of board
        rank.squares.forEach(sq => {
            let p = sq.piece ? sq.piece.notation : '_';
            pieces.push(`_${p}_`);
        });
        s += pieces.join('|');
        rankString.push(s);
    });
    return rankString.reverse().join("\r\n");
}
exports.boardToString = boardToString;
function toString() {
    var ranks = [];
    var fileLabels = ['-'];
    for (var i = this.rankCount; i > 0; i--) {
        fileLabels[i] = "_" + i + "_";
        var pieces = [i];
        var rank = this.boardState.ranks[i];
        for (var p in rank.squares) {
            var s = rank.squares[p];
            var val = s.piece == null ? "_" : s.piece.notation;
            if (s.piece)
                val = s.piece.isWhite ? val.toUpperCase() : val.toLowerCase();
            pieces.push("_" + val + "_");
        }
        ranks.push(pieces.join("|"));
    }
    ranks.push(fileLabels.join("|"));
    return ranks.join("\r\n");
}
exports.default = toString;

},{}],68:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const toString_1 = require("./helpers/toString");
const getMoves_1 = require("./helpers/getMoves");
const inferMoves_1 = require("./helpers/inferMoves");
const movePiece_1 = require("./helpers/movePiece");
const fen_1 = require("./parsers/fen");
const createSquares_1 = require("./helpers/createSquares");
const basePiece_1 = require("./basePiece");
const availableMoves_1 = require("./helpers/availableMoves");
const getSquare_1 = require("./helpers/getSquare");
const createPiece_1 = require("./helpers/createPiece");
/**
 * Board: extensible board (TODO: more detail)
 */
class Engine {
    constructor() {
        this.uciEngine = null;
        this.rankCount = 8;
        this.fileCount = 8;
        this.postMoveFunctions = [];
        this.boardState = {
            ranks: [],
            tags: {},
            capturedPieces: [],
            whitesTurn: true,
            moveNumber: 1,
            preMoveFunctions: [],
            postMoveFunctions: [],
            moves: [],
            moveHistory: []
        };
        this.pieceDefinitions = [];
        this.pieceFactory = basePiece_1.default;
        this.parseFenString = fen_1.parseFromFenString.bind(this);
        this.stringifyFenString = fen_1.stringifyToFenString.bind(this);
        this.movePiece = movePiece_1.default.bind(this);
        this.calculateMovePiece = movePiece_1.calculateMovePiece.bind(this);
        this.getSquare = getSquare_1.default.bind(this);
        this.getMoves = getMoves_1.default.bind(this);
        this.create = createSquares_1.default.bind(this);
        this.inferMoves = inferMoves_1.default.bind(this);
        this.toString = toString_1.default.bind(this);
        this.populateAvailableMoves = availableMoves_1.default.bind(this);
        this.createPiece = createPiece_1.default.bind(this);
        this.analyzer = (uciEngine) => {
            this.uciEngine = uciEngine;
        };
    }
}
exports.default = Engine;

},{"./basePiece":58,"./helpers/availableMoves":59,"./helpers/createPiece":60,"./helpers/createSquares":61,"./helpers/getMoves":63,"./helpers/getSquare":64,"./helpers/inferMoves":65,"./helpers/movePiece":66,"./helpers/toString":67,"./parsers/fen":77}],69:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const upLeft = makeMove(-1, 1);
const upRight = makeMove(1, 1);
const downLeft = makeMove(-1, -1);
const downRight = makeMove(1, -1);
function makeMove(file, rank) {
    return {
        canCapture: true,
        canMove: true,
        incrementer: { file, rank }
    };
}
const bishop = {
    notation: "b",
    name: "Bishop",
    movement: [upLeft, upRight, downLeft, downRight],
    canQueen: false,
    canSpawn: false,
    value: 3,
    postMoveFunctions: []
};
exports.default = bishop;

},{}],70:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
const pawn_1 = require("./pawn");
const knight_1 = require("./knight");
const bishop_1 = require("./bishop");
const rook_1 = require("./rook");
const queen_1 = require("./queen");
const king_1 = require("./king");
const rules_1 = require("./rules");
/**
 * Engine Definition for classic chess
 */
function classEngine() {
    const board = new index_1.default();
    board.pieceDefinitions = [
        pawn_1.default, knight_1.default, bishop_1.default, rook_1.default, queen_1.default, king_1.default
    ];
    board.parseFenString("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    board.postMoveFunctions = [rules_1.default];
    return board;
}
exports.default = classEngine;

},{"../../index":68,"./bishop":69,"./king":71,"./knight":72,"./pawn":73,"./queen":74,"./rook":75,"./rules":76}],71:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rook_1 = require("./rook");
/**
 * King with castling support
 */
const up = makeMove(0, 1);
const down = makeMove(0, -1);
const left = makeMove(-1, 0);
const right = makeMove(1, 0);
const upLeft = makeMove(-1, 1);
const upRight = makeMove(1, 1);
const downLeft = makeMove(-1, -1);
const downRight = makeMove(1, -1);
const queenSideCastle = {
    canMove: true,
    transforms: { file: -2, rank: 0, absolute: true },
    preCondition: makeCastleMoveCondition({ file: -4, rank: 0 }),
    postMoveAction: postCastle({ file: -2, rank: 0 }, { file: 1, rank: 0 })
};
const kingSideCastle = {
    canMove: true,
    transforms: { file: 2, rank: 0, absolute: true },
    preCondition: makeCastleMoveCondition({ file: 3, rank: 0 }),
    postMoveAction: postCastle({ file: 1, rank: 0 }, { file: -1, rank: 0 })
};
function makeMove(file, rank) {
    return {
        canCapture: true,
        canMove: true,
        transforms: { file, rank }
    };
}
function makeCastleMoveCondition(rookSquare) {
    return (piece, state, board) => {
        // King is not allowed to have moved
        const kingMoves = state.moveHistory.filter(moves => moves.piece.id === piece.id);
        if (kingMoves.length > 0)
            return false;
        // If the king isn't at 1,5 or 8,5...
        if ((piece.location.rank !== 1 && piece.location.rank !== 8)
            || piece.location.file !== 5)
            return false;
        const coord = piece.getAbsoluteDestination(rookSquare);
        const square = board.getSquare(coord, state);
        // Piece must be a rook and the same colour..
        if (square == null)
            return false;
        if (square.piece == null)
            return false;
        if (square.piece.name !== rook_1.default.name)
            return false;
        if (square.piece.isWhite !== piece.isWhite)
            return false;
        // Rook must not have moved
        const rookMoves = state.moveHistory.filter(move => square.piece && move.piece.id === square.piece.id);
        if (rookMoves.length > 0)
            return false;
        // All squares between the King and the Rook must be vacant
        const betweenSquares = [];
        const increment = rookSquare.file > 0 ? 1 : -1;
        for (let x = increment; x !== rookSquare.file; x += increment) {
            const destination = piece.getAbsoluteDestination({ file: x, rank: 0 });
            betweenSquares.push(board.getSquare(destination, state));
        }
        const allVacant = betweenSquares.every(sq => sq.piece == null);
        return allVacant;
    };
}
function postCastle(rookSquare, rookDestination) {
    return {
        action: (piece, state, board) => {
            const oldRookSquare = board.getSquare(piece.getAbsoluteDestination(rookSquare), state);
            const newRookSquare = board.getSquare(piece.getAbsoluteDestination(rookDestination), state);
            newRookSquare.piece = oldRookSquare.piece;
            oldRookSquare.piece = null;
        }
    };
}
const king = {
    notation: "k",
    name: "King",
    movement: [upLeft, upRight, downLeft, downRight, up, down, left, right, queenSideCastle, kingSideCastle],
    canQueen: false,
    canSpawn: false,
    value: 10,
    postMoveFunctions: []
};
exports.default = king;

},{"./rook":75}],72:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Knight
 */
const upLeft = makeMove(-1, 2);
const upRight = makeMove(1, 2);
const downLeft = makeMove(-1, -2);
const downRight = makeMove(1, -2);
const leftUp = makeMove(-2, 1);
const leftDown = makeMove(-2, -1);
const rightUp = makeMove(2, 1);
const rightDown = makeMove(2, -1);
function makeMove(file, rank) {
    return {
        canCapture: true,
        canMove: true,
        transforms: { file, rank, canJump: true },
    };
}
const knight = {
    name: "Knight",
    movement: [upLeft, upRight, downLeft, downRight, leftUp, leftDown, rightUp, rightDown],
    canQueen: false,
    canSpawn: true,
    value: 3,
    notation: "n",
    postMoveFunctions: []
};
exports.default = knight;

},{}],73:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const queen_1 = require("./queen");
const inferMoves_1 = require("../../helpers/inferMoves");
/**
 * Pawn with enpassant, promote, first-move support
 */
const moveForward = {
    canMove: true,
    transforms: { file: 0, rank: 1 },
    postMoveAction: {
        action: (piece, state, board) => {
            const move = state.moveHistory.slice(-1)[0];
            if (!move || move.to.rank !== 1 && move.to.rank !== 8)
                return;
            const promotionNotation = (move.options || queen_1.default.notation).toLowerCase();
            let promotionPiece = board.pieceDefinitions.filter(p => p.notation === promotionNotation)[0];
            if (!promotionPiece) {
                promotionPiece = board.pieceDefinitions.filter(p => p.notation === queen_1.default.notation)[0];
            }
            piece.canQueen = false;
            piece.canSpawn = true;
            piece.movement = promotionPiece.movement;
            piece.notation = promotionPiece.notation;
            piece.postMoveFunctions = promotionPiece.postMoveFunctions;
            piece.value = promotionPiece.value;
            piece.name = promotionPiece.name;
        }
    }
};
const firstMove = {
    canMove: true,
    transforms: { file: 0, rank: 2 },
    preCondition: (piece, boardState) => boardState.moveHistory.filter(m => m.piece.id === piece.id).length === 0,
    postMoveAction: {
        action: (piece, state, board) => {
            const coordBehindPawn = piece.getRelativeDestination({ file: 0, rank: -1 });
            const squareBehindPawn = board.getSquare(coordBehindPawn, state);
            squareBehindPawn.tags["enpassant"] = true;
            state.postMoveFunctions.push({
                moveNumber: state.moveNumber + 1,
                action: (piece, innerState, innerBoard) => {
                    const sq = innerBoard.getSquare({ file: coordBehindPawn.file, rank: coordBehindPawn.rank }, innerState);
                    delete sq.tags["enpassant"];
                }
            });
        }
    }
};
const leftCapture = {
    canCapture: true,
    transforms: { file: 1, rank: 1 }
};
const rightCapture = {
    canCapture: true,
    transforms: { file: -1, rank: 1 }
};
const makeEnpassantPreMove = (dir) => {
    return (piece, state, board) => {
        const coord = piece.getRelativeDestination(dir);
        if (!inferMoves_1.isInBounds(coord))
            return false;
        const sq = board.getSquare(coord, state);
        return !!sq.tags["enpassant"];
    };
};
const enpassantPostMove = (piece, state, board) => {
    const coord = piece.getRelativeDestination({ file: 0, rank: -1 });
    const square = board.getSquare(coord, state);
    if (square.piece === null)
        throw Error(`enpassant postMove fail, expected target piece to be on square ${coord.rank} ${coord.file}, instead got null`);
    state.capturedPieces.push(square.piece);
    square.piece = null;
};
const leftEnpassant = {
    canCapture: true,
    transforms: { file: -1, rank: 1 },
    preCondition: makeEnpassantPreMove({ file: -1, rank: 1 }),
    postMoveAction: {
        action: enpassantPostMove
    }
};
const rightEnpassant = {
    canCapture: true,
    transforms: { file: 1, rank: 1 },
    preCondition: makeEnpassantPreMove({ file: 1, rank: 1 }),
    postMoveAction: {
        action: enpassantPostMove
    }
};
const pawn = {
    notation: "p",
    name: "Pawn",
    movement: [moveForward, firstMove, leftCapture, rightCapture, leftEnpassant, rightEnpassant],
    canQueen: true,
    canSpawn: false,
    value: 1,
    postMoveFunctions: []
};
exports.default = pawn;

},{"../../helpers/inferMoves":65,"./queen":74}],74:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const up = makeMove(0, 1);
const down = makeMove(0, -1);
const left = makeMove(-1, 0);
const right = makeMove(1, 0);
const upLeft = makeMove(-1, 1);
const upRight = makeMove(1, 1);
const downLeft = makeMove(-1, -1);
const downRight = makeMove(1, -1);
function makeMove(file, rank) {
    return {
        canCapture: true,
        canMove: true,
        incrementer: { file, rank }
    };
}
const queen = {
    notation: "q",
    name: "Queen",
    movement: [upLeft, upRight, downLeft, downRight, up, down, left, right],
    canQueen: false,
    canSpawn: false,
    value: 9,
    postMoveFunctions: []
};
exports.default = queen;

},{}],75:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const up = makeMove(0, 1);
const down = makeMove(0, -1);
const left = makeMove(-1, 0);
const right = makeMove(1, 0);
function makeMove(file, rank) {
    return {
        canCapture: true,
        canMove: true,
        incrementer: { file, rank }
    };
}
const rook = {
    notation: "r",
    name: "Rook",
    movement: [up, down, left, right],
    canQueen: false,
    canSpawn: false,
    value: 5,
    postMoveFunctions: []
};
exports.default = rook;

},{}],76:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pawn_1 = require("./pawn");
/**
 * Classic Chess Game Rules
 */
const postMoveFunction = {
    action: (piece, boardState, board) => {
        return processIsGameOver(boardState, board);
    }
};
exports.default = postMoveFunction;
/**
 * Check if move a move is allowed
 *
 * Internally tries to create a new board state
 * Then checks if inCheck
 *
 * @param move
 * @param boardState
 * @param board
 */
function isMoveAllowed(move, boardState, board) {
    const turn = boardState.whitesTurn;
    if (turn !== move.isWhite)
        return false;
    try {
        // Try get future board state
        const res = board.calculateMovePiece(move, boardState);
        if (!res)
            return false;
        // In check
        const check = isCheck(turn, res.newBoardState);
        return !check;
    }
    catch (ex) {
        // No king due to being captured
        return false;
    }
}
/**
 * Get all possible moves on the board
 * @param boardState
 * @param board
 */
function allowedMoves(boardState, board) {
    function isLegit(move) {
        return isMoveAllowed(move, boardState, board);
    }
    return boardState.moves.filter(isLegit);
}
/**
 * Checks if the game is over and assigns the associated states
 * @param boardState
 * @param board
 */
function processIsGameOver(boardState, board) {
    const fiftyMoveStalemate = fiftyMoveRule(boardState);
    if (fiftyMoveStalemate) {
        boardState.gameIsDrawn = true;
        boardState.moves = []; // this should be already set to empty?
        return true;
    }
    const isInCheck = isCheck(boardState.whitesTurn, boardState);
    const moves = allowedMoves(boardState, board);
    const hasMoves = moves.length > 0;
    if (hasMoves)
        return false;
    boardState.moves = [];
    if (isInCheck) {
        boardState.winnerIsWhite = !boardState.whitesTurn;
    }
    else {
        boardState.gameIsDrawn = true;
    }
    return true;
}
/**
 * Check is side is inCheck given a board state
 * @param checkWhite
 * @param boardState
 */
function isCheck(checkWhite, boardState) {
    let kingSquare = undefined;
    for (let rx = 1; rx <= 8; rx++) {
        const rank = boardState.ranks[rx];
        for (let sx = 1; sx <= 8; sx++) {
            const square = rank.squares[sx];
            if (!square.piece)
                continue;
            const isKing = square.piece.name === "King" && square.piece.isWhite === checkWhite;
            if (isKing)
                kingSquare = square;
        }
    }
    if (!kingSquare)
        throw Error("Unable to locate opposing king");
    const kingAttackers = boardState.moves.filter((move) => {
        if (kingSquare == null)
            return;
        return move.to.file === kingSquare.file && move.to.rank === kingSquare.rank;
    });
    return kingAttackers.length > 0;
}
function fiftyMoveRule(state) {
    if (state.moveHistory.length < 50)
        return false;
    const lastFiftyMoves = state.moveHistory.slice(-50);
    return !lastFiftyMoves.some(isPawn);
}
function isPawn(move) {
    return move.piece.notation === pawn_1.default.notation;
}

},{"./pawn":73}],77:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const king_1 = require("../instances/classic/king");
const rook_1 = require("../instances/classic/rook");
const fen_1 = require("./stringParsers/fen");
const defaultPosition = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
function hasRookMoved(boardState, isWhite, isQueenSide) {
    return boardState.moveHistory.some(move => {
        const piece = move.piece;
        const sideQueen = piece.location.file === 0;
        return piece.notation === rook_1.default.notation && piece.isWhite === isWhite && sideQueen === isQueenSide;
    });
}
function hasKingMoved(boardState, isWhite) {
    return boardState.moveHistory.some(move => {
        const piece = move.piece;
        return piece.notation === king_1.default.notation && move.piece.isWhite === isWhite;
    });
}
/**
 * Converts the board state to a fen string
 * TODO enpassant
 */
function stringifyToFenString() {
    const fen = {
        ranks: [],
        turn: 'w',
        castling: [],
        enpassant: '-',
        halfMove: 0,
        fullMove: 0
    };
    this.boardState.ranks.reverse().forEach(rank => {
        let rankRowPieces = [];
        rank.squares.forEach(sq => {
            if (sq.piece == null) {
                rankRowPieces.push('-');
            }
            else {
                rankRowPieces.push(sq.piece.notation);
            }
        });
        rankRowPieces = rankRowPieces.reduce((accumulator, currentValue) => {
            if (currentValue === '-') {
                const previousValueInt = Number(accumulator.slice(-1)[0]);
                if (!isNaN(previousValueInt)) {
                    accumulator[accumulator.length - 1] = (previousValueInt + 1).toString();
                    return accumulator;
                }
                else {
                    return [...accumulator, '1'];
                }
            }
            return [...accumulator, currentValue];
        }, []);
        fen.ranks.push(rankRowPieces.join(''));
    });
    fen.turn = this.boardState.whitesTurn ? 'w' : 'b';
    if (!hasKingMoved(this.boardState, true)) {
        if (!hasRookMoved(this.boardState, true, false)) {
            fen.castling.push('K');
        }
        if (!hasRookMoved(this.boardState, true, true)) {
            fen.castling.push('Q');
        }
    }
    if (!hasKingMoved(this.boardState, false)) {
        if (!hasRookMoved(this.boardState, false, false)) {
            fen.castling.push('k');
        }
        if (!hasRookMoved(this.boardState, false, true)) {
            fen.castling.push('q');
        }
    }
    if (fen.castling.length === 0) {
        fen.castling.push('-');
    }
    fen.fullMove = this.boardState.moveNumber;
    const ranksStr = fen.ranks.join('/');
    const castingStr = fen.castling.join('');
    return `${ranksStr} ${fen.turn} ${castingStr} ${fen.enpassant} ${fen.halfMove} ${fen.fullMove}`;
}
exports.stringifyToFenString = stringifyToFenString;
/**
 * Parses fen string and sets engine state accordingly
 * Does not load castling or enpassant info.. // Since this engine allows for variants
 *
 * @param position - the fen string
 */
function parseFromFenString(position) {
    const engineInput = fen_1.default.parse(position || defaultPosition);
    this.boardState.whitesTurn = engineInput.turn === "w";
    let rankCount = this.rankCount;
    engineInput.ranks.forEach(rank => {
        this.boardState.ranks[rankCount] = createFilesForRank(this, rank, rankCount);
        rankCount--;
    });
    this.populateAvailableMoves();
}
exports.parseFromFenString = parseFromFenString;
function createFilesForRank(engine, fenRank, rankNumber) {
    const rank = {
        rank: rankNumber,
        squares: []
    };
    const fenRankArray = fenRank.split('');
    let lastNotationNumber = 0;
    let index = 0;
    for (let i = 1; i <= engine.fileCount; i++) {
        const notation = fenRankArray[index];
        const notationNumber = parseInt(notation);
        // If the notation is a number, that many squares from this square contain no piece.
        // TODO Consider refactoring--export to function for readability
        if (!isNaN(notationNumber)) {
            lastNotationNumber += notationNumber;
            // Insert the next notation after the blank squares.
            if (!!fenRankArray[i + 1])
                fenRankArray[i + notationNumber] = fenRankArray[i + 1];
            // Insert blank squares from the current square, to currentSquare+notationNumber.
            for (let j = i; j < i + notationNumber; j++) {
                rank.squares[j] = { rank: rankNumber, file: j, piece: null, tags: {} };
            }
            i += notationNumber - 1;
            index++;
            continue;
        }
        rank.squares[i] = {
            rank: rankNumber,
            file: i,
            piece: engine.createPiece(notation, { file: i, rank: rankNumber }),
            tags: {}
        };
        index++;
    }
    return rank;
}

},{"../instances/classic/king":71,"../instances/classic/rook":75,"./stringParsers/fen":78}],78:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pegjs_1 = require("pegjs");
const parser = pegjs_1.generate(`
	Start
	= WS r:RankList WS t:Turn WS c:Castling WS Enpassant WS h:HalfMove WS m:Move WS
	{ return {
	ranks: r,
	turn: t,
	castling: c,
	halfMove: h,
	fullMove: t };
	}
	RankList
	= head:Rank "/" tail:RankList { return [].concat(head,tail); }
	/ Rank

	Rank
	= rank:[a-zA-Z0-9]+ { return rank.join(''); }

	WS
	= " "* { return null; }

	Turn
	= turn:[w|b] { return turn }

	Castling
	= castling:[k|q|K|Q|-]+ { return castling.filter(function(c) { return c !== '-'; }); }

	Enpassant
	= ([a-h]{1})([1-8]{1})
	/ "-"

	HalfMove
	= [0-9]+

	Move
	= [0-9]+
`);
exports.default = parser;

},{"pegjs":52}],79:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
    Direction[Direction["Left"] = 2] = "Left";
    Direction[Direction["Right"] = 3] = "Right";
    Direction[Direction["DiagonalUp"] = 4] = "DiagonalUp";
    Direction[Direction["DiagonalDown"] = 5] = "DiagonalDown";
    Direction[Direction["Lateral"] = 6] = "Lateral";
    Direction[Direction["Horizontal"] = 7] = "Horizontal";
    Direction[Direction["Vertical"] = 8] = "Vertical";
    Direction[Direction["Diagonal"] = 9] = "Diagonal";
    Direction[Direction["UpLeft"] = 10] = "UpLeft";
    Direction[Direction["UpRight"] = 11] = "UpRight";
    Direction[Direction["DownLeft"] = 12] = "DownLeft";
    Direction[Direction["DownRight"] = 13] = "DownRight";
    Direction[Direction["KingSide"] = 14] = "KingSide";
    Direction[Direction["QueenSide"] = 15] = "QueenSide";
})(Direction = exports.Direction || (exports.Direction = {}));

},{}],80:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("./engine");
const engine_2 = require("./engine/instances/classic/engine");
const enums_1 = require("./enums");
const chess = {
    Direction: enums_1.Direction,
    Engine: engine_1.default,
    classic: {
        engine: engine_2.default,
    }
};
exports.default = chess;

},{"./engine":68,"./engine/instances/classic/engine":70,"./enums":79}],81:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
const chai_1 = require("chai");
const make = index_1.default.classic;
const classic = index_1.default.classic.engine();
var classicMoveTest = pieceMoveTest.bind(classic);
var classicMovesTest = hasMovesTest.bind(classic);
var classicTagTest = hasTagTest.bind(classic);
var classicLocationTest = atLocationTest.bind(classic);
var checkmate = make.engine();
checkmate.parseFenString("6rk/6pp/3N4/8/8/8/PP2PPPP/RNBQKB1R w KQkq - 0 1");
var cmMoveTest = pieceMoveTest.bind(checkmate);
var blackCheckmate = make.engine();
blackCheckmate.parseFenString("r5bk/6pp/3N4/8/8/8/4PPPP/7K b KQkq - 0 1");
var blackCmMoveTest = pieceMoveTest.bind(blackCheckmate);
var stalemate = make.engine();
stalemate.parseFenString("k7/p7/2R5/8/8/8/8/1R2K3 w - - 0 1");
var stalementCmMoveTest = pieceMoveTest.bind(stalemate);
var whitePromote = make.engine();
whitePromote.parseFenString("1nbqkbnr/Pppppppp/8/8/8/8/1PPPPPPP/RNBQKBNR w KQkq - 0 1");
var whitePromiseMoveTest = pieceMoveTest.bind(whitePromote);
describe("relatve destination tests", () => {
    it("White: will evaluate {1,0} from {2,2} to be {3,2}", () => {
        var _a;
        var b2 = classic.getSquare({ file: 2, rank: 2 });
        var c2 = (_a = b2.piece) === null || _a === void 0 ? void 0 : _a.getRelativeDestination({ file: 1, rank: 0 });
        chai_1.expect(c2 === null || c2 === void 0 ? void 0 : c2.file).to.equal(3);
        chai_1.expect(c2 === null || c2 === void 0 ? void 0 : c2.rank).to.equal(2);
    });
    it("Black: will evaluate {0,1} from {2,7} to be {2,6}", () => {
        var _a;
        var b7 = classic.getSquare({ file: 2, rank: 7 });
        var b6 = (_a = b7.piece) === null || _a === void 0 ? void 0 : _a.getRelativeDestination({ file: 0, rank: 1 });
        chai_1.expect(b6 === null || b6 === void 0 ? void 0 : b6.file).to.equal(2);
        chai_1.expect(b6 === null || b6 === void 0 ? void 0 : b6.rank).to.equal(6);
    });
});
describe("absolute destination tests", () => {
    it("Black: will evaluate {0,-2} from {2,7} to be {2,5}", () => {
        var _a;
        var b7 = classic.getSquare({ file: 2, rank: 7 });
        var b5 = (_a = b7.piece) === null || _a === void 0 ? void 0 : _a.getAbsoluteDestination({ file: 0, rank: -2 });
        chai_1.expect(b5 === null || b5 === void 0 ? void 0 : b5.file).to.equal(2);
        chai_1.expect(b5 === null || b5 === void 0 ? void 0 : b5.rank).to.equal(5);
    });
});
describe("available move tests", () => {
    classicMovesTest("will find all available moves for the b2 pawn from the starting position", coord(2, 2), [coord(2, 3), coord(2, 4)]);
    classicMovesTest("will find all available moves for b1 knight from the starting position", coord(2, 1), [coord(3, 3), coord(1, 3)]);
    classicMovesTest("will find all available moves for c1 bishop from the starting position", coord(3, 1), []);
    classicMovesTest("will find all available moves for d1 queen from the starting position", coord(4, 1), []);
    classicMovesTest("will find all available moves for e1 king from the starting position", coord(5, 1), []);
    classicMovesTest("will find all available moves for b7 pawn from the starting position", coord(2, 7), [coord(2, 6), coord(2, 5)]);
    classicMovesTest("will find no available moves for b8 knight from the starting position", coord(2, 8), [coord(1, 6), coord(3, 6)]);
    classicMovesTest("will find all available moves for a7 pawn form the start position", coord(1, 7), [coord(1, 6), coord(1, 5)]);
});
describe("classic movement tests", () => {
    classicMoveTest("[White] will move a2-a3", coord(1, 2), coord(1, 3));
    classicMoveTest("[White] will not move a3-a4 due to being black's turn", coord(1, 3), coord(1, 4), true);
    classicMoveTest("[Black] will move a7-a6", coord(1, 7), coord(1, 6));
    classicMoveTest("[White] will move a3-a4", coord(1, 3), coord(1, 4));
    classicMoveTest("[Black] will move a6-a5", coord(1, 6), coord(1, 5));
    classicMoveTest("[White] will move not move a4-a5 due to 'cannot capture'", coord(1, 5), coord(1, 6), true);
    classicMoveTest("[White] will move g1-h3", coord(7, 1), coord(8, 3));
    classicMoveTest("[Black] will move b7-b5", coord(2, 7), coord(2, 5));
    classicMoveTest("[White] will capture from a4-b5", coord(1, 4), coord(2, 5));
    classicMoveTest("[Black] will move c7-c5, enabling enpassant capture on c6", coord(3, 7), coord(3, 5));
    classicMovesTest("will find all available moves for white pawn on b5", coord(2, 5), [coord(2, 6), coord(3, 6)]);
    classicMoveTest("[White] will capture EnPassant from b5-c6", coord(2, 5), coord(3, 6));
    classicTagTest("enpassant tag on c6 will be removed after the capture", coord(3, 6), "enpassant", undefined);
    classicMoveTest("[Black] will move Nb8-Na6", coord(2, 8), coord(1, 6));
    classicMoveTest("[White] will move g2 pawn two squares to for enpassant tag", coord(7, 2), coord(7, 4));
    classicTagTest("will have enpassant tag on g3", coord(7, 3), "enpassant", true);
    classicMoveTest("[Black] will move Bc8-Bb7", coord(3, 8), coord(2, 7));
    classicMoveTest("[White] will move Bf1-Bg2 to enable white king-side castling", coord(6, 1), coord(7, 2));
    classicMoveTest("[Black] will move Qd8-Qc7 enabling queenside castling", coord(4, 8), coord(3, 7));
    classicMovesTest("[White] will be able to move Ke1-Kg1 (O-O) and Ke1-Kf1", coord(5, 1), [coord(6, 1), coord(7, 1)]);
    classicMoveTest("[White] will castle king side (Ke1-Kg1 or O-O)", coord(5, 1), coord(7, 1));
    classicLocationTest("will have white rook on f1 after castling", coord(6, 1), "R");
    classicMovesTest("[Black] will be able to move Ke8-Kc8 (o-o-o) and Ke8-Kd8", coord(5, 8), [coord(3, 8), coord(4, 8)]);
    classicMoveTest("[Black] will castle queen side (Ke8-Kc8 or o-o-o)", coord(5, 8), coord(3, 8));
    classicLocationTest("will have black rook on d8 after castling", coord(4, 8), "r");
    it("[Promote] will promote pawn on a7 to a queen", () => {
        var _a;
        whitePromote.movePiece({
            from: { file: 1, rank: 7 },
            to: { file: 1, rank: 8 }
        });
        var square = whitePromote.getSquare({ file: 1, rank: 8 });
        var piece = square.piece;
        chai_1.expect(square.piece).to.exist;
        chai_1.expect((_a = square.piece) === null || _a === void 0 ? void 0 : _a.notation).to.equal("q");
    });
});
describe("game conclusion tests", () => {
    cmMoveTest("[Checkmate] will move Nf7#", coord(4, 6), coord(6, 7));
    it("Will declare that white is the winner", () => {
        chai_1.expect(checkmate.boardState.winnerIsWhite).to.equal(true);
    });
    blackCmMoveTest("[Checkmate] will move Ra1#", coord(1, 8), coord(1, 1));
    it("Will declare that white is the winner", () => {
        chai_1.expect(blackCheckmate.boardState.winnerIsWhite).to.equal(false);
    });
    stalementCmMoveTest("[Stalemate] will move Ra6", coord(3, 6), coord(1, 6));
    it("Will declare that the game is drawn by stalement", () => {
        chai_1.expect(stalemate.boardState.gameIsDrawn).to.equal(true);
    });
});
function hasTagTest(message, coordinate, tagName, expected) {
    it(message, () => {
        var board = this;
        var square = board.getSquare(coordinate);
        chai_1.expect(square.tags[tagName]).to.equal(expected);
    });
}
function atLocationTest(message, location, notation) {
    it(message, () => {
        var _a;
        var board = this;
        var square = board.getSquare(location);
        chai_1.expect((_a = square.piece) === null || _a === void 0 ? void 0 : _a.notation).to.equal(notation);
    });
}
function hasMovesTest(message, start, expectedMoves) {
    it(message, () => {
        var board = this;
        var moves = board.boardState.moves
            .filter(move => move.from.file === start.file && move.from.rank === start.rank)
            .map(move => move.to);
        expectedMoves.forEach(m => chai_1.expect(moves).to.include({ rank: m.rank, file: m.file }));
        chai_1.expect(expectedMoves.length).to.equal(moves.length);
    });
}
function coord(file, rank) {
    return { file: file, rank: rank };
}
function compare(left, right) {
    return left.rank === right.rank && left.file === right.file;
}
function move(direction, count) {
    return { direction: direction, count: count };
}
/**
 * Test that a piece successfully moved
 */
var count = 0;
function pieceMoveTest(message, from, to, wont = false) {
    it(message, () => {
        var isShitMove = from.file === 2 && from.rank === 7;
        var board = this;
        var expected = wont ? from : to;
        // var square: Square = board.getSquare(from);
        var piece = board.getSquare(from).piece;
        var newState = board.movePiece({ from, to });
        var moved = newState ? board.getSquare(expected, newState) : null;
        var movedPiece = moved === null || moved === void 0 ? void 0 : moved.piece;
        if (wont) {
            chai_1.expect(newState).to.be.null;
            return;
        }
        // A bit elaborate due to immutability of movePiece function
        chai_1.expect(movedPiece).to.exist;
        chai_1.expect(movedPiece === null || movedPiece === void 0 ? void 0 : movedPiece.location.file).to.equal(expected.file);
        chai_1.expect(movedPiece === null || movedPiece === void 0 ? void 0 : movedPiece.location.rank).to.equal(expected.rank);
        chai_1.expect(movedPiece === null || movedPiece === void 0 ? void 0 : movedPiece.isWhite).to.equal(piece === null || piece === void 0 ? void 0 : piece.isWhite);
        chai_1.expect(movedPiece === null || movedPiece === void 0 ? void 0 : movedPiece.notation).to.equal(piece === null || piece === void 0 ? void 0 : piece.notation);
    });
}

},{"../src/index":80,"chai":5}]},{},[81]);
