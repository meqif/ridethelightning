var _ = require('underscore');

var subscribers = [];

module.exports = {
    add: function(token, latitude, longitude) {
        this.remove(token);
        subscribers.push({
            token: token,
            latitude: latitude,
            longitude: longitude
        });
    },

    remove: function(token) {
        if (this.contains(token)) {
            subscribers = _.reject(subscribers, function(el) {
                return el.token === token;
            });
            return true;
        } else {
            return false;
        }
    },

    contains: function(token) {
        return !! this.find(token);
    },

    find: function(token) {
        var searchProperty = { token: token };
        return _.findWhere(subscribers, searchProperty);
    },

    all: function() {
        return _.clone(subscribers);
    }
};
