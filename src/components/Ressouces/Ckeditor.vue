<template>
  <div>
    <label :for="ckName">{{ label }}</label>
    <ckeditor
      v-model="content"
      :name="ckName"
      :config="editorConfig"
      :editor-url="editorUrl"
      @input="updateContent"
      @namespaceloaded="onNamespaceLoaded"
    ></ckeditor>
  </div>
</template>

<script>
import CKEditor from "ckeditor4-vue";
import ckeditorConfig from "./ckeditor-config";
export default {
  name: "CkeditorComponent",
  components: {
    ckeditor: CKEditor.component,
  },
  props: {
    ckName: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      content: this.value,
      editorUrl: ckeditorConfig.editorUrl(),
      preEditorConfig: ckeditorConfig.preEditorConfig(),
    };
  },
  computed: {
    editorConfig() {
      var extraPlugins =
        "quickuploader, codesnippet, print,format,font,colorbutton,justify,image,filebrowser,stylesheetparser,undo";
      return {
        extraPlugins: extraPlugins,
        ...this.preEditorConfig,
      };
    },
  },
  methods: {
    updateContent() {
      this.$emit("input", this.content);
    },
    onNamespaceLoaded(CKEDITOR) {
      ckeditorConfig.onNamespaceLoaded(CKEDITOR);
    },
  },
};
</script>

<style scoped>
/* Ajoutez ici vos styles personnalisés */
</style>
