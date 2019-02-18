import { arrayMethods } from './array';
import Dep from './Dep';
import { isObject, hasOwn, isPlainObject } from './Util';

const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true,
    });
}

function dependArray(value) {
    for (let e, i = 0, l = value.length; i < l; i++) {
        e = value[i];
        e && e.__ob__ && e.__ob__.dep.depend();
        if (Array.isArray(e)) {
            dependArray(e);
        }
    }
}

function protoAugment(target, src) {
    /* eslint-disable no-proto */
    target.__proto__ = src;
    /* eslint-enable no-proto */
}

/* istanbul ignore next */
function copyAugment(target, src, keys) {
    for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        def(target, key, src[key]);
    }
}

const hasProto = '__proto__' in {};

function Observer(value) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;

    def(value, '__ob__', this);

    if (Array.isArray(value)) {
        if (hasProto) {
            protoAugment(value, arrayMethods);
        } else {
            copyAugment(value, arrayMethods, arrayKeys);
        }
        this.observeArray(value);
    } else {
        this.walk(value);
    }
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

    // 1. 为property收集watchers(dep<-->watchers), dep 是该属性的的 watcher collector
    // 2. value全是引用类型
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
                        if (Array.isArray(value)) {
                            dependArray(value);
                        }
                    }
                }

                return value;
            },

            set: function reactiveSetter(newVal) {
                const value = val;
                /* eslint-disable no-self-compare */
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

// 1. 为data的所有属性设置依赖收集函数 defineReactive get()  dep.connect(Dep.target);
// 2. 为data的所有属性设置更新函数 defineReactive set() dep.notify();
export function observe(value, asRootData) {
    if (
        !isObject(value)
        // || value instanceof VNode
    ) {
        return;
    }

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
