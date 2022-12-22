<template>
  <div>
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
      <b-form>
        <b-row class=" ">
          <b-col md="6">
            <div class="fi-input">
              <label for="input-titre">{{ settings.label_value }}</label>
              <b-form-input
                id="input-titre"
                v-model="form.value"
                type="text"
                placeholder="Titre"
                required
              ></b-form-input>
              <b-form-text> p.ex. Vendeur de cercueil </b-form-text>
            </div>
          </b-col>
          <b-col md="6">
            <div class="fi-input">
              <label for="input-compaign">{{ settings.label_company }}</label>
              <b-form-input
                id="input-compaign"
                v-model="form.company"
                type="text"
                placeholder="la compagnie"
                required
              ></b-form-input>
              <b-form-text> p.ex. Luis Vuitton</b-form-text>
            </div>
          </b-col>
          <b-col cols="12">
            <div class="fi-input">
              <label for="input-location">{{ settings.label_address }}</label>
              <b-form-input
                id="input-location"
                v-model="form.address"
                type="text"
                placeholder="Tokyo, Lagos"
                required
              ></b-form-input>
              <b-form-text> p.ex. Lagos </b-form-text>
            </div>
          </b-col>
        </b-row>
        <b-row class=" ">
          <b-col md="6">
            <div class="fi-input">
              <label for="input-date-debut">
                {{ settings.label_date_debut }}
              </label>
              <b-form-datepicker
                id="input-date-debut"
                v-model="date_debut"
                type="text"
                placeholder="Date de début"
                required
                locale="fr"
                :date-format-options="{
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                }"
              ></b-form-datepicker>
              <b-form-text> p.ex. 22 Juin</b-form-text>
            </div>
          </b-col>
          <b-col md="6">
            <div class="fi-input">
              <label for="input-date-fin">
                {{ settings.label_date_fin }}
              </label>
              <b-form-datepicker
                id="input-date-fin"
                v-model="date_fin"
                type="text"
                placeholder="Date de fin"
                required
                locale="fr"
                :date-format-options="{
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                }"
              ></b-form-datepicker>
              <b-form-text> p.ex. 22 Dec </b-form-text>
              <b-form-checkbox
                v-model="form.en_poste"
                class="mt-3 ml-2"
                required
              >
                {{ settings.label_en_poste }}
              </b-form-checkbox>
            </div>
          </b-col>
        </b-row>
        <b-row class=" ">
          <b-col>
            <div class="fi-input fi-input--textarea">
              <label for="input-textarea-role" class="label-respon">
                {{ settings.label_description }}
              </label>
              <ckeditor
                v-model="form.description"
                :config="editorConfig"
                @input="input"
                @namespaceloaded="onNamespaceLoaded"
              ></ckeditor>
              <b-form-text>
                p.ex. Organisation d'événements VIP et prise en charge de
                clients exclusifs.
              </b-form-text>
            </div>
          </b-col>
        </b-row>
      </b-form>
    </div>
  </div>
</template>

<script>
import request from "../fieldsDrupal/loadField";
class CreateInstance {
  constructor(value) {
    this.name = value;
  }
  getValue() {
    return this.name;
  }
}
export default {
  name: "FormInput",
  components: {},
  props: {
    fValue: {
      type: Object,
      require: true,
      default: function () {
        return {};
      },
    },
    field: {
      type: Object,
      require: true,
      default: function () {
        return {};
      },
    },
  },
  data() {
    return {
      form: {},
      editorData: "",
      preEditorConfig: {
        codeSnippet_theme: "monokai_sublime",
        stylesSet: [],
        toolbar: [
          {
            name: "document",
            items: [
              "Bold",
              "Italic",
              "-",
              "Cut",
              "Copy",
              "Paste",
              "PasteText",
              "PasteFromWord",
              "-",
              "Undo",
              "Redo",
            ],
          },
        ],
        contentsCss:
          "@import '" +
          request.config.getBaseUrl() +
          "/themes/contrib/wb_universe/node_modules/%40fortawesome/fontawesome-free/css/all.min.css'; @import 'http://wb-horizon.com/themes/custom/wb_horizon_com/css/vendor-style.css';",
        on: {
          instanceReady: function (ev) {
            ev.sender.dataProcessor.writer.setRules("p", {
              indent: true,
              breakBeforeOpen: true,
              breakAfterOpen: false,
              breakBeforeClose: true,
              breakAfterClose: true,
            });
            ev.sender.dataProcessor.writer.setRules("img", {
              indent: true,
              breakBeforeOpen: true,
              breakAfterOpen: false,
              breakBeforeClose: false,
              breakAfterClose: false,
            });
            ev.sender.dataProcessor.writer.setRules("h1", {
              indent: true,
              breakBeforeOpen: false,
              breakAfterOpen: false,
              breakBeforeClose: false,
              breakAfterClose: false,
            });

            ev.sender.dataProcessor.writer.setRules("h2", {
              indent: true,
              breakBeforeOpen: false,
              breakAfterOpen: false,
              breakBeforeClose: false,
              breakAfterClose: false,
            });
            ev.sender.dataProcessor.writer.setRules("h3", {
              indent: true,
              breakBeforeOpen: false,
              breakAfterOpen: false,
              breakBeforeClose: false,
              breakAfterClose: false,
            });
            ev.sender.dataProcessor.writer.setRules("h4", {
              indent: true,
              breakBeforeOpen: false,
              breakAfterOpen: false,
              breakBeforeClose: false,
              breakAfterClose: false,
            });
            ev.sender.dataProcessor.writer.setRules("h5", {
              indent: true,
              breakBeforeOpen: false,
              breakAfterOpen: false,
              breakBeforeClose: false,
              breakAfterClose: false,
            });
            ev.sender.dataProcessor.writer.setRules("h6", {
              indent: true,
              breakBeforeOpen: false,
              breakAfterOpen: false,
              breakBeforeClose: false,
              breakAfterClose: false,
            });
            ev.sender.dataProcessor.writer.setRules("div", {
              indent: true,
              breakBeforeOpen: true,
              breakAfterOpen: true,
              breakBeforeClose: true,
              breakAfterClose: false,
            });
          },
        },
      },
    };
  },
  computed: {
    settings() {
      if (this.field.entity_form) return this.field.entity_form.settings;
      else return {};
    },
    editorConfig() {
      //,ckawesome, ckeditorfa
      var extraPlugins =
        "codesnippet,print,format,font,colorbutton,justify,image,filebrowser,stylesheetparser";
      return {
        extraPlugins: extraPlugins,
        ...this.preEditorConfig,
      };
    },
    date_debut: {
      get() {
        if (this.form.date_debut) {
          const date = new Date(this.form.date_debut * 1000);
          let month = parseInt(date.getMonth()) + 1;
          return date.getFullYear() + "-" + month + "-" + date.getDate();
        } else return "";
      },
      set(val) {
        if (val) {
          const date = new Date(val);
          this.form.date_debut = Math.floor(date.getTime() / 1000);
        }
      },
    },
    date_fin: {
      get() {
        if (this.form.date_fin) {
          const date = new Date(this.form.date_fin * 1000);
          let month = parseInt(date.getMonth()) + 1;
          return date.getFullYear() + "-" + month + "-" + date.getDate();
        } else return "";
      },
      set(val) {
        console.log(" date_fin : ", val);
        if (val) {
          const date = new Date(val);
          this.form.date_fin = Math.floor(date.getTime() / 1000);
        }
      },
    },
  },
  mounted() {
    const v = new CreateInstance(this.fValue);
    this.form = v.getValue();
  },
  methods: {
    input(v) {
      // const vals = [];
      // vals.push({ value: v, format: "full_html" });
      // this.setValue(vals);
      this.form.description = v;
    },
    onNamespaceLoaded(CKEDITOR) {
      CKEDITOR.config.allowedContent = true;
      // CKEDITOR.config.contentsCss =
      //   "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";
      CKEDITOR.config.htmlEncodeOutput = false;
      CKEDITOR.config.entities = false;
      // CKEDITOR.config.entities_processNumerical = 'force';
      CKEDITOR.dtd.$removeEmpty.span = 0;
      CKEDITOR.dtd.$removeEmpty.i = 0;
      CKEDITOR.dtd.$removeEmpty.label = 0;
    },
  },
};
</script>
