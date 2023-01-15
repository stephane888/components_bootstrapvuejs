<template>
  <div :class="classCss">
    <MultiSelectTaxo
      v-if="
        field.definition_settings &&
        field.definition_settings.target_type == 'taxonomy_term'
      "
      :field="field"
      :model="model"
      :namespace-store="namespaceStore"
    >
    </MultiSelectTaxo>
    <MultiSelectEntities
      v-if="
        field.definition_settings &&
        field.definition_settings.target_type != 'taxonomy_term'
      "
      :field="field"
      :model="model"
      :namespace-store="namespaceStore"
    >
    </MultiSelectEntities>
  </div>
</template>

<script>
export default {
  name: "MultiSelect",
  components: {
    MultiSelectTaxo: () => import("../Ressouces/MultiSelectTaxo.vue"),
    MultiSelectEntities: () => import("../Ressouces/MultiSelectEntities.vue"),
  },
  props: {
    classCss: {
      type: [Array],
      default: function () {
        return [];
      },
    },
    field: { type: Object, required: true },
    model: { type: [Object, Array], required: true },
    namespaceStore: { type: String, required: true },
  },
};
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
