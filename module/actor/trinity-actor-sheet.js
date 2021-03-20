/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

//trinity roll 1
// import { TrinityRoll } from "/systems/trinity/module/trinity-roll.js";

// trinity roll 2
import { trinityRoll } from "/systems/trinity/module/trinity-roll2.js";


export class TrinityActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["trinity", "sheet", "actor"],
      template: "systems/trinity/templates/actor/trinity-actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  get template() {
    const path = "systems/trinity/templates/actor";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.

    if (this.actor.data.type == 'TrinityCharacter') {
      return `${path}/trinity-actor-sheet.html`;
    }
    if (this.actor.data.type == 'character') {
      return `${path}/actor-sheet.html`;
    }
  }

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
//    for (let attr of Object.values(data.data.attributes)) {
//      attr.isCheckbox = attr.dtype === "Boolean";
//    }

    // Prepare items.
    if (this.actor.data.type == 'TrinityCharacter') {
      this._prepareTrinityCharacterItems(data);
    }

// Test section - can I add more data here for other stuff?
// No
//    if (typeof rollparts !== 'undefined'){
//      data.rollParts = rollparts;
//    }

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
    const effects = [];
    const stunts = [];
    const gifts = [];
    const tricks = [];
    const contacts = [];
    const bonds = [];
    const healthBoxes = [];
    healthBoxes.bruised = [];
    healthBoxes.injured = [];
    healthBoxes.maimed = [];

    // Create healthboxes
    // Get # of injuries - Turn this into a loop to reduce code...
    // might need to change .length to some other counter, if it's an object
    // Bruised (1)
    let bruisedNum = Object.keys(this.actor.data.items.filter(h => h.flags.isInjury && h.injury.value === 1)).length;
    if (bruisedNum <= this.actor.data.data.healthboxes.bruised) {
      healthBoxes.bruised.filled = bruisedNum;
      healthBoxes.bruised.empty = this.actor.data.data.healthboxes.bruised - healthBoxes.bruised.filled;
      healthBoxes.bruised.extra = 0;
    } else {
      healthBoxes.bruised.extra = bruisedNum - this.actor.data.data.healthboxes.bruised;
      healthBoxes.bruised.filled = bruisedNum - healthBoxes.bruised.extra;
      healthBoxes.bruised.empty = 0;
    }

    // Injured (2)
    let injuredNum = Object.keys(this.actor.data.items.find(h => h.flags.isInjury && h.injury.value === 1)).length;
    if (injuredNum <= this.actor.data.data.healthboxes.injured) {
      healthBoxes.injured.filled = injuredNum;
      healthBoxes.injured.empty = this.actor.data.data.healthboxes.injured - healthBoxes.injured.filled;
    } else {
      healthBoxes.injured.extra = injuredNum - this.actor.data.data.healthboxes.injured;
      healthBoxes.injured.filled = injuredNum - healthBoxes.injured.extra;
      healthBoxes.injured.empty = 0;
    }

    // Maimed (4)
    let maimedNum = Object.keys(this.actor.data.items.find(h => h.flags.isInjury && h.injury.value === 1)).length;
    if (maimedNum <= this.actor.data.data.healthboxes.maimed) {
      healthBoxes.maimed.filled = maimedNum;
      healthBoxes.maimed.empty = this.actor.data.data.healthboxes.maimed - healthBoxes.maimed.filled;
    } else {
      healthBoxes.maimed.extra = maimedNum - this.actor.data.data.healthboxes.maimed;
      healthBoxes.maimed.filled = maimedNum - healthBoxes.maimed.extra;
      healthBoxes.maimed.empty = 0;
    }


    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of sheetData.items) {
      let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;

      // Append to gear.
      if (i.type === 'item' && i.data.flags.isGear === true) { gear.push(i); }
      if (i.type === 'item' && i.data.flags.isWeapon === true) { weapons.push(i); }
      if (i.type === 'item' && i.data.flags.isArmor === true) { armors.push(i); }
      if (i.type === 'item' && i.data.flags.isVehicle === true) { vehicles.push(i); }

      // Append to other types.
      if (i.type === 'edge') { edges.push(i); }
      if (i.type === 'skill') { skills.push(i); }
      if (i.type === 'specialty') { specialties.push(i); }
      if (i.type === 'path') { paths.push(i); }
      if (i.data.flags.isComplication === true) { complications.push(i); }
      if (i.type === 'stunt') { stunts.push(i); }
      if (i.type === 'gift') { gifts.push(i); }
      if (i.type === 'trick') { tricks.push(i); }
      if (i.type === 'effect') { effects.push(i); }
      if (i.type === 'contact') { contacts.push(i); }
      if (i.type === 'bond') { bonds.push(i); }

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
    actorData.effects = effects;
    actorData.stunts = stunts;
    actorData.gifts = gifts;
    actorData.tricks = tricks;
    actorData.contacts = contacts;
    actorData.bonds = bonds;
    actorData.healthboxes = healthboxes;

  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Attempt to block normal handling of duplicate input boxes (which would return unwanted arrays)
    /*
    html.find('.duplicate').change(event => {
      event.preventDefault();
      console.log("Block default behavior for duplicate? This:");
      console.log(this);
    });
    */

    /* Failed attempt to make a sticky header
    html.onscroll = function() {stickyHeader()};
    var header = document.getElementById("actor-header");
    var sticky = header.offsetTop;
    function stickyHeader() {
      if (window.pageYOffset > sticky) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }
    }
    */

    /*
    html.find('.collapsible').click(ev => {
      var coll = document.getElementsByClassName("collapsible");
      for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
          this.classList.toggle("collapsible-active");
          var content = this.nextElementSibling;
          if (content.style.maxHeight){
            content.style.maxHeight = null;
          } else {
            content.style.maxHeight = content.scrollHeight + "px";
          }
        });
      }
    });
    */
    var coll = document.getElementsByClassName("collapsible");

    for (let i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("collapsible-active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight){
          content.classList.toggle("collapsible-content-active");
          content.style.maxHeight = null;
        } else {
          content.classList.toggle("collapsible-content-active");
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    }


    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  _onItemCreate(event) {
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
      data: data
    };

    // Subtype / Flag handling
    if (typeof header.dataset.flag !== 'undefined' && header.dataset.flag !== null) {
      console.log("Create Item Flag Handling");
      itemData.data.flags = {};
      itemData.data.flags[header.dataset.flag] = true;
    }

    console.log(itemData);

    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }

  _onRoll(event) {
    event.preventDefault();
    trinityRoll(this.actor, null, event);
  }



}
