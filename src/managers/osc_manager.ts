//@ts-nocheck
import osc from "osc"

const XAIR_IP = "169.254.151.124";
const XAIR_PORT = 10024;

// Sadly the library OSC does not have any types, so no autocompletion for free

export class OscManager {
    udpPort: any;
    onNewOscMessage?: (oscMsg: {}) => void;

    constructor(onNewOscMessage) {
        this.udpPort = new osc.UDPPort({
            localAddress: "0.0.0.0",
            localPort: 57121,
            metadata: true
        });
        this.onNewOscMessage = onNewOscMessage;
    }

    init(): void {
        // Listen for messages
        this.udpPort.on("message", (oscMsg, timeTag, info) => {
            // console.log("New OSC message : ", oscMsg);
            // console.log("Remote Info is : ", info);
            if (this.onNewOscMessage) {
                this.onNewOscMessage(oscMsg);
            }
        });
        // Handle port on ready
        this.udpPort.on("ready", () => {
            console.log("OSC Port is ready");
        });

        // Open OSC port
        this.udpPort.open();

    }

    send(address, args): void {
        this.udpPort.send({
            address: address,
            args: args
        }, XAIR_IP, XAIR_PORT);
    }

    subscribeToMeter1(): void {
        this.send("/meters", [
            { type: "s", value: "/meters/1" },
        ]);
    }
    unsubscribeFromMeter1(): void {

    }
}

