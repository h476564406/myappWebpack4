/* Hash Router
    1. Listen event 'load' and 'hashchange'.
    2. Register url, store component path, component id.
    3. When event trigged, use window.location.hash to get current url,
        analyze it to pathname and query params.
    4. If the analyzed result about pathname can be found in routers object,
        ensure import the component file, and display the component.
    @param string el the root div
 */
function HashRouter(el) {
    this.el = el;
    this.init();
}
HashRouter.prototype = {
    _routers: {},
    register(path, component = '', componentId) {
        path = path.replace(/\s*/g, '');
        this._routers[path] = {
            component,
            componentId,
        };
    },
    init() {
        window.addEventListener('load', () => {
            this._urlChange();
        });
        window.addEventListener('hashchange', () => {
            this._urlChange();
        });
    },
    _processUrl(url) {
        const urlDetails = url.split('?');
        const params = [];
        if (urlDetails.length > 1) {
            const query = urlDetails[1].split('&');
            query.forEach(value => {
                params.push(value);
            });
        }
        // slice(1) 将'#'去掉。
        return {
            name: urlDetails[0].slice(1),
            params,
        };
    },
    _urlChange() {
        const path = this._processUrl(window.location.hash).name;
        if (!this._routers[path]) {
            return null;
        }
        this._refresh(path);
    },
    _refresh(path) {
        const childNodesArr = Array.prototype.slice.call(
            document.querySelector(this.el).childNodes,
        );
        childNodesArr.forEach(element => {
            if (element.nodeType === 1) {
                element.style.display = 'none';
            }
        }, this);
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
export default HashRouter;
