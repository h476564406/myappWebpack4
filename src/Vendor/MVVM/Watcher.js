import { pushTarget, popTarget } from './Dep';
import { parsePath, noop } from './util';

let uid = 0;

// 观察者Watcher
function Watcher(vm, expOrFn, cb) {
    this.vm = vm;
    this.property = expOrFn;
    this.cb = cb;
    this.id = ++uid;
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
