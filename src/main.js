import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';

Vue.use(VueRouter);

const Foo = {
  template: '<div>foo, {{ $route.path }}</div>',
};
const Bar = {
  template: '<div>bar</div>',
};

const routes = [
  { path: '/', component: App },
  // {
  //   path: '/foo', component: Foo,
  //   beforeEnter: (to, from, next) => {
  //     console.log('matched routes', to.matched);
  //     next();
  //   }
  // },
  // { path: '/bar', component: Bar },
  { path: '*', redirect: '/' }
];

const router = new VueRouter({
  // mode: 'history',
  routes // short for routes: routes
});

const app = new Vue({
  // render: h => h(App),
  router
}).$mount('#app');