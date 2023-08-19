import { LightManager } from "./light_manager/light_manager";

/**
 * Led assignation on manager:
 * Marcos: 0 to 4 with guest, 0 to 6 without
 * Siete : 5 to 9 with guest, 7 to 13 without 
 * Tato : 15 to 19 with guest, 14 to 20 without
 * Guest : 10 to 14. WITH GUEST THE LAST ONE (20) IS FREE/EXTRA
 */

// TO CHANGE THE LED ASSIGNATIONS, CHANGE THESE TWO OBJECTS
const ledAssignationNoGuest:
    {
        marcos: Array<number>,
        siete: Array<number>,
        tato: Array<number>,
    } = {
    marcos: [0, 1, 2, 3, 4, 5, 6],
    siete: [7, 8, 9, 10, 11, 12, 13,],
    tato: [14, 15, 16, 17, 18, 19, 20],
}

const ledAssignationGuest:
    {
        marcos: Array<number>,
        siete: Array<number>,
        guest: Array<number>,
        tato: Array<number>,
    }
    =
{
    marcos: [0, 1, 2, 3, 4],
    siete: [5, 6, 7, 8, 9],
    guest: [10, 11, 12, 13, 14],
    tato: [15, 16, 17, 18, 19],
}

export class LightCoordinator {
    lightManager: LightManager;
    hasGuest: boolean;
    users: { tato: LedState, marcos: LedState, siete: LedState, invitado: LedState | undefined }

    constructor(lightManager: LightManager, hasGuest: boolean) {
        this.lightManager = lightManager;
        this.hasGuest = hasGuest;
        this._init();
    }

    _init() {
        this.users = {
            tato: new LedState(this.hasGuest ? ledAssignationGuest.tato : ledAssignationNoGuest.tato),
            marcos: new LedState(this.hasGuest ? ledAssignationGuest.marcos : ledAssignationNoGuest.marcos),
            siete: new LedState(this.hasGuest ? ledAssignationGuest.siete : ledAssignationNoGuest.siete),
            invitado: this.hasGuest ? new LedState(ledAssignationGuest.guest) : undefined,
        };
        this.lightManager.init();
    }

    // Primitives
    marcos(led1: number, led2: number, led3: number, led4: number, led5: number, led6?: number, led7?: number) {
        this.users.marcos.assign(led1, led2, led3, led4, led5, led6, led7);
        for (let i = 0; i < this.users.marcos.positions.length; i++) {
            let position = this.users.marcos.positions[i];
            let value = this.users.marcos.values[i];
            this.lightManager.setValue({ ledNumber: position, value: value });
        }
    }
    marcosDecay(decayTime: number, stepTime: number, led1: number, led2: number, led3: number, led4: number, led5: number, led6?: number, led7?: number) {
        this.users.marcos.assign(led1, led2, led3, led4, led5, led6, led7);
        for (let i = 0; i < this.users.marcos.positions.length; i++) {
            let position = this.users.marcos.positions[i];
            let value = this.users.marcos.values[i];
            this.lightManager.setWithDecay({ ledNumber: position, value: value, decayTime: decayTime, stepTime: stepTime });
        }
    }
    tato(led1: number, led2: number, led3: number, led4: number, led5: number, led6?: number, led7?: number) {
        this.users.tato.assign(led1, led2, led3, led4, led5, led6, led7);
        for (let i = 0; i < this.users.tato.positions.length; i++) {
            let position = this.users.tato.positions[i];
            let value = this.users.tato.values[i];
            this.lightManager.setValue({ ledNumber: position, value: value });
        }

    }
    tatoDecay(decayTime: number, stepTime: number, led1: number, led2: number, led3: number, led4: number, led5: number, led6?: number, led7?: number) {
        this.users.tato.assign(led1, led2, led3, led4, led5, led6, led7);
        for (let i = 0; i < this.users.tato.positions.length; i++) {
            let position = this.users.tato.positions[i];
            let value = this.users.tato.values[i];
            this.lightManager.setWithDecay({ ledNumber: position, value: value, decayTime: decayTime, stepTime: stepTime });
        }
    }
    siete(led1: number, led2: number, led3: number, led4: number, led5: number, led6?: number, led7?: number) {
        if (!this.hasGuest) {
            this.lightManager.setValue({ ledNumber: 7, value: led1 });
            this.lightManager.setValue({ ledNumber: 8, value: led2 });
            this.lightManager.setValue({ ledNumber: 9, value: led3 });
            this.lightManager.setValue({ ledNumber: 10, value: led4 });
            this.lightManager.setValue({ ledNumber: 11, value: led5 });
            this.lightManager.setValue({ ledNumber: 12, value: led6 ?? 0 });
            this.lightManager.setValue({ ledNumber: 13, value: led7 ?? 0 });
        } else {
            this.lightManager.setValue({ ledNumber: 5, value: led1 });
            this.lightManager.setValue({ ledNumber: 6, value: led2 });
            this.lightManager.setValue({ ledNumber: 7, value: led3 });
            this.lightManager.setValue({ ledNumber: 8, value: led4 });
            this.lightManager.setValue({ ledNumber: 9, value: led5 });
        }
    }
    sieteDecay(decayTime: number, stepTime: number, led1: number, led2: number, led3: number, led4: number, led5: number, led6?: number, led7?: number) {

    }
    guest(led1: number, led2: number, led3: number, led4: number, led5: number) {
        if (!this.hasGuest) return;
        this.lightManager.setValue({ ledNumber: 10, value: led1 });
        this.lightManager.setValue({ ledNumber: 11, value: led2 });
        this.lightManager.setValue({ ledNumber: 12, value: led3 });
        this.lightManager.setValue({ ledNumber: 13, value: led4 });
        this.lightManager.setValue({ ledNumber: 14, value: led5 });
    }
    center(value: number) {
        if (this.hasGuest) {
            this.lightManager.setValue({ ledNumber: 20, value: value });
        }
    }

    // All
    marcosAll(value: number) {
        this.marcos(value, value, value, value, value, value, value);
    }
    sieteAll(value: number) {
        this.siete(value, value, value, value, value, value, value);
    }
    tatoAll(value: number) {
        this.tato(value, value, value, value, value, value, value);
    }
    guestAll(value: number) {
        this.guest(value, value, value, value, value);
    }


}

class LedState {
    positions: Array<number>;
    values: Array<number>;
    led1Value: number;
    led2Value: number;
    led3Value: number;
    led4Value: number;
    led5Value: number;
    led6Value: number;
    led7Value: number;
    constructor(positions: Array<number>) {
        this.positions = positions;
        for (let i = 0; i < positions.length; i++) {
            this.values.push(0);
        }
        this.led1Value = 0;
        this.led2Value = 0;
        this.led3Value = 0;
        this.led4Value = 0;
        this.led5Value = 0;
        this.led6Value = 0;
        this.led7Value = 0;
    }

    assign(led1: number, led2: number, led3: number, led4: number, led5: number, led6?: number, led7?: number) {
        this.values[0] = led1;
        this.values[1] = led2;
        this.values[2] = led3;
        this.values[3] = led4;
        this.values[4] = led5;
        this.values[5] = led6 ?? 0;
        this.values[6] = led7 ?? 0;

        this.led1Value = led1;
        this.led2Value = led2;
        this.led3Value = led3;
        this.led4Value = led4;
        this.led5Value = led5;
        this.led6Value = led6 ?? 0;
        this.led7Value = led7 ?? 0;
    }


}