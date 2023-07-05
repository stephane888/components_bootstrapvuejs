<template>
  <div :class="classCss">
    <b-form-group :label="field.label" :description="field.description">
      <div class="accordion" role="tablist">
        <component
          :is="container.template"
          v-for="(container, i) in fields"
          :key="i"
          :entity="container.entity"
          :class-entity="['pt-1']"
          :accordion-container="idAcordion"
          class="mb-3"
        >
          <component
            :is="render.template"
            v-for="(render, k) in container.fields"
            :key="k"
            :field="render.field"
            :model="render.model"
            :entities="render.entities"
            :class-css="['mb-5']"
            :parent-name="parentChildName + field.name + '.' + i + '.entity.'"
            :parent-child-name="
              parentChildName + field.name + '.' + i + '.entities.'
            "
            namespace-store=""
            @addNewValue="addNewValue($event, render)"
            @removeField="removeField($event, render)"
            @array_move="array_move($event, render)"
          ></component>
        </component>
        <small v-if="fields.length == 0" class="text-muted py-2">
          Aucune section
        </small>
      </div>
    </b-form-group>
  </div>
</template>

<script>
import generateField from "../../js/FormUttilities";
export default {
  name: "CreationSitevirtuelComplexinline",
  props: {
    classCss: {
      type: [Array],
      default: function () {
        return [];
      },
    },
    field: { type: Object, required: true },
    model: { type: [Object, Array], required: true },
    entities: { type: Array, required: true },
    namespaceStore: { type: String, required: true },
    parentChildName: {
      type: String,
      required: true,
    },
    parentName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      idAcordion: "accordion-" + Math.random().toString(36).slice(2),
      fields: [],
    };
  },
  mounted() {
    this.buildFields();
  },
  methods: {
    buildFields() {
      var fields = [];
      this.$store.commit("RUN_BUILDING_FIELDS");
      if (this.entities && this.entities.length) {
        generateField
          .generateFields(this.entities, fields, "accordion_card")
          .then((resp) => {
            console.log(" sub fields : ", resp);
            this.fields = resp;
          });
      }
    },
  },
};
</script>
