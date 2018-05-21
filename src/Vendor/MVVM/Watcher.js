import Dep from './Dep';
// 观察者, 在数据变化的时候, 观察者中与该属性绑定的回调函数会被调用。
// const watcherHouse = [];
function Watcher(vm, property, callback) {
    this.vm = vm;
    this.callback = callback;
    this.property = property;
    this.depIds = {};
    this.value = this._connectDeps();
}
Watcher.prototype = {
    _connectDeps() {
        Dep.readyWatcher = this;
        const value = this.triggerBinding();
        // watcherHouse.push(Dep.readyWatcher);
        // console.log('watcherHouse', watcherHouse);
        Dep.readyWatcher = null;
        return value;
    },
    addNewDep(dep) {
        // 如果这个属性已经添加过这个watcher, 不再重复添加。
        // 比如一个文本节点里如果出现两个{{ user }} {{ user }}, 那么在分析第一个的时候，user属性已经添加了watcher。
        // 第二个的时候，又添加了一个watcher. 不判断的话，user变化的时候，watcher函数会调用两次。
        if (!this.depIds[dep.id]) {
            dep.addWatcher(this);
            this.depIds[dep.id] = dep;
        }
    },
    triggerBinding() {
        const properties = this.property.split('.');
        let value = this.vm;
        // 调用计算属性的时候，在函数体内通过this.property触发了this.property的get, 从而将this.property的dep存入了
        // 计算属性的watcher中， 也在该属性的dep中存入了计算属性的watcher.
        // 在this.property改变的时候， 通知到了计算属性的watcher调用update，获取到了新值并传入到回调函数中。
        for (let i = 0, len = properties.length; i < len; i += 1) {
            value = value[properties[i]];
        }
        return value;
    },
    update() {
        const newValue = this.triggerBinding();
        const oldValue = this.value;
        if (newValue !== oldValue) {
            this.value = newValue;
            this.callback.call(this.vm, newValue);
        }
    },
};
export default Watcher;
