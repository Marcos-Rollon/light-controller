import { LightManager } from "./light_manager/light_manager";

class LightAnimator {
    lightManager: LightManager;
    _lights: number[] = [];

    constructor(lightManager: LightManager) {
        this.lightManager = lightManager;

    }


    pulse(center: number, widthLeft: number, widthRight: number, extension: number, opacity: number, time: number) {
        // Find center and turn it on
        let leftSide = center - widthLeft >= 0 ? center - widthLeft : 0;
        for (let i = leftSide; i < center + widthRight; i++) {
            this.lightManager.setValue({ ledNumber: i, value: 1 });
        }
        // TODO
        // Move until extension

    }
}