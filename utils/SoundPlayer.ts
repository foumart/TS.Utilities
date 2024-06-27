import { AssetManager } from "loaders/AssetManager";// TODO: implement $loader.
import { Howl, Howler } from "howler";

export class SoundPlayer {
    protected assetManager: AssetManager;
    private _instances: { [key: string]: { timeStarted: number; soundInstances: Howl[] } } = {};

    public attachAssetManager(): void {
        this.assetManager = $loader.get("assetManager");
    }

    public play(
        id: string,
        options: ISoundOptions = { lazy: LazySoundType.SKIP_IF_NOT_LOADED }
    ): void {
        const sound = this.getSound(id);

        if (!sound) {
            console.warn(`Sound Player could not find sound with id ${id}`);
            return;
        }

        // We need to check for duplicate sounds only if limitInterval is required
        // TODO: DO WE NEED DEFAULT INTERVAL?
        const limitInterval = options?.limitInterval || 100;
        if (limitInterval && this._instances[id]) {
            const timeRequested = Date.now();
            const timeDiff = timeRequested - this._instances[id].timeStarted;

            if (timeDiff <= limitInterval) {
                console.warn(
                    `Sound Player tried to play sound ${id} after ${timeDiff} ms, while having set interval of ${limitInterval}.!`
                );
                return;
            }

            this._instances[id].timeStarted = timeRequested;
            // TODO: DO WE NEED MULTIPLE INSTANCES?
            this._instances[id].soundInstances.push(sound);
        }

        if (!this._instances[id]) {
            const instance = {
                timeStarted: Date.now(),
                soundInstances: [sound]
            };

            this._instances[id] = instance;
        }

        sound.loop(options?.loop);

        if (sound?.state() == "loaded") {
            this.playSound(sound, options);
        } else if (options?.lazy === LazySoundType.PLAY_WHEN_LOADED) {
            sound?.once(
                "load",
                function () {
                    this.playSound(sound, options);
                }.bind(this)
            );
        }
    }

    private playSound(
        sound: any,
        options?: { loop?: boolean; limitInterval?: number; initialVolume?: number }
    ): void {
        sound?.play();
        sound?.volume(options?.initialVolume != undefined ? options.initialVolume : 1);
    }

    public getVolume(id: string): number {
        return this.getSound(id).volume();
    }

    public stop(id: string): void {
        const sound = this.getSound(id);

        if (!sound) {
            console.warn(`Sound Player could not find sound with id ${id}`);
            return;
        }

        sound.stop();
    }

    public volume(id: string, volume?: number): void | number {
        // if (!this.isPlaying(id)) {
        //     return;
        // }

        if (this.getSound(id)?.state() == "loaded") {
            this.getSound(id).volume(volume);
        } else {
            this.getSound(id)?.once(
                "load",
                function () {
                    this.getSound(id).volume(volume);
                }.bind(this)
            );
        }
    }

    public fade(
        from: number,
        to: number,
        duration: number,
        id: string,
        stopOnComplete?: boolean
    ): void {
        this.getSound(id).fade(from, to, duration);
        if (stopOnComplete && to == 0) {
            this.getSound(id).once("fade", () => this.getSound(id).stop());
        }
    }

    public mute(muted: boolean): void {
        Howler.mute(muted);
    }

    public getSound(id: string): any {
        // Return Howl
        return (this.assetManager._sounds as any)[id];
    }

    public isPlaying(id: string): boolean {
        return this.getSound(id)?.playing();
    }
}
export interface ISoundOptions {
    loop?: boolean;
    limitInterval?: number;
    initialVolume?: number;
    lazy?: number;
}

export const LazySoundType = {
    PLAY_WHEN_LOADED: 0,
    SKIP_IF_NOT_LOADED: 1,
    PLAY_IN_SYNC_AFTER_LOAD: 2
};
