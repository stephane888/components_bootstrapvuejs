//import Vue from "vue";
import HButton from "./HButton.vue";
import HbkButton from "./HbkButton";

//Vue.component(HButton.name, HButton);
const Buttons = {
  install(Vue) {
    Vue.component(HButton.name, HButton);
    Vue.component(HbkButton.name, HbkButton);
  },
};

export default Buttons;
