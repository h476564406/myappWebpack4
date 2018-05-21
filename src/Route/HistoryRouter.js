/* History Router
    1.  Listen event 'load' and 'popstate', all link should add click listener
    2.  Register url, store component path, component id.
    3. When event trigged, use window.location.href, window.history.state.path, e.target.getAttribute('href')
    to get current path name,
    4. If pathname can be found in routers object, use window.history.pushState and window.history.replaceState to change
        browser url location. Then import the component file, and display the component.
    @param string el the root div
 */
function HistoryRouter(el) {
    this.el = el;
    this._init();
}
HistoryRouter.prototype = {
    _routers: {},
    _init() {
        const self = this;
        window.addEventListener('load', () => {
            const herf = window.location.href;
            const path = herf.slice(herf.indexOf('/', 8));
            self._urlChange(path, 0);
        });

        // 当用户点击前进后退按钮时触发函数
        window.addEventListener(
            'popstate',
            () => {
                if (window.history.state !== null) {
                    self._urlChange(window.history.state.path, 2);
                }
            },
            false,
        );
        // 对所有的link标签进行绑定事件
        document.body.addEventListener('click', e => {
            if (e.target.nodeName === 'A') {
                e.preventDefault();
                self._urlChange(e.target.getAttribute('href'), 1);
            }
        });
    },
    register(path, component, componentId) {
        this._routers[path] = {
            component,
            componentId,
        };
    },
    _urlChange(path, type) {
        let isOnLoad = null;
        if (!this._routers[path]) {
            return null;
        }
        if (type === 1) {
            // Give some custom data
            window.history.pushState({ path, custom: 'hello' }, '', path);
            isOnLoad = false;
        } else if (type === 2) {
            window.history.replaceState({ path, custom: 'world' }, '', path);
            isOnLoad = false;
        } else {
            isOnLoad = true;
        }
        this._refresh(path, isOnLoad);
    },
    _refresh(path, isOnLoad) {
        const childNodesArr = Array.prototype.slice.call(
            document.querySelector(this.el).childNodes,
        );
        if (!isOnLoad) {
            childNodesArr.forEach(element => {
                if (element.nodeType === 1) {
                    element.style.display = 'none';
                }
            }, this);
        }
        if (typeof this._routers[path].component === 'function') {
            this._routers[path].component().then(() => {
                const element = document.getElementById(
                    this._routers[path].componentId,
                );
                if (element) {
                    element.style.display = 'block';
                }
            });
        } else {
            const element = document.getElementById(
                this._routers[path].componentId,
            );
            if (element) {
                element.style.display = 'block';
            }
        }
    },
};
export default HistoryRouter;
