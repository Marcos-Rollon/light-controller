import { ExpressManager } from "./managers/express_manager";
import { LightManager } from "./managers/light_manager/light_manager";
import { OscManager } from "./managers/osc_manager";
import path from "path";
import { Utils } from "./utils/utils";
import { LightManagerImplementation } from "./managers/light_manager/light_manager_implementation";
import { WebsocketLightManager } from "./managers/light_manager/websocket_light_manager_implementation";
import { TatoMain, onSongChanged, onOSCMsg } from "./tato";

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
let lightManager: LightManager = new LightManagerImplementation();//new WebsocketLightManager();
let oscManager = new OscManager(onNewOscMessage)

expressManger.init();
// lightManager.init();
// oscManager.init(() => {});

TatoMain(lightManager, oscManager);

/**
 * Callback fired when the UI changed succesfully the current song
 * @param {number} newIndex 
 */
function songWasChanged(newIndex: number): void {
	// currentIndex = newIndex;
	// console.log(`Active song is ${songList[currentIndex]}`);
	// lightManager.setWithDecay({ ledNumber: newIndex, value: 1 });
	onSongChanged(songList[newIndex], newIndex);
}

function onSetLed(ledNumber: number, value: number, withFade: boolean): void {
	console.log(`Set led ${ledNumber} to value ${value}`)
	lightManager.setValue({ ledNumber: ledNumber, value: value });
}

// Callback with new osc message
function onNewOscMessage(oscMsg: any) {
	onOSCMsg(oscMsg);
	// if (oscMsg.address == "/meters/1") {
	// 	// Get data value
	// 	const value = oscMsg.args[0].value;
	// 	// Get size of data package
	// 	let size = value.slice(0, 4);
	// 	// Get array as uint8 array
	// 	let uint8 = value.slice(4);
	// 	// Get array of float numbers from array
	// 	let result = Utils.uInt8ArrayToFloatArray(uint8);
	// 	// The first 16 values (0-15) are the input values
	// 	console.log(result);
	// }
}