//* Import Functions *//
// import { rollDataTemplate } from "/systems/trinity/module/protos.js";
import { TRoll } from "/systems/trinity/module/roll/troll.js";

/**
 * DOCUMENTATION FOR ORIGINAL FormApplication:
 * An abstract pattern for defining an Application responsible for updating some object using an HTML form
 *
 * A few critical assumptions:
 * 1) This application is used to only edit one object at a time
 * 2) The template used contains one (and only one) HTML form as it's outer-most element
 * 3) This abstract layer has no knowledge of what is being updated, so the implementation must define _updateObject
 *
 * @extends {Application}
 * @abstract
 * @interface
 *
 * @param {Object} object                     Some object which is the target data structure to be be updated by the form.
 * @param {FormApplicationOptions} [options]  Additional options which modify the rendering of the sheet.
 */


export class RollForm extends FormApplication {

    constructor(actor, options, object, elementID) {
      super(object, options);
      console.log("RollForm Constructor this: ", this);
      console.log("RollForm Constructor Actor: ", actor);
      console.log("RollForm Object Pre-Check: ", object);
      this.actor = actor;
      this.oItemList = [];
      this.oSettings = [];
      this.saved = false;
    
      if (typeof object === 'undefined' || object === null) {
        this.object = this._rollDataTemplate();
        if (typeof elementID !== 'undefined' && elementID !== null) {
          this._addItem(elementID);
        }
      } else {
        this.object = this._rollDataTemplate();
        
        this.oItemList = { ...object.items };
        this.oSettings = { ...object.settings };
    
        if (object.id) {
          this.saved = true;
        }
    
        this.object.name = JSON.parse(JSON.stringify(object.name));
        this.object.desc = JSON.parse(JSON.stringify(object.desc));
        this.object.id = object.id ? JSON.parse(JSON.stringify(object.id)) : "";
        this.object.items = { ...object.items };
        this.object.settings = { ...object.settings };
        this.object.flags = { ...object.flags };
        this.object.favorite = object.favorite ? true : false;
      }
    
      if (game.settings.get("trinity", "healthModel") === "modelS" && actor.system.health.summary.penalty < 0) {
        let rollItemID = randomID(16);
        this.object.items[rollItemID] = {
          value: actor.system.health.summary.penalty,
          name: actor.system.health.summary.status,
          SourceType: "Injury",
          note: "Injury Penalty",
          isDice: true,
          multiplier: 1,
          id: rollItemID,
          isCustom: true
        };
      }
    
      console.log("RollForm Object Post-Check this: ", this);
    }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["trinity", "roll-form"],
      popOut: true,
      template: "systems/trinity/templates/roll/roll-form.html",
      id: "roll-form",
      title: `Roll`,
      width: 350
    });
  }
  // height : "100%"

  getData() {
    // Send data to the template
    console.log("RollForm getData called");
    // this.rollname = Object.assign({}, this.object.name);
    return {
      actor: this.actor,
      rollData: this.object,
      itemList: this.itemList,
      saved: this.saved
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.selector').click(async (event) => {
      console.log("Roll Dialog This:", this);
      console.log("Selector Event:", event);
      console.log("Selector Event ID:", event.currentTarget.id);
      this._getItems(event.currentTarget.id); // Update ItemList
      console.log("itemList:", this.itemList);
      await this._render(true);
      console.log("rendered");

      document.getElementById("overlay").style.display = "block";
      document.getElementById("overlay").nextElementSibling.classList.toggle("hidden");

      console.log("overlaid");
      // reset height
      this._resetHeight();
    });

    html.find('.back').click((event) => {
      document.getElementById("overlay").style.display = "none";
      document.getElementById("overlay").nextElementSibling.classList.toggle("hidden");

      // reset height
      this._resetHeight();
    });

    html.find('.roll-button').click((event) => {
      this._roll();
      this.close();
    });

    html.find('.showOptions').click((event) => {
      if (document.getElementById("options").style.display === "grid") {
        document.getElementById("options").style.display = "none";
      } else {
        document.getElementById("options").style.display = "grid";
      }
      // reset height
      this._resetHeight();
    });

    html.find('.select-item').click(async (event) => {
      document.getElementById("overlay").style.display = "none"; // Remove overlay
      // this._addItem.bind(this, event.currentTarget.id);
      this._addItem(event.currentTarget.id);
      await this._render(true);
      this._resetHeight();
    });

    html.find('.remove').click(async (event) => {
      const itemID = event.currentTarget.id;
      this._removeItem(itemID);
      await this._render(true);
      this._resetHeight();
    });

    html.find('.save-as').click(async (event) => {
      await this._saveAs(this.object, this.actor);
      // await this._updateObject();

      await this._render(true);
      this._resetHeight();
    });

    html.find('.save').click(async (event) => {
      this._save(this.object, this.actor);
    });

    html.find('.add-custom').click(async (event) => {
      console.log("add-custom Listener, this: ", this);
      console.log("add-custom Listener, this: ", event);
      // this._addItem.bind(this, null, true);
      this._addItem(null, true);
      await this._render(true);
      this._resetHeight();
    });

    html.find('.setting').change(async (event) => {
      this.submit({preventClose: true});
    });

  }

  // Example - not yet used...
  async _updateObject(event, formData) {
    console.log("_updateObject");
    console.log("_updateObject event: ", event);
    console.log("_updateObject formData: ", formData);
    mergeObject(this, formData);
    console.log("_updateObject rollData after merge: ", this);
  }

  // reset height
  _resetHeight() {
    const position = this.position;
    // position.height = "100%";
    // position.height = this.form.clientHeight + 30;
    position.height = "auto";
    this.setPosition(position);
  }

  _getItems(type) {
    this.itemListType = type;
    this.itemList = [];
    for (let i of this.actor.items) {
      if (i.system.flags.isFacet && !this.actor.flags.isTalent) { continue; }
      if (type === "enhancement" && i.system.flags.isEnhancement === true) { this.itemList.push(i); continue; }
      if (type === "attribute" && i.type === "attribute" && i.system.flags.isMain === true) { this.itemList.push(i); continue; }
      if (i.name === type) { this.itemList.push(i); continue; }
      if (type !== "attribute" && i.type === type && i.system.flags.isEnhancement === false) { this.itemList.push(i); }
    }
  }

_addItem(id, custom) {
  console.log("_addItem this/args", this, id, custom);
  
  let itemValue = 0;
  let itemName = "";
  let isDice = true;
  let note = "";
  let rollItemID = "";
  let sourceType = "";
  let isCustom = false;
  let mult = 1;

  if (typeof custom !== "undefined") {
    itemValue = document.getElementById("customValue").value || 0;
    itemName = document.getElementById("customName").value || "Custom Value";
    rollItemID = randomID(16);
    note = "Manually Entered";
    isDice = this.itemListType !== "enhancement";
    sourceType = this.itemListType;
    isCustom = true;
  } else {
    const item = this.actor.items.get(id);
    if (item) {
      rollItemID = item.id;
      itemValue = item.system.flags.isEnhancement ? item.system.enhancement.value : item.system.value;
      itemName = item.name;
      isDice = !item.system.flags.isEnhancement;
      sourceType = item.type;
      if (item.type === "attribute" && item.system.flags.isMain === true) {
        note = `${item.system.arena}/${item.system.approach}`;
      } else {
        note = item.system.enhancement.relevance;
      }
      if (this.object.items && rollItemID in this.object.items) {
        mult = this.object.items[rollItemID].multiplier + 1;
      }
    }
  }

  this.object.items[rollItemID] = {
    value: itemValue,
    name: itemName,
    SourceType: sourceType,
    note: note,
    isDice: isDice,
    multiplier: mult,
    id: rollItemID,
    isCustom: isCustom,
  };
}

  _removeItem(id) {
    // var rollData = this.object;
    delete this.object.items[id];
  }

  _roll() {
    var rollData = this.object;
    let roll = new TRoll(rollData.formula);
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: rollData.flavor
    });
  }

  _rollDataTemplate() {
    return {
      name : "New Roll",
      id : "",
      get flavor() {
        let text = '<div class="flex-flavor">';
        for (let i of Object.keys(this.items)) {
          if (this.items[i].isDice) {
            text += '<span class="flex-flavor-trait small-trait">';
            text += this.items[i].value + "● " + this.items[i].name; // Expand this for better Flavortext
            text += '</span>';
          }
        }
        for (let i of Object.keys(this.items)) {
          if (!this.items[i].isDice) {
            text += '<span class="flex-flavor-trait small-trait">';
            text += this.items[i].value + "# " + this.items[i].name; // Expand this for better Flavortext
            text += '</span>';
          }
        }
        text += '</div>'
        return text;
      },
      desc : "",
      // formula : "",
      // use Getter to compute this automatically
      get formula() {
        if (!this.items) { return 0; }
        let enhaScale = this.enhaTotal + (this.settings.dsca * 2);
        let fail = '';
        let doub = '';
        let enha = '';
        let nsca = '';
        if (this.flags.fail) {fail = `df<=${this.settings.fail}`;}
        if (this.flags.doub) {doub = `csa>=${this.settings.doub}`;}
        if (enhaScale > 0) {enha = `ae${enhaScale}`;}
        if (this.settings.nsca > 1) {nsca = `*${this.settings.nsca}`;}
        let rollFormula = `(${this.diceTotal}d10x>=${this.settings.expl}cs>=${this.settings.succ}${doub}${fail}${enha})${nsca}`;
        return rollFormula;
      },
      items : {
        /*
        value
        name
        SourceType
        note
        isDice
        */
      },
      get diceTotal() {
        let total = 0;
        for (let i of Object.keys(this.items)) {
          if (this.items[i].isDice) { total += this.items[i].value * this.items[i].multiplier; }
        }
        if (total < 1) {total = 1}
        return total;
      },
      get enhaTotal() {
        let total = 0;
        for (let i of Object.keys(this.items)) {
          if (!this.items[i].isDice) { total += this.items[i].value * this.items[i].multiplier; }
        }
        return total;
      },
      settings : {
        expl : this.actor.system.rollSettings.expl.value,
        succ : this.actor.system.rollSettings.succ.value,
        nsca : this.actor.system.rollSettings.nsca.value, // Narrative Scale (Absolute)
        dsca : this.actor.system.rollSettings.dsca.value, // Dramatic Scale (Difference)
        fail : game.settings.get("trinity", "defaultFail"), // Fail value, for old-school homebrew
        doub : game.settings.get("trinity", "defaultDouble"), // Double Success value, for old-school homebrew
        init : false // For Compatibility
      },
      flags : {
        fail : this.actor.system.flags.isMage,
        doub : false
      },
      favorite : false
    };
  }

  async _saveAs(rollData, targetActor) {
    console.log("_saveAs started");
    let html = await renderTemplate("systems/trinity/templates/save-as-prompt.html");
    new Dialog({
      title: "Save Roll As",
      content: html,
      default: 'save',
      buttons: {
        save: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Save As',
          default: true,
          callback: html => {
            let results = document.getElementById('saveName').value;
            let uniqueRollNumber = randomID(16);
            rollname = results;
            rollData.id = uniqueRollNumber;

            let updates = {
              "data.savedRolls": {
                [uniqueRollNumber]: rollData
              }
            };
            game.actors.get(targetActor.id).update(updates);
            this.saved = true;

            ui.notifications.notify(`Saved Roll to ${targetActor.name} as "${results}".`);
            return;
          },
        }
      }
    }).render(true);
  }

  async _save(rollData, targetActor) {
    console.log("_save started");
    // let html = await renderTemplate("systems/trinity/templates/save-prompt.html");
    new Dialog({
      title: "Save Roll",
      content: `Over-write existing saved roll <b>${rollname}</b>?`,
      default: 'save',
      buttons: {
        save: {
          icon: '<i class="fas fa-check"></i>',
          label: 'Save',
          default: true,
          callback: html => {
            // let results = document.getElementById('saveName').value;
            // let uniqueRollNumber = randomID(16);
            // rollname = results;
            // rollData.id = uniqueRollNumber;

            let updates = {
              "data.savedRolls": {
                [rollData.id]: rollData
              }
            };
            game.actors.get(targetActor.id).update(updates);


            ui.notifications.notify(`Saved Roll to ${targetActor.name} as "${rollname}".`);
            return;
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel',
          default: false,
          callback: html => {
            return;
          }
        }
      }
    }).render(true);
  }

}
