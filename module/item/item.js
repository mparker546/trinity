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
    const itemData = this.data;
    const actorData = this.actor ? this.actor.data : {};
    const data = itemData.system;
  }

  prepareDerivedData() {
    const itemData = this.data;
    const actorData = this.actor ? this.actor.data : {};
    const data = itemData.system;
    // console.log("prepareDerivedData called", itemData);

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareSubItemData(itemData);
    this._updateFlags(itemData);
    this._matchValues(itemData);
  }


  _updateFlags(itemData) {
    /*
    if (this.data.system.enhancement.value > 0) {this.data.system.flags.isEnhancement = true;}
    else {{this.data.system.flags.isEnhancement = false;}
    if (this.data.system.complication.value > 0) {this.data.system.flags.isComplication = true;}
    else {{this.data.system.flags.isComplication = false;}
    */

    /* Don't think this section is needed, if it ever was. Downgrading an injury should still keep it as an injury.
    if (typeof this.data.system.injury !== "undefined" && typeof this.data.system.injury.value !== "undefined") {
      if (this.data.system.injury.value < 1) {this.data.system.flags.isInjury = false;}
      else {this.data.system.flags.isInjury = true;}
    }
    */
  }

  _matchValues(itemData) {
    // Certain item types have an enhancement calue equal to dots - this updates that manually
    if (this.data.type === "attribute" && typeof this.data.system.flags.isFacet !== "undefined" && this.data.system.flags.isFacet) {
      this.data.system.enhancement.value = this.data.system.value;
      this.data.system.flags.isEnhancement = true;
    } else if ( this.data.type === "attribute" && typeof this.data.system.flags.isEnhancement ) {
      this.data.system.enhancement.value = this.data.system.value;
    }
  }


  _prepareSubItemData(itemData) {
    // console.log("_prepareSubItemData called", itemData);
    if (typeof this.data.system.subItems !== "undefined") {
      // this.data.system.subItems.sort((a, b) => a.name > b.name ? 1 : -1);
      const stunts = [];
      const tags = [];
      const modePowers = [];

      for (let i of Object.keys(this.data.system.subItems)) {
        let subItem = this.data.system.subItems[i];
        if (subItem === null) { continue; }
        if (subItem.type === 'stunt') { stunts.push(subItem); }
        if (subItem.type === 'tag') { tags.push(subItem); }
        if (subItem.type === 'modePower') { modePowers.push(subItem); }
      }

      // Additional Sorts & Assign
      this.data.system.stunts = stunts.sort((a, b) => a.name > b.name ? 1 : -1);
      this.data.system.tags = tags.sort((a, b) => a.name > b.name ? 1 : -1);
      this.data.system.modePowers = modePowers.sort((a, b) => a.name > b.name ? 1 : -1);
      this.data.system.modePowers = modePowers.sort((a, b) => a.dotRequirement < b.dotRequirement ? 1 : -1);
      this.data.system.totalTagValue = this._getTotalTagValue(tags);
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
