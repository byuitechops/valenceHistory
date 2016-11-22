/*eslint no-console: ["error", { allow: ["warn", "error"] }] */

(function (global, factory) {

    'use strict'

    factory(global)

}(typeof window !== 'undefined' ? window : this, global => {
    'use strict'

    var vers = '2.0.0'

    function Start(version, selector) {
        this.wand_version = version
        this.selector = selector
        this.tag = ''
        this.child = ''

        this.queryTag(this.selector)

        if (this.tag === null) {
            this.createTag(this.selector)
        } else if (this.selector === undefined) {
            this.createTag(this.child)
        }
    }

    Start.prototype = {
    }

    global.wand = function (a) {
        var obj = new Start(vers, a)

        return obj
    }

}))
