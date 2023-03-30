<template>
  <div class="vuejs-uploader" :class="classCss">
    <ValidationProvider :name="fullname" :rules="getRules()" v-slot="v">
      <b-form-group :label="field.label" :description="field.description">
        <b-form-file
          v-if="cardinality | (toUplode.length == 0)"
          v-model="files"
          placeholder="Ajouter un fichier ..."
          drop-placeholder="Drop file here..."
          :multiple="cardinality"
          :accept="file_extensions"
          size="md"
          :state="getValidationState(v)"
          :name="fullname"
          @input="previewImage"
        ></b-form-file>
      </b-form-group>
    </ValidationProvider>
    <div class="previews d-flex flex-wrap">
      <div v-for="(fil, i) in toUplode" :key="i" class="item">
        <b-img
          :src="fil.url"
          fluid
          alt="Fluid image"
          thumbnail
          class="img-preview"
        ></b-img>
        <b-icon
          v-b-tooltip.v-danger="' Supprimer l\'image '"
          icon="x"
          font-scale="2"
          variant="danger"
          class="icon-delete"
          @click="delete_file(i, fil)"
        ></b-icon>
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
  name: "DrupalFile",
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
    parentName: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      // Fichiers provenant de l'action utilisateur.
      files: [],
      // Fichiers uploaded.
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
    fullname() {
      return this.parentName + this.field.name;
    },
    file_extensions() {
      if (
        this.field.definition_settings &&
        this.field.definition_settings.file_extensions
      ) {
        var extensions = "";
        this.field.definition_settings.file_extensions
          .split(" ")
          .forEach((item) => {
            extensions += ".";
            extensions += item.trim();
            extensions += ", ";
          });
        extensions.trim();
        return extensions;
      } else return "";
    },
  },
  mounted() {
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
      // ceci permet de faire patienter l'utilisateur, le temps de traitement de l'image.
      setTimeout(() => {
        if (this.namespaceStore)
          this.$store.commit(this.namespaceStore + "/DISABLE_RUNNING");
        else this.$store.commit("DISABLE_RUNNING");
      }, 1000);
      // preview
      var reader = new FileReader();
      if (this.cardinality) {
        var vals = [];
        // si on a deja ds images
        if (this.model[this.field.name] && this.model[this.field.name].length) {
          vals = this.model[this.field.name];
        }
        for (const i in files) {
          const file = files[i];
          // Send images.
          request.config
            .postFile("/filesmanager/post", file)
            .then((resp) => {
              reader.onload = (read) => {
                this.toUplode.push({
                  file: file,
                  status: resp,
                  error: 0,
                  url: read.target.result,
                  target_id: resp.id,
                });
              };
              reader.readAsDataURL(file);
              vals.push({ target_id: resp.id });
              // On ajoute les images progressivement dans le champs.
              this.setValue(vals);
            })
            .catch((er) => {
              console.log("er", er);
              // On doi traiter l'affichage des erreurs des messages.
            });
        }
      } else {
        const vals = [];
        this.toUplode = [];
        request.config
          .postFile("/filesmanager/post", files)
          .then((resp) => {
            if (this.namespaceStore)
              this.$store.commit(this.namespaceStore + "/ACTIVE_RUNNING");
            else this.$store.commit("ACTIVE_RUNNING");
            reader.onload = (read) => {
              this.toUplode.push({
                file: files,
                status: resp,
                error: 0,
                url: read.target.result,
                target_id: resp.id,
              });
            };
            reader.readAsDataURL(files);
            vals.push({ target_id: resp.id });
            this.setValue(vals);
          })
          .catch((er) => {
            console.log("er", er);
            // On doi traiter l'affichage des erreurs des messages.
          });
      }
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
    getValue() {
      if (this.model[this.field.name] && this.model[this.field.name].length) {
        this.toUplode = [];
        this.model[this.field.name].forEach((item) => {
          if (request.config) {
            const toUplode = {
              url: "",
              target_id: item.target_id,
            };
            if (item.target_id)
              request.getImageUrl(item.target_id).then((resp) => {
                toUplode.url = resp.data;
                this.toUplode.push(toUplode);
              });
          }
        });
      }
    },
    delete_file(index, file) {
      if (
        file.target_id &&
        this.field.definition_settings &&
        this.field.definition_settings.module_name
      ) {
        request.config
          .get(
            "/filesmanager/delete/" +
              file.target_id +
              "/" +
              this.field.definition_settings.module_name
          )
          .then(() => {
            this.toUplode.splice(index, 1);
            this.removeValue(file.target_id);
          });
      }
    },
    removeValue(target_id) {
      if (this.model[this.field.name] && this.model[this.field.name].length) {
        const oldValues = this.model[this.field.name];
        const vals = [];
        oldValues.forEach((item) => {
          if (item.target_id != target_id) vals.push(item);
        });
        this.setValue(vals);
      }
    },
  },
};
</script>
