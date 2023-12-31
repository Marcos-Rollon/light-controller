//@ts-nocheck
import osc from "osc"

const XAIR_IP = "169.254.151.124";
const XAIR_PORT = 10024;

// Sadly the library OSC does not have any types, so no autocompletion for free

export class OscManager {
    udpPort: any;
    onNewOscMessage?: (oscMsg: {}) => void;
    meter1Subscription: NodeJS.Timer?;
    meter6Subscription: NodeJS.Timer?;

    constructor(onNewOscMessage) {
        this.udpPort = new osc.UDPPort({
            localAddress: "0.0.0.0",
            localPort: 57121,
            metadata: true
        });
        this.onNewOscMessage = onNewOscMessage;
        this.meter1Subscription = null;
    }

    init(onReady): void {
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
            if (onReady) {
                onReady();
            }
        });
        this.udpPort.on("error", (error) => {
            console.error("Error with OSC");
            console.error(error.message)
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
        if (this.meter1Subscription == null) {
            console.log("Subscription created for meter 1");

            this.send("/meters", [
                { type: "s", value: "/meters/1" },
            ]);
            this.meter1Subscription = setInterval(() => {
                this.send("/renew", [
                    { type: "s", value: "/meters/1" }
                ])
            }, 9000);



        }

    }
    unsubscribeFromMeter1(): void {
        if (this.meter1Subscription != null) {
            console.log("Unsubscribed from meter 1");
            clearInterval(this.meter1Subscription);
            this.meter1Subscription = null;
        }
    }

    subscribeToMeter6(): void {
        if (this.meter6Subscription == null) {
            console.log("Subscription created for meter 6");

            this.send("/meters", [
                { type: "s", value: "/meters/6" },
                //{ type: "i", value: "14" },
                //{ type: "i", value: "15" },
            ]
            );

            this.meter6Subscription = setInterval(() => {
                this.send("/renew", [
                    { type: "s", value: "/meters/6" }
                ])
            }, 9000);

        }

    }
}

