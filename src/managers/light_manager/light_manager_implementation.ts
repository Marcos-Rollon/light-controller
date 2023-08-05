import i2cBus from "i2c-bus";
import { Utils } from "../../utils/utils.js";
import { Pca9685Driver, Pca9685Options } from "pca9685";
import { DecayElement, LightManager } from "./light_manager.js";


/**
 * This class deals with all the PCA9685 and I2C things
 */
export class LightManagerImplementation implements LightManager {

    PWM_FREQUENCY: number;
    _optionsModule1: Pca9685Options;
    _optionsModule2: Pca9685Options;
    _decays: DecayElement[];
    module1: Pca9685Driver;
    module2: Pca9685Driver;

    constructor() {
        /**
         * These options are hardcoded BY DESIGN, they cannot be change "hot"
         */
        this.PWM_FREQUENCY = 600;
        this._optionsModule1 = {
            i2c: i2cBus.openSync(1),
            address: 0x40,
            frequency: this.PWM_FREQUENCY,
            debug: false,
        }
        this._optionsModule2 = {
            i2c: i2cBus.openSync(1),
            address: 0x41,
            frequency: this.PWM_FREQUENCY,
            debug: false,
        }
        this._decays = [];
        for (let i = 0; i < 20; i++) {
            this._decays.push(new DecayElement(i, 30, this.setValue))
        }
    }

    /**
     * Inits and configures all the things
     */
    init(): void {

        this.module1 = new Pca9685Driver(this._optionsModule1, (err) => {
            if (err) {
                console.log("Initialization error for module 1");
                console.log(err);
            }
            console.log("Module 1 initialized")
        });
        this.module2 = new Pca9685Driver(this._optionsModule2, (err) => {
            if (err) {
                console.log("Initialization error for module 2");
                console.log(err);
            }
            console.log("Module 2 initialized");
        });

    }

    /**
     * Sends a value to a led. Leds are divided in two groups, the first one is
     * 0 to 9, and the second one is 10 to 20 (since we have 21 leds in total)
     * in this way every pca9685 drives 10 or 11 lights instead of 16 and 6
     * 
     * @param {ledNumber: number, value: number} params 
     */
    setValue({ ledNumber, value }: { ledNumber: number, value: number }): void {
        // The leds 0 to 9 are in the frist module
        if (ledNumber < 10 && ledNumber >= 0) {
            // They are in the channels 0 to 9, so no conversion needed
            if (value == 0) {
                this.module1.channelOff(ledNumber);
            } else if (value == 1) {
                this.module1.channelOn(ledNumber);
            } else {
                this.module1.setDutyCycle(ledNumber, Utils.clamp(value, 0, 1));
            }
        } else if (ledNumber > 9 && ledNumber < 21) {
            // In this case, the led channel 10 is on the module 0 output 1, and so on
            const channel = ledNumber - 10;
            if (value == 0) {
                this.module2.channelOff(channel);
            } else if (value == 1) {
                this.module2.channelOn(channel);
            } else {
                this.module2.setDutyCycle(channel, Utils.clamp(value, 0, 1));
            }

        } else {
            // Unknown led
            console.log("There is no LED assign to that channel or the channel is invalid");
        }
    }

    /**
     * 
     * @param {ledNumber: number, value: number, decayRate: number} params
     */
    setWithDecay({ ledNumber, value, decayRate = 30 }: { ledNumber: number, value: number, decayRate?: number }): void {

        // Safety check for the index of the array
        if (typeof this._decays[ledNumber] != "undefined") {
            // Clear prev timer (if any) and apply decay
            this._decays[ledNumber].clear();
            this._decays[ledNumber].decayRate = decayRate;
            let startValue = value * 1000 //to pass it to milliseconds
            this._decays[ledNumber].start(startValue)
        }

        // if (this.decays[ledNumber] != null) {
        //     clearInterval(this.decays[ledNumber]);
        //     this.decays[ledNumber] = null;
        // }
        // let currentValue = value * 1000;
        // this.setValue({ ledNumber: ledNumber, value: value });
        // this.decays[ledNumber] = setInterval(() => {
        //     currentValue -= decayRate;
        //     if (currentValue <= 0) {
        //         clearInterval(this.decays[ledNumber]);
        //         this.decays[ledNumber] = null;
        //         this.setValue({ ledNumber: ledNumber, value: 0 });
        //     } else {
        //         this.setValue({ ledNumber: ledNumber, value: currentValue / 1000 });
        //     }
        // }, value * 1000 / decayRate);
        //console.log(Object.keys(this.decays).length);
    }

}

module.exports = { LightManagerImplementation };