# TS.Utilities
Helper classes overview:

* **AnimationsManager.ts**

  - Provides simple animation helper to work with GSAP's API, easily handling PIXI specific objects and filters by utilizing the PixiPlugin.

* **SoundPlayer.ts**

  - Sound Player utilizing Howler and implementing the following Lazy sound types:
    - 0: PLAY_WHEN_LOADED,
    - 1: SKIP_IF_NOT_LOADED,
    - 2: PLAY_IN_SYNC_AFTER_LOAD
  - Example:  soundPlayer.play("Ambient", {loop: true, lazy: 0});
