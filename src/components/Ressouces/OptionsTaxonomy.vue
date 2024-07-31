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
import termsTaxo from "drupal-vuejs/src/App/jsonApi/termsTaxo.js";
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
    this.selected = this.getValue();
  },
  methods: {
    loadTerms() {
      let vocabulary = this.getFistVocab();
      if (vocabulary && loadField.config) {
        const terms = new termsTaxo(vocabulary, loadField.config);
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
      } else return null;
    },
    getValue() {
      if (
        this.model[this.field.name] &&
        this.model[this.field.name][0] &&
        this.model[this.field.name][0].target_id
      )
        return this.model[this.field.name][0].target_id;
    },
    input(val) {
      const vals = [];
      vals.push({ target_id: val });
      this.$emit("setValue", vals);
    },
  },
};
</script>
