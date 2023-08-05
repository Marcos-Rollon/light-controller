import { LightManager } from "./light_manager";
import { Server } from "socket.io";

export class WebsocketLightManager implements LightManager {
    socket: Server;


    init(): void {
        this.socket = new Server({
            cors: {
                origin: "http://localhost:8000",
                methods: ["GET", "POST"]
            },
        });
        this.socket.on("connection", (client) => {
            console.log("Client connected with id: ", client.id);
        });
        this.socket.listen(3000);
    }
    setValue({ ledNumber, value }: { ledNumber: number; value: number; }): void {
        this.socket.emit("setValue", { ledNumber, value });
    }
    setWithDecay({ ledNumber, value, decayTime = 500, stepTime = 10 }: { ledNumber: number; value: number; decayTime?: number; stepTime?: number }): void {
        this.socket.emit("setWithDecay", { ledNumber, value, decayTime, stepTime });
    }

}