<template>
  <div :class="classCss">
    <ValidationProvider v-slot="v" :name="fullname" :rules="getRules()">
      <b-form-group
        :label="field.label"
        :description="field.description"
        :class="size ? 'size-' + size : ''"
      >
        <input :id="idHtml" class="form-control" />
        <span :id="idHtmlValid" class="d-none">✓ Valid</span>
        <span :id="idHtmlError" class="d-none"></span>
      </b-form-group>
      <div v-if="v.errors && v.errors.length > 0" class="text-danger my-2">
        <small v-for="(error, ii) in v.errors" :key="ii" class="d-block">
          {{ error }}
        </small>
      </div>
    </ValidationProvider>
  </div>
</template>

<script>
import "../../assets/scss/PhoneInternational.scss";
import intlTelInput from "intl-tel-input";
import { ValidationProvider } from "vee-validate";
import "./vee-validation-rules";
import loadField from "./loadField";
export default {
  name: "PhoneInternational",
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
    // permet de definir la taille du bouton,
    // sm,md,lg
    size: {
      type: [String],
      default: "md",
    },
  },
  data() {
    return {
      idHtml: "phoneint-" + Math.random().toString(36).slice(2),
      idHtmlError: "phoneerr-" + Math.random().toString(36).slice(2),
      idHtmlValid: "phonevalid-" + Math.random().toString(36).slice(2),
      timeout: null,
    };
  },
  computed: {
    fullname() {
      return this.parentName + this.field.name;
    },
  },
  mounted() {
    this.initPhone();
  },
  methods: {
    initPhone() {
      //
      const input = document.querySelector("#" + this.idHtml);
      const errorMsg = document.querySelector("#" + this.idHtmlError);
      const validMsg = document.querySelector("#" + this.idHtmlValid);
      // here, the index maps to the error code returned from getValidationError - see readme
      // const errorMap = [
      //   "Invalid number",
      //   "Invalid country code",
      //   "Too short",
      //   "Too long",
      //   "Invalid number",
      // ];
      // initialise plugin
      const iti = intlTelInput(input, {
        separateDialCode: true,
        preferredCountries: ["fr"],
        initialCountry: "auto",
        nationalMode: true,
        formatOnDisplay: true,
        geoIpLookup: (callback) => {
          fetch("https://ipapi.co/json")
            .then((res) => res.json())
            .then((data) => callback(data.country_code))
            .catch(() => callback("us"));
        },
        utilsScript:
          "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/18.1.7/js/utils.min.js",
      });
      // set default number
      const number = this.getValue();
      if (number && number !== null) {
        iti.setNumber(number);
      }

      const reset = () => {
        input.classList.remove("error", "is-invalid");
        errorMsg.innerHTML = "";
        errorMsg.classList.add("d-none");
        validMsg.classList.add("d-none");
      };
      // on blur: validate
      input.addEventListener("blur", () => {
        reset();
        if (input.value.trim()) {
          if (iti.isValidNumber()) {
            // validMsg.classList.remove("d-none");
          } else {
            // input.classList.add("error", "is-invalid");
            // const errorCode = iti.getValidationError();
            // if (errorMap[errorCode]) errorMsg.innerHTML = errorMap[errorCode];
            // errorMsg.classList.remove("d-none");
          }
        }
      });
      // on keyup / change flag: reset
      input.addEventListener("change", reset);
      input.addEventListener("keyup", () => {
        reset();
        const vals = [];
        vals.push({ value: iti.getNumber() });
        this.setValue(vals);
      });
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
        return this.model[this.field.name][0].value;
      } else return null;
    },
  },
};
</script>
