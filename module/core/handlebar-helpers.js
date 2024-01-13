export function handlebarHelpers() {

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function() {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function(str) {
    return str.toLowerCase();
  });

  // Used for the HealthBox edit - in need of FIXME / TODO
  Handlebars.registerHelper('hbPathFixer', function(str, act) {
    return act.data.system.health.details[str].boxes;
  });

  /* Not used now, fixed template
  Handlebars.registerHelper('varToString', function(v) {
    return Object.keys({v})[0];
  });
  */

  // From Party-Overview
  Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("isEqual", function (arg1, arg2, arg3) {
    let isEqual = false;
    if (arg1 === arg2 || arg1 === arg3) { isEqual = true; }
    return isEqual;
  });

  // return value of trinity game setting
  Handlebars.registerHelper("getSetting", function (arg) {
    return JSON.parse(game.settings.get("trinity", arg));
  });

  Handlebars.registerHelper("getSettingArray", function (arg1) {
    let settingArray = JSON.parse(game.settings.get("trinity", arg1));
    // if (arg2) {settingArray.push("");}
    return settingArray;
  });

/*
  Handlebars.registerHelper('isPopulated', function (arg) {
    return value !== undefined;
  });
*/

  Handlebars.registerHelper('toDots', function(n, m) {
    let dots = '';
    let filled = '<i class="fa fa-circle"></i>';
    let empty = '<i class="far fa-circle"></i>';
    let mega = '<i class="fas fa-exclamation-circle"></i>';
    if (n > 10) {
      dots = n.toString();
      dots += filled;
    } else {
      for (let i = 0; i < Math.max(n, 5); i++) {
        if (i === 5) { dots += ' '; }
        if (i < n) {
          if (i < m) { dots += mega; }
          else { dots += filled; }
        }
        else {dots += empty;}
      }
    }
    return dots;
  });

  Handlebars.registerHelper('to10Dots', function(n) {
    let dots = '';
    let filled = '<i class="fa fa-circle"></i>';
    let empty = '<i class="far fa-circle"></i>';
    if (n > 10) {
      dots = n.toString();
      dots += filled;
    } else {
      for (let i = 0; i < Math.max(n, 10); i++) {
        if (i < n) { dots += filled; }
          else {dots += empty;}
      }
    }
    return dots;
  });

  Handlebars.registerHelper('to10Boxes', function(n) {
    let dots = '';
    let filled = '<i class="fas fa-square"></i>';
    let empty = '<i class="far fa-square"></i>';
    if (n > 10) {
      dots = n.toString();
      dots += filled;
    } else {
      for (let i = 0; i < Math.max(n, 10); i++) {
        if (i < n) { dots += filled; }
          else {dots += empty;}
      }
    }
    return dots;
  });

  Handlebars.registerHelper('toHealthBoxes', function(state) {
    if (typeof state === "undefined") { console.log("MISSING STATES"); return;}

    let box = '';
    let extraBox = '<i class="fas fa-plus-square fa-stack-2x"></i>';
    let filledBox = '<i class="fas fa-square fa-stack-2x"></i>';
    let emptyBox = '<i class="far fa-square fa-stack-2x"></i>';
    let state1Box = '<i class="far fa-square fa-stack-2x"></i><i class="fas fa-slash fa-stack-1x"></i>';
    let state2Box = '<i class="far fa-square fa-stack-2x"></i><i class="fas fa-times fa-stack-1x"></i>';
    switch ( state ) {
      case 0 : box = emptyBox; break;
      case 1 : box = state1Box; break;
      case 2 : box = state2Box; break;
      case 3 : box = filledBox; break;
      case 4 : box = extraBox; break;
    }
    return box;
  });

  Handlebars.registerHelper('uniqueTypes', function(items) {
    let types = [];
    for (let i of items) {
      if (i && i.data && i.data.typeName && types.indexOf(i.data.typeName) === -1) {
        types.push(i.data.typeName);
      }
    }
    types.sort(function(a, b) {
      return a > b ? 1 : -1;
    });
    return types;
  });

  Handlebars.registerHelper('mult', function(n) {
    let end = n.toString() + 'x</div>';
    let hidden = '<div class="flex-valign left small" style="visibility:hidden;">';
    let visible = '<div class="flex-valign left small">';
    if (n === 1) {
      return (hidden+end);
    } else {
      return (visible+end);
    }
  });

// Quintessence / Paradox Circle
  Handlebars.registerHelper('qpCircle', function(tracker) {
    if ( !tracker ) { return; }
    let html = '';
    let emptyBox = '<i class="qpicon far fa-square"></i>';
    let qBox = '<i class="qpicon far fa-sun"></i>';
    let pBox = '<i class="qpicon fas fa-pastafarianism"></i>';

    for (var i = 0; i <= tracker.length; i++) {
      switch ( tracker[i] ) {
        case "" : html += emptyBox; break;
        case "Q" : html += qBox; break;
        case "P" : html += pBox; break;
      }
    }
    console.log("QP tracker", tracker);
    return html;
  });

// Use on an actor sheet like: {{{createChip "data.defense.value"}}} or simply {{{createChip "defense"}}}
// Use on an actor sheet, within an #each, like: {{{createChip item._id ../actor}}}
// Use on an item sheet like: {{{createChip this.item.id}}}
// This code is inefficient and repetitive - fixing it will be a project for another day
  Handlebars.registerHelper('createChip', function(ref, argActor) {
    //console.log("createChip, ref", ref);
    //console.log("createChip, this", this);
    //console.log("createChip, actor", this.actor);
    //console.log("createChip, argActor", argActor);
    let targetActor = {};
    if (typeof argActor !== "undefined" && typeof argActor.name !== "undefined" && argActor.name === "createChip") {
      argActor = null;
    }
    if (argActor) {
      targetActor = argActor;
    } else {
      targetActor = this.actor || this.item.actor;
    }
    //console.log("createChip, targetActor", targetActor);
    // let targetActor = this.actor || this.item.actor;
    let isItem = false;
    let isLinked = false;
    let rollName = "No Roll Linked";
    let rollData = {};
    let linkedRoll = "";
    let linkKey = "";
    let targetItem = {};
    let html = "";

    if (!argActor && !targetActor) {
      html =
      `<div class="chip">
        <div class="chip-head">
          <i class="fas fa-dice"></i>
        </div>
      </div>`;
      return html;
    }

    // convert the ref to a complete path
let refPath = targetActor.data.system.linkedRolls;
let refSplit = ref.split('.');
for (var i = 0; i < refSplit.length; i++) {
  if (typeof refPath === "object" && refSplit[i] in refPath) {
    refPath = refPath[refSplit[i]];
  }
}

// check if ref is an actor quality or an item
if (typeof targetActor.items.get(ref) !== "undefined") {
  isItem = true;
  targetItem = targetActor.items.get(ref);
}


if (!isItem) {
  if (refPath !== null && refPath !== "") {
    linkedRoll = refPath;
    isLinked = true;
    rollData = targetActor.data.system.savedRolls[refPath];
  }
} else if (isItem) {
  if (targetActor.data.system.linkedRolls[ref] !== null && targetActor.data.system.linkedRolls[ref] !== "") {
    linkedRoll = targetActor.data.system.linkedRolls[ref];
    isLinked = true;
    rollData = targetActor.data.system.savedRolls[linkedRoll];
  }
}

if (isLinked && typeof rollData !== "undefined" && typeof rollname !== "undefined") {
  rollName = rollname;
}

    
    // Build option list
    let optionHTML = "";
    for (const [key, value] of Object.entries(targetActor.data.system.savedRolls)) {
      let selected = "";
      if (key === linkedRoll) {
        selected = "selected";
        linkKey = key;
      }
      optionHTML += `<option value="${key}" ${selected}>${value.name}</option>`;
    }

// New method that uses the general edit-area toggle
let chipHeadDiv = "";
if (rollData && Object.keys(rollData).length === 0) {
  chipHeadDiv += `<div class="chip-head" id="${ref}">`;
} else {
  chipHeadDiv += `<div class="chip-head saved-roll rollable" id="${ref}" data-rollID="${linkKey}">`;
}
    html =
    `<div class="chip">
      ${chipHeadDiv}
        <i class="fas fa-dice"></i>
      </div>
      <div class="placeholder can-hide">
      </div>
      <div class="chip-content chip-change can-hide hidden edit-area">
        <label class="chip-body chip-label" for="chip-select">Link Roll: </label>
        <select class="chip-body chip-select" id="chip-select" data-name="data.linkedRolls.${ref}" data-dtype="String">
          <option value="">None Selected</option>
          ${optionHTML}
        </select>
      </div>
    </div>`
    ;

    return html;
  });

}
