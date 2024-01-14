// trinity roll 2
import { trinityRoll } from "/systems/trinity/module/trinity-roll.js";
import { pickedElementsProto } from "/systems/trinity/module/protos.js";

export class Picker {

  static async pDialog(pickType, targetActor, pickedElements) {

    var html = {};
    let pItems = {};

    switch(pickType) {
      case "attr":
        html = await renderTemplate("systems/trinity/templates/pickers/pick-attr.html", {picked: pickedElements, actor: targetActor});
        break;
      case "skil":
        pItems = targetActor.items.filter(f => f.type.includes("skill"));
        html = await renderTemplate("systems/trinity/templates/pickers/pick-skil.html", {items: pItems, actor: targetActor});
        break;
      case "enha":
        pItems = targetActor.items.filter(f => f.system.flags.isEnhancement === true);
        pickedElements.enha = {};
        Object.assign(pickedElements.enha, pickedElementsProto.enha);
        html = await renderTemplate("systems/trinity/templates/pickers/pick-enha.html", {items: pItems, actor: targetActor});
        break;
      default:
        ui.notifications.warn("No Picker Type Found.");
        return;
    }

    // const pickDialog = await new Promise(resolve => {
    return new Promise((resolve, reject) => {
        new Dialog({
        title: "Pick Element",
        id: "picker",
        content: html,
        buttons: {
          update: {
            icon: "<i class='fas fa-redo'></i>",
            label: "Update",
            callback: () => {
              for (let i of document.getElementsByClassName('input')) {
                if (i.checked) {  // maybe i[0], might not work with Enha/Checkbox
                  switch(pickType) {
                    case "attr":
                      pickedElements.attr = Object.values(targetActor.system.attributes).find(attribute => attribute.system.name === i.value) || pickedElements.attr;
                      break;
                    case "skil":
                      pickedElements.skil = targetActor.items.find(item => item.id === i.id).system || pickedElements.skil;
                      pickedElements.skil.value = pickedElements.skil.value;
                      break;
                    case "enha":
                      pickedElements.enha[i.id] = targetActor.items.find(item => item.id === i.id).system || pickedElements.enha;
                      pickedElements.enha.value = parseInt(pickedElements.enha.value) + parseInt(pickedElements.enha[i.id].enhancement.value);
                      // pickedElements.enha.name = pickedElements.enha.name + '•' + pickedElements.enha[i.id].name;

                      console.log("enha case name assignment");
                      console.log(pickedElementsProto.enha.name);
                      pickedElements.enha.name = ((pickedElements.enha.name === pickedElementsProto.enha.name) ? (pickedElements.enha[i.id].name) : (pickedElements.enha.name + ' • ' + pickedElements.enha[i.id].name));

                      console.log(pickedElements);

                      break;
                  }
                }
              };

              console.log("pickedElements");
              console.log(pickedElements);

              // console.log(pickedElements);
              // resolve(pickedElements);

              // trinityRoll(null, targetActor, pickedElements);
              trinityRoll(targetActor, pickedElements);

              resolve(pickedElements);
            }
          },
          cancel: {
            icon: "<i class='fas fa-times'></i>",
            label: "Cancel",
            callback: () => {
              trinityRoll(targetActor, pickedElements);
              resolve(pickedElements);
          //	  actionType = "remove";
            }
          },
        },
        default:"roll",
        callback: html => {
          resolve(pickedElements);
//            console.log(html, actor);
      }
    }).render(true);
  });
}

}
