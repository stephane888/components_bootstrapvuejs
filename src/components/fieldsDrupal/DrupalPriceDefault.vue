<template>
  <div :class="classCss">
    <ValidationProvider v-slot="v" :name="fullname" :rules="getRules()">
      <b-form-group :label="field.label" :description="field.description">
        <b-input-group
          :append="input_value.currency_code"
          class="field-item-value"
        >
          <b-form-input
            v-model="input_value.number"
            :placeholder="field.placeholder"
            :state="getValidationState(v)"
            :name="fullname"
            debounce="2500"
            @input="input"
          ></b-form-input>
        </b-input-group>

        <div v-if="v.errors" class="text-danger my-2">
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
  name: "DrupalPriceDefault",
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
      input_value: { number: null, currency_code: "EUR" },
      timeout: null,
    };
  },
  computed: {
    fullname() {
      return this.parentName + this.field.name;
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
        return {
          number: new Intl.NumberFormat("fr-FR").format(
            this.model[this.field.name][0].number
          ),
          currency_code: this.model[this.field.name][0].currency_code,
        };
      } else return { number: null, currency_code: "EUR" };
    },
    input(v) {
      const vals = [];
      v = v.replace(",", ".");
      vals.push({ number: v, currency_code: "EUR" });
      this.setValue(vals);
    },
  },
};
</script>
