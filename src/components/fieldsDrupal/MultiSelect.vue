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
      :parent-name="parentName"
    >
    </MultiSelectTaxo>
    <MultiSelectEntities
      v-else-if="
        field.definition_settings &&
        field.definition_settings.target_type != 'taxonomy_term'
      "
      :field="field"
      :model="model"
      :namespace-store="namespaceStore"
      :parent-name="parentName"
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
    parentName: {
      type: String,
      required: true,
    },
  },
};
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
