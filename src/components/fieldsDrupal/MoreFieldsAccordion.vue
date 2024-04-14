<!--

-->
<template>
  <div :class="classCss" class="mb-4">
    <ValidationProvider v-slot="v" :name="fullname" :rules="getRules()">
      <label class="pt-2" v-html="field.label"></label>
      <div class="accordion">
        <div class="options-config">
          <b-form-checkbox v-model="select_edit_mode" switch size="md"> Edit code (Pro) </b-form-checkbox>
        </div>
        <div v-for="(item, idx) in editorData" :key="idx" class="mb-2">
          <div role="tab">
            <b-button v-b-toggle="fullname + '-' + idx" block variant="secondary" class="w-100 text-white fw-bold">
              Block: {{ idx }} ( <i>{{ item.title | truncate(20, "...   ") }}</i> )
            </b-button>
          </div>
          <b-collapse :id="fullname + '-' + idx" :visible="idx == 0" accordion="my-accordion" role="tabpanel">
            <b-card-body>
              <b-form-group>
                <div class="field-item-value title">
                  <div class="accordion-header d-flex justify-content-between align-item-center">
                    <label :for="fullname + '-title-' + idx">
                      {{ formSettings.title.fieldName }}
                    </label>
                    <b-button v-if="cardinality" v-b-tooltip.v-danger="' Supprimer '" variant="outline-danger" size="sm" class="p-0 border-0 elt-remove" @click="remove(idx)">
                      <b-icon icon="trash" font-scale="1"></b-icon>
                    </b-button>
                  </div>
                  <b-form-input
                    :id="fullname + '-title-' + idx"
                    v-model="item.title"
                    :state="getValidationState(v)"
                    :name="getFieldFullName(formSettings.title.fieldName)"
                    :placeholder="formSettings.title.placeholder"
                    debounce="2500"
                    @input="input($event, idx, 'title')"
                  ></b-form-input>
                </div>
                <div class="field-item-value icon">
                  <label :for="fullname + '-icon-' + idx">
                    {{ formSettings.icon.fieldName }}
                  </label>
                  <ckeditor
                    v-if="!select_edit_mode"
                    v-model="item.icon"
                    :name="fullname + '-icon-' + idx"
                    :config="editorConfig"
                    :editor-url="editorUrl"
                    @input="input($event, idx, 'icon')"
                    @namespaceloaded="onNamespaceLoaded"
                  ></ckeditor>
                </div>
                <div class="field-item-value description">
                  <label :for="'description-' + idx">
                    {{ formSettings.description.fieldName }}
                  </label>
                  <ckeditor
                    v-if="!select_edit_mode"
                    v-model="item.description"
                    :name="fullname + '-description-' + idx"
                    :config="editorConfig"
                    :editor-url="editorUrl"
                    @input="input($event, idx, 'description ')"
                    @namespaceloaded="onNamespaceLoaded"
                  ></ckeditor>
                  <b-form-textarea
                    v-else
                    v-model="item.description"
                    :placeholder="formSettings.description.placeholder"
                    :state="getValidationState(v)"
                    :name="fullname + '-description-' + idx"
                    rows="3"
                    max-rows="6"
                    @change="input($event, idx, 'description ')"
                  ></b-form-textarea>
                </div>
                <div v-if="v.errors && v.errors.length > 0" class="text-danger my-2">
                  <small v-for="(error, ii) in v.errors" :key="ii" class="d-block">
                    {{ error }}
                  </small>
                </div>
              </b-form-group>
            </b-card-body>
          </b-collapse>
        </div>
        <div v-if="cardinality">
          <b-button size="sm" variant="info" @click.prevent="addField"> Add more </b-button>
        </div>
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
  name: "MoreFieldsAccordion",
  components: {
    ValidationProvider,
    ckeditor: CKEditor.component,
  },
  filters: {
    truncate: function (text, length, clamp) {
      clamp = clamp || "...";
      var node = document.createElement("div");
      node.innerHTML = text;
      var content = node.textContent;
      return content.length > length ? content.slice(0, length) + clamp : content;
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
  },
  data() {
    return {
      editorData: [],
      name: "",
      preEditorConfig: ckeditorConfig.preEditorConfig(),
      editorUrl: ckeditorConfig.editorUrl(),
      timeout: null,
      select_edit_mode: true,
      formSettings: {
        title: {
          fieldName: "title",
          placeholder: "Entrez le titre",
        },
        icon: {
          fieldName: "Icon",
          placeholder: "entrez l'icon",
        },
        description: {
          fieldName: "Description",
          placeholder: "Entrez la description",
        },
      },
    };
  },
  computed: {
    editorConfig() {
      var extraPlugins = "quickuploader, codesnippet, print,format,font,colorbutton,justify,image,filebrowser,stylesheetparser";
      return {
        extraPlugins: extraPlugins,
        ...this.preEditorConfig,
      };
    },
    cardinality() {
      if (this.field.cardinality === -1) {
        return true;
      } else {
        return false;
      }
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
    this.name = this.field.name;
  },

  methods: {
    getFieldFullName(fieldName) {
      return this.parentName + this.field.name + fieldName;
    },
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
      return this.model[this.field.name] ? this.model[this.field.name] : [];
    },
    remove(index) {
      this.editorData.splice(index, 1);
    },
    addField() {
      const newEntry = {
        title: "",
        icon: "",
        format: "full_html",
        description: "",
      };
      this.editorData.push(newEntry);
    },
    input(value, index, field) {
      console.log("my_values: ", { value, index, field });
      switch (field) {
        case "icon":
          // this.editorData[index].icon = value;
          break;
        case "description":
          // this.editorData[index].description = value;
          this.editorData[index].format = "full_html";
          break;
        case "title":
          // this.editorData[index].title = value;
          break;
        default:
          break;
      }
      this.setValue(this.editorData);
    },
    onNamespaceLoaded(CKEDITOR) {
      ckeditorConfig.onNamespaceLoaded(CKEDITOR);
    },
  },
};
</script>
