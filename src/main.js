import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App';

Vue.use(VueRouter);

const Foo = {
  template: '<div>foo, {{ $route.path }}</div>',
  created: () => {
    console.log('foo');
    console.log(router.currentRoute);
    // router.push('/bar');
  }
};
const Bar = {
  template: '<div>bar</div>',
  created: () => console.log('bar')
};
const Default = {
  template: '<div>home</div>',
  created: () => {
    console.log('home');
  }
};
const All = {
  template: '<div>All</div>',
  created: () => console.log('all')
};

const routes = [
  { path: '/', component: Default },
  {
    path: '/foo', component: Foo,
    beforeEnter: (to, from, next) => {
      console.log('matched routes', to.matched);
      next();
    }
  },
  { path: '/bar', component: Bar },
  { path: '*', redirect: '/' }
];

const router = new VueRouter({
  mode: 'history',
  routes // short for routes: routes
});

const app = new Vue({
  render: h => h(App),
  router
}).$mount('#app');