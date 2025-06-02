<template>
  <ValidationProvider v-slot="v" :name="fullname" :rules="getRules()">
    <b-form-group :label="field.label" :description="field.description">
      <div class="autocomplete">
        <multiselect
          v-model="value_computed"
          :options="options"
          :custom-label="nameWithLang"
          :taggable="auto_create"
          placeholder=""
          label="text"
          track-by="text"
          :show-no-results="true"
          :show-labels="false"
          :loading="isLoading"
          :multiple="cardinality"
          :allow-empty="true"
          @search-change="asyncFind"
          @tag="createElement"
        >
          <template slot="noResult">
            <span class="option__title"> Aucun contenu ne correspond à votre recherche </span>
          </template>
          <template slot="placeholder">
            <span class="option__title"> Aucun contenu ... </span>
          </template>
          <template slot="noOptions">
            <span class="option__title"> Saisir un ou plusieurs caractères ... </span>
          </template>
        </multiselect>
        <div class="text-danger">
          <small v-for="(error, ii) in v.errors" :key="ii" class="d-block">
            {{ error }}
          </small>
        </div>
      </div>
    </b-form-group>
    <pre> taxo field : {{ field }} </pre>
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
    parentName: {
      type: String,
      required: true,
    },
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
    cardinality() {
      if (this.field.cardinality === -1) {
        return true;
      } else {
        return false;
      }
    },
    auto_create() {
      return this.field.definition_settings.handler_settings.auto_create;
    },
    /**
     * @see https://skirtles-code.github.io/vue-examples/patterns/computed-v-model.html
     */
    value_computed: {
      get() {
        return this.value_select;
      },
      set(val) {
        this.updateValue(val);
      },
    },
  },
  // watch: {
  //   /**
  //    * L'objectif est que cette valeur soit un reflet de la valeur contenu dans l'entité.
  //    * @param {*} val
  //    */
  //   value_select(val) {
  //     if (this.cardinality) {
  //       const vals = [];
  //       val.forEach((item) => {
  //         vals.push({ target_id: item.value });
  //       });
  //       this.setValue(vals);
  //     } else {
  //       const vals = [];
  //       if (val) vals.push({ target_id: val.value });
  //       this.setValue(vals);
  //     }
  //   },
  // },
  mounted() {
    this.loadDefaults();
    this.asyncFind("", true);
  },
  methods: {
    /**
     *
     * @param {*} tid
     */
    getTermByTid(tid) {
      this.isLoading = true;
      // Doit etre dynamique.
      let vocabulary = this.getFistVocab();
      const terms = new termsTaxo(vocabulary);
      terms
        .getValueByTid(tid)
        .then(() => {
          const options = terms.getOptions();
          this.options = options;
          if (this.cardinality) {
            this.value_select = options;
          } else if (options[0]) this.value_select = options[0];
          this.isLoading = false;
        })
        .catch(() => {
          this.isLoading = false;
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
        const keys = Object.keys(this.field.definition_settings.handler_settings.target_bundles);
        return this.field.definition_settings.handler_settings.target_bundles[keys[0]];
      } else if (this.field.definition_settings.target_type) {
        return this.field.definition_settings.target_type;
      } else return null;
    },
    /**
     *
     * @param {string} newElement
     */
    createElement(newElement) {
      const entity = {
        value: {
          name: newElement,
          vid: this.field.definition_settings.bundle_entity_type_id,
        },
        entity_type_id: this.field.definition_settings.target_type,
      };

      const action = this.namespaceStore ? this.namespaceStore + "/saveEntity" : "saveEntity";

      this.$store
        .dispatch(action, entity)
        .then((response) => {
          this.value_select.push({
            text: newElement,
            value: response.data.id,
          });
          this.updateValue(this.value_select);
        })
        .catch((e) => console.log("error: ", e));
    },
    /**
     *
     * @param {*} search
     */
    asyncFind(search, init = false) {
      if (search.length >= 2 || init) {
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
    updateValue(val) {
      this.value_select = val;
      if (this.cardinality) {
        const vals = [];
        if (val && val.length)
          val.forEach((item) => {
            vals.push({ target_id: item.value });
          });
        this.setValue(vals);
      } else {
        const vals = [];
        if (val && val.value) vals.push({ target_id: val.value });
        this.setValue(vals);
      }
    },
  },
};
</script>
