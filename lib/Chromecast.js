"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Bind_1 = tslib_1.__importDefault(require("./Bind"));
var PlayerEvent_1 = require("./PlayerEvent");
var Media_1 = tslib_1.__importDefault(require("./Media"));
var onAvailableCallbackId = '__onGCastApiAvailable';
var CastOptions = (function () {
    function CastOptions() {
        this._options = {
            autoJoinPolicy: chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED,
            receiverApplicationId: 'CC1AD845',
            language: 'en'
        };
    }
    CastOptions.prototype.setOptions = function (options) {
        this._options = tslib_1.__assign({}, this._options, options);
    };
    Object.defineProperty(CastOptions.prototype, "options", {
        get: function () {
            return this._options;
        },
        enumerable: true,
        configurable: true
    });
    return CastOptions;
}());
exports.CastOptions = CastOptions;
var ChromecastInstance = (function () {
    function ChromecastInstance() {
        this._ready = false;
        this._mediaQueue = [];
        this._readyStateListener = function () { };
        this._errorListener = function () { };
        this._eventHandler = new PlayerEvent_1.PlayerEventDelegate();
    }
    ChromecastInstance.prototype.isReady = function () {
        return this._ready;
    };
    ChromecastInstance.prototype.initializeCastService = function (options) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof chrome.cast === 'undefined') {
                var t = document.createElement('script');
                t.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
                document.body.appendChild(t);
                window[onAvailableCallbackId] = function (available) {
                    if (available) {
                        _this._context = cast.framework.CastContext.getInstance();
                        _this._context.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, _this.onSessionStateChange);
                        _this._options = new CastOptions();
                        if (options)
                            _this._options.setOptions(options);
                        _this._context.setOptions(_this._options.options);
                        resolve();
                    }
                    else {
                        reject(new Error('Cast service is not available'));
                    }
                };
            }
        });
    };
    ChromecastInstance.prototype.setReadyStateListner = function (listener) {
        this._readyStateListener = listener;
    };
    ChromecastInstance.prototype.setErrorListener = function (listener) {
        this._errorListener = listener;
    };
    Object.defineProperty(ChromecastInstance.prototype, "eventDelegate", {
        get: function () {
            return this._eventHandler;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChromecastInstance.prototype, "controller", {
        get: function () {
            return this._controller;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChromecastInstance.prototype, "player", {
        get: function () {
            return this._player;
        },
        enumerable: true,
        configurable: true
    });
    ChromecastInstance.prototype.disconnect = function () {
        this._session.endSession(true);
        this.removeListeners();
        this._ready = false;
    };
    ChromecastInstance.prototype.newMediaEntity = function (mediaId, mimeType, title, image, meta) {
        return Media_1.default.newEntity(mediaId, mimeType, title, image, meta);
    };
    ChromecastInstance.prototype.playOne = function (media) {
        var request = new chrome.cast.media.LoadRequest(media);
        this._session.loadMedia(request)
            .then(this.onMediaLoaded, this.onMediaLoadError)
            .catch(console.error);
    };
    ChromecastInstance.prototype.queue = function (items) {
        var _this = this;
        items.forEach(function (i) { return _this._mediaQueue.push(new chrome.cast.media.QueueItem(i)); });
    };
    ChromecastInstance.prototype.addToQueue = function (item) {
        this._mediaQueue.push(new chrome.cast.media.QueueItem(item));
    };
    ChromecastInstance.prototype.startQueue = function () {
        var request = new chrome.cast.media.QueueLoadRequest(this._mediaQueue);
        this._mediaSession.queueLoad(request, this.onMediaLoaded, this.onError);
    };
    ChromecastInstance.prototype.onSessionStateChange = function (event) {
        switch (event.sessionState) {
            case cast.framework.SessionState.SESSION_ENDED:
                break;
            case cast.framework.SessionState.SESSION_STARTED:
                this._session = this._context.getCurrentSession();
                this._mediaSession = this._session.getSessionObj();
                this._readyStateListener();
                break;
        }
    };
    ChromecastInstance.prototype.onMediaLoaded = function () {
        this.removeListeners();
        this._player = new cast.framework.RemotePlayer();
        this._controller = new cast.framework.RemotePlayerController(this._player);
        this._controller.addEventListener(cast.framework.RemotePlayerEventType.ANY_CHANGE, this.onPlayerEvent);
    };
    ChromecastInstance.prototype.onMediaLoadError = function (errorCode) {
        this._errorListener(new chrome.cast.Error(errorCode));
    };
    ChromecastInstance.prototype.onError = function (error) {
        this._errorListener(error);
    };
    ChromecastInstance.prototype.onPlayerEvent = function (event) {
        this._eventHandler.invoke(event.field, event.value);
    };
    ChromecastInstance.prototype.removeListeners = function () {
        if (!!this._controller)
            this._controller.removeEventListener(cast.framework.RemotePlayerEventType.ANY_CHANGE, this.onPlayerEvent);
    };
    tslib_1.__decorate([
        Bind_1.default
    ], ChromecastInstance.prototype, "onSessionStateChange", null);
    tslib_1.__decorate([
        Bind_1.default
    ], ChromecastInstance.prototype, "onMediaLoaded", null);
    tslib_1.__decorate([
        Bind_1.default
    ], ChromecastInstance.prototype, "onMediaLoadError", null);
    tslib_1.__decorate([
        Bind_1.default
    ], ChromecastInstance.prototype, "onError", null);
    tslib_1.__decorate([
        Bind_1.default
    ], ChromecastInstance.prototype, "onPlayerEvent", null);
    return ChromecastInstance;
}());
var Chromecast = new ChromecastInstance();
exports.default = Chromecast;