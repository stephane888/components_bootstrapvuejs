<template>
  <div :class="class_css" field="drupal_boolean">
    <div class="field-item-value js-form-type-radio" :format_val="format_val">
      <ValidationProvider :name="field.name" :rules="getRules()" v-slot="v">
        <b-form-group :label="field.label" :name="field.name">
          <div class="fieldset-wrapper">
            <div
              class="radio"
              v-if="field.settings && field.settings.list_options"
            >
              <b-form-radio
                v-model="selected"
                :name="field.name"
                v-for="(option, o) in field.settings.list_options"
                :key="o"
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
import { ValidationProvider } from "vee-validate";
import "./vee-validation-rules";
import svgLoader from "./svg-preloader.vue";
export default {
  name: "DrupalBoolean",
  components: {
    ValidationProvider,
    svgLoader,
  },
  props: {
    class_css: { type: [Array] },
    field: { type: Object, required: true },
    model: { type: [Object, Array], required: true },
    namespaceStore: { type: String, required: true },
  },

  data() {
    return {
      selected:
        this.model[this.field.name] && this.model[this.field.name][0]
          ? this.model[this.field.name][0].value
          : null,
    };
  },
  computed: {
    format_val() {
      const vals = [];
      if (this.selected !== null) {
        vals.push({ value: this.selected });
      }
      this.setValue(vals);
      return vals;
    },
    fieldName() {
      return this.field.name;
    },
  },
  watch: {
    /**
     * Lorsque le composant est charg?? plusieurs durant le processus, on est oblig?? de forcer la MAJ des images si le nom change.
     * ( Idealement on devrait charger des instances du champs pour un espace bien donn??e ).
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
          fieldName: this.field.name,
        });
      } else
        this.$store.dispatch("setValue", {
          value: vals,
          fieldName: this.field.name,
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
