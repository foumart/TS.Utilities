# TS.Utilities
Helper classes overview:

* [**AnimationsManager.ts**](https://github.com/foumart/TS.Utilities/blob/main/utils/AnimationsManager.ts)

  - Provides simple animation helper to work with GSAP's API, easily handling PIXI specific objects and filters by utilizing the PixiPlugin.
    - ```scale```          : scales an element
    - ```scaleX```         : scales an element on the X axis
    - ```scaleY```         : scales an element on the Y axis
    - ```hue```            : sets the hue property of the color (minus 180 to 180, default: 0)
    - ```saturation```     : adjusts saturation, increases the separation between colors (0 - 5, default: 1)
    - ```brightness```     : adjusts brightness (0 - 5, default: 1)
    - ```contrast```       : adjusts contrast - increases/decreases the separation between shadows and highlights (0 - 5, default: 1)
    - ```colorizeAmount``` : sets the amount of colorization - a color must be provided, like: {colorize: "#00ff00"}
    - ```blur```           : blurs an element
    - ```blurX```          : blurs an element only in the X axis
    - ```blurY```          : blurs an element only in the Y axis
  - Example:
    ```
    animationsManager.set( bullet, { x: player.x, y: player.y, blurX: 2 });

    animationsManager.to( bullet, 1, { x: player.x + 500, onComplete: () => {
        animationsManager.set( bullet, { blurX: 0, blur: 2, brightness: 2 });
        animationsManager.to( bullet, 0.5, { scale: 2, blur: 5, brightness: 5, alpha: 0 });
    });
    ```

* [**SoundPlayer.ts**](https://github.com/foumart/TS.Utilities/blob/main/utils/SoundPlayer.ts)

  - Sound Player utilizing Howler and implementing the following Lazy sound types:
    - ```0: PLAY_WHEN_LOADED```,
    - ```1: SKIP_IF_NOT_LOADED```,
    - ```2: PLAY_IN_SYNC_AFTER_LOAD```
  - Example:
    ```
    soundPlayer.play("Ambient", {loop: true, lazy: 2});
    soundPlayer.play("Song", {loop: true, lazy: 2});
    ```
