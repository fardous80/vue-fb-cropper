// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'

Vue.config.productionTip = false;

window.bus = new Vue();


const config = {
	url: '/upload.php',
    canvas: {width: 600, height: 400},
    cropbox: {width: 260, height: 260}
};

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App :config="config" />',
  components: { App },

  data: {
  	config: config
  }
})
