import Dep from './Dep';
// 数据监听器 对数据对象的所有属性进行监听，发生变化了，通知观察者Watchers
export function Observer(data) {
    Object.keys(data).forEach(property => {
        this.defineReactive(data, property, data[property]);
    });
}
export function observe(value) {
    if (!value || Object.prototype.toString.call(value) !== '[object Object]') {
        return;
    }
    return new Observer(value);
}
Observer.prototype = {
    // 对data里的每个属性进行监听， 直到每个属性的子属性值为基本类型的数据
    defineReactive(data, property, value) {
        // Dep 是该属性的的 watcher collector
        const dep = new Dep(property);
        // 如果不这么做，在访问子属性的时候子属性没办法触发get函数
        // 让子属性也能被get劫持
        observe(value);
        Object.defineProperty(data, property, {
            enumerable: true,
            configurable: false,
            get() {
                // 如果有属性在模板中出现，在模版解析过程中，会设置一个未与任何属性绑定的待用new Watcher
                if (Dep.readyWatcher) {
                    // 1.watcher会遍历取得最后的值，将属性值的每一个子属性注册到同一个watcher中
                    // 属性相关的一个watcher可能对应多个dep, 属性的子属性变化，watcher会收到通知， 并且因为在同一个实例中，能对父属性进行处理。
                    // watcher.depIds[dep.id] = dep;
                    // data.user.name  两个 dep1 user, dep2 name
                    // 2.可能模板中多处用到了某个属性user, user可以被多个 watcher订阅。
                    // 一个属性可能对应多个watcher
                    // dep.addWatcher(watcher);
                    // 往dep中注册watcher， dep通知watcher更新
                    dep.connect(Dep.readyWatcher);
                }
                return value;
            },
            set(newValue) {
                if (newValue === value) {
                    return;
                }
                value = newValue;
                dep.notify();
            },
        });
    },
};
