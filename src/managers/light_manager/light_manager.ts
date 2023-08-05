export interface LightManager {
    init(): void;
    setValue({ ledNumber, value }: { ledNumber: number, value: number }): void;
    setWithDecay({ ledNumber, value, decayTime = 500, stepTime = 10 }: { ledNumber: number, value: number, decayTime?: number, stepTime?: number }): void;
}

export class DecayElement {
    ledNumber: number;
    timer?: NodeJS.Timer;
    decayTime: number;
    stepTime: number;
    setValue: ({ ledNumber, value }: { ledNumber: number, value: number }) => void

    constructor(
        ledNumber: number,
        setValue: ({ ledNumber, value }: { ledNumber: number, value: number }) => void,
        decayTime: number = 500,
        stepTime: number = 10,
    ) {
        this.ledNumber = ledNumber;
        this.timer = undefined;
        this.decayTime = decayTime;
        this.stepTime = stepTime;
        this.setValue = setValue;
    }

    clear() {
        if (this.timer != undefined) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }

    start(startValue: number) {
        if (this.timer != undefined) {
            this.clear();
            return;
        }
        let currentValue = startValue;
        this.setValue({ ledNumber: this.ledNumber, value: startValue });
        let numSteps = this.decayTime / this.stepTime;
        let numToDeduct = startValue / numSteps;

        this.timer = setInterval(() => {
            currentValue -= numToDeduct;
            if (currentValue <= 0.01) {
                this.clear();
                this.setValue({ ledNumber: this.ledNumber, value: 0 });
                return;
            }
            this.setValue({ ledNumber: this.ledNumber, value: currentValue });
        }, this.stepTime);

    }
}

