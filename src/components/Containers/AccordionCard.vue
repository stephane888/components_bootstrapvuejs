<template>
  <b-card :class="classEntity" no-body>
    <b-card-header
      header-tag="header"
      class="p-1"
      role="tab"
      header-bg-variant="info"
      header-text-variant="light"
    >
      <div
        v-b-toggle="idAcordion"
        class="align-items-center d-flex justify-content-between"
      >
        <h4 class="mb-0 px-4 py-2">
          {{ entity.label }}
        </h4>
        <div class="px-4">
          <b-icon
            v-if="!isOpen"
            icon="chevron-double-down"
            class="light"
            font-scale="1.2"
          ></b-icon>
          <b-icon
            v-if="isOpen"
            icon="chevron-double-up"
            class="light"
            font-scale="1.2"
          ></b-icon>
        </div>
      </div>
    </b-card-header>
    <b-collapse
      :id="idAcordion"
      :accordion="accordionContainer"
      role="tabpanel"
    >
      <b-card-body>
        <slot></slot>
      </b-card-body>
    </b-collapse>
  </b-card>
</template>

<script>
export default {
  name: "AccordionCard",
  props: {
    entity: {
      type: Object,
      required: true,
    },
    classEntity: {
      type: [Object, Array],
      default: function () {
        return [];
      },
    },
    accordionContainer: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      idAcordion: "accd-item-" + Math.random().toString(36).slice(2),
      isOpen: false,
    };
  },
  mounted() {
    this.$root.$on("bv::collapse::state", (collapseId, isJustShown) => {
      if (collapseId == this.idAcordion) this.isOpen = isJustShown;
    });
  },
};
</script>
