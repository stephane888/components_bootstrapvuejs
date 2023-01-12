<template>
  <div :class="classCss">
    <ValidationProvider :name="fullname" :rules="getRules()" v-slot="v">
      <b-form-group :label="field.label" :description="field.description">
        <div
          v-if="
            field.definition_settings &&
            field.definition_settings.target_type == 'taxonomy_term'
          "
          class="autocomplete"
        >
          <multiselect
            v-model="model.value"
            :options="options"
            :custom-label="nameWithLang"
            placeholder=""
            label="text"
            track-by="text"
            :show-no-results="false"
            :show-labels="false"
            :loading="isLoading"
            @search-change="asyncFind"
            @select="selectUser"
          >
            <template slot="noResult">
              <span class="option__titl d-none"> Aucun contenu </span>
            </template>
            <template slot="placeholder">
              <span class="option__title"> Le terme n'existe pas </span>
            </template>
            <template slot="noOptions">
              <span class="option__title"> Saisir un terme </span>
            </template>
          </multiselect>
          <div class="text-danger">
            <small v-for="(error, ii) in v.errors" :key="ii" class="d-block">
              {{ error }}
            </small>
          </div>
        </div>
        <div v-else class="autocomplete"></div>
      </b-form-group>
    </ValidationProvider>
  </div>
</template>

<script>
import { ValidationProvider } from "vee-validate";
import Multiselect from "vue-multiselect";
import termsTaxo from "drupal-vuejs/src/App/jsonApi/termsTaxo.js";
import loadField from "./loadField";
export default {
  name: "MultiSelect",
  components: {
    ValidationProvider,
    Multiselect,
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
  },
  data() {
    return {
      isLoading: false,
      options: [],
    };
  },
  computed: {
    fullname() {
      return this.parentName + this.field.name;
    },
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return (dirty || validated) && !valid ? valid : null;
    },
    getRules() {
      return loadField.getRules(this.field);
    },
    setValue(vals) {
      console.log("set value : ", vals);
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
        return this.model[this.field.name][0].value;
      } else return null;
    },
    nameWithLang({ text }) {
      return `${text}`;
    },
    asyncFind(search) {
      if (search.length >= 2) {
        // Doit etre dynamique.
        let vocabulary = "domaine_Compétence";
        const terms = new termsTaxo(vocabulary);
        this.isLoading = true;
        terms.getSearch(search).then(() => {
          this.options = terms.getOptions();
          this.isLoading = false;
        });
        // loadField
      }
    },
    selectUser(input) {
      const vals = [];
      vals.push({ target_id: input.value });
      this.setValue(vals);
    },
  },
};
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
