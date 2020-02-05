import Vue from "vue";
import App from "./App.vue";
import router from "./router";

import vSelect from "vue-select";
import { Datetime } from "vue-datetime";

Vue.component("v-select", vSelect);

Vue.component("datetime", Datetime);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
