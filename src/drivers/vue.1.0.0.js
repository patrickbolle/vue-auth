module.exports = {

    // NOTE: Use underscore to denote a driver function (all are overrideable also).

    _init: function () {
        this.options._bind.call(this);

        this.options._beforeEach.call(this, this.options.routerBeforeEach, this.options.transitionEach);
        this.options._interceptor.call(this, this.options.requestIntercept, this.options.responseIntercept);
    },

    _bind: function () {
        this.options.http = this.options.http || this.options.Vue.http;
        this.options.router = this.options.router || this.options.Vue.router;
    },

    _watch: function (data) {
        return new this.options.Vue({
            data: function () {
                return data;
            }
        });
    },

    _getHeaders: function (res) {
        return {
            authorization: res.headers.get(this.options.tokenHeader)
        };
    },

    _setHeaders: function (req, headers) {
        if (headers.authorization) {
            req.headers.set(this.options.tokenHeader, headers.authorization);
        }
    },

    _bindData: function (data, ctx) {
        var error, success;

        data = data || {};

        error = data.error;
        success = data.success;

        data.query = ctx.$route.query || {};

        if (data.success) { data.success = function (res) { success.call(ctx, res); } }
        if (data.error) { data.error = function (res) { error.call(ctx, res); } }

        return data;
    },

    _interceptor: function (req, res) {
        var _this = this;

        this.options.http.interceptors.push(function (request, next) {
            if (req) { req.call(_this, request); }
            
            next(function (response) {
                if (res) { res.call(_this, response); }
            });
        });
    },

    _beforeEach: function (routerBeforeEach, transitionEach) {
        var _this = this;

        this.options.router.beforeEach(function (transition, location, next) {
            routerBeforeEach.call(_this, function () {
                transitionEach.call(_this, (transition.to || transition).auth, function () { (next || transition.next)(); });
            });
        })
    },

    _invalidToken: function (res) {
        if (res.status === 401) {
            this.logout();
        }
    },

    _routerReplace: function (data) {
        this.options.router.replace(data);
    },

    _routerGo: function (data) {
        var router = this.options.router;

        (router.push || router.go).call(router, data);
    },

    _httpData: function (res) {
        return res.data || {};
    },

    _http: function (data) {
        this.options.http(data).then(data.success, data.error);
    }

};