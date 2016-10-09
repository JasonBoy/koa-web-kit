<template>
  <div id="app">
    <img class="logo" src="./content/img/node.png">
    <hello></hello>
    <p>
      Welcome to your Vue.js app!
    </p>
    <p>
      <router-link to="/foo">Go to Foo</router-link>
      <router-link to="/bar">Go to Bar</router-link>
    </p>
    <router-view></router-view>

  </div>
</template>

<script>
  import './content/scss/bootstrap.scss';
//  import './content/scss/common.scss';
//  import './content/scss/demo.css';
  import Hello from './components/Hello/Hello';
  console.log(process.env.NODE_ENV);
  export default {
    components: {
      Hello,
    },
  };
</script>

<style lang="sass">
  @import "./content/scss/common.scss";
  $brand-secondary: red;

  html {
    height: 100%;
  }

  body {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  #app {
    color: #2c3e50;
    margin-top: -100px;
    max-width: 600px;
    font-family: Source Sans Pro, Helvetica, sans-serif;
    text-align: center;
  }

  #app a {
    color: $brand-primary;
    text-decoration: none;
  }

  .logo {
    width: 100px;
    height: 100px
  }
</style>
