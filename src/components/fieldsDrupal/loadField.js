import Vue from "vue";
import drupalString from "./drupal-string.vue";
import drupalLink from "./drupal-link.vue";
import drupalColor from "./drupal-color.vue";
import drupalBoolean from "./drupal-boolean.vue";
import drupalListString from "./drupal-list-string.vue";
import drupalTextLong from "./textarea-ckeditor.vue";
import htmlRender from "./html-render.vue";
import drupalFile from "./drupal-file.vue";
import ExperienceTypeVue from "./ExperienceType.vue";
import CKEditor from "ckeditor4-vue";
Vue.use(CKEditor);

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
        template = drupalString;
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
        template = drupalTextLong;
        break;
      case "image":
        template = drupalFile;
        break;
      case "experience_type":
        template = ExperienceTypeVue;
        break;
      default:
        console.log("Champs sans rendu :", key);
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
