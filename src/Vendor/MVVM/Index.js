import { observe } from './Observer';
import Compile from './Compile';

/* Mvvm入口函数
1. 初始化数据
2. 开启观察者模式
3. 开始分析模版 */
function MVVM(options) {
    this.$options = options || {};
    this._data = options.data();
    const data = this._data;
    // 用vm.xxx代理vm._data， 使用vm.xxx取值。
    Object.keys(data).forEach(property => this._proxyData(property), this);
    this._initComputed();
    // 开启观察者模式
    observe(data, this);
    // 开始分析模版
    this.$compile = new Compile(options.el || document.body, this);
}
MVVM.prototype = {
    _proxyData(property) {
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
    },
    _initComputed() {
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
