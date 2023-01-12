<template>
  <div>
    <b-form-group :label="field.label">
      <b-form-radio-group
        v-model="selected"
        :options="options"
        :name="field.name"
        @change="input"
      ></b-form-radio-group>
    </b-form-group>
  </div>
</template>

<script>
import itemsEntity from "drupal-vuejs/src/App/jsonApi/itemsEntity.js";
import loadField from "../fieldsDrupal/loadField.js";
export default {
  name: "OptionsTaxonomy",
  components: {},
  props: {
    field: { type: Object, required: true },
    model: { type: [Object, Array], required: true },
    namespaceStore: { type: String, required: true },
  },
  data() {
    return {
      options: [],
      selected: null,
    };
  },
  mounted() {
    this.loadTerms();
  },
  methods: {
    loadTerms() {
      let vocabulary = this.getFistVocab();
      console.log("vocabulary : ", vocabulary);
      if (vocabulary && loadField.config) {
        const terms = new itemsEntity(vocabulary, vocabulary, loadField.config);
        terms.get().then(() => {
          this.options = terms.getOptions();
        });
      }
    },
    getFistVocab() {
      if (this.field.definition_settings.handler_settings.target_bundles) {
        const keys = Object.keys(
          this.field.definition_settings.handler_settings.target_bundles
        );
        return this.field.definition_settings.handler_settings.target_bundles[
          keys[0]
        ];
      } else if (this.field.definition_settings.target_type) {
        return this.field.definition_settings.target_type;
      } else return null;
    },
    input(val) {
      const vals = [];
      vals.push({ target_id: val });
      this.$emit("setValue", vals);
    },
  },
};
</script>
