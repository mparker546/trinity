/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class TrinityItemSheet extends ItemSheet {

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
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.data.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();

    /* -- Moved to item.js
    const itemData = data.item;
    const stunts = [];
    const tags = [];

    for (let i of Object.keys(this.item.data.data.subItems)) {
      let subItem = this.item.data.data.subItems[i];
      if (subItem.type === 'stunt') { stunts.push(subItem); }
      if (subItem.type === 'tag') { tags.push(subItem); }
    }

    // Assign and return
    itemData.stunts = stunts;
    itemData.tags = tags;
    */

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
              // this.actor.deleteOwnedItem(li.data("itemId"));
              // this.actor.deleteEmbeddedDocuments('Item',[li.data("itemId")]);
              let liID = li.data("itemId");
              console.log("li", li);
              console.log("liID", liID);
              console.log("ev", ev);
              //this.item.update({`data.subItems.-=${liID}`: null});
              this.item.update({[`data.subItems.-=${liID}`] : null});
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
      const li = $(ev.currentTarget).parents(".item");
      let liID = li.data("itemId");
      // const item = this.actor.items.get(li.data("itemId"));
      console.log("chat item:", item);
      let chatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker(),
        flavor: ("From " this.item.data.name),
        content: ("<h2>"+this.item.data.data.subItems[liID].name+"</h2>"+this.item.data.data.subItems[liID].description)
      };
      console.log("chatData:", chatData);
      ChatMessage.create(chatData);
      // item.sheet.render(true);
    });


    // html.find('.memorization-slot').on("drop", console.log("something dropped: ",this));

  }

  async _onDrop(event) {

    // Try to extract the data
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    } catch (err) {
      return false;
    }

    console.log(event);
    console.log(data);

    switch ( data.type ) {
    /*  case "ActiveEffect":
        return this._onDropActiveEffect(event, data);
      case "Actor":
        return this._onDropActor(event, data); */
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

    // Handle item sorting within the same Actor
    // if ( await this._isFromSameActor(data) ) return this._onSortItem(event, itemData);

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
    // console.log("_onDropGetInfo itemData", itemData);
    // console.log("_onDropGetInfo this", this);
    // let destinationItem = game.items.get(this.object.id) || game.actors.get(this.object.actor).items.get(this.object.id).type
    // console.log("_onDropGetInfo destinationItem", destinationItem);
    let updates = [];
    let subItems = {};
    for (var droppedItem of itemData) {
      switch (droppedItem.type) {
        case "stunt":
          // console.log("_onDropGetInfo this-in-loop", this);
          // console.log("_onDropGetInfo droppedItem-in-loop", droppedItem);
          subItems = this.item.data.data.subItems;
          subItems[droppedItem._id] = {
            id : droppedItem._id,
            name : droppedItem.name,
            type : droppedItem.type,
            description : droppedItem.data.description,
            costDescription : droppedItem.data.costDescription
          };
          this.item.update({'data.subItems': subItems});
          break;
        case "tag":
          subItems = this.item.data.data.subItems;
          subItems[droppedItem._id] = {
            id : droppedItem._id,
            name : droppedItem.name,
            type : droppedItem.type,
            description : droppedItem.data.description,
            tagValue : droppedItem.data.tagValue
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
