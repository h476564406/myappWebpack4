// import HashRouter from './Route/HashRouter';
import HistoryRouter from './Route/HistoryRouter';
// 同步加载
import Home from './components/home';

// 异步加载，到某个时刻再加载
const List = () => import(/* webpackChunkName: "list" */ './components/list');

const Detail = () =>
    import(/* webpackChunkName: "detail" */ './components/detail');

const historyRouter = new HistoryRouter('#app');
historyRouter.register('/', Home, 'home');
historyRouter.register('/list', List, 'list');
historyRouter.register('/detail', Detail, 'detail');

// 可以用hash路由
// const hashRouter = new HashRouter('#app');
// http://localhost:8081/#/
// hashRouter.register('/', Home, 'home');
// http://localhost:8081/#/list
// hashRouter.register('/list', List, 'list');
// hashRouter.register('/detail', Detail, 'detail');
