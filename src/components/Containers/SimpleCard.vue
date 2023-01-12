<template>
  <div>
    <b-card :class="classEntity">
      <template #header>
        <h4 class="mb-0">{{ entity.label }}</h4>
      </template>
      <slot></slot>
    </b-card>
  </div>
</template>

<script>
export default {
  name: "SimpleCard",
  props: {
    entity: {
      type: Object,
      required: true,
    },
    classEntity: {
      type: [Object, Array],
      default: function () {
        return [];
      },
    },
  },
};
</script>
