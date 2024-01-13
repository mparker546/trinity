/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class TrinityItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    super.prepareData();

    // Get the Item's data
    const itemData = this;
    const actorData = this.actor ? this.actor : {};
    const systemData = itemData;

    // Update the code within this method as needed
    // Remove any references to TrinityActor#data

  }

  prepareDerivedData() {
    const itemData = this;
    const actorData = this.actor ? this.actor : {};
    const systemData = itemData;
    // console.log("prepareDerivedData called", itemData);

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareSubItemData(itemData);
    this._updateFlags(itemData);
    this._matchValues(itemData);

  }

  _updateFlags(itemData) {
    // Update the code within this method as needed
    // Remove any references to TrinityActor#data
  }

  _matchValues(itemData) {
    // Update the code within this method as needed
    // Remove any references to TrinityActor#data
  }

  _prepareSubItemData(itemData) {
    // console.log("_prepareSubItemData called", itemData);
    if (typeof itemData.system.subItems !== "undefined") {
      const stunts = [];
      const tags = [];
      const modePowers = [];
  
      for (let i of Object.keys(itemData.system.subItems)) {
        let subItem = itemData.system.subItems[i];
        if (subItem === null) { continue; }
        if (subItem.type === 'stunt') { stunts.push(subItem); }
        if (subItem.type === 'tag') { tags.push(subItem); }
        if (subItem.type === 'modePower') { modePowers.push(subItem); }
      }
  
      // Additional Sorts & Assign
      itemData.system.stunts = stunts.sort((a, b) => a.name > b.name ? 1 : -1);
      itemData.system.tags = tags.sort((a, b) => a.name > b.name ? 1 : -1);
      itemData.system.modePowers = modePowers.sort((a, b) => a.name > b.name ? 1 : -1);
      itemData.system.modePowers = modePowers.sort((a, b) => a.dotRequirement < b.dotRequirement ? 1 : -1);
      itemData.system.totalTagValue = this._getTotalTagValue(tags);
    }
  }

  _getTotalTagValue(tags) {
    let total = 0;
    for (let t of tags) {
      total = total + t.tagValue;
    }
    return total;
  }

}