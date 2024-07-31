<!--
On ajoute type-field-render et type-field-drupal car on a bc de mal a ce retrouver sur le rendu html.
-->
<template>
  <div
    :class="classCss"
    type-field-render="MultiSelect"
    :type-field-drupal="field.type"
  >
    <MultiSelectTaxo
      v-if="
        field.definition_settings &&
        field.definition_settings.target_type == 'taxonomy_term'
      "
      :field="field"
      :model="model"
      :namespace-store="namespaceStore"
      :parent-name="parentName"
      :override-config="overrideConfig"
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
      :override-config="overrideConfig"
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
    /**
     * Pour effeutuer les requetes, certains champs initialise leur configuration, cela fontionne si l'application est interne au site.
     * Mais dans le cadre d'une applcation decouplé, il faut utiliser la config definie par l'applicationde base. (dans ce cas on met true)
     */
    overrideConfig: { type: Boolean, default: false },
  },
};
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
