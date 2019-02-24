import { observe } from './Observer';
import Compile from './Compile';

/* Mvvm入口函数
1. 初始化数据
2. 开启观察者模式
3. 开始分析模版 */

function MVVM(options) {
    this.$options = options || {};
    this._data = options.data();

    // 用vm.xxx代理vm._data，使用vm.xxx取值。
    this._proxyData();
    this._proxyComputed();

    observe(this._data);

    this.$compile = new Compile(options.el, this);
}

MVVM.prototype = {
    _proxyData() {
        Object.keys(this._data).forEach(property => {
            Object.defineProperty(this, property, {
                configurable: false,
                enumerable: true,
                get() {
                    return this._data[property];
                },
                set(newVal) {
                    this._data[property] = newVal;
                },
            });
        }, this);
    },

    _proxyComputed() {
        const { computed } = this.$options;
        if (
            computed &&
            Object.prototype.toString.call(computed) === '[object Object]'
        ) {
            Object.keys(computed).forEach(key => {
                if (typeof computed[key] !== 'function') {
                    throw new Error('Must be function!');
                }

                // 当调用vm.computedAttribute的时候，会调用get函数即computed里定义的函数
                Object.defineProperty(this, key, {
                    get: computed[key],
                    set() {},
                });
            }, this);
        }
    },
};

export default MVVM;
