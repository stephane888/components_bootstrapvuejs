<template>
  <ValidationProvider v-slot="v" :name="fullname" :rules="getRules()">
    <b-form-group :label="field.label" :description="field.description">
      <div class="autocomplete">
        <multiselect
          v-model="value_select"
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
    </b-form-group>
  </ValidationProvider>
</template>

<script>
import { ValidationProvider } from "vee-validate";
import Multiselect from "vue-multiselect";
import termsTaxo from "drupal-vuejs/src/App/jsonApi/termsTaxo.js";
import loadField from "../fieldsDrupal/loadField.js";
export default {
  name: "MultiSelectTaxo",
  components: {
    ValidationProvider,
    Multiselect,
  },
  props: {
    field: { type: Object, required: true },
    model: { type: [Object, Array], required: true },
    namespaceStore: { type: String, required: true },
  },
  data() {
    return {
      isLoading: false,
      options: [],
      value_select: null,
    };
  },
  computed: {
    fullname() {
      return this.parentName + this.field.name;
    },
  },
  mounted() {
    this.loadDefaults();
  },
  methods: {
    /**
     *
     * @param {*} tid
     */
    getTermByTid(tid) {
      // Doit etre dynamique.
      let vocabulary = this.getFistVocab();
      const terms = new termsTaxo(vocabulary);
      terms.getValueByTid(tid).then((resp) => {
        if (resp.data[0] && resp.data[0].attributes) {
          const option = {
            text: resp.data[0].attributes.name,
            value: resp.data[0].attributes.drupal_internal__tid,
          };
          this.options.push(option);
          // Par principe on aurra toujours 1 seule valeur
          this.value_select = option;
        }
      });
    },
    /**
     *
     */
    loadDefaults() {
      this.model[this.field.name].forEach((item) => {
        this.getTermByTid(item.target_id);
      });
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
     * @param {*} search
     */
    asyncFind(search) {
      if (search.length >= 2) {
        // Doit etre dynamique.
        let vocabulary = this.getFistVocab();
        const terms = new termsTaxo(vocabulary);
        this.isLoading = true;
        terms.getSearch(search).then(() => {
          this.options = terms.getOptions();
          this.isLoading = false;
        });
      }
    },
    /**
     *
     * @param {*} input
     */
    selectUser(input) {
      const vals = [];
      vals.push({ target_id: input.value });
      this.setValue(vals);
    },
    nameWithLang({ text }) {
      return `${text}`;
    },
    /**
     *
     * @param {*} vals
     */
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
    /**
     *
     */
    getRules() {
      return loadField.getRules(this.field);
    },
  },
};
</script>
