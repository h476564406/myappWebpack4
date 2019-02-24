import MVVM from 'MVVM';
import styles from './index.css';

export const id = 'list';
const template = `
    <div id=${id} style="display: none">
        <h3 class=${styles.listTitle}>List Page: I am local class</h3>
        <span>我是List组件，只由浏览器渲染，并且在进入到list路由时异步加载。</span>
        <p><a href="/">home link</a>&nbsp;&nbsp;<a href="/detail">detail link</a></p>
    </div>`;
export const List = new MVVM({
    // 空白符和换行符号会被html解析起处理成一个空白，要用&nbsp;或者<br>
    template,
    el: '#app',
    id,
    data() {
        return {};
    },
});
