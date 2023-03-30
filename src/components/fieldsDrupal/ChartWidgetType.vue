<template>
  <div :class="classCss">
    <ValidationProvider v-slot="v" :name="fullname" :rules="getRules()">
      <div class="border p-2 container-field">
        <div
          class="header d-flex align-items-center justify-content-between px-3 mb-3"
        >
          <label class="pt-2" v-html="field.label"></label>
          <div>
            <b-button
              v-if="cardinality"
              variant="outline-info"
              size="sm"
              class="p-0 border-0"
              @click="add"
            >
              <b-icon icon="plus-square" font-scale="2"></b-icon>
            </b-button>
          </div>
        </div>
        <div
          v-for="(val, i) in input_value"
          :key="i"
          class="px-3 pt-3 field-item-value"
        >
          <b-button
            v-if="cardinality"
            variant="outline-danger"
            size="sm"
            class="p-0 border-0 elt-remove"
            @click="remove(i)"
          >
            <b-icon icon="trash" font-scale="1"></b-icon>
          </b-button>
          <b-form-group :label="field.settings.label_1">
            <b-form-input
              v-model="val.label"
              :placeholder="field.placeholder"
              :name="fullname + '.' + i"
              debounce="2500"
              @input="setValue"
            ></b-form-input>
            <div v-if="v.errors" class="text-danger my-2">
              <small v-for="(error, ii) in v.errors" :key="ii" class="d-block">
                {{ error }}
              </small>
            </div>
          </b-form-group>
          <b-form-group :label="field.settings.label_2">
            <b-form-input
              v-model="val.value"
              type="number"
              min="0"
              max="100"
              @input="setValue"
            ></b-form-input>
            <div v-if="v.errors" class="text-danger my-2">
              <small v-for="(error, ii) in v.errors" :key="ii" class="d-block">
                {{ error }}
              </small>
            </div>
          </b-form-group>
          <b-form-group :label="field.settings.label_3">
            <b-form-input v-model="val.color" type="color"></b-form-input>
            <div v-if="v.errors" class="text-danger my-2">
              <small v-for="(error, ii) in v.errors" :key="ii" class="d-block">
                {{ error }}
              </small>
            </div>
          </b-form-group>
        </div>
        <div v-html="field.description"></div>
      </div>
    </ValidationProvider>
  </div>
</template>

<script>
import { ValidationProvider } from "vee-validate";
import "./vee-validation-rules";
import loadField from "./loadField";
const input_default = {
  label: "",
  value: "",
  color: "",
};
export default {
  name: "DrupalString",
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
      input_value: null,
      timeout: null,
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
    setValue() {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        if (this.namespaceStore) {
          this.$store.dispatch(this.namespaceStore + "/setValue", {
            value: this.input_value,
            fieldName: this.fullname,
          });
        } else
          this.$store.dispatch("setValue", {
            value: this.input_value,
            fieldName: this.fullname,
          });
      }, loadField.timeToWait);
    },
    getValue() {
      if (this.model[this.field.name] && this.model[this.field.name][0]) {
        return this.model[this.field.name];
      } else return [input_default];
    },

    add() {
      this.input_value.push(input_default);
    },
    remove(index) {
      this.input_value.splice(index, 1);
    },
  },
};
</script>
