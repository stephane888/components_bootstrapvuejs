<template>
  <div class="d-flex align-items-center h-card-icon" :class="classCss">
    <span :class="iconClass">
      <b-icon :icon="icon" font-scale="1.9" variant="info"></b-icon>
    </span>
    <div>
      <h3 class="titre font-weight-bold"><slot name="titre">Conseils</slot></h3>
      <div class="description">
        <slot>
          Dites à vos futurs employeurs quelle est la meilleure manière de vous
          contacter en indiquant vos coordonnées de contact actuelles.
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HCardIcon",
  props: {
    icon: {
      type: String,
      default: "server",
    },
    iconClass: {
      type: [Array, String],
      default: function () {
        return ["icon", "bg-white", "p-4", "mr-4", "shadow"];
      },
    },
    // avec les marge de bas, oui par defaut.
    withMb: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    classCss() {
      const cls = [];
      if (this.withMb) cls.push("mb-5");
      return cls;
    },
  },
};
</script>
