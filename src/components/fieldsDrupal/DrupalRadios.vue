<!--
On ajoute type-field-render et type-field-drupal car on a bc de mal a ce retrouver sur le rendu html.
-->
<template>
  <div
    :class="classCss"
    type-field-render="DrupalRadios"
    :type-field-drupal="field.type"
  >
    <div class="field-item-value js-form-type-radio" :format_val="format_val">
      <ValidationProvider :name="fullname" :rules="getRules()" v-slot="v">
        <!-- On a different cas de figure-->
        <OptionsTaxonomy
          v-if="
            field.definition_settings.target_type &&
            field.definition_settings.target_type == 'taxonomy_term'
          "
          :field="field"
          :model="model"
          :namespace-store="namespaceStore"
          @setValue="setValue"
        >
        </OptionsTaxonomy>
        <OptionsAllowedValues
          v-else-if="
            field.definition_settings.allowed_values &&
            Object.keys(field.definition_settings.allowed_values).length > 0
          "
          :field="field"
          :model="model"
          :namespace-store="namespaceStore"
          @setValue="setValue"
        ></OptionsAllowedValues>
        <OptionsEntities
          v-else-if="
            field.definition_settings.target_type &&
            field.definition_settings.target_type != ''
          "
          :field="field"
          :model="model"
          :namespace-store="namespaceStore"
          @setValue="setValue"
        >
        </OptionsEntities>
        <b-form-group
          v-else
          :label="field.label"
          :name="fullname"
          :class="size ? 'size-' + size : ''"
        >
          <div class="fieldset-wrapper">
            <div
              v-if="field.settings && field.settings.list_options"
              class="radio"
            >
              <b-form-radio
                v-for="(option, o) in field.settings.list_options"
                :key="o"
                v-model="selected"
                :name="fullname"
                :value="option.value"
                :size="size"
                class="form-check"
                :state="getValidationState(v)"
              >
                <transition name="fade" mode="out-in">
                  <div>
                    <b-img
                      v-if="option.image_url"
                      thumbnail
                      fluid
                      :src="option.image_url"
                      alt="Image 1"
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
            <div class="text-danger my-2" v-if="v.errors">
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
// import { ValidationProvider } from "vee-validate";
// import "./vee-validation-rules";
import svgLoader from "./svg-preloader.vue";
export default {
  name: "DrupalRadios",
  components: {
    // ValidationProvider,
    svgLoader,
    OptionsTaxonomy: () => {
      return import("../Ressouces/OptionsTaxonomy.vue");
    },
    OptionsAllowedValues: () => {
      return import("../Ressouces/OptionsAllowedValues.vue");
    },
    OptionsEntities: () => {
      return import("../Ressouces/OptionsEntities.vue");
    },
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
    // permet de definir la taille du bouton,
    // sm,md,lg
    size: {
      type: [String],
      default: "sm",
    },
  },

  data() {
    return {
      selected: null,
    };
  },
  computed: {
    format_val() {
      const vals = [];
      if (this.selected !== null && this.selected !== undefined) {
        vals.push({ value: this.selected });
        this.setValue(vals);
      }
      return vals;
    },
    fieldName() {
      return this.field.name;
    },
    fullname() {
      return this.parentName + this.field.name;
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
    this.getImage();
    console.log("load image boolean");
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
