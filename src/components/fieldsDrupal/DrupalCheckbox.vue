<!--
On ajoute type-field-render et type-field-drupal car on a bc de mal a ce retrouver sur le rendu html.
-->
<template>
  <div
    :class="classCss"
    type-field-render="DrupalCheckbox"
    :type-field-drupal="field.type"
  >
    <div class="field-item-value">
      <ValidationProvider v-slot="v" :name="fullname" :rules="getRules()">
        <!-- cas de selection unique on/off -->
        <b-form-group
          v-if="field.type == 'boolean_checkbox'"
          :label="field.label"
          :description="field.description"
        >
          <b-form-checkbox
            v-model="selected"
            :name="fullname"
            switch
            @change="input"
          >
            {{ field.label }}
          </b-form-checkbox>
        </b-form-group>
        <!-- cas de selection multiple -->
        <b-form-group
          v-else-if="field.type == 'options_buttons'"
          v-slot="{ ariaDescribedby }"
          :label="field.label"
          :description="field.description"
        >
          <b-form-checkbox-group
            v-model="multi_selected"
            :options="options_allowed_values"
            :aria-describedby="ariaDescribedby"
            :name="fullname"
            @change="input_multi"
          ></b-form-checkbox-group>
        </b-form-group>
        <!-- Utiliser par des rendu avec image de selection -->
        <b-form-group v-else :label="field.label" :name="fullname">
          <div class="fieldset-wrapper">
            <div
              v-if="field.settings && field.settings.list_options"
              class="checkbox"
            >
              <b-form-radio
                v-for="(option, o) in field.settings.list_options"
                :key="o"
                v-model="selected"
                :name="fullname"
                :value="option.value"
                class="form-check"
                :state="getValidationState(v)"
              >
                <transition name="fade" mode="out-in">
                  <div>
                    <b-img
                      thumbnail
                      fluid
                      :src="option.image_url"
                      alt="Image 1"
                      v-if="option.image_url"
                    ></b-img>
                    <svgLoader v-if="!option.image_url"></svgLoader>
                  </div>
                </transition>
                <div class="mt-5">{{ option.label }}</div>
                <div
                  v-if="
                    option.description.value && option.description.value !== ''
                  "
                  class="mt-5 text-hover"
                  v-html="option.description.value"
                ></div>
              </b-form-radio>
            </div>
            <div v-if="v.errors" class="text-danger my-2">
              <small v-for="(error, ii) in v.errors" :key="ii" class="d-block">
                {{ error }}
              </small>
            </div>
          </div>
        </b-form-group>
      </ValidationProvider>
    </div>
  </div>
</template>

<script>
import config from "./loadField";
//import { ValidationProvider } from "vee-validate";
//import "./vee-validation-rules";
import svgLoader from "./svg-preloader.vue";
export default {
  name: "DrupalCheckbox",
  components: {
    // ValidationProvider,
    svgLoader,
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
      selected: null,
      multi_selected: [],
      key_value: "value",
    };
  },
  computed: {
    fieldName() {
      return this.field.name;
    },
    fullname() {
      return this.parentName + this.field.name;
    },
    options_allowed_values() {
      const options = [];
      if (this.field.definition_settings.allowed_values) {
        for (const i in this.field.definition_settings.allowed_values) {
          options.push({
            value: i,
            text: this.field.definition_settings.allowed_values[i],
          });
        }
      }
      return options;
    },
  },
  watch: {
    /**
     * Lorsque le composant est chargé plusieurs durant le processus, on est obligé de forcer la MAJ des images si le nom change.
     * ( Idealement on devrait charger des instances du champs pour un espace bien donnée ).
     */
    fieldName() {
      this.getImage();
    },
  },
  mounted() {
    if (
      this.field.definition_settings &&
      this.field.definition_settings.target_type
    ) {
      this.key_value = "target_id";
    } else this.key_value = "value";
    this.getImage();
    this.selected = this.getValue();
    this.multi_selected = this.getValues();
  },

  methods: {
    getImage() {
      if (this.field.settings && this.field.settings.list_options)
        this.field.settings.list_options.forEach((option) => {
          if (!option.image_url) this.$set(option, "image_url", "");
          if (option.image[0] && option.image_url == "") {
            config.getImageUrl(option.image[0]).then((resp) => {
              option.image_url = resp.data;
            });
          }
        });
    },
    getValue() {
      var value = false;
      switch (this.field.type) {
        case "boolean_checkbox":
          if (
            this.model[this.field.name][0] &&
            this.model[this.field.name][0].value
          ) {
            value = true;
          }
          break;
      }
      return value;
    },
    getValues() {
      const values = [];
      if (this.model[this.field.name] && this.model[this.field.name].length) {
        this.model[this.field.name].forEach((item) => {
          // console.log(
          //   "item : " + this.field.name,
          //   " : ",
          //   item,
          //   "\n this.key_value ",
          //   this.key_value
          // );
          values.push(item[this.key_value]);
        });
      }
      return values;
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
    input(val) {
      const vals = [];
      vals.push({ [this.key_value]: val });
      this.setValue(vals);
    },
    input_multi(val) {
      const vals = [];
      val.forEach((value) => {
        vals.push({ [this.key_value]: value });
      });
      this.setValue(vals);
    },
    getValidationState({ dirty, validated, valid = null }) {
      return (dirty || validated) && !valid ? valid : null;
    },
    getRules() {
      return config.getRules(this.field);
    },
  },
};
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0.2;
}
</style>
