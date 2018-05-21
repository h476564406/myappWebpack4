// 属性的id, watcher中用dep.id来判断该属性是否已经添加过watcher
let id = 0;
function Dep() {
    id += 1;
    this.id = id;
    this.watchers = [];
}
Dep.target = null;
Dep.prototype = {
    connect() {
        Dep.readyWatcher.addNewDep(this);
    },
    notify() {
        this.watchers.forEach(watcher => {
            watcher.update();
        });
    },
    addWatcher(sub) {
        this.watchers.push(sub);
    },
    removeWatcher(sub) {
        const index = this.watchers.indexOf(sub);
        if (index !== -1) {
            this.watchers.splice(index, 1);
        }
    },
};
export default Dep;
