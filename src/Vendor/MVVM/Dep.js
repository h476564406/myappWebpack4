// watcher中用dep.id来判断该属性是否已经添加过watcher
let id = 0;

function Dep() {
    id += 1;
    this.id = id;
    this.watchers = [];
}

Dep.target = null;

Dep.prototype = {
    connect() {
        // 如果这个属性被这个watcher订阅, 不再重复添加。
        // 比如一个文本节点里如果出现两个{{ user }} {{ user }}, 那么在分析第一个的时候，user属性已经添加了watcher。
        // 第二个的时候，又添加了一个watcher. 不判断的话，user变化的时候，watcher函数会调用两次。
        if (!Dep.readyWatcher.depIds[this.id]) {
            this.addWatcher(Dep.readyWatcher);
            Dep.readyWatcher.addNewDep(this);
        }
    },

    notify() {
        this.watchers.forEach(watcher => {
            watcher.update();
        });
    },

    addWatcher(watcher) {
        this.watchers.push(watcher);
    },

    removeWatcher(watcher) {
        const index = this.watchers.indexOf(watcher);

        if (index !== -1) {
            this.watchers.splice(index, 1);
        }
    },
};

export default Dep;
