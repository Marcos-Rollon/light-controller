// const ExpressManager = require("./src/express_manager").ExpressManager;
import { ExpressManager } from "./managers/express_manager.js";
import { LightManager } from "./managers/light_manager/light_manager.js";
import { OscManager } from "./managers/osc_manager.js";
import path from "path";
import { Utils } from "./utils/utils.js";
import { LightManagerImplementation } from "./managers/light_manager/light_manager_implementation.js";
import { MockLightManagerImplementation } from "./managers/light_manager/mock_light_manager_implementation.js";

// By design this is hardcoded and cannot change "hot"
const songList = [
	"centro",
	"al_barro",
	"reptilianos",
	"bola_saque",
	"rayos",
	"nadie_mas",
];
let currentIndex = 0;

let expressManger = new ExpressManager({
	songList: songList,
	currentIndex: currentIndex,
	publicPath: path.join(__dirname, "public"),
	onSongChanged: songWasChanged,
	onSetLed: onSetLed,
});
let lightManager: LightManager = new MockLightManagerImplementation();
console.log(process.platform);
// if (process.platform != "linux") {
// 	lightManager = new MockLightManagerImplementation();
// } else {
// 	lightManager = new LightManagerImplementation();
// }
let oscManager = new OscManager(onNewOscMessage)

expressManger.init();
lightManager.init();

//oscManager.init();
// setTimeout(() => {
// 	oscManager.subscribeToMeter1();
// }, 2000);

async function sleep(milliseconds: number) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

/**
 * Callback fired when the UI changed succesfully the current song
 * @param {number} newIndex 
 */
function songWasChanged(newIndex: number): void {
	console.log(newIndex / 4);

	lightManager.setWithDecay({ ledNumber: 2, value: newIndex / 4 });
	currentIndex = newIndex;
}

function onSetLed(ledNumber: number, value: number, withFade: boolean): void {
	console.log(`Set value ${value} to led number ${ledNumber} with fade ${withFade}`);
	if (withFade) {
		lightManager.setWithDecay({ ledNumber: Number(ledNumber), value: Number(value), decayRate: 20 })
	} else {
		lightManager.setValue({ ledNumber: Number(ledNumber), value: Number(value) });
	}
}

// Callback with new osc message
function onNewOscMessage(oscMsg: any) {
	if (oscMsg.address == "/meters/1") {
		// Get data value
		const value = oscMsg.args[0].value;
		// Get size of data package
		let size = value.slice(0, 4);
		// Get array as uint8 array
		let uint8 = value.slice(4);
		// Get array of float numbers from array
		let result = Utils.uInt8ArrayToFloatArray(uint8);
		// The first 16 values (0-15) are the input values
		console.log(result);
	}
}