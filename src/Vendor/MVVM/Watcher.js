import Dep from './Dep';
import { getValue } from './Util';

// 订阅者Watcher
function Watcher(vm, property, updateCallback) {
    this.vm = vm;
    this.depIds = {};
    this.property = property;
    this.updateCallback = updateCallback;

    Dep.readyWatcher = this;

    // 触发依赖收集并且获得value
    this.triggerPropertyReactive();

    Dep.readyWatcher = null;
}

Watcher.prototype = {
    triggerPropertyReactive() {
        return getValue(this.vm, this.property);
    },

    addNewDep(dep) {
        this.depIds[dep.id] = dep;
    },

    update() {
        const newValue = this.triggerPropertyReactive();

        this.updateCallback.call(this.vm, newValue);
    },
};
export default Watcher;
