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

    function Construct(version, api_string) {
        this.valence_version = version
        this.api_string = api_string
    }

    Construct.prototype = {
        fetch: function (url) {

            var httpRequest = new XMLHttpRequest()

            if (!httpRequest) {
                alert('Giving up :( Cannot create an XMLHTTP instance')
                return false
            }

            httpRequest.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    console.log(JSON.parse(this.responseText))
                }
            }

            httpRequest.open('GET', url)
            httpRequest.send()
        }
    }

    window.valence = function (a) {
        var vers = '2.0.0',
            obj = new Construct(vers, a)

        return obj
    }

}))
