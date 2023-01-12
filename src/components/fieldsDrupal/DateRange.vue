<template>
  <div :class="classCss">
    <ValidationProvider :name="fullname" :rules="getRules()" v-slot="v">
      <label for="input-date-fin">
        {{ field.label }}
      </label>
      <b-row>
        <b-col md="6">
          <b-input-group>
            <b-form-datepicker
              v-model="date.value"
              type="text"
              placeholder="Date de début"
              required
              locale="fr"
              :date-format-options="{
                year: 'numeric',
                month: 'short',
                day: '2-digit',
              }"
              @input="date_change_debut"
            ></b-form-datepicker>
            <b-form-input
              :id="'b-' + idHtml"
              v-model="date.hour_begin"
              type="text"
              placeholder="HH:mm:ss"
              class="input-time"
            ></b-form-input>
            <b-input-group-append>
              <b-form-timepicker
                v-model="date.hour_begin"
                button-only
                right
                show-seconds
                locale="fr"
                :aria-controls="'b-' + idHtml"
              ></b-form-timepicker>
            </b-input-group-append>
          </b-input-group>
        </b-col>
        <b-col md="6">
          <b-input-group>
            <b-form-datepicker
              v-model="date.end_value"
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
            <b-form-input
              :id="'e-' + idHtml"
              v-model="date.hour_end"
              type="text"
              placeholder="HH:mm:ss"
              class="input-time"
            ></b-form-input>
            <b-input-group-append>
              <b-form-timepicker
                v-model="date.hour_end"
                button-only
                right
                show-seconds
                locale="fr"
                :aria-controls="'e-' + idHtml"
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
    getValue() {
      if (this.model[this.field.name] && this.model[this.field.name][0]) {
        return {
          value: this.model[this.field.name][0].value,
          end_value: this.model[this.field.name][0].end_value,
        };
      } else return this.currentDate();
    },
    currentDate() {
      const date = new Date();
      let month = parseInt(date.getMonth()) + 1;
      return {
        value: date.getFullYear() + "-" + month + "-" + date.getDate(),
        end_value: date.getFullYear() + "-" + month + "-" + date.getDate(),
        hour_begin:
          date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(),
        hour_end:
          date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(),
      };
    },
    date_change_debut() {
      console.log("date_change_debut : ", this.date);
      const vals = [];
      if (this.date.value) {
        const dateDebut = new Date(
          this.date.value + " " + this.date.hour_begin
        );
        vals.push({ value: dateDebut.getTime() / 1000 });
      }
      //
      if (this.date.end_value) {
        const dateFin = new Date(
          this.date.end_value + " " + this.date.hour_end
        );
        vals.push({ end_value: dateFin.getTime() / 1000 });
      }
      this.setValue(vals);
    },
  },
};
</script>
<style lang="scss" scoped>
.input-time {
  width: 100%;
  max-width: 85px;
}
</style>
