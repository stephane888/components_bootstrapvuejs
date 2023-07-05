// import de ckeditor, ne fonctionne pas lorsqu'on est sur nm run serve.
// import CKEditor from "ckeditor4-vue";
// Vue.use(CKEditor);
// import Vue from "vue";
import drupalString from "./DrupalString.vue";
import drupalInteger from "./DrupalInteger.vue";
import drupalLink from "./drupal-link.vue";
import drupalColor from "./drupal-color.vue";
import drupalRadios from "./DrupalRadios.vue";
import drupalListString from "./drupal-list-string.vue";
import drupalTextLong from "./TextareaCkeditor.vue";
import htmlRender from "./html-render.vue";
import drupalFile from "./drupal-file.vue";
import ExperienceTypeVue from "./ExperienceType.vue";
import MultiSelect from "./MultiSelect";
import ValueNiveau from "./ValueNiveau.vue";
import DrupalEmailVue from "./DrupalEmail.vue";
import DrupalCheckbox from "./DrupalCheckbox.vue";
import DateRange from "./DateRange.vue";
import CreationSitevirtuelComplexinline from "./CreationSitevirtuelComplexinline.vue";
import DrupalPriseDefault from "./DrupalPriceDefault.vue";
import PhysicalDimensionsDefault from "./PhysicalDimensionsDefault.vue";
import StockLevel from "./StockLevel.vue";
import iconTextWidget from "./IconTextWidget.vue";
import chartWidgetType from "./ChartWidgetType.vue";
import TexTarea from "./TexTarea.vue";
import PhoneInternational from "./PhoneInternational.vue";
// @deprecated will be remove before 2x. use MoreFieldsIconDescription
import MoreFieldsIconwTextidget from "./MoreFieldsIconwTextidget.vue";
import MoreFieldsIconDescription from "./MoreFieldsIconwDescriptionidget.vue";

// load Container
import NoContainer from "../Containers/NoContainer.vue";
import SimpleCard from "../Containers/SimpleCard.vue";
import AccordionCard from "../Containers/AccordionCard.vue";

// import style
import "../../assets/scss/container-field.scss";
export default {
  debug: false,
  timeToWait: 800,
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
      case "number":
        template = drupalInteger;
        break;
      case "email":
      case "email_default":
        template = DrupalEmailVue;
        break;
      case "link":
      case "link_default":
        template = drupalLink;
        break;
      case "daterange_default":
      case "datetime_timestamp":
      case "datetime_default":
        template = DateRange;
        break;
      case "color_theme_field_type":
        template = drupalColor;
        break;
      case "boolean":
      case "options_select":
        template = drupalRadios;
        break;
      case "options_buttons":
        if (field.cardinality === 1) template = drupalRadios;
        else template = DrupalCheckbox;
        break;
      case "boolean_checkbox":
        template = DrupalCheckbox;
        break;
      case "list_string":
        template = drupalListString;
        break;
      case "render_html":
        template = htmlRender;
        break;
      case "text_long":
      case "text_textarea":
      case "text_textarea_with_summary":
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
      case "select2_entity_reference":
        template = MultiSelect;
        break;
      case "value_niveau_type":
      case "value_niveau_widget_type":
        template = ValueNiveau;
        break;
      case "creationsitevirtuelcomplexinline":
      case "inline_entity_form_complex":
        template = CreationSitevirtuelComplexinline;
        break;
      case "commerce_price_default":
      case "commerce_list_price":
        template = DrupalPriseDefault;
        break;
      case "physical_dimensions_default":
        template = PhysicalDimensionsDefault;
        break;
      case "commerce_stock_level_simple_transaction":
        template = StockLevel;
        break;
      case "icon_text_widget":
        template = iconTextWidget;
        break;
      case "chart_widget_type":
        template = chartWidgetType;
        break;
      case "string_textarea":
        template = TexTarea;
        break;
      // @deprecated will be remove before 2x. use MoreFieldsIconDescription
      case "more_fields_icon_text_widget":
        template = MoreFieldsIconwTextidget;
        break;
      case "more_fields_icon_text_description_widget":
        template = MoreFieldsIconDescription;
        break;
      case "phone_international_widget":
        template = PhoneInternational;
        break;
      default:
        console.log(" Champs sans rendu : ", key, "\n field : ", field);
        break;
    }
    return template;
  },
  getImageUrl(fid, style = "medium") {
    return this.config.get("/filesmanager/image/" + fid + "/" + style);
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
  setConfig(config) {
    this.config = config;
  },
  /**
   *
   * @param {String} container_name
   */
  getContainer(container_name) {
    var template = NoContainer;
    switch (container_name) {
      case "simple_card":
        template = SimpleCard;
        break;

      case "accordion_card":
        template = AccordionCard;
        break;
    }
    return template;
  },
};
