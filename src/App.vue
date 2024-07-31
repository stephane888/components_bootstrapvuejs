<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
    <div class="my-5">
      <form-drag-drop></form-drag-drop>
    </div>
  </div>
</template>

<script>
import FormDragDrop from "./components/forms/FormDragDrop.vue";
export default {
  name: "App",
  components: { FormDragDrop },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
