import { isObject } from './Util';

const seenObjects = new Set();

// 递归激活引用类型的所有getters， 全部属性依赖收集完毕。
function _traverse(val, seen) {
    let i;
    let keys;

    const isA = Array.isArray(val);

    if (
        (!isA && !isObject(val)) ||
        Object.isFrozen(val)
        // || val instanceof VNode
    ) {
        return;
    }

    // 该值已经收集依赖完毕
    if (val.__ob__) {
        const depId = val.__ob__.dep.id;
        if (seen.has(depId)) {
            return;
        }
        seen.add(depId);
    }

    if (isA) {
        i = val.length;
        while (i--) _traverse(val[i], seen);
    } else {
        keys = Object.keys(val);
        i = keys.length;
        while (i--) _traverse(val[keys[i]], seen);
    }
}

export function traverse(val) {
    _traverse(val, seenObjects);
    seenObjects.clear();
}
