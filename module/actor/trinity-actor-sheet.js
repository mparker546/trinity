/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

import { RollForm } from "/systems/trinity/module/roll/roll-form.js";



export class TrinityActorSheet extends ActorSheet {

  constructor(actor, options) {
    super(actor, options);
    this.options.collapsedSections = [];
    this.options.collapsedHeaders = [];
    this.options.collapsedContent = [];
    // this.options.configTab = false;

  }

// ------- New Method of Collapse/Expand Content

async _render(force = false, options = {}) {
  console.log("_render Called");
  this._saveToggleStates();
  await super._render(force, options);
  this._setToggleStates();
}

  _saveToggleStates() {
    if (this.form === null)
      return;

    const html = $(this.form).parent();

    this.toggleStates = {
      headers : [],
      content : [],
      chipContent : [],
      hiddenContent : []
    };

    // Headers
    let headerItems = $(html.find(".collapsible"));
    for (let item of headerItems) {
      this.toggleStates.headers.push($(item).hasClass("collapsible-active"));
    }

   // Content
let contentItems = $(html.find(".collapsible-content"));
for (let item of contentItems) {
  this.toggleStates.content.push($(item).hasClass("collapsible-content-active"));
}

    // Other uses of the hidden class
    let hiddenContentItems = $(html.find(".can-hide"));
    for (let item of hiddenContentItems) {
      this.toggleStates.hiddenContent.push($(item).hasClass("hidden"));
    }

    // Chip-Content
    /*
    let chipItems = $(html.find(".chip-content"));
    for (let item of chipItems) {
      this.toggleStates.chipContent.push($(item).hasClass("chip-hidden"));
    }
    */


    console.log("_saveToggleStates:",this.toggleStates);

  }

  _setToggleStates() {
    if (this.toggleStates) {
      const html = $(this.form).parent();

      // Headers
      let headerItems = $(html.find(".collapsible"));
      for (let i = 0; i < headerItems.length; i++) {
        if (this.toggleStates.headers[i]) {
          $(headerItems[i]).addClass("collapsible-active");
        } else {
          $(headerItems[i]).removeClass("collapsible-active");
        }
      }

      // Content
      let contentItems = $(html.find(".collapsible-content"));
      for (let i = 0; i < contentItems.length; i++) {
        if (this.toggleStates.content[i]) {
          $(contentItems[i]).addClass("collapsible-content-active");
        } else {
          $(contentItems[i]).removeClass("collapsible-content-active");
        }
      }

      // Other uses of the hidden class
      let hiddenContentItems = $(html.find(".can-hide"));
      for (let i = 0; i < hiddenContentItems.length; i++) {
        if (this.toggleStates.hiddenContent[i]) {
          $(hiddenContentItems[i]).addClass("hidden");
        } else {
          $(hiddenContentItems[i]).removeClass("hidden");
        }
      }


      // Chip-Content
      /*
      let chipItems = $(html.find(".chip-content"));
      for (let i = 0; i < chipItems.length; i++) {
        if (this.toggleStates.content[i]) {
          $(chipItems[i]).addClass("chip-hidden");
        } else {
          $(chipItems[i]).removeClass("chip-hidden");
        }
      }
      */

    }

    console.log("_setToggleStates:",this.toggleStates);
  }

// ------ Method section End

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["trinity", "sheet", "actor"],
      template: "systems/trinity/templates/actor/trinity-actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "background" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  get template() {
    const path = "systems/trinity/templates/actor";

    if (this.actor.type == 'TrinityCharacter') {
      return `${path}/trinity-actor-sheet.html`;
    }
    if (this.actor.type == 'TrinityNPC') {
      return `${path}/trinity-actor-sheet-npc.html`;
    }
  }

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
    this._prepareTrinityCharacterItems(data);
    console.log("getData -----", data);
    return data;
  }


  /**
   * Organize and classify Items for TrinityCharacter sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareTrinityCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const gear = [];
    const weapons = [];
    const armors = [];
    const vehicles = [];
    const edges = [];
    const skills = [];
    const specialties = [];
    const paths = [];
    const complications = [];
    const conditions = [];
    const stunts = [];
    const gifts = [];
    const tricks = [];
    const contacts = [];
    const bonds = [];
    const enhancements = [];
    const allItems = [];
    const healthBoxes = {};
    const initRolls = [];
    const unflaggedEquipment = [];
    const modes = [];
    const quantumPowers = [];
    const modePowers = [];
    const attributes = [];
    const npcAttributes = [];
    const facets = [];
    const psi = [];
    const quantum = [];
    const miscAttributes = [];
    const actions = [];

    // Identify Saved Rolls w/ Initiative Flagged
    for (let sRoll of Object.keys(this.actor.system.savedRolls)) {
      // IF check for compatibility w/ new savedRolls styles
      if (typeof this.actor.system.savedRolls[sRoll].elements !== 'undefined') {
        if (typeof this.actor.system.savedRolls[sRoll].elements.init !== 'undefined' && this.actor.system.savedRolls[sRoll].elements.init !== null) {
          if (this.actor.system.savedRolls[sRoll].elements.init.value) {
            initRolls.push(sRoll);
          }
        }
      }
    }

    // Check that Default Initiative Roll is still valid
    if (this.actor.system.initiativeRollID !== "") {
      if(typeof this.actor.system.savedRolls[this.actor.system.initiativeRollID] === 'undefined') {
        this.actor.system.initiativeRollID = "";
      }
    }

    // Get / Set All Items Filter
    if (typeof actorData.system.allItemsFilter === 'undefined') {
      actorData.system.allItemsFilter = "All";
      // console.log("Set/Reset allItemsFilter to empty.")
    }

    // Sort Items before allocating, alphabetically & favorited
    let sheetItems = sheetData.items;
    sheetItems.sort(function(a, b) {return (a.name > b.name) ? 1 : -1;});
    sheetItems.sort(function(x, y) {return (x.system.flags.isFavorite === y.system.flags.isFavorite)? 0 : x? -1 : 1;});

// Iterate through items, allocating to containers
for (let i of sheetItems) {

  let item = i.system;
  i.img = i.img || DEFAULT_TOKEN;

  // "item" sub-types - Gear / Weapon / Armor / Vehicle
  if ((i.type === 'item' || i.type === 'equipment') && i.system.flags.isGear === true) { gear.push(i); }
  if ((i.type === 'item' || i.type === 'equipment') && i.system.flags.isWeapon === true) { weapons.push(i); }
  if ((i.type === 'item' || i.type === 'equipment') && i.system.flags.isArmor === true) { armors.push(i); }
  if ((i.type === 'item' || i.type === 'equipment') && i.system.flags.isVehicle === true) { vehicles.push(i); }
  // unflaggedEquipment
  if ((i.type === 'item' || i.type === 'equipment')
    && i.system.flags.isGear !== true
    && i.system.flags.isWeapon !== true
    && i.system.flags.isArmor !== true
    && i.system.flags.isVehicle !== true) { unflaggedEquipment.push(i); }

  // Other item types
  if (i.type === 'edge') { edges.push(i); }
  if (i.type === 'skill') { skills.push(i); }
  skills.sort((a, b) => a.name.localeCompare(b.name));
  if (i.type === 'specialty') { specialties.push(i); }
  if (i.type === 'path') { paths.push(i); }
  if (i.system.flags.isComplication === true) { complications.push(i); }
  if (i.system.flags.isEnhancement === true) { enhancements.push(i); }
  if (i.type === 'gift') { gifts.push(i); }
  if (i.type === 'trick') { tricks.push(i); }
  if (i.type === 'condition') { conditions.push(i); }
  if (i.type === 'contact') { contacts.push(i); }
  if (i.type === 'bond') { bonds.push(i); }
  if (i.type === 'mode') { modes.push(i); }
  if (i.type === 'quantumPower') { quantumPowers.push(i); }
  if (i.type === 'modePower') { modePowers.push(i); }
  if (i.type === 'action') { actions.push(i); }
  if (i.type === 'attribute') {
    if (i.system.flags.isMain) {
      if (typeof i.system.sortNum === 'undefined' || i.system.sortNum === null) { i.system.sortNum = 0; }
      attributes.push(i);
      attributes.sort(function(a, b) {
        return a.system.sortNum - b.system.sortNum;
      });
    } else if (i.system.flags.isFacet) {
      if (typeof i.system.sortNum === 'undefined' || i.system.sortNum === null) { i.system.sortNum = 0; }
      facets.push(i);
      facets.sort(function(a, b) {
        return a.system.sortNum - b.system.sortNum;
      });
    } else if (i.system.flags.isPsi) {
      if (typeof i.system.sortNum === 'undefined' || i.system.sortNum === null) { i.system.sortNum = 0; }
      psi.push(i);
      psi.sort(function(a, b) {
        return a.system.sortNum - b.system.sortNum;
      });
    } else if (i.system.flags.isQuantum) {
           if (typeof i.system.sortNum === 'undefined' || i.system.sortNum === null) { i.system.sortNum = 0; }
      quantum.push(i);
      quantum.sort(function(a, b) {
        return a.system.sortNum - b.system.sortNum;
      });
    } else {
      if (typeof i.system.sortNum === 'undefined' || i.system.sortNum === null) { i.system.sortNum = 0; }
      miscAttributes.push(i);
      miscAttributes.sort(function(a, b) {
        return a.system.sortNum - b.system.sortNum;
      });
    }
  }
  if (i.type === 'attribute') {
    if (i.system.flags.isMain) {
      if (typeof i.system.sortNum === 'undefined' || i.system.sortNum === null) { i.system.sortNum = 0; }
      npcAttributes.push(i);
      npcAttributes.sort(function(a, b) {
        return a.system.sortNum - b.system.sortNum;
      });
    } else if (i.system.flags.isEnhancement && !i.system.flags.isFacet) {
      if (typeof i.system.sortNum === 'undefined' || i.system.sortNum === null) { i.system.sortNum = 0; }
      npcAttributes.push(i);
      npcAttributes.sort(function(a, b) {
        return a.system.sortNum - b.system.sortNum;
      });
    }
  }
  if (typeof(i.system.stunts) !== "undefined" && Object.keys(i.system.stunts).length > 0  && i.type !== 'action') { stunts.push(i); }

  allItems.push(i);

}

    // Assign and return
    actorData.gear = gear;
    actorData.weapons = weapons;
    actorData.armors = armors;
    actorData.vehicles = vehicles;
    actorData.edges = edges;
    actorData.skills = skills;
    actorData.specialties = specialties;
    actorData.paths = paths;
    actorData.complications = complications;
    actorData.enhancements = enhancements;
    actorData.conditions = conditions;
    actorData.stunts = stunts;
    actorData.gifts = gifts;
    actorData.tricks = tricks;
    actorData.contacts = contacts;
    actorData.bonds = bonds;
    actorData.healthBoxes = healthBoxes;
    actorData.allItems = allItems;
    actorData.initRolls = initRolls;
    actorData.unflaggedEquipment = unflaggedEquipment;
    actorData.modes = modes;
    actorData.quantumPowers = quantumPowers;
    actorData.modePowers = modePowers;
    actorData.attributes = attributes;
    actorData.npcAttributes = npcAttributes;
    actorData.facets = facets;
    actorData.psi = psi;
    actorData.quantum = quantum;
    actorData.miscAttributes = actorData;
    actorData.actions = actions;





  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.on("mouseenter mouseleave", ".portrait-area", function (event) {
      event.preventDefault();
      // event.currentTarget.nextElementSibling.classList.toggle("hidden");
      // event.currentTarget.parentElement.querySelector(".portrait-popout")?.classList.toggle("hidden", event.type == "mouseenter");
      event.currentTarget.parentElement.querySelector(".portrait-popout")?.classList.toggle("hidden");
    });

    html.find('.portrait-popout').click(ev => {
      let ip = new ImagePopout(event.currentTarget.previousElementSibling.src, {
        title: this.actor.name,
        shareable: true,
        uuid: this.actor.uuid
      });
      console.log("ip",ip);
      // Display the image popout
      ip.render(true);

      // Share the image with other connected players
      // ip.share();

    });


    // Everything below here is only needed if the sheet is editable
if (!this.options.editable) return;

// Show sub-item details
html.find('.show-detail').click(ev => {
  ev.currentTarget.parentElement.nextElementSibling.classList.toggle("hidden");
});

// Edit Button toggle for entire sheet
html.find('.edit-button').click(ev => {
  html.find('.edit-button').each((i, editButton) => {
    editButton.classList.toggle("hidden");
  });
  html.find('.edit-area').each((i, editArea) => {
    editArea.classList.toggle("hidden");
    editArea.previousElementSibling.classList.toggle("hidden");
  });
  html.find('.config-tab').each((i, editArea) => {
    editArea.classList.toggle("hidden");
  });
  this._saveToggleStates();
});

// Collapsible Button on Config page
html.find('.collapsible').click(event => {
  const collapsibleElement = event.currentTarget;
  collapsibleElement.classList.toggle("collapsible-active");
  collapsibleElement.nextElementSibling.classList.toggle("collapsible-content-active");
  this._saveToggleStates();
});

html.find('.chip-control').click(event => {
  event.currentTarget.previousElementSibling.classList.toggle("chip-hidden");
  event.currentTarget.previousElementSibling.previousElementSibling.classList.toggle("chip-hidden");
});

// updates the actor outside the normal input/select process to allow for multiple inputs for the same value
html.find('.chip-select').change(event => {
  console.log(".chip-select", event);
  let varName = event.currentTarget.dataset.name;
  let varValue = event.currentTarget.value;
  this.actor.update({ [varName]: varValue });
});

// Return a value by putting together two pieces of a variable name.
// ex:
// obj = this.actor
// desc = data.tolerance.value
// returns = this.actor.system.tolerance.value
function getDescendantProp(obj, desc) {
  var arr = desc.split('.');
  while (arr.length) {
    obj = obj[arr.shift()];
  }
  return obj;
}

// Item edits
html.find('.item-value-edit').change(ev => {
  // console.log("sub-value, ev:", ev);
  let target = ev.currentTarget.dataset.target;
  if (typeof ev.currentTarget.dataset.itemid !== "undefined") {
    let itemid = ev.currentTarget.dataset.itemid;
    let item = this.actor.items.get(itemid);
    item.update({ [target]: ev.currentTarget.value });
  }
});

// Subtract 1 from value target
html.find('.sub-value').click(ev => {
  let target = ev.currentTarget.dataset.target;
  let negative = ev.currentTarget.dataset.negative === "true";
  
  if (ev.currentTarget.dataset.itemid !== undefined) {
    let itemid = ev.currentTarget.dataset.itemid;
    let item = this.actor.items.get(itemid);
    let current = getProperty(item, target);
  
    if (current === null) {
      item.update({ [target]: 2 });
    }
    if (current > 0 || negative) {
      item.update({ [target]: current - 1 });
    }
  } else {
    let current = getProperty(this.actor, target);
  
    if (current === null) {
      this.actor.update({ [target]: 2 });
    }
    if (current > 0 || negative) {
      this.actor.update({ [target]: current - 1 });
    }
  }
});

// Add 1 to value target
html.find('.add-value').click(ev => {
  let target = ev.currentTarget.dataset.target;

  if (ev.currentTarget.dataset.itemid !== undefined) {
    let itemid = ev.currentTarget.dataset.itemid;
    let item = this.actor.items.get(itemid);
    let current = getProperty(item, target);

    if (current === null || current < 0) {
      item.update({ [target]: 0 });
    }
    item.update({ [target]: current + 1 });
  } else {
    let current = getProperty(this.actor, target);
    console.log("Add Value, ev:", ev);
    console.log("Add Value, current:", current);
    console.log("Add Value, target:", target);

    if (current === null || current < 0) {
      this.actor.update({ [target]: 0 });
    }
    this.actor.update({ [target]: current + 1 });
  }
});
//HERE
    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Healthbox Click Handling
    html.find('.healthbox').click(this._healthBoxLClick.bind(this)); // Left Click
    html.find('.healthbox').contextmenu(this._healthBoxRClick.bind(this)); // Right Click

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      console.log("item-edit click:", ev);
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Toggle Favorite flag
    html.find('.item-favorite').click(ev => {
      console.log("item-favorite click:", ev);
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.update({ 'data.flags.isFavorite': !item.system.data.flags.isFavorite });
    });

    // Output Item Description to Chat
    html.find('.item-chat').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      console.log("chat item:", item);
      let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker(),
        flavor: (item.system.data.typeName + " Description"),
        content: ("<h2>"+item.name+"</h2>"+item.system.data.description)
      };
      console.log("chatData:", chatData);
      ChatMessage.create(chatData);
      // item.sheet.render(true);
    });

    html.find('.sub-item-chat').click(ev => {
      console.log(".sub-item-chat listener ev: ", ev);
      let li = $(ev.currentTarget).parents(".sub-item");
      let liID = li.data("itemId");
      let pi = $(ev.currentTarget).parents(".item");
      let item = this.actor.items.get(pi.data("itemId"));
      console.log(".sub-item-chat listener li, liID, item: ", li, liID, item);
      // let ownerItem =
      // console.log("chat output:", this, ev, li, liID);
      let ownerName = item.name;
      let addinfo = (item.system.data.subItems[liID].type === "stunt") ? item.system.data.subItems[liID].costDescription : item.system.data.subItems[liID].tagValue;
      let subItemName = item.system.data.subItems[liID].name+" ("+addinfo+")";
      let subItemDesc = item.system.data.subItems[liID].description;
      let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker(),
        flavor: ("From "+ownerName),
        content: ("<h2>"+subItemName+"</h2>"+subItemDesc)
      };
      ChatMessage.create(chatData);
    });

//Here
// Delete Inventory Item
html.find('.item-delete').click(ev => {
  const li = $(ev.currentTarget).parents(".item");

  let deleteConfirm = new Dialog({
    title: "Delete Confirmation",
    content: "Delete Item?",
    buttons: {
      Yes: {
        icon: '<i class="fa fa-check"></i>',
        label: "Yes",
        callback: dlg => {
          // this.actor.deleteOwnedItem(li.data("itemId"));
          this.actor.deleteEmbeddedDocuments('Item', [li.data("itemId")]);
          li.slideUp(200, () => this.render(false));
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel"
      },
    },
    default: 'Yes'
  });
  deleteConfirm.render(true);
});

    // Delete Saved Roll
    html.find('.roll-delete').click(ev => {
      const roll = event.currentTarget.dataset.rollid;
      const rollDeleteString = "data.savedRolls.-=" + roll;
      let aID = this.actor.id;

      let deleteConfirm = new Dialog({
        title: "Delete Confirmation",
        content: "Delete Item?",
        buttons: {
          Yes: {
            icon: '<i class="fa fa-check"></i>',
            label: "Yes",
            callback: dlg => {
              // this.actor.update({[rollDeleteString]: null});
              game.actors.get(aID).update({[rollDeleteString]: null});

            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel"
          },
        },
        default: 'Yes'
      });
      deleteConfirm.render(true);
    });

    // Rollable abilities.
    /* Original roll code, before checking for saved roll info */
    html.find('.rollable').click(this._onRoll.bind(this));

    // New Test, for FormApplication
    html.find('.actor-roll-button').click(ev => {

      new RollForm(this.actor, {event:ev}).render(true);
    });

    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  async _healthBoxLClick(event) {
    event.preventDefault();
    console.log("Health Box Left Click");

    // Model T handling: Create Injury Item
if (game.settings.get("trinity", "healthModel") === "modelT") {
  console.log("Create Item - Injury");

  const header = event.currentTarget;
  // Get the type of item to create.
  const type = header.dataset.type;

  // Grab any data associated with this control.
  const data = duplicate(header.dataset);
  // Initialize a default name.
  const name = `New ${type.capitalize()}`;
  // Prepare the item object.
  const itemData = {
    name: name,
    type: type,
    data: data,
    flags: {
      isInjury: true,
      isComplication: true
    }
  };

  const healthDetails = Object.values(this.actor.system.health.details).find(b => b.type === +header.dataset.healthtype);
  itemData.system = {
    injury: {
      type: +header.dataset.healthtype,
      value: healthDetails.penalty
    },
    complication: {
      value: healthDetails.penalty
    }
  };

  // pop-out new condition, bypass normal process
  delete itemData.system.type;

  console.log("injury create itemdata bottom", itemData);
  this.actor.createEmbeddedDocuments('Item', [itemData], { renderSheet: true });

  return;
}

    // Model S handling: Update state
    let header = event.currentTarget;
    let hKey = header.dataset.healthkey;
    let hStates = this.actor.system.health.details[hKey].states;
    let hStateIndex = header.dataset.healthstate;
    let hState = this.actor.system.health.details[hKey].states[hStateIndex];

    if ( hState < 3 ) {
      hStates[hStateIndex] = ++hState;
      this.actor.update({ "data.health.details" : { [hKey] : { states : hStates } } } );
    }

    return;
  }

  async _healthBoxRClick(event) {
    event.preventDefault();
    console.log("Health Box Right Click");

    // Model T handling: Nothing happens
    if ( game.settings.get("trinity", "healthModel") === "modelT" ) { return; }

    // Model S handling: Update state
    let header = event.currentTarget;
    let hKey = header.dataset.healthkey;
    let hStates = this.actor.system.health.details[hKey].states;
    let hStateIndex = header.dataset.healthstate;
    let hState = this.actor.system.health.details[hKey].states[hStateIndex];

    if ( hState > 0 ) {
      hStates[hStateIndex] = --hState;
      this.actor.update({ "data.health.details" : { [hKey] : { states : hStates } } } );
    }

    return;
  }


  async _onItemCreate(event) {
    event.preventDefault();
  
    console.log("_onItemCreate(event)");
    console.log(event); // <--- Need to figure out how to handle subtypes
  
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
  
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data,
    };
  
    // Subtype / Flag handling
    if (typeof header.dataset.flag !== "undefined" && header.dataset.flag !== null) {
      console.log("Create Item Flag Handling");
      itemData.flags = {};
      itemData.flags[header.dataset.flag] = true;
    }
  
    console.log(itemData);
  
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];
  
    // Finally, create the item!
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  _onRoll(event) {
    console.log("_onRoll: Launch trinityRoll event");
    console.log(event);
    event.preventDefault();
    if (event.currentTarget.classList.contains("saved-roll")) {
      let rollData = this.actor.system.savedRolls[event.currentTarget.dataset.rollid];
      console.log("rollData found: ", rollData);
      // trinityRoll(this.actor, passElements, event);
      new RollForm(this.actor, {event:event}, rollData).render(true);
    } else {
      // trinityRoll(this.actor, null, event);
      new RollForm(this.actor, {event:event}, null, event.currentTarget.id).render(true);

    }
  }

}
