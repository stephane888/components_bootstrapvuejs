<!--
Remplir la date par defaut avec vuejs n'est pas efficace et peux entrainer de mauvaise données.
-->
<template>
  <div :class="classCss">
    <ValidationProvider :name="fullname" :rules="getRules()" v-slot="v">
      <label for="input-date-fin">
        {{ field.label }}
      </label>
      <b-row class="date-range">
        <b-col md="6">
          <b-input-group>
            <b-form-datepicker
              v-model="date.value"
              type="text"
              placeholder="Selectionner une date"
              required
              locale="fr"
              :date-format-options="{
                year: 'numeric',
                month: 'short',
                day: '2-digit',
              }"
              @input="date_change"
            ></b-form-datepicker>
            <b-form-input
              v-if="field.type != 'datetime_default'"
              :id="'b-' + idHtml"
              v-model="date.hour_begin"
              type="text"
              placeholder="HH:mm:ss"
              class="input-time"
              @input="date_change"
            ></b-form-input>
            <b-input-group-append v-if="field.type != 'datetime_default'">
              <b-form-timepicker
                v-model="date.hour_begin"
                button-only
                right
                show-seconds
                locale="fr"
                :aria-controls="'b-' + idHtml"
                @input="date_change"
              ></b-form-timepicker>
            </b-input-group-append>
          </b-input-group>
        </b-col>
        <b-col v-if="field.type == 'daterange_default'" md="6">
          <b-input-group>
            <b-form-datepicker
              v-model="date.end_value"
              type="text"
              placeholder="Selectionner une date"
              required
              locale="fr"
              :date-format-options="{
                year: 'numeric',
                month: 'short',
                day: '2-digit',
              }"
              @input="date_change"
            ></b-form-datepicker>
            <b-form-input
              :id="'e-' + idHtml"
              v-model="date.hour_end"
              type="text"
              placeholder="HH:mm:ss"
              class="input-time"
              @input="date_change"
            ></b-form-input>
            <b-input-group-append>
              <b-form-timepicker
                v-model="date.hour_end"
                button-only
                right
                show-seconds
                locale="fr"
                :aria-controls="'e-' + idHtml"
                @input="date_change"
              ></b-form-timepicker>
            </b-input-group-append>
          </b-input-group>
        </b-col>
      </b-row>
      <small class="form-text text-muted">{{ field.description }}</small>
      <div v-if="v.errors" class="text-danger my-2">
        <small v-for="(error, ii) in v.errors" :key="ii" class="d-block">
          {{ error }}
        </small>
      </div>
    </ValidationProvider>
  </div>
</template>

<script>
import { ValidationProvider } from "vee-validate";
import "./vee-validation-rules";
import loadField from "./loadField";
export default {
  name: "DateRange",
  components: {
    ValidationProvider,
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
      // format pour D9.5.0 >= 2023-01-03T09:23:48
      date: { value: null, end_value: null, hour_begin: "", hour_end: "" },
      idHtml: "time-" + Math.random().toString(36),
      timeout: null,
      /**
       * On a deux format de sauvegarde, celui definit par string (YYYY-MM-DDTHH:mm:ss qui n'est pas un format normalisé)
       * et celui definit par un integer (timeStamp).
       * Pour l'instant compliqué de determiner qu'elle est le format qui doit etre utiliser.
       * Donc, l'approche c'est de determiner le type à partir de la valeur par defaut.
       * Par defaut, on conidere que c'est du string(pour etre compatible avec drupal >= 9.5.9).
       */
      checkFormatDate: "string",
    };
  },
  computed: {
    fullname() {
      return this.parentName + this.field.name;
    },
  },
  watch: {
    /**
     * Lorsque le champs est constrit via les boucle dynamique,
     * le template n'est pas reconstruit du coup la valeur du precedent champs est concerservé.
     * On applique ce watch et on verra les resultats.
     * Cela ne s'execute que dans le cadre d'un watch et permet de ressoudre le probleme.
     */
    field() {
      this.date = this.getValue();
    },
  },
  mounted() {
    // On recupere la valeur par defaut pour chaque construction:
    this.date = this.getValue();
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
    /**
     *
     */
    getValue() {
      // console.log("date range : ", this.model[this.field.name]);
      if (
        this.model[this.field.name] &&
        this.model[this.field.name][0] &&
        this.model[this.field.name][0].value
      ) {
        const D_b = this.checkValue(this.model[this.field.name][0].value);
        const val = { value: D_b.date, hour_begin: D_b.hour };
        if (this.field.type == "daterange_default") {
          const D_f = this.checkValue(this.model[this.field.name][0].end_value);
          val["end_value"] = D_f.date;
          val["hour_end"] = D_f.hour;
        }
        return val;
      } else
        return { value: null, end_value: null, hour_begin: "", hour_end: "" };
      // pas necessaire ( car entrainne des mauvaises données )
      // else return this.currentDate();
    },
    checkValue(data) {
      let value = parseInt(data);
      if (value > 326636489) {
        this.checkFormatDate = "int";
        return this.getDateFromDateTimeStamp(data);
      } else {
        let date = new Date(data);
        if (date) {
          this.checkFormatDate = "string";
          return this.getDateFromDateTimeStamp(date.getTime() / 1000);
        }
      }
    },

    /**
     *
     * @param {*} DateTimeStamp
     */
    getDateFromDateTimeStamp(DateTimeStamp) {
      const date = new Date();
      date.setTime(parseInt(DateTimeStamp) * 1000);
      let month = parseInt(date.getMonth()) + 1;
      return {
        date:
          date.getFullYear() +
          "-" +
          ("0" + month).slice(-2) +
          "-" +
          date.getDate(),
        hour:
          ("0" + date.getHours()).slice(-2) +
          ":" +
          ("0" + date.getMinutes()).slice(-2) +
          ":" +
          ("0" + date.getSeconds()).slice(-2),
      };
    },

    /**
     * @deprecated pas utiliser ( car entrainne des mauvaise données )
     * Permet d'ajouter la date encours ou date par defaut si vide.
     */
    currentDate() {
      const date = new Date();
      let month = parseInt(date.getMonth()) + 1;
      const val = {
        value: date.getFullYear() + "-" + month + "-" + date.getDate(),
        hour_begin:
          date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(),
      };
      if (this.field.type == "daterange_default") {
        val["end_value"] =
          date.getFullYear() + "-" + month + "-" + date.getDate();
        val["hour_end"] =
          date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      }
      return val;
    },
    /**
     *
     */
    date_change() {
      const vals = [];
      if (this.date.value) {
        const dateDebut = new Date(
          this.date.value + " " + this.date.hour_begin
        );
        if (this.checkFormatDate == "string")
          vals.push({ value: this.date.value + "T" + this.date.hour_begin });
        else vals.push({ value: dateDebut.getTime() / 1000 });
      }
      //
      if (this.date.end_value && this.field.type == "daterange_default") {
        const dateFin = new Date(
          this.date.end_value + " " + this.date.hour_end
        );
        if (this.checkFormatDate == "string")
          vals.push({
            end_value: this.date.end_value + "T" + this.date.hour_end,
          });
        else vals.push({ end_value: dateFin.getTime() / 1000 });
      }
      this.setValue(vals);
    },
  },
};
</script>
<style lang="scss" scoped>
.date-range {
  .input-time {
    width: 100%;
    max-width: 85px;
    padding-right: 0.5rem;
  }
}
</style>
