"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redis_1 = require("redis");
var _ = require('lodash');
var pubsub_async_iterator_1 = require("./pubsub-async-iterator");
var RedisPubSub = (function () {
    function RedisPubSub(options) {
        if (options === void 0) { options = {}; }
        this.triggerTransform = options.triggerTransform || (function (trigger) { return trigger; });
        this.redisPublisher = redis_1.createClient(options.connection);
        this.redisSubscriber = redis_1.createClient(options.connection);
        this.redisSubscriber.on('message', this.onMessage.bind(this));
        if (options.connectionListener) {
            this.redisPublisher.on('connect', options.connectionListener);
            this.redisPublisher.on('error', options.connectionListener);
            this.redisSubscriber.on('connect', options.connectionListener);
            this.redisSubscriber.on('error', options.connectionListener);
        }
        else {
            this.redisPublisher.on('error', console.error);
            this.redisSubscriber.on('error', console.error);
        }
        this.subscriptionMap = {};
        this.subsRefsMap = {};
        this.currentSubscriptionId = 0;
    }
    RedisPubSub.prototype.publish = function (trigger, payload) {
        return this.redisPublisher.publish(trigger, JSON.stringify(payload));
    };
    RedisPubSub.prototype.subscribe = function (trigger, onMessage, options) {
        var _this = this;
        var triggerName = this.triggerTransform(trigger, options);
            // Check Type
        const { model } = options;

        if (_.isNil(model)) {
        return Promise.reject(new Error('No related model found for this subscription'));
        }

        const { create, update, remove: rmv, options: opts } = options;

        var id = this.currentSubscriptionId++;
        this.subscriptionMap[id] = [triggerName, onMessage];
        var refs = this.subsRefsMap[triggerName];
         return new Promise((resolve, reject) => {
                model.checkAccess(options.context.accessToken, null, model.sharedClass.methods().filter(model=>model["name"]=="createChangeStream")[0], null, (err, allowed) => {
                    if (err) {
                    reject(err);
                    }
                    resolve(allowed);
                });
            })
            .then((result)=>{
                if(!result)
                {
                    throw new Error('Access Denied');
                }
                return new Promise(function (resolve, reject) {
                _this.redisSubscriber.subscribe(triggerName, function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        if(_this.subsRefsMap[triggerName] == null)
                        {
                        model.createChangeStream(opts, (err, stream) => {
                            // changes.pipe(es.stringify()).pipe(process.stdout);

                            // Listeners
                            stream.on('data', (data) => {

                                switch (data.type) {
                                case 'create':
                                    if (create) {
                                        const payload = {
                                        subscriptionId: id,
                                        event: create,
                                        object: data 
                                        }
                                    _this.publish(triggerName, payload);
                                    }
                                    break;

                                case 'update':
                                    if (update) {
                                    model.findById(data.target).then((obj) => {

                                        const payload = {
                                            subscriptionId: id,
                                            event: update,
                                            object: { data: obj }
                                        };

                                        try {
                                            _this.publish(triggerName, payload);
                                        }
                                        catch (e) {
                                        // logger.info(new Error('An error occured while try to broadcast subscription.'));
                                        }
                                        });
                                    }                             
                                    break;

                                case 'remove':
                                    if (rmv) {
                                    const payload = {
                                        subscriptionId: id,
                                        event: rmv,
                                        object: data 
                                        }
                                    _this.publish(triggerName, payload);
                                    }
                                    break;

                                default:
                                    break;
                                }
                            });

                            stream.on('end', () => this.unsubscribe(id));
                            stream.on('error', () => this.unsubscribe(id));

                            // this.subscriptions[id] = [stream, onMessage];
                            });
                        }
                        _this.subsRefsMap[triggerName] = (_this.subsRefsMap[triggerName] || []).concat([id]);
                        resolve(id);
                    }
                });
                });
                
            })
            .catch((err)=>{
                throw err;
            })
    };
    RedisPubSub.prototype.unsubscribe = function (subId) {
        var _a = (this.subscriptionMap[subId] || [])[0], triggerName = _a === void 0 ? null : _a;
        var refs = this.subsRefsMap[triggerName];
        if (!refs)
            throw new Error("There is no subscription of id \"" + subId + "\"");
        var newRefs;
        if (refs.length === 1) {
            this.redisSubscriber.unsubscribe(triggerName);
            newRefs = [];
        }
        else {
            var index = refs.indexOf(subId);
            if (index !== -1) {
                newRefs = refs.slice(0, index).concat(refs.slice(index + 1));
            }
        }
        this.subsRefsMap[triggerName] = newRefs;
        delete this.subscriptionMap[subId];
    };
    RedisPubSub.prototype.asyncIterator = function (triggers) {
        return new pubsub_async_iterator_1.PubSubAsyncIterator(this, triggers);
    };
    RedisPubSub.prototype.onMessage = function (channel, message) {
        var subscribers = this.subsRefsMap[channel];
        if (!subscribers || !subscribers.length)
            return;
        var parsedMessage;
        try {
            parsedMessage = JSON.parse(message);
        }
        catch (e) {
            parsedMessage = message;
        }
        for (var _i = 0, subscribers_1 = subscribers; _i < subscribers_1.length; _i++) {
            var subId = subscribers_1[_i];
            var listener = this.subscriptionMap[subId][1];
            listener(parsedMessage);
        }
    };
    return RedisPubSub;
}());
exports.RedisPubSub = RedisPubSub;
//# sourceMappingURL=redis-pubsub.js.map