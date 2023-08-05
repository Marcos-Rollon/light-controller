import { LightManager } from "./light_manager";

export class MockLightManagerImplementation implements LightManager {
    init(): void {
        console.log("Mock Light Manager init");
    }
    setValue({ ledNumber, value }: { ledNumber: number; value: number; }): void {
        console.log(`Led number: ${ledNumber} setted to value: ${value}`);
    }
    setWithDecay({ ledNumber, value, decayRate }: { ledNumber: number; value: number; decayRate?: number | undefined; }): void {
        console.log(`Led number: ${ledNumber} setted to value: ${value} with decay rate: ${decayRate}`);
    }

}