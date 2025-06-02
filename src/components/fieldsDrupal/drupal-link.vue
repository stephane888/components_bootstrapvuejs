<template>
  <div :class="classCss">
    <ValidationProvider v-slot="v" :name="fullname" :rules="getRules()">
      <b-form-group :label="field.label" :description="field.description">
        <div v-for="(input_value, ij) in input_values" :key="ij" class="field-item-value" :class="[input_values.length > 1 ? 'mb-4' : '']">
          <b-form-input v-model="input_value.title" :placeholder="field.placeholder" :state="getValidationState(v)" :name="fullname + 'title' + ij" @input="input()"></b-form-input>
          <b-form-input v-model="input_value.uri" :placeholder="field.placeholder" :state="getValidationState(v)" :name="fullname + 'url' + ij" @input="input()"></b-form-input>
        </div>
        <div v-if="cardinality">
          <b-button size="sm" @click="addMore">Add more</b-button>
        </div>
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
import config from "./loadField";
export default {
  name: "DrupalLink",
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
      input_values: [{ title: "", uri: "#" }],
      timer: null,
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
  mounted() {
    this.input_values = this.getValue();
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return (dirty || validated) && !valid ? valid : null;
    },
    getRules() {
      return config.getRules(this.field);
    },
    setValue(vals) {
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
    },
    getValue() {
      if (this.model[this.field.name] && this.model[this.field.name][0]) {
        const values = [];
        this.model[this.field.name].forEach((value) => {
          if (value.uri) {
            values.push({
              uri: value.uri.replace("internal:", ""),
              title: value.title,
              attributes: value.attributes,
              options: value.options,
            });
          }
        });
        return values;
      } else return { title: "", uri: "#" };
    },
    input() {
      const vals = [];
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        // On met à jour toutes les valeurs.
        for (const index in this.input_values) {
          var r = new RegExp("^(?:[a-z+]+:)?//", "i");
          var uri = "internal:" + this.input_values[index].uri;
          if (r.test(this.input_values[index].uri)) {
            uri = this.input_values[index].uri;
          }
          const value = {
            ...this.model[this.field.name][index],
            uri: uri,
            title: this.input_values[index].title,
            // attributes: [],
            // options: [],
          };
          vals.push(value);
        }
        this.setValue(vals);
      }, config.timeToWait);
    },
    addMore() {
      if (this.input_values.length > 0) this.input_values.push({ title: "", uri: "#", attributes: [], options: [] });
      else {
        this.input_values = [];
        this.input_values.push({ title: "", uri: "#", attributes: [], options: [] });
      }
    },
  },
};
</script>
