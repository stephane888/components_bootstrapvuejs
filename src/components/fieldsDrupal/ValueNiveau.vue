<template>
  <div :class="classCss" class="complexe_field">
    <h4 v-show="!showFormEdit">{{ field.label }}</h4>
    <div v-show="!showFormEdit" :id="idHtml" class="pb-3 field-mutiple">
      <div
        v-for="(val, k) in value_computed"
        :key="k"
        class="field-item-value mb-4"
      >
        <div class="bg-light p-4 px-5">
          <div class="d-flex justify-content-between align-items-center">
            <div v-if="val" class="text">
              <div
                v-if="val && val.target_id && terms['tid-' + val.target_id]"
                class="font-weight-bold"
              >
                {{ terms["tid-" + val.target_id].name }}
              </div>
              <i
                v-if="!terms['tid-' + val.target_id]"
                class="text-muted font-weight-bold"
              >
                Compétence ...
              </i>
              <div class="d-flex">
                <span>
                  {{ field.settings.niveau_options[val.niveau] }}
                </span>
              </div>
            </div>

            <div class="icon-buttons">
              <span
                v-b-tooltip.hover
                variant="light"
                class="btn-action mr-5"
                title="Editer"
                @click="Edit(val)"
              >
                <b-icon
                  icon="pencil-fill"
                  variant="secondary"
                  font-scale="1"
                  class=""
                ></b-icon>
              </span>
              <span
                v-b-tooltip.hover
                variant="light"
                title="Glisser-déposer"
                class="btn-action btn-drag-drop mr-5"
              >
                <b-icon
                  icon="arrows-move"
                  variant="secondary"
                  font-scale="1"
                  class=""
                ></b-icon>
              </span>
              <span
                v-b-tooltip.hover
                variant="light"
                class="btn-action mr-4"
                title="Supprimer"
                @click="removeField(k)"
              >
                <b-icon
                  icon="trash-fill"
                  variant="secondary"
                  font-scale="1"
                  class=""
                ></b-icon>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-show="!showFormEdit" class="add-new-card" @click="add">
      <div class="anc-content d-flex align-items-center">
        <b-icon
          icon="plus-circle-fill"
          font-scale="1.5"
          class="text-info"
        ></b-icon>
        <h4 class="anc-titre">{{ addButtonTitle }}</h4>
      </div>
    </div>
    <EditValueNiveau
      v-if="showFormEdit"
      :f-value="currentEditValue"
      :field="field"
      :terms="terms"
      @closeEditForm="closeEditForm"
      @setValue="setValue"
      @addTermsInCache="addTermsInCache"
    ></EditValueNiveau>
  </div>
</template>

<script>
import termsTaxo from "drupal-vuejs/src/App/jsonApi/termsTaxo.js";
import EditValueNiveau from "../Ressouces/EditValueNiveau.vue";
import DrapDropHtml5 from "../../js/drap-drop-html5";
const defaultValue = () => {
  return {
    target_id: null,
    niveau: 1,
  };
};
export default {
  name: "ValueNiveau",
  components: {
    EditValueNiveau,
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
    addButtonTitle: {
      type: String,
      default: "Ajouter",
    },
  },
  data() {
    return {
      idHtml: "sort-" + Math.random().toString(36).slice(2),
      currentEditValue: {},
      showFormEdit: false,
      /**
       * Contient les termes recuperés.
       * ( Evite d'effectuer pluiseurs requetes pour un meme terme )
       */
      terms: {},
      sortable: null,
      timer: null,
    };
  },
  computed: {
    event_name() {
      return "drap-drop-html5" + this.idHtml;
    },
    value_computed: {
      get() {
        return this.model[this.field.name];
      },
      /**
       * Peut etre un bug, mais le computed ne vois pas les modifications au niveaux des cles des objets.
       */
      set() {},
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
    model: {
      handler: function () {
        this.destroyedSortable();
        setTimeout(() => {
          this.initSortable();
        }, 500);
      },
      deep: true,
    },
  },
  mounted() {
    this.initSortable();
    this.drap_drop_event();
    this.loadDefaults();
  },
  methods: {
    add() {
      this.value_computed.push(defaultValue());
      this.destroyedSortable();
      // On edite directement cette valeur.
      this.Edit(this.value_computed[this.value_computed.length - 1]);
    },
    //
    removeField(index) {
      this.value_computed.splice(index, 1);
    },
    Edit(value) {
      this.currentEditValue = value;
      this.showFormEdit = true;
    },
    closeEditForm() {
      this.showFormEdit = false;
    },
    getTermByTid(tid) {
      if (!this.terms["tid-" + tid]) {
        // Doit etre dynamique.
        let vocabulary = this.getFistVocab();
        const terms = new termsTaxo(vocabulary);
        terms.getValueByTid(tid).then((resp) => {
          if (resp.data[0] && resp.data[0].attributes)
            this.$set(this.terms, "tid-" + tid, resp.data[0].attributes);
          else this.$set(this.terms, "tid-" + tid, {});
        });
      }
    },
    getFistVocab() {
      if (this.field.settings.target_bundles) {
        return this.field.settings.target_bundles;
      } else return null;
    },
    addTermsInCache(vals) {
      vals.forEach((term) => {
        if (!this.terms["tid-" + term.attributes.drupal_internal__tid]) {
          this.$set(
            this.terms,
            "tid-" + term.attributes.drupal_internal__tid,
            term.attributes
          );
        }
      });
    },
    loadDefaults() {
      this.model[this.field.name].forEach((item) => {
        this.getTermByTid(item.target_id);
      });
    },
    /**
     * On passe les données valides au champs.
     */
    setValue() {
      const vals = [];
      // suppression des donnée non valide.
      this.model[this.field.name].forEach((item) => {
        if (item.target_id) {
          vals.push(item);
        }
      });
      if (this.namespaceStore) {
        this.$store.dispatch(this.namespaceStore + "/setValue", {
          value: vals,
          fieldName: this.field.name,
        });
      } else
        this.$store.dispatch("setValue", {
          value: vals,
          fieldName: this.field.name,
        });
    },
    drap_drop_event() {
      document.addEventListener(
        this.event_name,
        (even) => {
          if (even.detail) {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
              this.array_move(even.detail);
            }, 150);
          }
        },
        false
      );
    },
    destroyedSortable() {
      if (this.sortable) {
        this.sortable.destroyed();
        this.sortable = null;
      }
    },
    initSortable() {
      if (!this.sortable) {
        this.sortable = new DrapDropHtml5(
          document.getElementById(this.idHtml),
          { event_name: this.event_name }
        );
        this.sortable.sortable();
      }
    },
    updateValue() {
      if (this.cardinality) {
        this.setValue(this.value_computed);
      } else {
        let vals = this.value_computed;
        if (vals[0]) vals = this.value_computed[0];
        this.setValue(vals);
      }
    },
    /**
     * Ne fonctionne pas assez bien.
     * @param {*} evt
     */
    array_move(evt) {
      const moveItem = (arr, fromIndex, toIndex) => {
        let itemRemoved = arr.splice(fromIndex, 1); // assign the removed item as an array
        arr.splice(toIndex, 0, itemRemoved[0]); // insert itemRemoved into the target index
        return arr;
      };
      const vals = moveItem(this.value_computed, evt.oldIndex, evt.newIndex);
      console.log(" vals : ", vals);
      //
      this.updateValue();
    },
  },
};
</script>
<style lang="scss" scoped>
@use "../../assets/scss/drap-drop.scss";
</style>
