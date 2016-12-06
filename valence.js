/*eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
/* global module */

(function (global, factory) {

    'use strict'

    if (typeof module === 'object' && typeof module.exports === 'object') {

        /*
        Check to see if in Nodejs environment
        */

        module.exports = global.document ?
            factory(global, true) :
            (w) => {
                if (!w.document) {
                    throw new Error('Valence requires a window with a document')
                }
                return factory(w)
            }
    } else {

        /*
        Done in the browser
        */

        factory(global)
    }

}(typeof window !== 'undefined' ? window : this, window => {
    'use strict'

    /*CONSTRUCTOR*/
    function Construct(version, call, callback) {
        this.lib_version = version
        this.api_version = 1.15
        this.call = call
        this.ou = this.getOU()
        this.api_base_string = this.getCall(this.call, this.api_version, this.ou)
        this.callback = callback
        this.response = {}

        /*Check to see if call need to be async or not.*/
        this.asyncr = arguments[2] ? true : false

        /*Get the data*/
        this.fetch(this.asyncr)
    }

    /*PROTOTYPE METHODS*/
    Construct.prototype = {
        fetch: function (asyncr) {

            /*AJAX request working with the REST API call*/

            var httpRequest = new XMLHttpRequest(),
                that = this,
                bool = asyncr

            httpRequest.open('GET', this.api_base_string, bool)

            httpRequest.onload = function () {
                let r = JSON.parse(this.responseText)
                that.response = r
                that.callback
                    ? that.callback(r)
                : console.warn('You have done a synchronous request.  Are you sure you want to continue?')
            }

            httpRequest.onerror = function (e) {
                console.warn('Can not retrieve API data', e, httpRequest.statusText)
            }

            httpRequest.setRequestHeader('Content-Type', 'application/json')
            httpRequest.send()
        },
        getOU: function () {
            /*Parse the URL and return a string for the OU ID(Org Unit ID)*/
            var ou = window.location.pathname.split('/')[4] || window.location.pathname.split('/')[3]
            return ou
        },
        getCall: function (call, ver, ou) {

            /*
            PLAN
            Make a white pages object with the routing table.
            http://docs.valence.desire2learn.com/http-routingtable.html
            */

            let directory = {
                whoami: `/d2l/api/lp/${ver}/users/whoami`,
                getFinalGrade: `/d2l/api/le/${ver}/${ou}/grades/values/myGradeValues/`
            }

            if (directory[call] === undefined) {

                var not_found = call

                console.warn("API call not found in library directory")
                console.warn("Is this the one you wanted? ", not_found)
                return not_found

            } else {
                return directory[call]
            }
        }
    }

    /*WINDOW ATTACHER*/
    window.valence = function (a, b) {

        /*
        The parameter "a" is the API call.
        The parameter "b" is the callback function
        if asynchronous is wanted.
        */

        let vers = '2.0.0',
            obj = new Construct(vers, a, b)

        return obj
    }

}))
