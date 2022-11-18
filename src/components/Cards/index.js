//import Vue from "vue";
import HCardIcon from "./HCardIcon.vue";

//Vue.component(HButton.name, HButton);
const Cards = {
  install(Vue) {
    Vue.component(HCardIcon.name, HCardIcon);
  },
};

export default Cards;
