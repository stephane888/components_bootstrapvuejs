<template>
  <div :class="classCss">
    <ValidationProvider v-slot="v" :name="fullname" :rules="getRules()">
      <b-form-group :label="field.label" :description="field.description">
        <div class="field-item-value">
          <b-form-input
            v-model="input_value.title"
            :placeholder="field.placeholder"
            :state="getValidationState(v)"
            :name="fullname + 'title'"
            @input="input"
          ></b-form-input>
          <b-form-input
            v-model="input_value.uri"
            :placeholder="field.placeholder"
            :state="getValidationState(v)"
            :name="fullname + 'url'"
            @input="input"
          ></b-form-input>
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
      input_value: { title: "", uri: "#" },
      timer: null,
    };
  },
  computed: {
    fullname() {
      return this.parentName + this.field.name;
    },
  },
  mounted() {
    this.input_value = this.getValue();
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
        var url = this.model[this.field.name][0];
        if (url.uri) {
          return {
            uri: url.uri.replace("internal:", ""),
            title: url.title,
            attributes: url.attributes,
            options: url.options,
          };
        }
        return url;
      }
    },
    input() {
      const vals = [];
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        const value = {
          uri: "internal:" + this.input_value.uri,
          title: this.input_value.title,
          attributes: [],
          options: [],
        };
        vals.push(value);
        this.setValue(vals);
      }, config.timeToWait);
    },
  },
};
</script>
