<template>
  <div :class="classCss">
    <b-form-group :label="field.label" :description="field.description">
      <div
        v-for="(val, k) in model[field.name]"
        :key="k"
        class="field-item-value"
      >
        <b-form-input
          v-model="val.color"
          :placeholder="field.placeholder"
          type="color"
        ></b-form-input>
      </div>
    </b-form-group>
  </div>
</template>

<script>
export default {
  name: "DrupalString",
  props: {
    classCss: {
      type: [Array],
      default: function () {
        return [];
      },
    },
    field: { type: Object, required: true },
    model: { type: [Object, Array], required: true },
  },
};
</script>
