/**
 * @author Pedro Cruz<pedrocruz.dev@gmail.com>
 * @author Mario Wunderlich<mario@lionmane.io>
 */

let HttpRequestHelper = {
    environment: "development"
};

HttpRequestHelper.Util = {
    get: function (params, what, default_value) {
        if (!params) {
            return default_value || params;
        }

        if (typeof(params) != "object") {
            return default_value || false;
        }

        if (!(what in params)) {
            return default_value || false;
        }

        return params[what];
    }
};

HttpRequestHelper.Http = {

    development: {
        hostname: "http://localhost:8000"
    },

    production: {
        hostname: "https://somewhat"
    },

    makeUrl: function (verb, route, params = undefined) {

        var url = '';
        if(route.indexOf('://') === -1){
            url =  this[HttpRequestHelper.environment].hostname ;
        }
        url += route;
        if (typeof(params) == "object") {
            var key;
            for (key in params) {
                url = url.replace('{' + key + '}', params[key]);
            }
        }
        return {verb: verb, url: url};
    },
    getUrl: function (verb, route, params = undefined) {
        var url_info = this.makeUrl(verb, route, params);
        return url_info.url;
    },
    ajax: function (url_info, data, params) {
        if (!url_info) {
            throw "Bad bad bad";
        }

        if (typeof(url_info) == "string") {
            // url_info is a string -- create an object with GET verb
            url_info = { url: url_info, verb: "GET" };
        }
        else if (typeof(url_info) == "object" && (url_info.length || url_info.join)) {
            // url_info is an array -- convert to object with expected props
            url_info = { url: url_info[0], verb: url_info[1] };
        }

        var verb = url_info.verb;
        var url = url_info.url;

        var quick_callback = null;
        if (typeof(params) == "function") {
            quick_callback = params;
            params = {};
        }

        console.info("Making AJAX call with: verb=" + verb + "; url=" + url);

        var no_op_success = function (r) {
            console.info("AJAX call ok");
            quick_callback(true, r);
        };

        var no_op_error = function (xhr, status, error) {
            console.info("AJAX call failed");
            quick_callback(false, xhr, status, error);
        };
        // var token = localStorage.getItem('token');
        //
        // $.ajaxSetup({
        //     headers: {
        //         'Authorization': 'Bearer '+token
        //     }
        // });

        $.ajax(url, {
            type: verb,
            data: data,
            crossDomain: true,
            success: HttpRequestHelper.Util.get(params, "success", no_op_success),
            error: HttpRequestHelper.Util.get(params, "error", no_op_error)
        });
    },

    makeRequest: function (verb, url, data, callback) {
        let urlInfo = HttpRequestHelper.Http.makeUrl(verb, url);

        HttpRequestHelper.Http.ajax(urlInfo, data, function(success, data){
            callback(success, data);
        });
    },

    get: function (url, callback) {

        let urlInfo = HttpRequestHelper.Http.makeUrl('GET', url);

        HttpRequestHelper.Http.ajax(urlInfo, {}, function(success, data){
            callback(success, data);
        });
    },

    post: function (url, data, callback) {
        let urlInfo = HttpRequestHelper.Http.makeUrl('POST', url);

        HttpRequestHelper.Http.ajax(urlInfo, data, function(success, data){
            callback(success, data);
        });
    }

};


/*
 * How to use
 *
 *

(function test() {

    var url_info = HttpRequestHelper.Http.makeUrl("agent", "get", {id: 1});


    HttpRequestHelper.Http.ajax(url_info, {}, function (success, data) {
        if (success) {
            console.dir(data);
        }
        else {
            console.error("Failed to call");
        }
    });
})();

*/
