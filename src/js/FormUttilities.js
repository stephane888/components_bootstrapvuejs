import loadField from "../components/fieldsDrupal/loadField";
export default {
  /**
   * Contient l'entite domaine, utile dans les cas ou l'on souhaite mettre à jour le domain.
   */
  domainRegister: {},
  /**
   * Permet de generer le formulaire drupal.
   * @param {Array} entities
   * @param {Array} results
   * @returns
   */
  generateFields(entities, allFields = []) {
    entities.forEach((entity) => {
      if (entity.form_sort.length) {
        const fields = [];
        entity.form_sort.forEach((field) => {
          const sf = {
            template: loadField.getField(field),
            field: field,
            model: entity.entity,
            entities: [],
          };
          if (entity.entities && entity.entities[field.name]) {
            sf.entities = entity.entities[field.name];
          }
          fields.push(sf);
        });
        allFields.push({
          template: loadField.getContainer("simple_card"),
          fields: fields,
          entity: entity,
        });
      }
    });
    return allFields;
  },
  getNumberEntities(entityDuplicate) {
    return new Promise((resolv) => {
      var number = 0;
      const loopCount = (datas) => {
        for (const i in datas) {
          number++;
          if (datas[i].entities) {
            for (const j in datas[i].entities) {
              loopCount(datas[i].entities[j]);
            }
          }
        }
      };
      loopCount(entityDuplicate);
      setTimeout(() => {
        resolv(number);
      }, 300);
    });
  },
  /**
   * Sauvegarde toutes les données d'une matrice, et retourne les entites parentes.
   * @param {Object} response
   * @param {Object} suivers
   * @return {Array} un tableau d'entité de drupal.
   */
  prepareSaveEntities(store, response, suivers, ActionDomainId = false) {
    return new Promise((resolu, rejecte) => {
      const updateDomainId = (entity) => {
        if (
          ActionDomainId &&
          this.domainRegister.id &&
          entity.field_domain_access
        ) {
          entity.field_domain_access = [{ target_id: this.domainRegister.id }];
        }
        return entity;
      };

      /**
       * Permet de creer les sous contenus et return les target_ids.
       * @param {Array} items
       * @param {Integer} i
       * @param {Array} values
       */
      const loopItem = (items, i, values = []) => {
        return new Promise((resolv, reject) => {
          console.log("loopItem : ", items);
          if (items[i]) {
            const item = items[i];
            if (items[i].entities) {
              const keys = Object.keys(items[i].entities);
              loopFieldEntity(
                items[i].entities,
                keys[0],
                items[i].entity,
                keys,
                0
              ).then((entity) => {
                store
                  .dispatch("saveEntity", {
                    entity_type_id: items[i].target_type,
                    value: updateDomainId(entity),
                    index: i,
                  })
                  .then((resp) => {
                    suivers.creates++;
                    values.push({ target_id: resp.data.id });
                    i = i + 1;
                    if (i < items.length) {
                      // loopEntityPromise(items, i).then((resp) => {
                      //   values.push({ target_id: resp.data.id });
                      // });
                      resolv(loopItem(items, i, values));
                    } else resolv(values);
                  })
                  .catch((er) => {
                    console.log(" catch : ", er);
                    reject(er);
                  });
              });
            } else {
              store
                .dispatch("saveEntity", {
                  entity_type_id: item.target_type,
                  value: updateDomainId(item.entity),
                  index: i,
                })
                .then((resp) => {
                  suivers.creates++;
                  values.push({ target_id: resp.data.id });
                  i = i + 1;
                  if (items.length <= i) {
                    resolv(loopItem(items, i, values));
                  } else {
                    resolv(values);
                  }
                })
                .catch((er) => {
                  console.log("catch : ", er);
                  reject(er);
                });
            }
          } else resolv(values);
        });
      };
      //
      /**
       * Permet de sauvegarder les données d'une matrice.
       *
       * @param {Array} datas // tableau des entites enfants.
       * @param {String} fieldname // fieldname
       * @param {String} entity // entité parente
       * @param {Array} keys // tableau des champs à parcourirt (permet de passer à l'etape suivante)
       * @param {Integer} i   // l'etape encours (permet de passer à l'etape suivante)
       * @return {Object} entity // l'entité parente MAJ.
       */
      const loopFieldEntity = (datas, fieldname, entity, keys, i) => {
        return new Promise((resolv) => {
          console.log(" loopFieldEntity : ", datas);
          // Si le champs contient des données,
          // on parcourt chacune des entrées.
          if (datas[fieldname] && datas[fieldname].length > 0) {
            // Pour chaque champs, on cree les contenus et on recupere les ids.
            loopItem(datas[fieldname], 0).then((resp) => {
              console.log("loopFieldEntity result of loopItem : ", resp);
              entity[fieldname] = resp;
              // on passe au champs suivant.
              i = i + 1;
              if (keys.length > i) {
                resolv(loopFieldEntity(datas, keys[i], entity, keys, i));
              } else {
                resolv(entity);
              }
            });
          } else resolv(entity);
        });
      };
      /**
       * Permet de cree l'entité parent, apres que tous les entitées enfants soient ok.
       * il est appelle par tous les enfants possedant des enfants.
       * loopEntityPromise recois un tableau contenant les entites qui doivent etre cree.
       * il retourne un tableau de d'entity => [{target_id:...},{target_id:...}, ... ].
       *
       * @param {*} datas
       * @param {*} i
       * @return resp [{id:..., json:...}] // return un json avec une proprieté json et une autre id.
       */
      const loopEntityPromise = (datas, i = null, values = []) => {
        return new Promise((resolv, reject) => {
          console.log("loopEntityPromise : ", datas);
          if (datas[i]) {
            // S'il contient des sous entités.
            if (datas[i].entities && typeof datas[i].entities === "object") {
              const keys = Object.keys(datas[i].entities);
              loopFieldEntity(
                datas[i].entities,
                keys[0],
                datas[i].entity,
                keys,
                0
              ).then((entity) => {
                console.log(
                  " loopEntityPromise SEND with override entity : ",
                  entity
                );
                store
                  .dispatch("saveEntity", {
                    entity_type_id: datas[i].target_type,
                    value: updateDomainId(entity),
                    index: i,
                  })
                  .then((resp) => {
                    suivers.creates++;
                    values.push(resp.data.json);
                    // datas[i].entity = resp.data.json;
                    i = i + 1;
                    if (i < datas.length) {
                      resolv(loopEntityPromise(datas, i));
                    } else resolv(values);
                  })
                  .catch((er) => {
                    console.log("catch : ", er);
                    reject(er);
                  });
              });
            }
            // S'il ne contient pas de sous entité.
            else {
              store
                .dispatch("saveEntity", {
                  entity_type_id: datas[i].target_type,
                  value: updateDomainId(datas[i].entity),
                  index: i,
                })
                .then((resp) => {
                  suivers.creates++;
                  values.push(resp.data.json);
                  i = i + 1;
                  if (i < datas.length) {
                    resolv(loopEntityPromise(datas, i));
                  } else resolv(values);
                })
                .catch((er) => {
                  console.log("catch : ", er);
                  reject(er);
                });
            }
          } else {
            console.log(" loopEntityPromise END ");
            resolv([]);
          }
        });
      };
      loopEntityPromise(response, 0)
        .then((entities) => {
          resolu(entities);
        })
        .catch((er) => {
          rejecte(er);
        });
    });
  },
};
