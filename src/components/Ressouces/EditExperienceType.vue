<template>
  <div>
    <div class="p-3 py-5" @click="$emit('closeEditForm')">
      <span
        v-b-tooltip.hover
        variant="light"
        title="Back"
        class="btn-action btn-back"
      >
        <b-icon
          icon="arrow-left"
          variant="secondary"
          font-scale="1"
          class=""
        ></b-icon>
        Retour
      </span>
    </div>
    <div class="add-item-form">
      <b-form>
        <b-row class=" ">
          <b-col md="6">
            <div class="fi-input">
              <label for="input-titre">Titre / poste</label>
              <b-form-input
                id="input-titre"
                v-model="form.value"
                type="text"
                placeholder="Titre"
                required
              ></b-form-input>
              <b-form-text> p.ex. Vendeur de cercueil </b-form-text>
            </div>
          </b-col>
          <b-col md="6">
            <div class="fi-input">
              <label for="input-compaign">Entreprise</label>
              <b-form-input
                id="input-compaign"
                v-model="form.company"
                type="text"
                placeholder="la compagnie"
                required
              ></b-form-input>
              <b-form-text> p.ex. Luis Vuitton</b-form-text>
            </div>
          </b-col>
          <b-col cols="12">
            <div class="fi-input">
              <label for="input-location">Lieux (ville, pays)</label>
              <b-form-input
                id="input-location"
                v-model="form.location"
                type="text"
                placeholder="Tokyo, Lagos"
                required
              ></b-form-input>
              <b-form-text> p.ex. Lagos </b-form-text>
            </div>
          </b-col>
        </b-row>
        <b-row class=" ">
          <b-col md="6">
            <div class="fi-input">
              <label for="input-date-debut">Date de début</label>
              <b-form-datepicker
                id="input-date-debut"
                v-model="form.date_debut"
                type="text"
                placeholder="Date de début"
                required
              ></b-form-datepicker>
              <b-form-text> p.ex. 22 Juin</b-form-text>
            </div>
          </b-col>
          <b-col md="6">
            <div class="fi-input">
              <label for="input-date-fin">Date de fin</label>
              <b-form-datepicker
                id="input-date-fin"
                v-model="form.date_fin"
                type="text"
                placeholder="Date de fin"
                required
              ></b-form-datepicker>
              <b-form-text> p.ex. 22 Dec</b-form-text>
              <b-form-checkbox
                v-model="form.encours"
                class="mt-3 ml-2"
                required
              >
                Poste actuel
              </b-form-checkbox>
            </div>
          </b-col>
        </b-row>
        <b-row class=" ">
          <b-col>
            <div class="fi-input fi-input--textarea">
              <label for="input-textarea-role" class="label-respon">
                Tâches et responsabilités
              </label>
              <b-form-textarea
                id="input-textarea-role"
                v-model="form.description"
                type="text"
                placeholder=" "
                required
              ></b-form-textarea>

              <b-form-text>
                p.ex. Organisation d'événements VIP et prise en charge de
                clients exclusifs.
              </b-form-text>
            </div>
          </b-col>
        </b-row>
      </b-form>
    </div>
  </div>
</template>

<script>
class CreateInstance {
  constructor(value) {
    this.name = value;
  }
  getValue() {
    return this.name;
  }
}
export default {
  name: "FormInput",
  components: {},
  props: {
    fValue: {
      type: Object,
      require: true,
      default: function () {
        return {};
      },
    },
  },
  data() {
    return {
      form: {},
    };
  },

  computed: {},
  mounted() {
    const v = new CreateInstance(this.fValue);
    this.form = v.getValue();
    console.log("this.form : ", this.form);
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
.btn-back {
  cursor: pointer;
}
.fi-input {
  text-align: left;
  margin-bottom: 1.5rem;
  label {
    font-size: 14px;
    color: black;
  }
  .custom-checkbox {
    font-size: 14px;
  }
  .form-control {
    position: relative;
    border-radius: 4px;
    background-color: rgb(240, 243, 245);
    height: 55px;
    border: 2px solid transparent;
    transition: ease-in 0.3s;
    font-size: 14px;
    align-items: center;
    &:focus,
    &:active {
      background-color: transparent;
      border-color: rgb(159, 159, 159);
      box-shadow: none;
    }
  }
  small {
    font-size: 12px;
    margin: 3px 14px 0px;
    color: rgb(90, 94, 97);
  }
  .label-respon {
    font-size: 1.2rem;
  }
  &--textarea {
    .form-control {
      height: auto;
      min-height: 200px;
      padding-top: 20px;
      padding-bottom: 20px;
      &:focus,
      &:active {
        background-color: rgb(240, 243, 245);
        border-color: transparent;
        box-shadow: none;
      }
    }
  }
}
</style>
