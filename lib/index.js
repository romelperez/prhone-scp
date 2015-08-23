/*!
 * prhone-scp
 * Simple config parser.
 * https://github.com/romelperez/prhone-scp
 *
 * Copyright 2015 Romel Pérez
 * Released under the MIT license
 */

'use strict';

var _ = require('underscore');
var fs = require('fs');


var defaultConfig = {
  encoding: 'utf8',
  tokens: {}
};
var config = _({}).extend(defaultConfig);


//
// Tokens.
//
var tokenProc = {

  line: function (data) {
    return data;
  },

  multiline: function (data) {
    data = data.split(/[\r\n]/);
    return data;
  }
};


//
// Parse.
//
var parse = function (path, conf, callback) {

  var tokensNames = Object.keys(conf.tokens);

  // Remove innecesary lines and spaces of a text.
  var cleanSpaces = function (text) {
    text = text.replace(/^\s*[\r\n]/gm, '');
    text = text.replace(/^\s*/gm, '');
    text = text.replace(/\s*$/gm, '');
    return text;
  };

  // Extract a token data from a source.
  // Return the source without the token data too.
  var extract = function (src, token) {
    var index = src.indexOf(token);
    if (index === -1) return {
      base: src,
      data: ''
    };

    var data = src.substring(index + token.length);

    // Cut off till next token position.
    var ti, nextTokenI;
    var dataNextTokenPos = data.length;
    for (var i = 0; i < tokensNames.length; i++) {
      ti = data.indexOf(tokensNames[i]);
      if (ti !== -1 && ti < dataNextTokenPos) {
        dataNextTokenPos = ti;
        nextTokenI = i;
      }
    }
    data = data.substring(0, dataNextTokenPos);

    var base = src.replace(token, '').replace(data, '');
    data = cleanSpaces(data);

    return {
      base: base,
      data: data
    };
  };

  // Get the clean content of a file.
  var getCleanFile = function (conf, path, callback) {

    return fs.readFile(path, {encoding: conf.encoding}, function (err, raw) {
      if (err) return callback(err);

      // Remove comments.
      var data = raw.replace(new RegExp(/^\s*#.*$/igm), '').trim();

      data = cleanSpaces(data);

      // Verify repeated tokens.
      var t, token, match;
      for (t = 0; t < tokensNames.length; t += 1) {
        token = tokensNames[t];
        match = data.match(new RegExp(token, 'gm'));
        if (match && match.length > 1) {
          return callback(new Error('Token "'+ token +'" repeated in config file "'
            + path +'"'));
        }
      }

      callback(null, data);
    });
  };

  // Process the clean content of the config file.
  getCleanFile(conf, path, function (err, data) {
    if (err) return callback(err);

    var parsed = {};

    var dataExt;
    var dataCut = data;
    for (var tn in conf.tokens) {
      dataExt = extract(dataCut, tn);
      dataCut = dataExt.base;

      if (typeof conf.tokens[tn] === 'string') {
        if (!tokenProc[conf.tokens[tn]]) {
          return callback(new Error('The processor "'+ conf.tokens[tn] +'" of token "'
            + tn +'" is not defined for config file "'+ path +'".'));
        } else {
          parsed[tn] = tokenProc[conf.tokens[tn]](dataExt.data);
        }
      } else {
        parsed[tn] = conf.tokens[tn](dataExt.data);
      }
    };

    callback(null, parsed);
  });
};


//
// Module.
//
module.exports = exports = {

  /**
   * Set a configuration for the parser and get it.
   * @param  {Object} [conf] A configuration.
   * @return {Object}        The configuration defined.
   */
  config: function (conf) {
    return _(config).extend(conf);
  },

  /**
   * Parse a config file.
   * @param  {String}   path     Absolute path to the file.
   * @param  {Object}   [conf]   Optional configuration.
   * @param  {Function} callback A callback which sends if an error ocurred and
   * the configuration parsed.
   */
  parse: function (path, conf, callback) {

    if (typeof conf === 'object') {
      _(conf).extend(defaultConfig);
    } else {
      if (typeof conf === 'function') {
        callback = conf;
      }
      conf = config;
    }

    parse(path, conf, callback);
  }

};
