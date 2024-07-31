<template>
  <div>
    <b-form-group :label="field.label">
      <b-form-select
        v-if="field.type == 'options_select'"
        v-model="selected"
        :options="options"
        :name="field.name"
        @change="input"
      ></b-form-select>
      <b-form-radio-group
        v-else
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
  name: "OptionsEntities",
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
      let entity_type_id = this.getFistVocab();
      if (entity_type_id && loadField.config) {
        const terms = new itemsEntity(
          entity_type_id,
          entity_type_id,
          loadField.config
        );
        terms.get().then(() => {
          this.options = terms.getOptions();
        });
      }
    },
    /**
     * --
     */
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
    /**
     *
     * @param {*} val
     */
    input(val) {
      const vals = [];
      vals.push({ target_id: val });
      this.$emit("setValue", vals);
    },
    /**
     * --
     */
    getValue() {
      if (this.model[this.field.name] && this.model[this.field.name][0]) {
        if (this.model[this.field.name][0].value)
          return this.model[this.field.name][0].value;
        else return this.model[this.field.name][0].target_id;
      } else return null;
    },
  },
};
</script>
