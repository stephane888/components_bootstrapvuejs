<template>
  <div :class="classCss">
    <ValidationProvider v-slot="v" :name="fullname" :rules="getRules()">
      <b-form-group
        :label="field.label"
        :description="field.description"
        :class="size ? 'size-' + size : ''"
      >
        <div class="field-item-value">
          <b-form-input
            v-model="input_value"
            :placeholder="field.placeholder"
            :state="getValidationState(v)"
            :name="fullname"
            :size="size"
            :min="settings.min"
            :max="settings.max"
            debounce="2500"
            type="number"
            @input="input"
          ></b-form-input>
        </div>
        <div v-if="v.errors && v.errors.length > 0" class="text-danger my-2">
          <small v-for="(error, ii) in v.errors" :key="ii" class="d-block">
            {{ error }}
          </small>
        </div>
      </b-form-group>
    </ValidationProvider>
  </div>
</template>

<script>
import { ValidationProvider } from "vee-validate";
import "./vee-validation-rules";
import loadField from "./loadField";
export default {
  name: "DrupalInteger",
  components: {
    ValidationProvider,
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
    // permet de definir la taille du bouton,
    // sm,md,lg
    size: {
      type: [String],
      default: "sm",
    },
  },

  data() {
    return {
      input_value: null,
      timeout: null,
    };
  },
  computed: {
    fullname() {
      return this.parentName + this.field.name;
    },
    settings() {
      var settings = { min: "", max: "" };
      if (this.field.definition_settings) {
        if (this.field.definition_settings.min)
          settings.min = this.field.definition_settings.min;
        if (this.field.definition_settings.max)
          settings.max = this.field.definition_settings.max;
      }
      return settings;
    },
  },
  watch: {
    /**
     * Lorsque le champs est construt via les boucles dynamique,
     * le template n'est pas reconstruit ducoup la valeur du precedent champs est concerservé.
     * On applique ce watch et on verra les resultats.
     * Cela ne s'execute que dans le cadre d'un watch et permet de ressoudre le probleme.
     */
    field() {
      this.input_value = this.getValue();
    },
  },

  mounted() {
    // On recupere la valeur par defaut pour chaque construction:
    this.input_value = this.getValue();
  },

  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return (dirty || validated) && !valid ? valid : null;
    },
    getRules() {
      return loadField.getRules(this.field);
    },
    setValue(vals) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        if (this.namespaceStore) {
          this.$store.dispatch(this.namespaceStore + "/setValue", {
            value: vals,
            fieldName: this.fullname,
          });
        } else
          this.$store.dispatch("setValue", {
            value: vals,
            fieldName: this.fullname,
          });
      }, loadField.timeToWait);
    },
    getValue() {
      if (this.model[this.field.name] && this.model[this.field.name][0]) {
        return this.model[this.field.name][0].value;
      } else return null;
    },
    input(v) {
      const vals = [];
      vals.push({ value: v });
      this.setValue(vals);
    },
  },
};
</script>
