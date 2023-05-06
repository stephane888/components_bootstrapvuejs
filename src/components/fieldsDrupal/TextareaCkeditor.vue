<!--

-->
<template>
  <div :class="classCss" class="mb-4">
    <ValidationProvider
      v-slot="v"
      :name="fullname"
      :rules="{ required: true }"
      class="form-group"
    >
      <legend>{{ field.label }}</legend>
      <div class="options-config">
        <b-form-checkbox v-model="select_edit_mode" switch size="md">
          Edit code (Pro)
        </b-form-checkbox>
      </div>
      <b-form-textarea
        v-if="select_edit_mode"
        v-model="editorData"
        :placeholder="field.placeholder"
        :state="getValidationState(v)"
        :name="fullname"
        rows="3"
        max-rows="6"
        @input="input"
      ></b-form-textarea>
      <ckeditor
        v-if="!select_edit_mode"
        v-model="editorData"
        :config="editorConfig"
        :editor-url="editorUrl"
        @input="input"
        @namespaceloaded="onNamespaceLoaded"
      ></ckeditor>
      <div v-if="v.errors" class="text-danger my-2">
        <small v-for="(error, ii) in v.errors" :key="ii" class="d-block">
          {{ error }}
        </small>
      </div>
    </ValidationProvider>
  </div>
</template>
<script>
import CKEditor from "ckeditor4-vue";
import { ValidationProvider } from "vee-validate";
import "./vee-validation-rules";
import config from "./loadField";
import ckeditorConfig from "../Ressouces/ckeditor-config";
export default {
  name: "TextareaCkeditor",
  components: {
    ValidationProvider,
    ckeditor: CKEditor.component,
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
      editorData: "",
      preEditorConfig: ckeditorConfig.preEditorConfig(),
      editorUrl: ckeditorConfig.editorUrl(),
      timeout: null,
      select_edit_mode: false,
    };
  },
  computed: {
    editorConfig() {
      var extraPlugins =
        "codesnippet, print,format,font,colorbutton,justify,image,filebrowser,stylesheetparser";
      return {
        extraPlugins: extraPlugins,
        ...this.preEditorConfig,
      };
    },
    fullname() {
      return this.parentName + this.field.name;
    },
    baseUrl() {
      if (config.config) return config.config.getBaseUrl();
      else return "";
    },
  },
  mounted() {
    this.editorData = this.getValue();
  },

  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return (dirty || validated) && !valid ? valid : null;
    },
    getRules() {
      return config.getRules(this.field);
    },
    setValue(vals) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
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
      }, config.timeToWait);
    },
    getValue() {
      if (this.model[this.field.name] && this.model[this.field.name][0]) {
        return this.model[this.field.name][0].value;
      }
    },
    input(v) {
      const vals = [];
      vals.push({ value: v, format: "full_html" });
      this.setValue(vals);
    },
    onNamespaceLoaded(CKEDITOR) {
      ckeditorConfig.onNamespaceLoaded(CKEDITOR);
    },
  },
};
</script>
