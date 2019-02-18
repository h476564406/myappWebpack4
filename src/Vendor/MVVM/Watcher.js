import { pushTarget, popTarget } from './Dep';
import { parsePath, noop } from './Util';
import { traverse } from './traverse';

let uid = 0;

// 订阅者Watcher
function Watcher(vm, expOrFn, cb, options = {}) {
    this.vm = vm;

    if (options) {
        this.deep = !!options.deep;
        this.user = !!options.user;
        this.lazy = !!options.lazy;
        this.sync = !!options.sync;
        this.before = options.before;
    } else {
        this.deep = this.user = this.lazy = this.sync = false;
    }

    this.property = expOrFn;
    this.cb = cb;
    this.id = ++uid; // uid for batching
    this.depIds = new Set();

    // get getter function
    if (typeof expOrFn === 'function') {
        this.getter = expOrFn;
    } else {
        this.getter = parsePath(expOrFn);

        if (!this.getter) {
            this.getter = noop;
        }
    }

    this.value = this.lazy ? undefined : this.get();
}

Watcher.prototype = {
    addDep(dep) {
        const { id } = dep;

        if (!this.depIds.has(id)) {
            this.depIds.add(id);
            dep.addSub(this);
        }
    },

    get() {
        pushTarget(this);

        let value;
        const vm = this.vm;

        try {
            value = this.getter.call(vm, vm);
        } catch (e) {
            console.log('e', e);
        } finally {
            // "touch" every property so they are all tracked as
            // dependencies for deep watching
            if (this.deep) {
                traverse(value);
            }

            popTarget();
        }

        return value;
    },

    update() {
        const newValue = this.get();

        this.cb.call(this.vm, newValue);
    },
};

export default Watcher;
