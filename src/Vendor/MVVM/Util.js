const _toString = Object.prototype.toString;

export function getValue(vm, property) {
    let value = vm;

    property.split('.').forEach(element => {
        value = value[element];
    });

    return value;
}

export function setValue(vm, property, newValue) {
    let val = vm;

    const properties = property.split('.');

    properties.forEach((k, i) => {
        if (i < properties.length - 1) {
            val = val[k];
        } else {
            val[k] = newValue;
        }
    });
}

export function noop(a, b, c) {}

export function parsePath(path) {
    const segments = path.split('.');
    return function(obj) {
        for (let i = 0; i < segments.length; i++) {
            if (!obj) return;
            obj = obj[segments[i]];
        }
        return obj;
    };
}

export function isObject(obj) {
    return obj !== null && typeof obj === 'object';
}

const { hasOwnProperty } = Object.prototype;
export function hasOwn(obj, key) {
    return hasOwnProperty.call(obj, key);
}

export function isPlainObject(obj) {
    return _toString.call(obj) === '[object Object]';
}
