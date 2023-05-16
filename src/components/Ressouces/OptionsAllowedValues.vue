<template>
  <div>
    <div class="d-none for-test">options value : {{ field.type }}</div>
    <ValidationProvider
      v-slot="validation"
      :name="fullname"
      :rules="getRules()"
    >
      <b-form-group :label="field.label">
        <b-form-select
          v-if="field.type == 'options_select'"
          v-model="selected"
          :options="options_allowed_values"
          :state="getValidationState(validation)"
          :name="fullname"
          @change="input"
        ></b-form-select>
        <b-form-radio-group
          v-else
          v-model="selected"
          :options="options_allowed_values"
          :name="fullname"
          :state="getValidationState(validation)"
          @change="input"
        ></b-form-radio-group>
      </b-form-group>
    </ValidationProvider>
  </div>
</template>

<script>
import config from "../fieldsDrupal/loadField";
export default {
  name: "OptionsAllowedValues",
  components: {},
  props: {
    field: { type: Object, required: true },
    model: { type: [Object, Array], required: true },
    namespaceStore: { type: String, required: true },
    fullname: { type: String, required: true },
  },
  data() {
    return {
      options: [],
      selected: null,
    };
  },
  computed: {
    options_allowed_values() {
      const options = [];
      if (this.field.definition_settings.allowed_values) {
        for (const i in this.field.definition_settings.allowed_values) {
          options.push({
            value: i,
            text: this.field.definition_settings.allowed_values[i],
          });
        }
      }
      return options;
    },
    is_target_type() {
      if (this.field.definition_settings.target_type) return true;
      else return false;
    },
    is_multiple() {
      if (this.field.cardinality === 1) return false;
      else return true;
    },
  },
  mounted() {
    this.selected = this.getValue();
  },
  methods: {
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
    input(val) {
      const vals = [];
      if (this.is_target_type) vals.push({ target_id: val });
      else vals.push({ value: val });
      this.$emit("setValue", vals);
    },
    /**
     * Cette approche a apparament un soucis car il ne tient pas en compte le multiple value.
     */
    getValue() {
      if (this.model[this.field.name] && this.model[this.field.name][0]) {
        if (this.is_target_type)
          return this.model[this.field.name][0].target_id;
        else return this.model[this.field.name][0].value;
      }
      return null;
    },
    getValidationState(validation) {
      var valid = true;
      return (validation.dirty || validation.validated) && !valid
        ? valid
        : null;
    },
    getRules() {
      return config.getRules(this.field);
    },
  },
};
</script>
