<template>
  <div class="fdd-container">
    <div class="fdd-desc">
      <h5 class="fdd-desc__title">
        Excellent ! Maintenant, passons à votre expérience professionnelle
      </h5>
      <p class="fdd-desc__desc">
        Commencez par votre poste actuel et remontez dans le passé. Si vous avez
        beaucoup d'expérience, n'ajoutez que les postes les plus récents et
        pertinents.
      </p>
    </div>
    <h3 class="fdd-header">
      <span
        id="title-bloc"
        contenteditable="true"
        class="fdd-header__title text"
      >
        {{ title }}
      </span>

      <span
        id="pencil-rename"
        v-b-tooltip.hover
        variant="light"
        title="Renommer"
        class="btn-rename"
      >
        <b-icon
          icon="pencil-fill"
          variant="secondary"
          font-scale="1"
          class=""
        ></b-icon>
      </span>
    </h3>

    <section class="list-card">
      <draggable
        v-model="items"
        group="people"
        class="w-100"
        @start="drag = true"
        @end="drag = false"
      >
        <div v-for="item in items" :key="item.title" class="head-card">
          <div class="text-content">
            <h5 class="text-content__title">{{ item.title }}</h5>
            <div class="text-content__desc">
              <span class="company">wb-univres</span>
              <span class="duration">Juin 2020 - Aug 2052</span>
            </div>
          </div>
          <div class="icon-content">
            <span v-b-tooltip.hover variant="light" class="btn-action">
              <b-icon
                icon="trash-fill"
                variant="secondary"
                font-scale="1"
                class=""
              ></b-icon>
            </span>
            <span
              id="pencil-rename"
              v-b-tooltip.hover
              variant="light"
              class="btn-action"
            >
              <b-icon
                icon="pencil-fill"
                variant="secondary"
                font-scale="1"
                class=""
              ></b-icon>
            </span>
            <span
              id="pencil-rename"
              v-b-tooltip.hover
              variant="light"
              title="Glisser-déposer pour réorganiser"
              class="btn-action"
            >
              <b-icon
                icon="arrows-move"
                variant="secondary"
                font-scale="1"
                class=""
              ></b-icon>
            </span>
          </div>
        </div>
      </draggable>

      <div class="add-new-card">
        <div class="anc-content">
          <b-icon
            icon="plus-circle-fill"
            font-scale="1"
            class="text-info"
          ></b-icon>
          <span class="anc-titre">{{ addButtonTitle }}</span>
        </div>
      </div>
    </section>
    <form-input></form-input>
  </div>
</template>

<script>
import draggable from "vuedraggable";
import FormInput from "./FormInput.vue";
export default {
  name: "HButton",
  components: {
    draggable,
    FormInput,
  },
  props: {},
  data() {
    return {
      title: "Expériences",
      addButtonTitle: "Ajouter un autre",
      items: [
        {
          title: "Agent de sécurité",
          agence: "wbu-script",
          date: "jul 2020 - Sept 2000",
          list: 1,
        },
        {
          title: "Agt de sécurienté",
          agence: "wbu-script",
          date: "jul 2020 - Sept 2000",
          list: 1,
        },
        {
          title: "Récrute arr ité",
          agence: "wbu-script",
          date: "jul 2020 - Sept 2000",
          list: 1,
        },
      ],
    };
  },
  computed: {
    listOne() {
      return this.items.filter((item) => item.list === 1);
    },
    listTwo() {
      return this.items.filter((item) => item.list === 2);
    },
  },
  mounted() {
    this.enableEditTitles();
  },
  methods: {
    enableEditTitles() {
      let self = this;
      let el = document.getElementById("title-bloc");
      let pencil = document.getElementById("pencil-rename");
      let valeur = "";
      el.addEventListener(
        "input",
        function (event) {
          console.log("input keycode", event.keyCode);
          if (event.keyCode === 13) {
            event.preventDefault();
            event.target.blur();
          } else {
            valeur = this.innerText;
          }
        },
        false
      );
      el.addEventListener("keydown", function (event) {
        console.log("keydown keycode", event.keyCode);
        if (event.keyCode === 13) {
          event.preventDefault();
          event.target.blur();
        }
      });

      el.addEventListener(
        "blur",
        function () {
          // console.log("input blured", valeur);
          valeur.length ? (self.title = valeur) : "";
        },
        false
      );
      pencil.addEventListener("click", () => {
        el.focus();
        document.execCommand("selectall", null, false);
        // this.selectText("title-bloc");
        //el.select();
      });
    },
    startDrag(evt, item) {
      evt.dataTransfer.dropEffect = "move";
      evt.dataTransfer.effectAllowed = "move";
      evt.dataTransfer.setData("itemID", item.id);
    },
    onDrop(evt, list) {
      const itemID = evt.dataTransfer.getData("itemID");
      const item = this.items.find((item) => item.id == itemID);
      item.list = list;
    },
  },
};
</script>
<style lang="scss" scoped>
.fdd-container {
  max-width: 600px;
  align-items: flex-start;
  width: 100%;
  margin: 0px auto;
  padding-bottom: 0px;
}
.fdd-desc {
  margin-bottom: 24px;
  text-align: left;
  &__title {
    flex: 0 0 auto;
    padding: 0px 15px 0px 0px;
    display: flex;
    -webkit-box-pack: justify;
    justify-content: space-between;
    -webkit-box-align: center;
    align-items: center;
    margin-bottom: 12px;
  }
  &__desc {
    color: rgb(150, 155, 158);
    display: inline-block;
    font-family: Roboto, sans-serif;
    font-size: 16px;
    line-height: 24px;
  }
}
.fdd-header {
  margin-bottom: 16px;
  display: flex;
  position: relative;
  align-items: center;
  justify-content: start;
  &__title {
    color: rgb(0, 0, 0);
    letter-spacing: 0.5px;
    width: 100%;
    height: 28px;
    font-family: Roboto;
    font-size: 20px;
    font-weight: 500;
    line-height: 28px;
    border: none;
    outline: 0;
    display: inline-block;
    width: auto;
    padding-bottom: 5px;
    max-height: 28px;
    &:focus {
      border-bottom: 1px dashed rgb(34, 152, 233);
    }
  }
  .btn-rename {
    font-size: 1.2rem;
    margin-left: 7px;
    cursor: pointer;
  }
}
.list-card {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
}
.head-card {
  margin-bottom: 16px;
  background: transparent;
  height: 60px;
  cursor: pointer;
  border-radius: 4px;
  box-shadow: rgb(231 235 238) 0px 3px 8px 0px, rgb(181 186 189) 0px 1px 4px 0px;
  display: block;
  transition: all 0.2s ease 0s;
  width: 100%;

  display: flex;
  padding: 8px 20px;
  max-width: 600px;
  box-shadow: none;
  box-sizing: border-box;
  align-items: center;
  border-radius: 4px;
  justify-content: center;
  background-color: #f8f9fa;
  .text-content {
    padding-left: 10px;
    display: flex;
    -webkit-box-pack: center;
    justify-content: center;
    align-items: flex-start;
    flex-direction: column;
    flex: 1 1 auto;
    overflow: hidden;
    width: 100%;
    pointer-events: none;
    text-align: start;
    &__title,
    &__desc {
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 0;
    }
    &__desc {
      color: #6d7275;
      padding: 0;
      font-size: 14px;
      line-height: 20px;
    }
    &__title {
      color: black;
      font-size: 16px;
      font-weight: 500;
      line-height: 24px;
    }
  }
  .icon-content {
    display: flex;
    gap: 15px;
  }
  .btn-action {
    padding: 2px;
    font-size: 18px;
  }
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
  .anc-titre {
    font-size: 16px;
    line-height: 24px;
    font-weight: 500;
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