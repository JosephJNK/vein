(function() {
  var Vein,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = Array.prototype.slice;

  Vein = (function() {

    function Vein(url, options) {
      var _base;
      this.url = url != null ? url : location.origin;
      this.options = options != null ? options : {};
      this.getSender = __bind(this.getSender, this);
      this.getListener = __bind(this.getListener, this);
      this.handleSession = __bind(this.handleSession, this);
      this.handleServices = __bind(this.handleServices, this);
      this.handleMessage = __bind(this.handleMessage, this);
      this.handleClose = __bind(this.handleClose, this);
      if ((_base = this.options).prefix == null) _base.prefix = 'vein';
      this.socket = new SockJS("" + this.url + "/" + this.options.prefix, null, this.options);
      this.callbacks['services'] = this.handleServices;
      this.callbacks['session'] = this.handleSession;
      this.socket.onmessage = this.handleMessage;
      this.socket.onclose = this.handleClose;
      return;
    }

    Vein.prototype.callbacks = {};

    Vein.prototype.subscribe = {};

    Vein.prototype.session = null;

    Vein.prototype.ready = function(cb) {
      return this.callbacks['ready'] = cb;
    };

    Vein.prototype.close = function(cb) {
      return this.callbacks['close'] = cb;
    };

    Vein.prototype.handleClose = function() {
      var _base;
      return typeof (_base = this.callbacks)['close'] === "function" ? _base['close']() : void 0;
    };

    Vein.prototype.handleMessage = function(e) {
      var args, fn, id, service, _i, _len, _ref, _ref2, _ref3;
      _ref = JSON.parse(e.data), id = _ref.id, service = _ref.service, args = _ref.args;
      if (this.subscribe[service] && this.subscribe[service].listeners) {
        _ref2 = this.subscribe[service].listeners;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          fn = _ref2[_i];
          fn.apply(null, args);
        }
      }
      if (!this.callbacks[id]) return;
      (_ref3 = this.callbacks)[id].apply(_ref3, args);
      delete this.callbacks[id];
    };

    Vein.prototype.handleServices = function() {
      var service, services, _base, _i, _j, _len, _len2;
      services = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = services.length; _i < _len; _i++) {
        service = services[_i];
        this[service] = this.getSender(service);
      }
      for (_j = 0, _len2 = services.length; _j < _len2; _j++) {
        service = services[_j];
        this.subscribe[service] = this.getListener(service);
      }
      if (typeof (_base = this.callbacks)['ready'] === "function") {
        _base['ready'](services);
      }
      delete this.callbacks['ready'];
    };

    Vein.prototype.handleSession = function(sess, obj) {
      this.session = {
        id: sess,
        data: obj
      };
      return this.setCookie;
    };

    Vein.prototype.getListener = function(service) {
      var _this = this;
      return function(cb) {
        var _base;
        if ((_base = _this.subscribe[service]).listeners == null) {
          _base.listeners = [];
        }
        _this.subscribe[service].listeners.push(cb);
      };
    };

    Vein.prototype.getSender = function(service) {
      var _this = this;
      return function() {
        var args, cb, id, _i;
        args = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
        id = _this.getId();
        _this.callbacks[id] = cb;
        _this.socket.send(JSON.stringify({
          id: id,
          service: service,
          args: args
        }));
      };
    };

    Vein.prototype.getId = function() {
      var rand;
      rand = function() {
        return (((1 + Math.random()) * 0x10000000) | 0).toString(16);
      };
      return rand() + rand() + rand();
    };

    return Vein;

  })();

  window.Vein = Vein;

}).call(this);