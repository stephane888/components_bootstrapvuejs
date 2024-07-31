import FormUttilities from "./FormUttilities";
/**
 * Permet d'executer la creation de node dans une instance et
 * permet ainsi de pouvoir mieux manipuler les données de chaque requetes.
 */
class ClassFormUtilities {
  constructor() {
    /**
     * Contient les entites qui ont ete crees.
     */
    this.entities = [];
    /**
     * Contient le dernier id sauvegardé.
     * @Alert
     * NB: la valeur retounée est valide si l'execution est strictement en serie cela
     * cela est du au fait qu'on utilise FormUttilities.
     */
    this.lastIdsEntity = null;
  }

  /**
   * @inheritdoc FormUttilities.prepareSaveEntities
   * @param {*} store
   * @param {*} datas
   * @param {*} suivers
   * @param {*} ActionDomainId
   * @returns
   */
  prepareSaveEntities(store, datas, suivers, ActionDomainId = false) {
    return new Promise((resolv, reject) => {
      FormUttilities.prepareSaveEntities(store, datas, suivers, ActionDomainId)
        .then((entities) => {
          this.entities = entities;
          this.setlastIdsEntity(FormUttilities.lastIdsEntity);
          resolv(entities);
        })
        .then((er) => {
          reject(er);
        });
    });
  }

  /**
   * @private
   */
  setlastIdsEntity(id) {
    this.lastIdsEntity = id;
  }
}
export default ClassFormUtilities;
