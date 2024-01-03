export function setHealth(actorData) {

  // Create default models, if not already present
  if ( actorData.system.health.models.modelT.length === 0 ) { actorData.system.health.models.modelT = modelSetup("modelT"); }
  if ( actorData.system.health.models.modelS.length === 0 ) { actorData.system.health.models.modelS = modelSetup("modelS"); }

  // Set health, using model determined by game.setting
  if (game.settings.get("trinity", "healthModel") === "modelT") {actorData.system.health.details = actorData.system.health.models.modelT;}
  if (game.settings.get("trinity", "healthModel") === "modelS") {actorData.system.health.details = actorData.system.health.models.modelS;}

  // update # of states based on # of boxes
  for (let i of actorData.system.health.details) {
    if (i.boxes < 0 ) { i.boxes = 0; }
    while ( i.boxes > i.states.length ) { i.states.push(0); }
    while ( i.boxes < i.states.length ) { i.states.length = i.boxes; }
  }

  // Model T:
  // Assign states by injury item look-up & add extra states when needed
  if (game.settings.get("trinity", "healthModel") === "modelT") {
    let injuries = actorData.items.filter(i => i.data.system.flags.isInjury);
    for (let i of injuries) {
      let assigned = false;
      let boxGroup = actorData.system.health.details.find(b => (b.type === i.data.system.injury.type)) ;
      if (typeof boxGroup !== 'undefined' ) {
        for (let [index, state] of boxGroup.states.entries()) {
          if (state === 0) {
            boxGroup.states[index] = 3;
            assigned = true; break;
          }
        }
        if ( !assigned ) { boxGroup.states.push(4); }
      }
    }
  }

  // Set health value/max for token bars, using # of Boxes,
  // and set the highest type penalty/status for display and roller use
  let totalBoxes = 0;
  let filledBoxes = 0;
  let topName = "";
  let topPenalty = null;
  let topType = 0;

  for (let i of actorData.system.health.details) {
    totalBoxes += i.boxes;
    for (let s of i.states) {
      if (s > 0) {
        ++filledBoxes;
        if (i.type > topType) {
          topName = i.name;
          topPenalty = i.penalty;
          topType = i.type;
        }
      }
    }
  }

  actorData.system.health.summary.max = totalBoxes;
  actorData.system.health.summary.value = totalBoxes - filledBoxes;
  actorData.system.health.summary.status = topName;
  actorData.system.health.summary.penalty = topPenalty;

}

/*
Default Health Model(s) Creation
Penalty: Positive means a complication of that value will be created, negative is a reduction in dice pools
Boxes: # of health boxes of that type
States: The state of each health box:
  0 - Healthy/Unfilled
  1 - Non-Leathal (Model S)
  2 - Leathal (Model S)
  3 - Injured (Model T) / Aggravated (Model S)
  4 - Excess Damage (Model T)
*/
function modelSetup(model) {

  // Model T - Trinity Continuum
  let modelT = [
    {
      name : "Armor",
      penalty : 0,
      boxes : 0,
      states : [],
      type : 1
    },
    {
      name : "Bruised",
      penalty : 1,
      boxes : 1,
      states : [0],
      type : 2
    },
    {
      name : "Injured",
      penalty : 2,
      boxes : 1,
      states : [0],
      type : 3
    },
    {
      name : "Maimed",
      penalty : 4,
      boxes : 1,
      states : [0],
      type : 4
    },
    {
      name : "Taken Out",
      penalty : 0,
      boxes : 1,
      states : [0],
      type : 5
    }
  ];

  // Model S - Storyteller / WoD
  let modelS = [
    {
      name : "Bruised (-0)",
      penalty : 0,
      boxes : 1,
      states : [0],
      type : 1
    },
    {
      name : "Hurt (-1)",
      penalty : -1,
      boxes : 1,
      states : [0],
      type : 2
    },
    {
      name : "Injured (-1)",
      penalty : -1,
      boxes : 1,
      states : [0],
      type : 3
    },
    {
      name : "Wounded (-2)",
      penalty : -2,
      boxes : 1,
      states : [0],
      type : 4
    },
    {
      name : "Mauled (-2)",
      penalty : -2,
      boxes : 1,
      states : [0],
      type : 5
    },
    {
      name : "Crippled (-5)",
      penalty : -5,
      boxes : 1,
      states : [0],
      type : 6
    },
    {
      name : "Incapacitated",
      penalty : 0,
      boxes : 1,
      states : [0],
      type : 7
    }
  ];

  if (model === "modelT") {return modelT;}
  if (model === "modelS") {return modelS;}

}
