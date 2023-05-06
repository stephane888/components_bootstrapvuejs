<template>
  <div :class="classCss">
    <ValidationProvider v-slot="v" :name="fullname" :rules="getRules()">
      <div class="border p-2 container-field">
        <div
          class="header d-flex align-items-center justify-content-between px-3 mb-3"
        >
          <label class="pt-2" v-html="field.label"></label>
          <div>
            <b-button
              v-if="cardinality"
              variant="outline-info"
              size="sm"
              class="p-0 border-0"
              @click="add"
            >
              <b-icon icon="plus-square" font-scale="2"></b-icon>
            </b-button>
          </div>
        </div>
        <div
          v-for="(val, i) in input_value"
          :key="i"
          class="px-3 pt-3 field-item-value"
        >
          <b-button
            v-if="cardinality"
            v-b-tooltip.v-danger="' Supprimer '"
            variant="outline-danger"
            size="sm"
            class="p-0 border-0 elt-remove"
            @click="remove(i)"
          >
            <b-icon icon="trash" font-scale="1"></b-icon>
          </b-button>
          <b-form-group :label="field.settings.label_1">
            <b-form-input
              v-model="val.value"
              :placeholder="field.placeholder"
              :name="fullname + '.' + i"
              debounce="2500"
              @input="input"
            ></b-form-input>
            <div v-if="v.errors" class="text-danger my-2">
              <small v-for="(error, ii) in v.errors" :key="ii" class="d-block">
                {{ error }}
              </small>
            </div>
          </b-form-group>
          <b-form-group v-if="show_svg_field" :label="field.settings.label_2">
            <b-form-textarea
              v-model="val.text"
              rows="3"
              max-rows="6"
            ></b-form-textarea>
            <div v-if="v.errors" class="text-danger my-2">
              <small v-for="(error, ii) in v.errors" :key="ii" class="d-block">
                {{ error }}
              </small>
            </div>
          </b-form-group>
        </div>
        <div v-html="field.description"></div>
      </div>
    </ValidationProvider>
  </div>
</template>

<script>
import { ValidationProvider } from "vee-validate";
import "./vee-validation-rules";
import loadField from "./loadField";
const input_default = {
  text: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path d="M21.5 5.35C21.5 6.26 21.07 7.07 20.41 7.59C19.93 7.97 19.32 8.2 18.65 8.2C17.07 8.2 15.8 6.93 15.8 5.35C15.8 4.68 16.03 4.08 16.41 3.59H16.42C16.93 2.93 17.74 2.5 18.65 2.5C20.23 2.5 21.5 3.77 21.5 5.35Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>\n<path d="M8.2 5.35C8.2 6.93 6.93 8.2 5.35 8.2C4.68 8.2 4.08 7.97 3.59 7.59C2.93 7.07 2.5 6.26 2.5 5.35C2.5 3.77 3.77 2.5 5.35 2.5C6.26 2.5 7.07 2.93 7.59 3.59C7.97 4.08 8.2 4.68 8.2 5.35Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>\n<path d="M21.5 18.65C21.5 20.23 20.23 21.5 18.65 21.5C17.74 21.5 16.93 21.07 16.42 20.41H16.41C16.03 19.93 15.8 19.32 15.8 18.65C15.8 17.07 17.07 15.8 18.65 15.8C19.32 15.8 19.92 16.03 20.41 16.41V16.42C21.07 16.93 21.5 17.74 21.5 18.65Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>\n<path d="M8.2 18.65C8.2 19.32 7.97 19.92 7.59 20.41C7.07 21.08 6.26 21.5 5.35 21.5C3.77 21.5 2.5 20.23 2.5 18.65C2.5 17.74 2.93 16.93 3.59 16.42V16.41C4.07 16.03 4.68 15.8 5.35 15.8C6.93 15.8 8.2 17.07 8.2 18.65Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>\n<path d="M21.5 12C21.5 13.6 21.11 15.09 20.41 16.41C19.93 16.03 19.32 15.8 18.65 15.8C17.07 15.8 15.8 17.07 15.8 18.65C15.8 19.32 16.03 19.92 16.41 20.41C15.09 21.11 13.6 21.5 12 21.5C10.41 21.5 8.91 21.11 7.59 20.41C7.97 19.93 8.2 19.32 8.2 18.65C8.2 17.07 6.93 15.8 5.35 15.8C4.68 15.8 4.08 16.03 3.59 16.41C2.89 15.09 2.5 13.6 2.5 12C2.5 10.41 2.89 8.91 3.59 7.59C4.08 7.97 4.68 8.2 5.35 8.2C6.93 8.2 8.2 6.93 8.2 5.35C8.2 4.68 7.97 4.08 7.59 3.59C8.91 2.89 10.41 2.5 12 2.5C13.6 2.5 15.09 2.89 16.41 3.59C16.03 4.07 15.8 4.68 15.8 5.35C15.8 6.93 17.07 8.2 18.65 8.2C19.32 8.2 19.92 7.97 20.41 7.59C21.11 8.91 21.5 10.41 21.5 12Z" stroke="#292D32" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>\n</svg>',
  value: "",
  format: "full_html",
};
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
      input_value: null,
      timeout: null,
      show_svg_field: false,
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
      if (this.model[this.field.name] && this.model[this.field.name][0]) {
        return this.model[this.field.name];
      } else return [input_default];
    },
    input() {
      this.setValue(this.input_value);
    },
    add() {
      this.input_value.push(input_default);
    },
    remove(index) {
      this.input_value.splice(index, 1);
    },
  },
};
</script>
