<template>
  <div :class="classCss" class="complexe_field">
    <h4 v-show="!showFormEdit">{{ field.label }}</h4>
    <div v-show="!showFormEdit" :id="idHtml" class="pb-3 field-mutiple">
      <div
        v-for="(val, k) in value_computed"
        :key="k"
        class="field-item-value mb-4 item"
      >
        <div class="bg-light p-4 px-5">
          <div class="d-flex justify-content-between align-items-center">
            <div class="text">
              <div class="font-weight-bold">{{ val.value }}</div>
              <div class="d-flex">
                <span>{{ val.company }}</span>
                <span class="d-inline-block pl-3">
                  {{ getDateInFrench(val.date_debut) }}
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
    <EditExperienceType
      v-if="showFormEdit"
      :f-value="currentEditValue"
      :field="field"
      @closeEditForm="closeEditForm"
      @updateValue="updateValue"
    ></EditExperienceType>
  </div>
</template>
<script>
import EditExperienceType from "../Ressouces/EditExperienceType.vue";
import DrapDropHtml5 from "../../js/drap-drop-html5";
const defaultValue = () => {
  const date = new Date();
  var date_string = date.getTime() / 1000;
  return {
    value: "Developpeur web",
    company: "Wb-Horizon",
    address: "Paris France",
    date_debut: date_string,
    date_fin: date_string,
    description: "Votre description ...",
    format: null,
  };
};
export default {
  name: "ExperienceType",
  components: {
    EditExperienceType,
  },
  props: {
    classCss: {
      type: [Array],
      default: function () {
        return [];
      },
    },
    addButtonTitle: {
      type: String,
      default: "Ajouter",
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
      idHtml: "sort-" + Math.random().toString(36),
      currentEditValue: {},
      showFormEdit: false,
      sortable: null,
      timer: null,
    };
  },
  computed: {
    event_name() {
      return "drap-drop-html5" + this.idHtml;
    },
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
    value_computed: {
      get() {
        return this.model[this.field.name];
      },
      /**
       * Peut etre un bug, mais le computed ne vois pas les modifications au niveaux des cles des objets.
       */
      set() {},
    },
  },
  watch: {
    // pour faire le sort.
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
    /**
     * --
     */
    destroyedSortable() {
      if (this.sortable) {
        this.sortable.destroyed();
        this.sortable = null;
      }
    },
    /**
     * --
     */
    initSortable() {
      if (!this.sortable) {
        this.sortable = new DrapDropHtml5(
          document.getElementById(this.idHtml),
          { event_name: this.event_name }
        );
        this.sortable.sortable();
      }
    },
    getDateInFrench(val) {
      val = parseInt(val) * 1000;
      if (val) {
        const date = new Date();
        date.setTime(val);
        var date_string = date.getDate();
        date_string += "-";
        date_string += parseInt(date.getMonth()) + 1;
        date_string += "-";
        date_string += date.getFullYear();
        return date_string;
      } else return;
    },
    setValue(vals) {
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
