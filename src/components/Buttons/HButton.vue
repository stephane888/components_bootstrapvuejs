<template>
  <b-button :size="size" :variant="variant" @click="$emit('click')">
    <span class="d-flex align-items-center align-items-start">
      <b-icon
        :icon="icon"
        :variant="iconVariant"
        :font-scale="fontScale"
        :class="iconClass"
      ></b-icon>
      <span class="bt-text"> <slot> Creer un projet </slot> </span>
    </span>
  </b-button>
</template>

<script>
export default {
  name: "HButton",
  props: {
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
  },
  methods: {
    userClick() {
      this.$emit("userClick", true);
    },
  },
};
</script>
