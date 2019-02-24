import { isPlainObject, hasOwn } from './util';
import Dep from './Dep';

function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true,
    });
}

function Observer(value) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;

    def(value, '__ob__', this);

    this.walk(value);
}

Observer.prototype = {
    walk(obj) {
        const keys = Object.keys(obj);

        for (let i = 0; i < keys.length; i++) {
            this.defineReactive(obj, keys[i]);
        }
    },

    observeArray(items) {
        for (let i = 0, l = items.length; i < l; i++) {
            observe(items[i]);
        }
    },

    defineReactive(obj, key, val, shallow = false) {
        const dep = new Dep();

        val = obj[key];

        let childOb = !shallow && observe(val);

        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,

            get: function reactiveGetter() {
                const value = val;
                if (Dep.target) {
                    dep.depend();

                    if (childOb) {
                        childOb.dep.depend();
                    }
                }

                return value;
            },

            set: function reactiveSetter(newVal) {
                const value = val;

                if (
                    newVal === value ||
                    (newVal !== newVal && value !== value)
                ) {
                    return;
                }

                val = newVal;

                childOb = !shallow && observe(newVal);
                dep.notify();
            },
        });
    },
};

export function observe(value, asRootData) {
    let ob;

    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        ob = value.__ob__;
    } else if (
        (Array.isArray(value) || isPlainObject(value)) &&
        Object.isExtensible(value)
    ) {
        ob = new Observer(value);
    }

    if (asRootData && ob) {
        ob.vmCount++;
    }

    return ob;
}
