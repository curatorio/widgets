class EventBus {
    constructor() {
        this.listeners = {};
        this.alive = true;
    }

    on(type, callback, scope) {
        let args = [];
        let numOfArgs = arguments.length;
        for (let i = 0; i < numOfArgs; i++) {
            args.push(arguments[i]);
        }
        args = args.length > 3 ? args.splice(3, args.length - 1) : [];
        if (typeof this.listeners[type] !== "undefined") {
            this.listeners[type].push({scope: scope, callback: callback, args: args});
        } else {
            this.listeners[type] = [{scope: scope, callback: callback, args: args}];
        }
    }

    off(type, callback, scope) {
        if (typeof this.listeners[type] !== "undefined") {
            let numOfCallbacks = this.listeners[type].length;
            let newArray = [];
            for (let i = 0; i < numOfCallbacks; i++) {
                let listener = this.listeners[type][i];
                if (listener.scope === scope && listener.callback === callback) {

                } else {
                    newArray.push(listener);
                }
            }
            this.listeners[type] = newArray;
        }
    }

    has(type, callback, scope) {
        if (typeof this.listeners[type] !== "undefined") {
            let numOfCallbacks = this.listeners[type].length;
            if (callback === undefined && scope === undefined) {
                return numOfCallbacks > 0;
            }
            for (let i = 0; i < numOfCallbacks; i++) {
                let listener = this.listeners[type][i];
                if ((scope ? listener.scope === scope : true) && listener.callback === callback) {
                    return true;
                }
            }
        }
        return false;
    }

    trigger(type) {
        let numOfListeners = 0;
        let event = {
            type: type,
            // target: target
        };
        let args = [];
        // let numOfArgs = arguments.length;
        for (let i = 1; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        // args = args.length > 2 ? args.splice(2, args.length - 1) : [];
        args = [event].concat(args);
        if (typeof this.listeners[type] !== "undefined") {
            let numOfCallbacks = this.listeners[type].length;
            for (let i = 0; i < numOfCallbacks; i++) {
                let listener = this.listeners[type][i];
                if (listener && listener.callback) {
                    let concatArgs = args.concat(listener.args);
                    listener.callback.apply(listener.scope, concatArgs);
                    numOfListeners += 1;
                }
            }
        }
    }

    getEvents() {
        let str = "";
        for (let type in this.listeners) {
            let numOfCallbacks = this.listeners[type].length;
            for (let i = 0; i < numOfCallbacks; i++) {
                let listener = this.listeners[type][i];
                str += listener.scope && listener.scope.className ? listener.scope.className : "anonymous";
                str += " listen for '" + type + "'\n";
            }
        }
        return str;
    }

    destroy () {
        // Might be a bit simplistic!!!
        this.listeners = {};
        this.alive = false;
    }
}

export default EventBus;