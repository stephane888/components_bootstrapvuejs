// import de ckeditor, ne fonctionne pas lorsqu'on est sur nm run serve.
// import CKEditor from "ckeditor4-vue";
// Vue.use(CKEditor);
// import Vue from "vue";
import drupalString from "./drupal-string.vue";
import drupalLink from "./drupal-link.vue";
import drupalColor from "./drupal-color.vue";
import drupalBoolean from "./drupal-boolean.vue";
import drupalListString from "./drupal-list-string.vue";
import drupalTextLong from "./TextareaCkeditor.vue";
import htmlRender from "./html-render.vue";
import drupalFile from "./drupal-file.vue";
import ExperienceTypeVue from "./ExperienceType.vue";
import MultiSelect from "./MultiSelect";
import ValueNiveau from "./ValueNiveau.vue";
import DrupalEmailVue from "./DrupalEmail.vue";

export default {
  debug: false,
  /**
   * Contient les methodes de wbu-utilities provenant du parent.
   */
  config: {},
  getField(field) {
    var key = field.type;
    if (key == "list_string" && field.cardinality == 1) key = "boolean";
    var template;
    if (this.debug) console.log(" key : ", key);
    switch (key) {
      case "string":
      case "string_textfield":
        template = drupalString;
        break;
      case "email":
      case "email_default":
        template = DrupalEmailVue;
        break;
      case "link":
        template = drupalLink;
        break;
      case "color_theme_field_type":
        template = drupalColor;
        break;
      case "boolean":
        template = drupalBoolean;
        break;
      case "list_string":
        template = drupalListString;
        break;
      case "render_html":
        template = htmlRender;
        break;
      case "text_long":
      case "text_textarea":
        template = drupalTextLong;
        break;
      case "image":
      case "image_image":
        template = drupalFile;
        break;
      case "experience_type":
      case "experience_widget_type":
        template = ExperienceTypeVue;
        break;
      case "entity_reference":
      case "entity_reference_autocomplete":
        // à ce state, on pourra distinguer plusieurs cas.
        if (
          field.definition_settings &&
          field.definition_settings.target_type == "taxonomy_term"
        ) {
          template = MultiSelect;
        } else console.log("Champs sans rendu :", key, "\n field : ", field);
        break;
      case "value_niveau_type":
      case "value_niveau_widget_type":
        template = ValueNiveau;
        break;
      default:
        console.log("Champs sans rendu :", key, "\n field : ", field);
        break;
    }
    return template;
  },
  getImageUrl(fid, style = "medium") {
    return this.config.get("/vuejs-entity/image/" + fid + "/" + style);
  },
  getRules(field) {
    const rules = {};
    if (field.constraints) {
      for (const i in field.constraints) {
        if (i == "NotNull") {
          rules["required"] = true;
        }
      }
    }
    return rules;
  },
  getConfig(config) {
    this.config = config;
  },
};
