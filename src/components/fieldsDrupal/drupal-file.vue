<template>
  <div class="vuejs-uploader" :class="classCss">
    <ValidationProvider :name="field.name" :rules="getRules()" v-slot="v">
      <b-form-group :label="field.label" :description="field.description">
        <b-form-file
          v-model="files"
          placeholder="Ajouter un fichier ..."
          drop-placeholder="Drop file here..."
          :multiple="cardinality"
          accept=".jpg, .png, .gif, webp"
          size="sm"
          :state="getValidationState(v)"
          @input="previewImage"
        ></b-form-file>
      </b-form-group>
    </ValidationProvider>

    <div class="previews">
      <div v-for="(fil, i) in toUplode" :key="i">
        <b-img
          :src="fil.url"
          fluid
          alt="Fluid image"
          thumbnail
          class="img-preview"
        ></b-img>
      </div>
    </div>
  </div>
</template>

<script>
import "../../assets/scss/upload.scss";
import request from "./loadField";
import { ValidationProvider } from "vee-validate";
import "./vee-validation-rules";

export default {
  name: "UploaderFile",
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
  },

  data() {
    return {
      // Fichiers provenant de l'action utilisateur.
      files: [],
      // Fichiers pour la preview.
      urls: [],
      // Fichiers qui doivent etre uploader
      toUplode: [],
    };
  },
  computed: {
    cardinality() {
      if (this.field.cardinality === -1) {
        return true;
      } else {
        return false;
      }
    },
  },
  mounted() {
    console.log("request in file : ", request);
    this.getValue();
  },
  methods: {
    /**
     *
     * @param {*} param0
     */
    getValidationState({ dirty, validated, valid = null }) {
      return (dirty || validated) && !valid ? valid : null;
    },
    /**
     *
     */
    getRules() {
      return request.getRules(this.field);
    },
    /**
     *
     * @param {*} files
     */
    previewImage(files) {
      // preview
      var reader = new FileReader();
      if (this.cardinality) {
        for (const i in files) {
          const file = files[i];
          // Send images.
          request.config.postFile("/filesmanager/post", file).then((resp) => {
            reader.onload = (read) => {
              this.toUplode.push({
                file: file,
                status: resp,
                error: 0,
                url: read.target.result,
              });
            };
            reader.readAsDataURL(file);
          });
        }
      } else {
        const vals = [];
        this.toUplode = [];
        request.config.postFile("/filesmanager/post", files).then((resp) => {
          this.$store.commit(this.namespaceStore + "/ACTIVE_RUNNING");
          reader.onload = (read) => {
            this.toUplode.push({
              file: files,
              status: resp,
              error: 0,
              url: read.target.result,
            });
            setTimeout(() => {
              this.$store.commit(this.namespaceStore + "/DISABLE_RUNNING");
            }, 300);
          };
          reader.readAsDataURL(files);
          vals.push({ target_id: resp.id });
          this.setValue(vals);
        });
      }
    },
    setValue(vals) {
      if (this.namespaceStore) {
        this.$store.dispatch(this.namespaceStore + "/setValue", {
          value: vals,
          fieldName: this.field.name,
        });
      } else
        this.$store.dispatch({
          value: vals,
          fieldName: this.field.name,
        });
    },
    getValue() {
      if (this.model[this.field.name] && this.model[this.field.name].length) {
        this.toUplode = [];
        this.model[this.field.name].forEach((item) => {
          if (request.config)
            request.config.getImageUrl(item.target_id).then((resp) => {
              this.toUplode.push({ url: resp.data });
            });
        });
      }
    },
  },
};
</script>
