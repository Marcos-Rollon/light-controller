import { LightManager } from "./managers/light_manager/light_manager";
import { OscManager } from "./managers/osc_manager";
import { Utils } from "./utils/utils";

let lightManager: LightManager;
let oscManager: OscManager;
export function TatoMain(lM: LightManager, oM: OscManager) {
    // INICIALIZACIONES, NO TOCAR ##############
    lightManager = lM;
    oscManager = oM;
    lightManager.init();
    oscManager.init(onOSCInitialized);
    // #########################################
    // Tu código empieza aquí
}


// ESTA FUNCIÓN SE EJECUTA CUANDO EL OSC ESTÁ LISTO PARA SER UTILIZADO
// LO CUAL *NO* NECESARIAMENTE SIGNIFICA QUE HAYA ENCONTRADO LA MESA
// PERO *SI* QUE ESTÁ LISTO PARA FUNCIONAR
function onOSCInitialized(): void {
    // Ejemplo de como utilizar el comando "send"

    oscManager.send("/meters", [
        { type: "s", value: "/meters/1" },
    ]);
}

// ESTA FUNCIÓN SE EJECUTA CUANDO SE CAMBIA LA CANCIÓN EN LA UI
export function onSongChanged(songName: String, songIndex: number): void {
    lightManager.setValue({ ledNumber: songIndex, value: 1 });
}


// ESTA FUNCION SE EJECUTA CUANDO LLEGA CUALQUIER MENSAJE OSC
export function onOSCMsg(oscMsg: any): void {
    // EJEMPLO DE COMO MANEJAR EL METER 1
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