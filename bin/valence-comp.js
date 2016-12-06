'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
/* global module */

(function (global, factory) {

    'use strict';

    if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && _typeof(module.exports) === 'object') {
        module.exports = global.document ? factory(global, true) : function (w) {
            if (!w.document) {
                throw new Error('Valence requires a window with a document');
            }
            return factory(w);
        };
    } else {
        factory(global);
    }
})(typeof window !== 'undefined' ? window : undefined, function (window) {
    'use strict';

    /*CONSTRUCTOR*/

    function Construct(version, call, callback) {
        this.lib_version = version;
        this.api_version = 1.15;
        this.call = call;
        this.ou = this.getOU();
        this.api_base_string = this.getCall(this.call, this.api_version, this.ou);
        this.callback = callback;
        this.response = {};

        this.asyncr = arguments[2] ? true : false;

        this.fetch(this.asyncr);
    }

    /*PROTOTYPE METHODS*/
    Construct.prototype = {
        fetch: function fetch(asyncr) {

            var httpRequest = new XMLHttpRequest(),
                that = this,
                bool = asyncr;

            httpRequest.open('GET', this.api_base_string, bool);

            httpRequest.onload = function () {
                var r = JSON.parse(this.responseText);
                that.response = r;
                that.callback ? that.callback(r) : console.warn('You have done a synchronous request.  Are you sure you want to continue?');
            };

            httpRequest.onerror = function (e) {
                console.warn('Can not retrieve API data', e, httpRequest.statusText);
            };

            httpRequest.setRequestHeader('Content-Type', 'application/json');
            httpRequest.send();

            return this;
        },
        getOU: function getOU() {
            //Parse the URL and return a string for the OU
            var ou = window.location.pathname.split('/')[4] || window.location.pathname.split('/')[3];
            return ou;
        },
        getCall: function getCall(call, ver, ou) {

            /*
            PLAN
            Make a white pages object with the routing table.
            http://docs.valence.desire2learn.com/http-routingtable.html
            */

            var directory = {
                whoami: '/d2l/api/lp/' + ver + '/users/whoami',
                getFinalGrade: '/d2l/api/le/' + ver + '/' + ou + '/grades/values/myGradeValues/'
            };

            return directory[call];
        }
    };

    /*WINDOW ATTACHER*/
    window.valence = function (a, b) {
        var vers = '2.0.0',
            obj = new Construct(vers, a, b);

        return obj;
    };
});
