import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App';

Vue.use(VueRouter);

const Foo = { template: '<div>foo</div>' };
const Bar = { template: '<div>bar</div>' };

const routes = [
  { path: '/foo', component: Foo },
  { path: '/bar', component: Bar }
];

const router = new VueRouter({
  routes // short for routes: routes
});

const app = new Vue({
  render: h => h(App),
  router
}).$mount('#app');