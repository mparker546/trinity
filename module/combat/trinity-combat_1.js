import { trinityRoll } from "/systems/trinity/module/trinity-roll.js";

export class TrinityCombat extends Combat
{

  async rollInitiative(ids, {formula=null, updateTurn=true, messageOptions={}}={})
  {
    // Structure input data
    ids = typeof ids === "string" ? [ids] : ids;
    const currentId = this.combatant?.id;
    const rollMode = messageOptions.rollMode || game.settings.get("core", "rollMode");

    let updates = [];
    // for(const id of ids)
    for ( let [i, id] of ids.entries() )
    {
      const combatant = this.combatants.get(id);
      if ( !combatant?.isOwner ) return results;

      var ini = "";

      // Actors w/o an initiative roll
      if (combatant.actor.data.system.initiativeRollID === "") {
        ini = 0;
        let chatData = {
          content: `${combatant.actor.data.name} has no initiative roll selected.`
        };
        ChatMessage.create(chatData)
      } else {

      // Actors w/ an initiative roll selected
        let pickedElements = combatant.actor.data.system.savedRolls[combatant.actor.data.system.initiativeRollID].elements;
        let breaker = combatant.actor.data.system.savedRolls[combatant.actor.data.system.initiativeRollID].dice;


        let combatRoll = await trinityRoll(combatant.actor, pickedElements, {}, true);
        /*
        console.log("COMBAT combatRoll: ", combatRoll);
        console.log("COMBAT combatRoll._total: ", await combatRoll._total);
        ini = await combatRoll._total + (breaker * 0.01);
        */

        /*
        const roll = combatant.getInitiativeRoll(formula);
        await roll.evaluate({async: true});
        */
        combatRoll.then( (rr) => {
          console.log("COMBAT C1: ", combatRoll.total);
          console.log("COMBAT C2: ", combatRoll._total);
          console.log("COMBAT C3: ", combatRoll._evaluated);
        });

        console.log("COMBAT A1: ", combatRoll.total);
        console.log("COMBAT A2: ", combatRoll._total);
        console.log("COMBAT A3: ", combatRoll._evaluated);

        console.log("COMBAT B1: ", await combatRoll.total);
        console.log("COMBAT B2: ", await combatRoll._total);
        console.log("COMBAT B3: ", await combatRoll._evaluated);


        ini = combatRoll._total + (breaker * 0.01);

        console.log("COMBAT ini: ", ini);
      }

      updates.push({
        _id: id,
        initiative: ini
      });
      console.log("COMBAT updates:", updates);
    }
    if ( !updates.length ) return this;

    console.log("COMBAT THIS:", this);
    await this.updateEmbeddedDocuments("Combatant", updates);
    // Ensure the turn order remains with the same combatant
    if ( updateTurn && currentId ) {
      await this.update({turn: this.turns.findIndex(t => t.id === currentId)});
    }

    return this;
  }

}
