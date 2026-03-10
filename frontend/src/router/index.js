import { createRouter, createWebHashHistory } from 'vue-router';
import { ElNotification } from 'element-plus';
import config from "@/config";
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import tool from '@/utils/tool';
import systemRouter from './systemRouter';
import { beforeEach, afterEach } from './scrollBehavior';

// ########################## Vite 动态导入核心：预加载所有视图组件 ##########################
// 预加载 src/views/ 目录下所有 .vue 文件，生成组件映射表
const modules = import.meta.glob('../views/**/*.vue', { eager: true });

// 手动导入布局组件
import Page404 from '@/layout/other/404.vue';
import PageEmpty from '@/layout/other/empty.vue';

// 系统路由
const routes = systemRouter;

// 系统特殊路由（404）
const routes_404 = {
  path: "/:pathMatch(.*)*",
  hidden: true,
  component: Page404
};
let routes_404_r = () => {};

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
});

// 设置标题
document.title = config.APP_NAME;

// 判断是否已加载过动态/静态路由
var isGetRouter = false;

router.beforeEach(async (to, from, next) => {
  NProgress.start();
  // 动态标题
  document.title = to.meta.title ? `${to.meta.title} - ${config.APP_NAME}` : `${config.APP_NAME}`;

  let token = tool.cookie.get("TOKEN");

  if (to.path === "/login") {
    // 删除路由(替换当前layout路由)
    router.addRoute(routes[0]);
    // 删除路由(404)
    routes_404_r();
    isGetRouter = false;
    next();
    return false;
  }

  if (routes.findIndex(r => r.path === to.path) >= 0) {
    next();
    return false;
  }

  if (!token) {
    next({
      path: '/login'
    });
    return false;
  }

  // 整页路由处理
  if (to.meta.fullpage) {
    to.matched = [to.matched[to.matched.length - 1]];
  }
  // 加载动态/静态路由
  if (!isGetRouter) {
    // 从数据库或本地存储获取菜单
    let apiMenu = tool.data.get("MENU") || [];
    let userInfo = tool.data.get("USER_INFO");

    // 权限过滤菜单
    let menu = treeFilter(apiMenu, node => {
      return node.meta.role ? node.meta.role.filter(item => userInfo.role.indexOf(item) > -1).length > 0 : true;
    });

    var menuRouter = filterAsyncRouter(menu);
    menuRouter = flatAsyncRoutes(menuRouter);
    menuRouter.forEach(item => {
      router.addRoute("layout", item);
    });
    routes_404_r = router.addRoute(routes_404);
    if (to.matched.length == 0) {
      router.push(to.fullPath);
    }
    isGetRouter = true;
  }
  beforeEach(to, from);
  next();
});

router.afterEach((to, from) => {
  afterEach(to, from);
  NProgress.done();
});

router.onError((error) => {
  NProgress.done();
  ElNotification.error({
    title: '路由错误',
    message: error.message
  });
});

// 入侵追加自定义方法、对象
router.sc_getMenu = () => {
  var apiMenu = tool.data.get("MENU") || [];
  let userInfo = tool.data.get("USER_INFO");
  let menu = treeFilter(apiMenu, node => {
    return node.meta.role ? node.meta.role.filter(item => userInfo.role.indexOf(item) > -1).length > 0 : true;
  });
  return menu;
};

// 转换路由：从预加载的组件映射表中匹配组件
function filterAsyncRouter(routerMap) {
  const accessedRouters = [];
  routerMap.forEach(item => {
    item.meta = item.meta ? item.meta : {};
    // 处理外部链接特殊路由
    if (item.meta.type == 'iframe') {
      item.meta.url = item.path;
      item.path = `/i/${item.name}`;
    }

    // 核心：根据数据库的 component 字段，从预加载的 modules 中找到组件
    let component = PageEmpty; // 默认空页面
    if (item.component) {
      // 数据库中的 component 是 'home' 或 'setting/user'，我们需要拼接成完整路径
      const componentPath = `../views/${item.component}/index.vue`;
      if (modules[componentPath]) {
        component = modules[componentPath].default;
      } else {
        // 如果找不到 index.vue，尝试直接找同名的 .vue 文件
        const fallbackPath = `../views/${item.component}.vue`;
        if (modules[fallbackPath]) {
          component = modules[fallbackPath].default;
        } else {
          console.warn(`组件未找到: ${item.component}`);
        }
      }
    }

    // MAP转路由对象
    var route = {
      path: item.path,
      name: item.name,
      meta: item.meta,
      redirect: item.redirect,
      children: item.children ? filterAsyncRouter(item.children) : null,
      component: component
    };
    accessedRouters.push(route);
  });
  return accessedRouters;
}

// 路由扁平化
function flatAsyncRoutes(routes, breadcrumb = []) {
  let res = [];
  routes.forEach(route => {
    const tmp = { ...route };
    if (tmp.children) {
      let childrenBreadcrumb = [...breadcrumb];
      childrenBreadcrumb.push(route);
      let tmpRoute = { ...route };
      tmpRoute.meta.breadcrumb = childrenBreadcrumb;
      delete tmpRoute.children;
      res.push(tmpRoute);
      let childrenRoutes = flatAsyncRoutes(tmp.children, childrenBreadcrumb);
      childrenRoutes.map(item => {
        res.push(item);
      });
    } else {
      let tmpBreadcrumb = [...breadcrumb];
      tmpBreadcrumb.push(tmp);
      tmp.meta.breadcrumb = tmpBreadcrumb;
      res.push(tmp);
    }
  });
  return res;
}

// 过滤树
function treeFilter(tree, func) {
  return tree.map(node => ({ ...node })).filter(node => {
    node.children = node.children && treeFilter(node.children, func);
    return func(node) || (node.children && node.children.length);
  });
}

export default router;