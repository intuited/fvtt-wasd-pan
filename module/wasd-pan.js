const MODULE_ID = 'wasd-pan';
const MODULE_ABBREV = 'WASDPAN';
const MODULE_PATH = 'modules/'.concat(MODULE_ID);

//============Dev Mode logging setup===============
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(MODULE_ID);
});

const devModeActive = () => game.modules.get('_dev-mode')?.api?.getPackageDebugValue(MODULE_ID);

function log(...args) {
  try {
    // if(game.modules.get('_dev-mode')?.api?.getPackageDebugValue(MODULE_ID)) {
    if (devModeActive()) {
      console.log(MODULE_ID, '|', ...args);
    }
  } catch (e) {}
}
function logForce(...args) {
    console.log(MODULE_ID, '|', ...args);
}
//============Dev Mode logging setup end===============

const {SHIFT, CONTROL, ALT} = KeyboardManager.MODIFIER_KEYS;

Hooks.once('init', () => {
	game.keybindings.register(MODULE_ABBREV, "wasdPanUp", {
		name: "WASD.PanUp",
		uneditable: [
			{key: "KeyW"}
		],
		onUp: context => onPan(context, [ClientKeybindings.MOVEMENT_DIRECTIONS.UP]),
		onDown: context => onPan(context, [ClientKeybindings.MOVEMENT_DIRECTIONS.UP]),
		reservedModifiers: [CONTROL, SHIFT],
		repeat: true
	});
	game.keybindings.register(MODULE_ABBREV, "wasdPanLeft", {
		name: "WASD.PanLeft",
		uneditable: [
			{key: "KeyA"}
		],
		onUp: context => onPan(context, [ClientKeybindings.MOVEMENT_DIRECTIONS.LEFT]),
		onDown: context => onPan(context, [ClientKeybindings.MOVEMENT_DIRECTIONS.LEFT]),
		reservedModifiers: [CONTROL, SHIFT],
		repeat: true
	});
	game.keybindings.register(MODULE_ABBREV, "wasdPanDown", {
		name: "WASD.PanDown",
		uneditable: [
			{key: "KeyS"}
		],
		onUp: context => onPan(context, [ClientKeybindings.MOVEMENT_DIRECTIONS.DOWN]),
		onDown: context => onPan(context, [ClientKeybindings.MOVEMENT_DIRECTIONS.DOWN]),
		reservedModifiers: [CONTROL, SHIFT],
		repeat: true
	});
	game.keybindings.register(MODULE_ABBREV, "wasdPanRight", {
		name: "WASD.PanRight",
		uneditable: [
			{key: "KeyD"}
		],
		onUp: context => onPan(context, [ClientKeybindings.MOVEMENT_DIRECTIONS.RIGHT]),
		onDown: context => onPan(context, [ClientKeybindings.MOVEMENT_DIRECTIONS.RIGHT]),
		reservedModifiers: [CONTROL, SHIFT],
		repeat: true
	});
});

/**
 * adapted from ClientKeybindings._onPan() @client/core/keybindings:793
 *
 * Handle Pan action
 * @param {KeyboardEventContext} context          The context data of the event
 * @param {string[]} movementDirections           The Directions being panned in
 * @private
 */
function onPan(context, movementDirections) {
  // Case 1: Check for Tour
  if ( (Tour.tourInProgress) && (!context.repeat) && (!context.up) ) {
    Tour.onMovementAction(movementDirections);
    return true;
  }

  // Case 2: Check for Canvas
  if ( !canvas.ready ) return false;

  // Remove Keys on Up
  if ( context.up ) {
    for ( let d of movementDirections ) {
      game.keybindings.moveKeys.delete(d);
    }
    return true;
  }

  // Keep track of when we last moved
  const now = Date.now();
  const delta = now - game.keybindings._moveTime;

  // Track the movement set
  for ( let d of movementDirections ) {
    game.keybindings.moveKeys.add(d);
  }

	// Always canvas pan
	game.keybindings._handleCanvasPan();

  // Delay 50ms before shifting tokens in order to capture diagonal movements
  const layer = canvas.activeLayer;
  if ( (layer === canvas.tokens) || (layer === canvas.tiles) ) {
    if ( delta < 100 ) return true; // Throttle keyboard movement once per 100ms
    setTimeout(() => game.keybindings._handleMovement(context, layer), 50);
  }
  game.keybindings._moveTime = now;
  return true;
}
