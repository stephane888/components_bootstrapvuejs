<template>
  <div :class="classCss">
    <div class="p-3 py-5" @click="$emit('closeEditForm')">
      <span
        v-b-tooltip.hover
        variant="light"
        title="Back"
        class="btn-action btn-back"
      >
        <b-icon
          icon="arrow-left"
          variant="secondary"
          font-scale="1"
          class=""
        ></b-icon>
        Retour
      </span>
    </div>
    <div class="add-item-form">
      <ValidationProvider v-slot="v" :name="field.name" :rules="getRules()">
        <b-form-group :label="settings.label_target_id">
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
        <div class="fi-input">
          <label for="input-niveau">{{ settings.label_niveau }}</label>
          <b-form-select
            id="input-niveau"
            v-model="form.niveau"
            type="text"
            placeholder="Titre"
            required
            :options="optionsNiveau"
            @change="selectNiveau"
          ></b-form-select>
          <b-form-text> p.ex. Moyen </b-form-text>
        </div>
      </ValidationProvider>
    </div>
  </div>
</template>

<script>
import { ValidationProvider } from "vee-validate";
import Multiselect from "vue-multiselect";
import termsTaxo from "drupal-vuejs/src/App/jsonApi/termsTaxo.js";
import loadField from "../fieldsDrupal/loadField";
class CreateInstance {
  constructor(value) {
    this.name = value;
  }
  getValue() {
    return this.name;
  }
}
export default {
  name: "EditValueNiveau",
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
    fValue: {
      type: Object,
      require: true,
      default: function () {
        return {};
      },
    },
    terms: {
      type: [Object],
      default: function () {
        return {};
      },
    },
  },
  data() {
    return {
      isLoading: false,
      options: [],
      form: {},
      value_select: null,
    };
  },
  computed: {
    settings() {
      if (this.field.settings) {
        return this.field.settings;
      } else return {};
    },
    optionsNiveau() {
      if (this.field.settings && this.field.settings.niveau_options) {
        const options = [];
        for (const i in this.field.settings.niveau_options) {
          options.push({
            text: this.field.settings.niveau_options[i],
            value: i,
          });
        }
        return options;
      } else return [];
    },
  },
  mounted() {
    const v = new CreateInstance(this.fValue);
    this.form = v.getValue();
    this.buildDefaultOptions();
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return (dirty || validated) && !valid ? valid : null;
    },
    getRules() {
      return loadField.getRules(this.field);
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
          this.$emit("addTermsInCache", terms.terms.data);
        });
        //
      }
    },
    selectUser(input) {
      console.log("update input Term : ", input.value);
      this.form.target_id = input.value;
      this.$emit("setValue", input);
    },
    selectNiveau() {
      console.log("update input Niveau");
      this.$emit("setValue");
    },
    buildDefaultOptions() {
      for (const i in this.terms) {
        const option = {
          text: this.terms[i].name,
          value: this.terms[i].drupal_internal__tid,
        };
        this.options.push(option);
        if (this.terms[i].drupal_internal__tid == this.form.target_id) {
          this.value_select = option;
        }
      }
    },
  },
};
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
