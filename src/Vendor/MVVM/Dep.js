// watcher中用dep.id来判断是否已经订阅该属性。
let uid = 0;

function Dep() {
    this.id = uid++;
    this.subs = [];
}

Dep.prototype = {
    depend() {
        if (Dep.target) {
            Dep.target.addDep(this);
        }
    },

    addSub(sub) {
        this.subs.push(sub);
    },

    removeSub(sub) {
        const index = this.subs.indexOf(sub);

        if (index !== -1) {
            this.subs.splice(index, 1);
        }
    },

    notify() {
        for (let i = 0, l = this.subs.length; i < l; i++) {
            this.subs[i].update();
        }
    },
};

Dep.target = null;

const targetStack = [];

export function pushTarget(target) {
    targetStack.push(target);
    Dep.target = target;
}

export function popTarget() {
    targetStack.pop();
    Dep.target = targetStack[targetStack.length - 1];
}

export default Dep;
