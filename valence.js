/*eslint no-console: ["error", { allow: ["warn", "error", "log"] }] */
/* global module */

(function (global, factory) {

    'use strict'

    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = global.document ?
            factory(global, true) :
            (w) => {
                if (!w.document) {
                    throw new Error('Valence requires a window with a document')
                }
                return factory(w)
            }
    } else {
        factory(global)
    }

}(typeof window !== 'undefined' ? window : this, window => {
    'use strict'

    /*
    PLAN
    Make a white pages object with the routing table.
    http://docs.valence.desire2learn.com/http-routingtable.html
    */

    function Construct(version, call) {
        this.valence_version = version
        this.api_version = 1.18

        /*Specify option with lp or le with this.api_base_string*/

        this.api_base_string = `/d2l/api/lp/${this.api_version}/`
        this.call = call
        this.response_json = {}
    }

    Construct.prototype = {
        fetch: function (url) {

            var httpRequest = new XMLHttpRequest()

            if (!httpRequest) {
                console.error('Giving up :( Cannot create an XMLHTTP instance')
                return false
            }

            httpRequest.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    let obj = JSON.parse(this.responseText)
                    this.response_json = obj
                } else {
                    console.error('Can not retrieve data from API call')
                }
            }

            httpRequest.open('GET', url)
            httpRequest.send()

            return this
        }
    }

    window.valence = function (a) {
        var vers = '2.0.0',
            obj = new Construct(vers, a)

        return obj
    }

}))
