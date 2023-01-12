<template>
  <div>
    <multiselect
      v-model="model.value"
      :options="options"
      :custom-label="nameWithLang"
      placeholder=""
      label="text"
      track-by="text"
      :show-no-results="false"
      :show-labels="false"
      :loading="isLoading"
      @search-change="asyncFind"
      @select="selectUser"
    >
      <template slot="noResult">
        <span class="option__titl d-none"> Aucun contenu </span>
      </template>
      <template slot="placeholder">
        <span class="option__title"> Le terme n'existe pas </span>
      </template>
      <template slot="noOptions">
        <span class="option__title"> Saisir un terme </span>
      </template>
    </multiselect>
  </div>
</template>
<script>
export default {
  name: "MultiSelectEntities",
};
</script>
