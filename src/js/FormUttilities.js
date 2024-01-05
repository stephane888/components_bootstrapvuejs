import loadField from "../components/fieldsDrupal/loadField";
/**
 * Les fichiers ont une limitation elle ne permet pas de recuperer plusiuers information.
 * par example les données et le diernier id creer lorsqu'on a une execution en serie ou
 * en paralle, il faut que chaque execution se fasse dans une instance.
 * Donc, pour la suite on recommande l'utilisation de la class "ClassFormUtilities".
 */
export default {
  /**
   * Contient l'entite domaine, utile dans les cas ou l'on souhaite mettre à jour le domain.
   * ( Entité drupal domain )
   */
  domainRegister: {},

  /**
   * Contient les derniers id de niveau 0 à etre creer.
   * @Justification
   * Dans certains cas, on a besin de recuperer cet id,
   * mais il nya pas de guarandi que cela soit dans la proprieté 'id' du flux et cela serait un poil plus complexe.
   * @Alert
   * NB: la valeur retounée est valide si l'execution est strictement en serie.
   */
  lastIdsEntity: [],
  /**
   * Represente le nombre d'essaie qui peut etre effectuer avant de marquer l'action comme non aboutie.
   */
  numberTry: 0,

  timeWaitBeforeRetry: 15000,

  /**
   * Permet de generer le formulaire drupal.
   * @param {Array} entities
   * @param {Array} results
   * @returns
   */
  generateFields(entities, allFields = [], container_entity = "simple_card") {
    return new Promise((resolv) => {
      entities.forEach((entity) => {
        if (entity.form_sort && entity.form_sort.length) {
          const fields = [];
          entity.form_sort.forEach((field) => {
            const sf = {
              template: loadField.getField(field),
              field: field,
              model: entity.entity, // doit etre supprimer pour la version 2x, cela est une information de trop.
              //(on doit utiliser celui definit au niveau du container)
              entities: [],
            };
            if (entity.entities && entity.entities[field.name]) {
              sf.entities = entity.entities[field.name];
            }
            fields.push(sf);
          });
          allFields.push({
            template: loadField.getContainer(container_entity),
            fields: fields,
            entity: entity,
          });
        }
      });
      resolv(allFields);
    });
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
   * example param suivers :
   * suivers: {
   *   ...
   *   creates: 0, // incrementé durant le process.
   *   ...
   * },
   * Evolution : 1
   * On a remarqué un nouveau paramettre,
   * target_revision_id (qui est requis pour que le processus de sauvegarde se passe bien).
   * La logique est de verifier la l'object reference, s'il contient un nouveau element on declenche une erreur.
   * les elements supportés pour le moment sont : target_revision_id, target_id.
   * **
   * @param {Object} datas contient les données à sauvegarder.
   * @param {Object} suivers permet de suivre la creation
   * @return {Array} un tableau d'entité de drupal.
   */
  prepareSaveEntities(store, datas, suivers, ActionDomainId = false) {
    return new Promise((resolu, rejecte) => {
      //console.log("prepareSaveEntities");
      // on vide les derniers ids.
      this.lastIdsEntity = [];
      const updateDomainId = (entity) => {
        //console.log("entity.field_domain_source : ", entity, "\n ActionDomainId : ", ActionDomainId, "\n this.domainRegister : ", this.domainRegister);
        if (ActionDomainId && this.domainRegister.id && entity.field_domain_access) {
          entity.field_domain_access = [{ target_id: this.domainRegister.id }];
          if (entity.field_domain_source !== undefined) entity.field_domain_source = [{ target_id: this.domainRegister.id }];
        }
        return entity;
      };
      const loopItemAddValues = (values, resp, has_target_revision_id) => {
        // console.log("loopItemAddValues values : ", values, "\n resp : ", resp, "\n has_target_revision_id : ", has_target_revision_id);
        if (has_target_revision_id) {
          // try to get revision.
          var revision_id;
          if (resp.data.json.revision_id && resp.data.json.revision_id[0] && resp.data.json.revision_id[0].value) {
            revision_id = resp.data.json.revision_id[0].value;
          } else {
            return false;
          }
          values.push({
            target_id: resp.data.id,
            target_revision_id: revision_id,
          });
        } else values.push({ target_id: resp.data.id });
        return true;
      };

      /**
       * Permet de creer les sous contenus et return les target_ids.
       * @param {Array} items
       * @param {Integer} i
       * @param {Array} values
       */
      const loopItem = (items, i, values = [], has_target_revision_id = false, essaie = 0) => {
        return new Promise((resolv, reject) => {
          if (items[i]) {
            const item = items[i];
            if (items[i].entities) {
              const keys = Object.keys(items[i].entities);
              loopFieldEntity(items[i].entities, keys[0], items[i].entity, keys, 0)
                .then((entity) => {
                  const saveEntity = () => {
                    store
                      .dispatch("saveEntity", {
                        entity_type_id: items[i].target_type,
                        value: updateDomainId(entity),
                        index: i,
                      })
                      .then((resp) => {
                        suivers.creates++;
                        //console.log(" Before loopItemAddValues 1 : ", values);
                        if (!loopItemAddValues(values, resp, has_target_revision_id)) reject(" Revision requis mais non definit ");
                        i = i + 1;
                        if (i < items.length) {
                          resolv(loopItem(items, i, values, has_target_revision_id));
                        } else resolv(values);
                      })
                      .catch((er) => {
                        /**
                         * Si l'utilisateur a defini un nombre d'essaie.
                         */
                        if (essaie < this.numberTry) {
                          essaie++;
                          //console.log("loopItem re-try : ", essaie);
                          setTimeout(() => {
                            saveEntity();
                          }, this.timeWaitBeforeRetry);
                        } else {
                          //console.log(" catch loopItem : ", er);
                          reject(er);
                        }
                      });
                  };
                  saveEntity();
                })
                .catch((er) => {
                  //console.log(" catch loopItem : ", er);
                  reject(er);
                });
            } else {
              const saveEntity = () => {
                store
                  .dispatch("saveEntity", {
                    entity_type_id: item.target_type,
                    value: updateDomainId(item.entity),
                    index: i,
                  })
                  .then((resp) => {
                    suivers.creates++;
                    //console.log(" Before loopItemAddValues 2 : ", values);
                    if (!loopItemAddValues(values, resp, has_target_revision_id)) reject(" Revision requis mais non definit ");
                    // values.push({ target_id: resp.data.id });

                    i = i + 1;
                    if (items.length <= i) {
                      resolv(loopItem(items, i, values, has_target_revision_id));
                    } else {
                      resolv(values);
                    }
                  })
                  .catch((er) => {
                    /**
                     * Si l'utilisateur a defini un nombre d'essaie.
                     */
                    if (essaie < this.numberTry) {
                      essaie++;
                      //console.log("loopItem re-try : ", essaie);
                      setTimeout(() => {
                        saveEntity();
                      }, this.timeWaitBeforeRetry);
                    } else {
                      //console.log("catch loopItem : ", er);
                      reject(er);
                    }
                  });
              };
              saveEntity();
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
        return new Promise((resolv, reject) => {
          //console.log(" loopFieldEntity : ", datas, "\n fieldname : ", fieldname);
          // Si le champs contient des données,
          // on parcourt chacune des entrées.
          if (datas[fieldname] && datas[fieldname].length > 0) {
            //console.log("entity[fieldname][0] : ", entity[fieldname][0], "\n : ", entity);
            // on verifie s'il ya des entrées supplementaire
            if (entity[fieldname][0]) {
              var has_target_revision_id = false;
              const keys = Object.keys(entity[fieldname][0]);
              //
              if (keys.includes("target_revision_id")) {
                has_target_revision_id = true;
              }
              // s'il ya plus de entrées , on emet une erreur de peur de perdre les données.
              if (keys.length > 2) {
                reject("On a plus de donnée que pruvu dans l'objet à enregistrer");
              }
            }
            // Pour chaque champs, on cree les contenus et on recupere les ids.
            loopItem(datas[fieldname], 0, [], has_target_revision_id)
              .then((resp) => {
                //console.log(" loopFieldEntity result of loopItem : ", resp);
                entity[fieldname] = resp;
                // on passe au champs suivant.
                i = i + 1;
                if (keys.length > i) {
                  resolv(loopFieldEntity(datas, keys[i], entity, keys, i));
                } else {
                  resolv(entity);
                }
              })
              .catch((er) => {
                //console.log("catch loopFieldEntity : ", er);
                reject(er);
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
       * @K erreur signalé.
       */
      const loopEntityPromise = (datas, i = null, values = [], essaie = 0) => {
        return new Promise((resolv, reject) => {
          //console.log("loopEntityPromise : ", datas);
          if (datas[i]) {
            // S'il contient des sous entités.
            if (datas[i].entities && typeof datas[i].entities === "object") {
              const keys = Object.keys(datas[i].entities);
              loopFieldEntity(datas[i].entities, keys[0], datas[i].entity, keys, 0)
                .then((entity) => {
                  //console.log(" loopEntityPromise SEND with override entity : ", entity);
                  const saveEntity = () => {
                    store
                      .dispatch("saveEntity", {
                        entity_type_id: datas[i].target_type,
                        value: updateDomainId(entity),
                        index: i,
                      })
                      .then((resp) => {
                        suivers.creates++;
                        this.lastIdsEntity.push({ target_id: resp.data.id });
                        values.push(resp.data.json);
                        // datas[i].entity = resp.data.json;
                        i = i + 1;
                        if (i < datas.length) {
                          resolv(loopEntityPromise(datas, i, values));
                        } else resolv(values);
                      })
                      .catch((er) => {
                        /**
                         * Si l'utilisateur a defini un nombre d'essaie.
                         */
                        if (essaie < this.numberTry) {
                          essaie++;
                          //console.log("loopEntityPromise re-try : ", essaie);
                          setTimeout(() => {
                            saveEntity();
                          }, this.timeWaitBeforeRetry);
                        } else {
                          //console.log("catch loopEntityPromise : ", er);
                          reject(er);
                        }
                      });
                  };
                  saveEntity();
                })
                .catch((er) => {
                  //console.log("catch loopEntityPromise : ", er);
                  reject(er);
                });
            }
            // S'il ne contient pas de sous entité.
            else {
              const saveEntity = () => {
                store
                  .dispatch("saveEntity", {
                    entity_type_id: datas[i].target_type,
                    value: updateDomainId(datas[i].entity),
                    index: i,
                  })
                  .then((resp) => {
                    suivers.creates++;
                    this.lastIdsEntity.push({ target_id: resp.data.id });
                    values.push(resp.data.json);
                    i = i + 1;
                    if (i < datas.length) {
                      resolv(loopEntityPromise(datas, i, values));
                    } else resolv(values);
                  })
                  .catch((er) => {
                    /**
                     * Si l'utilisateur a defini un nombre d'essaie.
                     */
                    if (essaie < this.numberTry) {
                      essaie++;
                      //console.log("loopEntityPromise re-try : ", essaie);
                      setTimeout(() => {
                        saveEntity();
                      }, this.timeWaitBeforeRetry);
                    } else {
                      //console.log("catch loopEntityPromise : ", er);
                      reject(er);
                    }
                  });
              };
              saveEntity();
            }
          } else {
            //console.log(" loopEntityPromise END ");
            resolv([]);
          }
        });
      };

      loopEntityPromise(datas, 0)
        .then((entities) => {
          resolu(entities);
        })
        .catch((er) => {
          rejecte(er);
        });
    });
  },
};
