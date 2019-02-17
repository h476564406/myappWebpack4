import Dep from './Dep';

export function Observe(data) {
    Object.keys(data).forEach(property => {
        this.defineReactive(data, property, data[property]);
    }, this);
}

// 1. 为data的所有属性设置依赖收集函数 defineReactive get()  dep.connect(Dep.readyWatcher);
// 2. 为data的所有属性设置更新函数 defineReactive set() dep.notify();
export function observeData(data) {
    if (!data || Object.prototype.toString.call(data) !== '[object Object]') {
        return;
    }

    return new Observe(data);
}

Observe.prototype = {
    // 1. 为property收集watchers(dep<-->watchers), dep 是该属性的的 watcher collector
    // 2. value全是引用类型
    defineReactive(data, property, value) {
        const dep = new Dep();

        // 递归属性，收集watchers
        observeData(value);

        Object.defineProperty(data, property, {
            enumerable: true,
            configurable: false,
            get() {
                // 如果有属性在模板中出现，在模版解析过程中，会设置一个未与任何属性绑定的待用new Watcher
                if (Dep.readyWatcher) {
                    /*
                        1.watcher会遍历取得最后的值，将属性值的每一个子属性注册到同一个watcher中
                        如果property的层级很深，一个watcher会对应多个dep. 属性的子属性变化，watcher会收到通知， 并且因为在同一个实例中，能对父属性进行处理。
                        watcher.depIds[dep.id] = dep;
                        e.g. data.user.name, 会产生两个dep。 dep1： user, dep2： name

                        2. 在模版中，如果一个属性和多个指令有关，一个属性会对应多个watcher。
                        e.g. 可能模板中多处用到了data.user, user可以被多个 watcher订阅。
                    */
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
