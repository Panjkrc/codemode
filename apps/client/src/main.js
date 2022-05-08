import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { plugin as VueTippy } from "vue-tippy";
import "tippy.js/dist/tippy.css";

import App from "./App.vue";
import router from "./router";
import "@/assets/base.css";
import "@/helpers/axios_config.js";

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(VueTippy);
app.use(Toast, {
  transition: "Vue-Toastification__fade",
  maxToasts: 3,
  newestOnTop: true,
});

app.mount("#app");
