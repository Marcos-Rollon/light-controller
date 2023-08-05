export interface LightManager {
    init(): void;
    setValue({ ledNumber, value }: { ledNumber: number, value: number }): void;
    setWithDecay({ ledNumber, value, decayRate = 30 }: { ledNumber: number, value: number, decayRate?: number }): void;
}

export class DecayElement {
    ledNumber: number;
    timer?: NodeJS.Timer;
    decayRate: number
    setValue: ({ ledNumber, value }: { ledNumber: number, value: number }) => void

    constructor(
        ledNumber: number,
        decayRate: number,
        setValue: ({ ledNumber, value }: { ledNumber: number, value: number }) => void,
    ) {
        this.ledNumber = ledNumber;
        this.timer = undefined;
        this.decayRate = decayRate;
        this.setValue = setValue;
    }

    clear() {
        if (this.timer != undefined) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }

    start(startValue: number) {
        let currentValue = startValue;
        this.setValue({ ledNumber: this.ledNumber, value: startValue });
        this.timer = setInterval(() => {
            currentValue -= this.decayRate;
            if (currentValue <= 0) {
                this.clear();
                this.setValue({ ledNumber: this.ledNumber, value: 0 });
            } else {
                this.setValue({ ledNumber: this.ledNumber, value: currentValue });
            }
        }, startValue * 1000 / this.decayRate);
    }
}

