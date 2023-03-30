<template>
  <div :class="classCss">
    <ValidationProvider v-slot="v" :name="fullname" :rules="getRules()">
      <b-form-group :label="field.label" :description="field.description">
        <div
          v-for="(value, index) in input_value"
          :key="index"
          class="field-item-value"
        >
          <b-form-input
            v-model="value.value"
            :placeholder="field.placeholder"
            :state="getValidationState(v)"
            :name="fullname + '.value'"
          ></b-form-input>
          <b-form-textarea
            v-model="value.text"
            :placeholder="field.placeholder"
            :state="getValidationState(v)"
            :name="fullname + '.text'"
            rows="3"
            max-rows="6"
          ></b-form-textarea>
        </div>
        <div v-if="v.errors" class="text-danger my-2">
          <small v-for="(error, ii) in v.errors" :key="ii" class="d-block">
            {{ error }}
          </small>
        </div>
      </b-form-group>
      <div v-if="cardinality">
        <b-button size="sm" variant="info" @click.prevent="addField">
          Add more
        </b-button>
      </div>
    </ValidationProvider>
  </div>
</template>

<script>
import { ValidationProvider } from "vee-validate";
import "./vee-validation-rules";
import loadField from "./loadField";
export default {
  name: "MoreFieldsIconwTextidget",
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
  },

  data() {
    return {
      input_value: [{ value: "", text: "", format: "text_html" }],
      timeout: null,
    };
  },
  computed: {
    fullname() {
      return this.parentName + this.field.name;
    },
    cardinality() {
      if (this.field.cardinality === -1) {
        return true;
      } else {
        return false;
      }
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
      if (
        this.model[this.field.name] &&
        this.model[this.field.name].length > 0
      ) {
        return this.model[this.field.name];
      } else return [];
    },
    input(v) {
      const vals = [];
      vals.push({ value: v });
      this.setValue(vals);
    },
    addField() {
      const newEntry = { value: "", text: "", format: "text_html" };
      this.input_value.push(newEntry);
    },
  },
};
</script>
