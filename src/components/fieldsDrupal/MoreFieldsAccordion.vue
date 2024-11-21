<!--

-->
<template>
  <div :class="classCss" class="mb-4 container-field">
    <ValidationProvider v-slot="v" :name="fullname" :rules="getRules()">
      <label class="pt-2 fw-bold" v-html="field.label"></label>
      <div class="accordion" role="tablist">
        <div class="options-config">
          <b-form-checkbox v-model="select_edit_mode" switch size="md"> Edit code (Pro) </b-form-checkbox>
        </div>
        <b-card bg-variant="light" class="my-2 border-0 py-0 my-3">
          <div v-for="(item, idx) in editorData" :key="idx" class="mb-2">
            <div role="tab">
              <b-button v-b-toggle="fullname + '-' + idx" block variant="secondary" class="w-100 text-white text-start">
                <div v-if="item.title" class="fw-bold">{{ item.title | truncate(20, "... ") }}</div>
                <div v-else class="opacity-50">{ Nouveau element }</div>
              </b-button>
            </div>
            <b-collapse :id="fullname + '-' + idx" :visible="idx == 0" accordion="my-accordion" role="tabpanel">
              <b-card-body class="p-0">
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
                      @input="input($event, id, 'title')"
                    ></b-form-input>
                  </div>
                  <div class="field-item-value icon">
                    <ckeditor
                      v-if="!select_edit_mode"
                      :key="fullname + '-icon-' + idx"
                      v-model="item.icon"
                      :label="formSettings.icon.fieldName"
                      :ck-name="fullname + '-icon-' + idx"
                      @input="input($event, idx, 'icon ')"
                    ></ckeditor>
                    <b-form-group v-else :label="formSettings.icon.fieldName">
                      <b-form-textarea
                        v-model="item.icon"
                        :placeholder="formSettings.icon.placeholder"
                        :state="getValidationState(v)"
                        :name="fullname + '-icon-' + idx"
                        rows="3"
                        max-rows="6"
                        @change="input($event, idx, 'icon ')"
                      ></b-form-textarea>
                    </b-form-group>
                  </div>
                  <div class="field-item-value description">
                    <ckeditor
                      v-if="!select_edit_mode"
                      :key="fullname + '-description-' + idx"
                      v-model="item.description"
                      :label="formSettings.description.fieldName"
                      :ck-name="fullname + '-description-' + idx"
                      @input="input($event, idx, 'description ')"
                    ></ckeditor>
                    <b-form-group v-else :label="formSettings.description.fieldName">
                      <b-form-textarea
                        v-model="item.description"
                        :placeholder="formSettings.description.placeholder"
                        :state="getValidationState(v)"
                        :name="fullname + '-description-' + idx"
                        rows="3"
                        max-rows="6"
                        @change="input($event, idx, 'description ')"
                      ></b-form-textarea>
                    </b-form-group>
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
        </b-card>
        <div v-if="cardinality">
          <b-button size="sm" variant="info" @click.prevent="addField"> Add more </b-button>
        </div>
      </div>
    </ValidationProvider>
  </div>
</template>
<script>
import { ValidationProvider } from "vee-validate";
import "./vee-validation-rules";
import config from "./loadField";
import CkeditorComponent from "../Ressouces/Ckeditor.vue";
export default {
  name: "MoreFieldsAccordion",
  components: {
    ValidationProvider,
    ckeditor: CkeditorComponent,
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
      timeout: null,
      select_edit_mode: false,
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
        } else {
          this.$store.dispatch("setValue", {
            value: vals,
            fieldName: this.fullname,
          });
        }
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
  },
};
</script>
