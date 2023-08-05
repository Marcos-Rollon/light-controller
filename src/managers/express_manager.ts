import express, { Express, Request, Response } from "express";

/**
 * This class handles all what is related to express and the UI events
 * BY DESIGN the songlist cannot be change "hot" (you need to hardcode it)
 */
export class ExpressManager {
    app: Express;
    songList: string[];
    publicPath: string;
    currentIndex: number;
    port: number;
    onSongChanged: ((index: number) => void);
    onSetLed: ((ledNumber: number, value: number, withFade: boolean) => void);

    constructor({
        songList,
        currentIndex,
        publicPath,
        onSongChanged,
        onSetLed,
        port = 8000 }:
        {
            songList: string[],
            currentIndex: number,
            publicPath: string,
            onSongChanged: (index: number) => void,
            onSetLed: (led: number, value: number, withFade: boolean) => void,
            port?: number
        }) {
        this.app = express();
        this.songList = songList;
        this.publicPath = publicPath;
        this.currentIndex = currentIndex;
        this.port = port;
        this.onSongChanged = onSongChanged;
        this.onSetLed = onSetLed;
    }

    init() {
        this.app.use(express.static(this.publicPath));

        /**
         * Gets the current selected song
         */
        this.app.get("/current_song", (req, res) => {
            res.send({ data: this.songList[this.currentIndex] });
        });
        /**
         * Gets the current song list
         */
        this.app.get("/song_list", (req, res) => {
            res.send({ data: this.songList });
        })
        /**
         * Petition from the UI to change the current active song
         */
        this.app.get("/change_song/:song", (req, res) => {
            // Get index of new song
            let newIndex = this.songList.indexOf(req.params.song);
            if (newIndex >= 0) {
                this.currentIndex = newIndex;
                if (this.onSongChanged) {
                    this.onSongChanged(this.currentIndex);
                }
                res.send({ success: true });
            } else {
                res.send({ success: false });
            }

        });

        this.app.get("/set_led/:ledNumber/:value", (req, res) => {
            if (this.onSetLed) {
                this.onSetLed(parseFloat(req.params.ledNumber), parseFloat(req.params.value), false);
                res.send({ success: true });
            } else {
                res.send({ success: false });
            }
        });

        this.app.get("/set_led_fade/:ledNumber/:value", (req, res) => {
            if (this.onSetLed) {
                this.onSetLed(parseFloat(req.params.ledNumber), parseFloat(req.params.value), true);
                res.send({ success: true });
            } else {
                res.send({ success: false });
            }
        });

        this.app.listen(this.port, () => {
            console.log(`LightController UI listening on port: ${this.port}`);
        });
    }
}