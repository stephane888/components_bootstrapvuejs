<template>
  <ValidationProvider v-slot="v" :name="fullname" :rules="getRules()">
    <div class="d-none for-test">MultiSelectEntities : {{ field.type }}</div>
    <b-form-group :label="field.label" :description="field.description">
      <div class="autocomplete">
        <multiselect
          v-model="value_computed"
          :options="options"
          :custom-label="nameWithLang"
          placeholder=""
          label="text"
          track-by="text"
          :show-no-results="true"
          :show-labels="false"
          :loading="isLoading"
          :multiple="cardinality"
          :allow-empty="true"
          @search-change="asyncFind"
        >
          <template slot="noResult">
            <span class="option__title">
              Aucun contenu ne correspond à votre recherche
            </span>
          </template>
          <template slot="placeholder">
            <span class="option__title"> Aucun contenu ... </span>
          </template>
          <template slot="noOptions">
            <span class="option__title">
              Saisir un ou plusieurs caractères ...
            </span>
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
import itemsEntity from "drupal-vuejs/src/App/jsonApi/itemsEntity.js";
import loadField from "../fieldsDrupal/loadField.js";
export default {
  name: "MultiSelectEntities",
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
    /**
     * Pour effeutuer les requetes, certains champs initialise leur configuration, cela fontionne si l'application est interne au site.
     * Mais dans le cadre d'une applcation decouplé, il faut utiliser la config definie par l'applicationde base. (dans ce cas on met true)
     */
    overrideConfig: { type: Boolean, default: false },
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
  //    * ( il ya un probleme avec le watch, des que la valeur change, il envoit les données,
  //    *  ce qui est faux, c'est unqiuement à la modification de l'utilisateur ).
  //    * @param {*} val
  //    */
  //   // value_select(val) {
  //   //   if (this.cardinality) {
  //   //     const vals = [];
  //   //     val.forEach((item) => {
  //   //       vals.push({ target_id: item.value });
  //   //     });
  //   //     this.setValue(vals);
  //   //   } else {
  //   //     const vals = [];
  //   //     vals.push({ target_id: val.value });
  //   //     this.setValue(vals);
  //   //   }
  //   // },
  // },
  mounted() {
    this.loadDefaults();
  },
  methods: {
    /**
     *
     * @param {*} tid
     */
    getTermById(tid) {
      let entity_type_id = this.getFistVocab();
      if (entity_type_id && loadField.config) {
        const bundle = this.field.definition_settings.bundle_entity_type_id
          ? this.field.definition_settings.bundle_entity_type_id
          : entity_type_id;

        const terms = new itemsEntity(entity_type_id, bundle, loadField.config);

        if (this.overrideConfig) {
          terms.remplaceConfig();
          console.log("getTermById :::", this.overrideConfig);
        }
        this.isLoading = true;
        terms
          .getValueById(tid)
          .then(() => {
            const options = terms.getOptions();
            if (options[0]) {
              this.options.push(options[0]);
              if (this.cardinality) {
                this.value_select.push(options[0]);
              } else if (options[0]) this.value_select = options[0];
            }
            this.isLoading = false;
          })
          .catch(() => {
            this.isLoading = false;
          });
      }
    },
    /**
     *
     */
    loadDefaults() {
      this.value_select = [];
      this.model[this.field.name].forEach((item) => {
        this.getTermById(item.target_id);
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
        let entity_type_id = this.getFistVocab();
        if (entity_type_id && loadField.config) {
          const bundle = this.field.definition_settings.bundle_entity_type_id
            ? this.field.definition_settings.bundle_entity_type_id
            : entity_type_id;
          const terms = new itemsEntity(
            entity_type_id,
            bundle,
            loadField.config
          );
          if (this.overrideConfig) {
            terms.remplaceConfig();
          }
          this.isLoading = true;
          terms
            .getSearch(search)
            .then(() => {
              this.options = terms.getOptions();
              this.isLoading = false;
              console.log(this.options);
            })
            .catch((e) => {
              this.isLoading = false;
              console.log(e);
            });
        }
      }
    },
    /**
     * cette fonction est utiliser pour mettre à jour les données dans l'entité.
     * @deprecated
     * @param {*} input
     */
    // selectUser(input) {
    //   const vals = this.model[this.field.name];
    //   vals.push({ target_id: input.value });
    //   this.setValue(vals);
    // },

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
      //met à jour la valeur de value_computed
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
