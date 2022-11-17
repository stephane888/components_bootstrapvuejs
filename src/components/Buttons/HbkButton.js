//import { BButton } from "bootstrap-vue/src/components/button/button.js";

const props = {
  icon: {
    type: String,
    default: "info-circle-fill",
  },
  variant: {
    type: String,
    default: "light",
  },
  iconVariant: {
    type: String,
    default: "info",
  },
  fontScale: {
    type: Number,
    default: 1,
  },
  iconClass: {
    type: String,
    default: "mr-3",
  },
  size: {
    type: String,
    default: "md",
  },
};
export default {
  name: "HbkButton",
  props: props,
  render(elt) {
    return elt(
      "b-button",
      {
        props: { variant: this.variant, size: this.size },
        on: {
          click: (e) => {
            this.$emit("click", e);
          },
        },
      },
      [
        elt(
          "span",
          { class: ["d-flex", "align-items-center", "align-items-start"] },
          [
            elt("b-icon", {
              props: {
                icon: this.icon,
                variant: this.iconVariant,
                fontScale: this.fontScale,
              },
              class: this.iconClass,
            }),
            elt(
              "span",
              {
                class: "bt-text",
              },
              this.$slots.default
            ),
          ]
        ),
      ]
    );
  },
};
