<template>
  <div :class="classCss">
    <b-form-group :label="field.label" :description="field.description">
      <div>
        <component
          :is="container.template"
          v-for="(container, i) in buildFields()"
          :key="i"
          :entity="container.entity"
          :class-entity="['pt-1']"
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
            namespace-store=""
            @addNewValue="addNewValue($event, render)"
            @removeField="removeField($event, render)"
            @array_move="array_move($event, render)"
          ></component>
        </component>
      </div>
    </b-form-group>
  </div>
</template>

<script>
import generateField from "../../js/FormUttilities";
import loadfield from "./loadField";
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
  methods: {
    buildFields() {
      var fields = [];
      console.log(
        "CreationSitevirtuelComplexinline . currentEntityForm  :",
        this.entities,
        loadfield
      );
      if (this.entities.length) {
        fields = generateField.generateFields(this.entities, fields);
      }
      return fields;
    },
  },
};
</script>
