<template>
  <div :class="classCss">
    <h4 v-show="!showFormEdit" class="font-weight-bold">{{ field.label }}</h4>
    <div v-show="!showFormEdit" :id="idHtml" class="pb-3 field-mutiple">
      <div
        v-for="(val, k) in model[field.name]"
        :key="k"
        class="field-item-value mb-4"
      >
        <div class="bg-light p-4 px-5">
          <div class="d-flex justify-content-between align-items-center">
            <div class="text">
              <div class="font-weight-bold">{{ val.value }}</div>
              <div class="d-flex">
                <span>{{ val.company }}</span> <span>{{ val.date_debut }}</span>
              </div>
            </div>
            <div class="icon-buttons" @click="Edit(val)">
              <span
                v-b-tooltip.hover
                variant="light"
                class="btn-action mr-5"
                title="Editer"
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
    ></EditExperienceType>
  </div>
</template>
<script>
import Sortable from "sortablejs";
import EditExperienceType from "../Ressouces/EditExperienceType.vue";
const defaultValue = () => {
  return {
    value: "Developpeur web",
    company: "Nutibe",
    address: "",
    date_debut: "",
    date_fin: "",
    description: "Array",
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
  },
  data() {
    return {
      idHtml: "sort-" + Math.random().toString(36),
      currentEditValue: {},
      showFormEdit: false,
    };
  },
  mounted() {
    var el = document.getElementById(this.idHtml);
    Sortable.create(el, {
      animation: 150,
      handle: ".btn-drag-drop",
      ghostClass: "blue-background-class",
    });
  },
  methods: {
    input(v) {
      const vals = [];
      vals.push({ value: v });
      // this.setValue(vals);
    },
    //
    add() {
      this.$emit("addNewValue", defaultValue());
    },
    //
    removeField(index) {
      console.log("removeField : ", index);
      this.$emit("removeField", index);
    },
    Edit(value) {
      this.currentEditValue = value;
      this.showFormEdit = true;
    },
    closeEditForm() {
      this.showFormEdit = false;
    },
  },
};
</script>
<style scoped lang="scss">
.btn-drag-drop {
  cursor: pointer;
}
.add-new-card {
  display: flex;
  box-sizing: border-box;
  -webkit-box-align: center;
  width: 100%;
  align-items: center;
  padding: 8px 14px;
  border-radius: 4px;
  min-height: 60px;
  cursor: pointer;
  transition: all 0.2s ease-in-out 0s;
  box-shadow: none;
  background-color: transparent;
  border: 2px dashed rgb(183, 220, 250);
  &:active {
    background: rgb(30, 109, 109);
  }
  .anc-titre {
    font-size: 18px;
    line-height: 24px;
    font-weight: 600;
    letter-spacing: 0.15px;
    color: rgb(38, 160, 244);
    max-width: 100%;
    padding: 0px 12px;
    margin: 0px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
