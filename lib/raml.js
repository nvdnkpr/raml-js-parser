(function() {
  var _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.composer = require('./composer');

  this.constructor = require('./construct');

  this.errors = require('./errors');

  this.events = require('./events');

  this.loader = require('./loader');

  this.nodes = require('./nodes');

  this.parser = require('./parser');

  this.reader = require('./reader');

  this.resolver = require('./resolver');

  this.scanner = require('./scanner');

  this.tokens = require('./tokens');

  this.q = require('q');

  this.FileError = (function(_super) {
    __extends(FileError, _super);

    function FileError() {
      _ref = FileError.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    return FileError;

  })(this.errors.MarkedYAMLError);

  /*
  Scan a RAML stream and produce scanning tokens.
  */


  this.scan = function(stream, location) {
    var loader, _results;
    loader = new exports.loader.Loader(stream, location, false);
    _results = [];
    while (loader.check_token()) {
      _results.push(loader.get_token());
    }
    return _results;
  };

  /*
  Parse a RAML stream and produce parsing events.
  */


  this.parse = function(stream, location) {
    var loader, _results;
    loader = new exports.loader.Loader(stream, location, false);
    _results = [];
    while (loader.check_event()) {
      _results.push(loader.get_event());
    }
    return _results;
  };

  /*
  Parse the first RAML document in a stream and produce the corresponding
  representation tree.
  */


  this.compose = function(stream, validate, apply, join, location, parent) {
    var loader;
    if (validate == null) {
      validate = true;
    }
    if (apply == null) {
      apply = true;
    }
    if (join == null) {
      join = true;
    }
    loader = new exports.loader.Loader(stream, location, validate, parent);
    return loader.get_single_node(validate, apply, join);
  };

  /*
  Parse the first RAML document in a stream and produce the corresponding
  Javascript object.
  */


  this.load = function(stream, validate, location) {
    var _this = this;
    if (validate == null) {
      validate = true;
    }
    return this.q.fcall(function() {
      var loader;
      loader = new exports.loader.Loader(stream, location, validate);
      return loader.get_single_data();
    });
  };

  /*
  Parse the first RAML document in a stream and produce a list of
  all the absolute URIs for all resources.
  */


  this.resources = function(stream, validate, location) {
    var _this = this;
    if (validate == null) {
      validate = true;
    }
    return this.q.fcall(function() {
      var loader;
      loader = new exports.loader.Loader(stream, location, validate);
      return loader.resources();
    });
  };

  /*
  Parse the first RAML document in a stream and produce the corresponding
  Javascript object.
  */


  this.loadFile = function(file, validate) {
    var _this = this;
    if (validate == null) {
      validate = true;
    }
    return this.q.fcall(function() {
      var stream;
      stream = _this.readFile(file);
      return _this.load(stream, validate, file);
    });
  };

  /*
  Parse the first RAML document in a file and produce the corresponding
  representation tree.
  */


  this.composeFile = function(file, validate, apply, join, parent) {
    var stream;
    if (validate == null) {
      validate = true;
    }
    if (apply == null) {
      apply = true;
    }
    if (join == null) {
      join = true;
    }
    stream = this.readFile(file);
    return this.compose(stream, validate, apply, join, file, parent);
  };

  /*
  Parse the first RAML document in a file and produce a list of
  all the absolute URIs for all resources.
  */


  this.resourcesFile = function(file, validate) {
    var stream;
    if (validate == null) {
      validate = true;
    }
    stream = this.readFile(file);
    return this.resources(stream, validate, file);
  };

  /*
  Read file either locally or from the network.
  */


  this.readFile = function(file) {
    var error, url;
    url = require('url').parse(file);
    if (url.protocol != null) {
      if (!url.protocol.match(/^https?/i)) {
        throw new exports.FileError("while reading " + file, null, "unknown protocol " + url.protocol, this.start_mark);
      } else {
        return this.fetchFile(file);
      }
    } else {
      if (typeof window !== "undefined" && window !== null) {
        return this.fetchFile(file);
      } else {
        try {
          return require('fs').readFileSync(file).toString();
        } catch (_error) {
          error = _error;
          throw new exports.FileError("while reading " + file, null, "cannot read " + file + " (" + error + ")", this.start_mark);
        }
      }
    }
  };

  /*
  Read file from the network.
  */


  this.fetchFile = function(file) {
    var error, xhr;
    if (typeof window !== "undefined" && window !== null) {
      xhr = new XMLHttpRequest();
    } else {
      xhr = new (require('xmlhttprequest').XMLHttpRequest)();
    }
    try {
      xhr.open('GET', file, false);
      xhr.setRequestHeader('Accept', 'application/raml+yaml, */*');
      xhr.send(null);
      if ((typeof xhr.status === 'number' && xhr.status === 200) || (typeof xhr.status === 'string' && xhr.status.match(/^200/i))) {
        return xhr.responseText;
      }
      throw new Error("HTTP " + xhr.status + " " + xhr.statusText);
    } catch (_error) {
      error = _error;
      throw new exports.FileError("while fetching " + file, null, "cannot fetch " + file + " (" + error + ")", this.start_mark);
    }
  };

}).call(this);
