<template>
  <div :class="classCss">
    <ValidationProvider v-slot="v" :name="fullname" :rules="getRules()">
      <b-form-group :label="field.label" :description="field.description">
        <b-input-group append="Hauteur" class="field-item-value">
          <b-form-input
            v-model="input_value.height"
            :state="getValidationState(v)"
            :name="fullname + '.height'"
            debounce="2500"
            @input="input"
          ></b-form-input>
        </b-input-group>
        <b-input-group append="Longueur" class="field-item-value">
          <b-form-input
            v-model="input_value.length"
            :state="getValidationState(v)"
            :name="fullname + '.length'"
            debounce="2500"
            @input="input"
          ></b-form-input>
        </b-input-group>
        <b-input-group append="Largeur" class="field-item-value">
          <b-form-input
            v-model="input_value.width"
            :state="getValidationState(v)"
            :name="fullname + '.width'"
            debounce="2500"
            @input="input"
          ></b-form-input>
        </b-input-group>
        <b-input-group append="Unit" class="field-item-value">
          <b-form-input
            v-model="input_value.unit"
            :state="getValidationState(v)"
            :name="fullname + '.unit'"
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
  name: "DrupalString",
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
      input_value: { height: "", length: "", unit: "", width: "" },
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
          height: Number.parseFloat(
            this.model[this.field.name][0].height
          ).toFixed(3),
          length: Number.parseFloat(
            this.model[this.field.name][0].length
          ).toFixed(3),
          width: Number.parseFloat(
            this.model[this.field.name][0].width
          ).toFixed(3),
          unit: this.model[this.field.name][0].unit,
        };
      } else return { height: "", length: "", unit: "", width: "" };
    },
    input(v) {
      const vals = [];
      vals.push({ height: v });
      console.log(" this.input_value : ", this.input_value);
      //this.setValue(vals);
    },
  },
};
</script>
