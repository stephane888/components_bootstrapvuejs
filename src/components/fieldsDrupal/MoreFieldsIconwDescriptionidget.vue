<template>
  <div :class="classCss" class="container-field">
    <ValidationProvider v-slot="v" :name="fullname" :rules="getRules()">
      <b-form-group :label="field.label" :description="field.description">
        <div class="options-config">
          <b-form-checkbox v-model="select_edit_mode" switch size="md">
            Edit code (Pro)
          </b-form-checkbox>
        </div>
        <div
          v-for="(value, index) in input_value"
          :key="index"
          class="field-item-value"
        >
          <label>{{ field.settings.label_1 }}</label>
          <b-form-textarea
            v-model="value.value"
            :placeholder="field.placeholder"
            :state="getValidationState(v)"
            :name="fullname + '.value'"
          ></b-form-textarea>
          <!-- 
            https://projets.habeuk.com/#/projets/3850
            <ckeditor
            v-if="!select_edit_mode"
            :value="value.value"
            :config="editorConfig"
            :editor-url="editorUrl"
            @namespaceloaded="onNamespaceLoaded"
            @change="input($event, index, 'value')"
          ></ckeditor> -->
          <label class="mt-2">
            {{ field.settings.label_2 }}
          </label>
          <b-form-textarea
            v-if="select_edit_mode"
            v-model="value.text"
            :placeholder="field.placeholder"
            :state="getValidationState(v)"
            :name="fullname + '.text'"
            rows="3"
            max-rows="6"
          ></b-form-textarea>
          <ckeditor
            v-if="!select_edit_mode"
            :value="value.text"
            :config="editorConfig"
            :editor-url="editorUrl"
            @namespaceloaded="onNamespaceLoaded"
            @input="inputRaw($event, index, 'value')"
          ></ckeditor>
          <b-button
            v-if="cardinality"
            v-b-tooltip.v-danger="' Supprimer '"
            variant="outline-danger"
            size="sm"
            class="p-0 border-0 elt-remove"
            @click="remove(index)"
          >
            <b-icon icon="trash" font-scale="1"></b-icon>
          </b-button>
        </div>
        <div v-if="v.errors" class="text-danger my-2">
          <small v-for="(error, ii) in v.errors" :key="ii" class="d-block">
            {{ error }}
          </small>
        </div>
      </b-form-group>
      <div v-if="cardinality">
        <b-button size="sm" variant="info" @click.prevent="addField">
          Add more
        </b-button>
      </div>
    </ValidationProvider>
  </div>
</template>

<script>
import { ValidationProvider } from "vee-validate";
import "./vee-validation-rules";
import loadField from "./loadField";
import ckeditorConfig from "../Ressouces/ckeditor-config";
import CKEditor from "ckeditor4-vue";
export default {
  name: "MoreFieldsIconwDescriptionidget",
  components: {
    ValidationProvider,
    ckeditor: CKEditor.component,
    //ckeditor2: CKEditor.component,
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
      input_value: [{ value: "", text: "", format: "text_html" }],
      timeout: null,
      editorConfig: ckeditorConfig.preEditorConfig(),
      editorUrl: ckeditorConfig.editorUrl(),
      select_edit_mode: true,
      editorData: "emdf plfg",
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
  },
  watch: {
    /**
     * Lorsque le champs est construt via les boucles dynamique,
     * le template n'est pas reconstruit ducoup la valeur du precedent champs est concerservé.
     * On applique ce watch et on verra les resultats.
     * Cela ne s'execute que dans le cadre d'un watch et permet de ressoudre le probleme.
     */
    field() {
      console.log("watch : ");
      this.input_value = this.getValue();
    },
  },

  mounted() {
    // On recupere la valeur par defaut pour chaque construction:
    this.input_value = this.getValue();
  },

  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return (dirty || validated) && !valid ? valid : null;
    },
    getRules() {
      return loadField.getRules(this.field);
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
      }, loadField.timeToWait);
    },
    getValue() {
      if (
        this.model[this.field.name] &&
        this.model[this.field.name].length > 0
      ) {
        return this.model[this.field.name];
      } else return [];
    },
    /**
     * Tentative de resolution.
     * @param {*} value
     * @param {*} index
     * @param {*} property
     */
    inputRaw(value, index, property) {
      console.log(
        "value :",
        value,
        "\n index : ",
        index,
        "\n property : ",
        property
      );
      // this.input_value[index][property] = value;
    },
    addField() {
      const newEntry = { value: "", text: "", format: "text_html" };
      this.input_value.push(newEntry);
    },
    remove(index) {
      this.input_value.splice(index, 1);
    },
    onNamespaceLoaded(CKEDITOR) {
      ckeditorConfig.onNamespaceLoaded(CKEDITOR);
    },
  },
};
</script>
