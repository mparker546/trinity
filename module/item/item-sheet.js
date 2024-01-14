/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class TrinityItemSheet extends ItemSheet {

/*
  constructor(object={}, options={}) {
    super(options);
    this.object = object;
    this.form = null;
    this.filepickers = [];
    this.editors = {};
    this.options.toggled = [];
  }
*/

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["trinity", "sheet", "item"],
      width: 520,
      height: 480,
      tabs:
      [
        {
        navSelector: ".sheet-tabs",
        contentSelector: ".sheet-body",
        initial: "description"
        }
      ],
      dragDrop:
      [
                { dragSelector: '.item[data-item-id]', dropSelector: null }
      ]
    });
  }

  /** @override */
  get template() {
    const path = "systems/trinity/templates/item";
    // Return a single sheet for all item types.
    return `${path}/item-sheet.html`;

  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();

    return data;
  }

  /* -------------------------------------------- */

  /** @override */
  setPosition(options = {}) {
    const position = super.setPosition(options);
    const sheetBody = this.element.find(".sheet-body");
    const bodyHeight = position.height - 192;
    sheetBody.css("height", bodyHeight);
    return position;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Roll handlers, click handlers, etc. would go here.
    html.find('.sub-item-name').click(ev => {
      // let element = $(ev.currentTarget.parentElement).siblings(".item-detail");
      // console.log("item-name click", ev, element);
      //element.classList.toggle("hidden");
      event.currentTarget.parentElement.nextElementSibling.classList.toggle("hidden");
      // event.currentTarget.previousElementSibling.previousElementSibling.classList.toggle("chip-hidden");
    });


    html.find('.sub-item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");

      let deleteConfirm = new Dialog({
        title: "Delete Confirmation",
        content: "Delete Item?",
        buttons: {
          Yes: {
            icon: '<i class="fa fa-check"></i>',
            label: "Yes",
            callback: dlg => {
              let liID = li.system("itemId");
              console.log("li", li);
              console.log("liID", liID);
              console.log("ev", ev);
              this.item.update({[`data.subItems.${liID}`] : null});
              console.log("after delete", this);
              // li.slideUp(200, () => this.render(false));
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

    html.find('.sub-item-chat').click(ev => {
      let li = $(ev.currentTarget).parents(".item");
      let liID = li.system("itemId");
      let ownerName = this.item.name;
      let addinfo = (this.item.system.subItems[liID].type === "stunt") ? this.item.system.subItems[liID].costDescription : this.item.system.subItems[liID].tagValue;
      let subItemName = this.item.system.subItems[liID].name+" ("+addinfo+")";
      let subItemDesc = this.item.system.subItems[liID].description;
      console.log("chat output:", this, ownerName, subItemName, subItemDesc);
      let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker(),
        flavor: ("From "+ownerName),
        content: ("<h2>"+subItemName+"</h2>"+subItemDesc)
      };
      console.log("chatData:", chatData);
      ChatMessage.create(chatData);
    });

    function getDescendantProp(obj, desc) {
      var arr = desc.split('.');
      while (arr.length) {
        obj = obj[arr.shift()];
      }
      return obj;
    }

// Remove value
html.find('.sub-value').click(ev => {
  console.log("sub-value, ev:", ev);
  let target = ev.currentTarget.systemset.target;
  let negative = false;
  if (ev.currentTarget.systemset.negative !== undefined && ev.currentTarget.systemset.negative === "true") {
    negative = true;
  }
  let current = getProperty(this.item, target);
  if (current === null) {
    this.item.update({ [target]: 2 });
  }
  if (current > 0 || negative) {
    this.item.update({ [target]: current - 1 });
    this.render(true);
  }
});

// Add Value
html.find('.add-value').click(ev => {
  let target = ev.currentTarget.systemset.target;
  let current = getProperty(this.item, target);
  console.log("Add Value:", ev);
  if (current === null || current < 0) {
    this.item.update({ [target]: 0 });
  }
  this.item.update({ [target]: current + 1 });
  this.render(true);
});

  }

  async _onDrop(event) {

    // Try to extract the data
    let data;
    try {
      data = JSON.parse(event.systemTransfer.getData('text/plain'));
    } catch (err) {
      return false;
    }

    console.log(event);
    console.log(data);

    switch ( data.type ) {
      case "Item":
        return this._onDropItem(event, data);
      case "Folder":
        return this._onDropFolder(event, data);
    }
  }

  async _onDropItem(event, data) {
    if ( !this.item.isOwner ) return false;
    const item = await Item.implementation.fromDropData(data);
    const itemData = item.toObject();

    // Create the owned item
    return this._onDropGetInfo(itemData);
  }

  async _onDropFolder(event, data) {
    if ( !this.item.isOwner ) return [];
    if ( data.documentName !== "Item" ) return [];
    const folder = game.folders.get(data.id);
    if ( !folder ) return [];
    return this._onDropGetInfo(folder.contents.map(e => e.toObject()));
  }

  async _onDropGetInfo(itemData) {
    itemData = itemData instanceof Array ? itemData : [itemData];
    let updates = [];
    let subItems = {};
    for (var droppedItem of itemData) {
      switch (droppedItem.type) {
        case "stunt":
          subItems = this.item.system.subItems;
          subItems[droppedItem._id] = {
            id : droppedItem._id,
            name : droppedItem.name,
            type : droppedItem.type,
            description : droppedItem.system.description,
            costDescription : droppedItem.system.costDescription
          };
          this.item.update({'data.subItems': subItems});
          break;
        case "tag":
          subItems = this.item.system.subItems;
          subItems[droppedItem._id] = {
            id : droppedItem._id,
            name : droppedItem.name,
            type : droppedItem.type,
            description : droppedItem.system.description,
            tagValue : droppedItem.system.tagValue
          };
          this.item.update({'data.subItems': subItems});
          break;
        case "modePower":
          subItems = this.item.system.subItems;
          subItems[droppedItem._id] = {
            id : droppedItem._id,
            name : droppedItem.name,
            type : droppedItem.type,
            description : droppedItem.system.description,
            costDescription : droppedItem.system.costDescription,
            dotRequirement : droppedItem.system.dotRequirement
          };
          this.item.update({'data.subItems': subItems});
          break;
      }
    }
    //console.log("_onDropGetInfo updates", updates);
    // await this.item.update(updates);
    // await this.object.update(updates);
    // await destinationItem.update(updates);
    //let logReturn = await destinationItem.update(updates);
    //console.log("_onDropGetInfo logReturn", logReturn);
    // console.log("_onDropGetInfo after switch this", this);
    // console.log("_onDropGetInfo destinationItem", destinationItem);
    // return this.actor.createEmbeddedDocuments("Item", itemData);
  }



}
