// PIXI 6.2.0, GSAP 3.7.1
import { TweenMax, gsap } from "gsap";
import PixiPlugin from "gsap/PixiPlugin";
import * as PIXI from 'pixi.js';
import { DisplayObject, Graphics } from "pixi.js";

// List of properties handled by pixiPlugin:
export const AnimationsManagerProperties = {
    scale: "scale",
    scaleX: "scaleX",
    scaleY: "scaleY",
    hue: "hue",
    saturation: "saturation",
    brightness: "brightness",
    contrast: "contrast",
    colorizeAmount: "colorizeAmount",
    blur: "blur",
    blurX: "blurX",
    blurY: "blurY"
}

// List of options for the pixiPlugin:
export const AnimationsManagerOptions = {
    resolution: "resolution",
    colorize: "colorize"
    //quality: "quality" // unfortunatelly the quality blur setting is not supported by pixiPlugin.
}

// Will use default values, if such are not explicitly provided in the tween object.
export const AnimationsManagerOptionsDefaults = {
    resolution: 3,
    colorize: null,
}


/**
 * Provides simple animation helper to work with GSAP's API,
 * easily handling PIXI specific objects and filters by utilizing the PixiPlugin.
 * Usage: AnimationManager.to(element, duration, parameters);
 */
export class AnimationsManager {

    // Get all properties we can animate through pixiPlugin.
    private propertiesList: Array<string> = Object.keys(AnimationsManagerProperties);

    // Get all pixiPlugin options we can set (currently only resolution).
    private optionsList: Array<string> = Object.keys(AnimationsManagerOptions);

    constructor() {
        gsap.registerPlugin(PixiPlugin);
        PixiPlugin.registerPIXI({
            DisplayObject: DisplayObject,
            Graphics: Graphics,
            filters: {
                ColorMatrixFilter: PIXI.filters.ColorMatrixFilter,
                BlurFilter: PIXI.filters.BlurFilter,
            },
            VERSION: "6.2.0",
        });
    }

    /**
     * Perform animation over an element.
     * @param element The element or an array of elements to play animation onto.
     * @param duration Duration of animation in seconds.
     * @param propertiesToAnimate Object populated with properties to animate, as well as options for the tweener and pixiPlugin.
     * Specific properties for the pixiPlugin:
     *      - scale          : scales an element
     *      - scaleX         : scales an element on the X axis
     *      - scaleY         : scales an element on the Y axis
     *      - hue            : sets the hue property of the color (minus 180 to 180, default: 0)
     *      - saturation     : adjusts saturation, increases the separation between colors (0 - 5, default: 1)
     *      - brightness     : adjusts brightness (0 - 5, default: 1)
     *      - contrast       : adjusts contrast - increases/decreases the separation between shadows and highlights (0 - 5, default: 1)
     *      - colorizeAmount : sets the amount of colorization - a color must be provided, like: {colorize: "#00ff00"}
     *      - blur           : blurs an element
     *      - blurX          : blurs an element only in the X axis
     *      - blurY          : blurs an element only in the Y axis
     * Options for the pixiPlugin:
     *      - resolution     : higher number will improve the quality, preventing pixelization, at the cost of performance
     */
    public to(element: any, duration: number, propertiesToAnimate: any): TweenMax {
        const tweenObject = this.getTweenObject(propertiesToAnimate);
        const tempAnimation: TweenMax = gsap.to(element, duration, tweenObject);
        return tempAnimation;
    }

    /**
     * Sets various properties of an element.
     * @param element The element or an array of elements to play animation onto.
     * @param propertiesToAnimate Object populated with properties to set, as well as options for the tweener and pixiPlugin.
     * Specific properties for the pixiPlugin:
     *      - scale          : scales an element
     *      - scaleX         : scales an element on the X axis
     *      - scaleY         : scales an element on the Y axis
     *      - hue            : sets the hue property of the color (minus 180 to 180, default: 0)
     *      - saturation     : adjusts saturation, increases the separation between colors (0 - 5, default: 1)
     *      - brightness     : adjusts brightness (0 - 5, default: 1)
     *      - contrast       : adjusts contrast - increases/decreases the separation between shadows and highlights (0 - 5, default: 1)
     *      - colorizeAmount : sets the amount of colorization - a color must be provided, like: {colorize: "#00ff00"}
     *      - blur           : blurs an element
     *      - blurX          : blurs an element only in the X axis
     *      - blurY          : blurs an element only in the Y axis
     * Options for the pixiPlugin:
     *      - resolution     : higher number will improve the quality, preventing pixelization, at the cost of performance
     */
    public set(element: any, propertiesToAnimate: any): void {
        const propertiesObject = this.getTweenObject(propertiesToAnimate);
        gsap.set(element, propertiesObject);
    }

    /**
     * Kills all tweens of a prticular object
     */
    public killTweensOf(element: any): void {
        gsap.killTweensOf(element);
    }

    /**
     * Helper function for parsing properties and options for the tweener and pixiPlugin. 
     */
    private getTweenObject(propertiesToAnimate: any): object {
        const parsedPropertyKeys = this.parseProperties(propertiesToAnimate);
        const parsedOptionKeys = this.parseOptions(propertiesToAnimate);

        const validateColorize = parsedOptionKeys.indexOf(AnimationsManagerOptions.colorize) > -1;
        const validateColorizeAmount = parsedPropertyKeys.indexOf(AnimationsManagerProperties.colorizeAmount) > -1;
        if ((validateColorizeAmount && !validateColorize) || (!validateColorizeAmount && validateColorize)) {
            console.warn("Colorize is not properly set. Need to provide both colorize{string|number} and colorizeAmount{number}, passed tween object:", propertiesToAnimate);
        }

        // Generate properly formatted object for the pixiPlugin:
        const pixiPluginProperties = {};
        parsedPropertyKeys.forEach(key => {
            (pixiPluginProperties as any)[key] = propertiesToAnimate[key];
        });

        // Parse options for the pixiPlugin, if such are provided, or use their defaults:
        this.optionsList.forEach(key => {
            if (parsedOptionKeys.indexOf(key) > -1 || AnimationsManagerOptionsDefaults.hasOwnProperty(key)) {
                (pixiPluginProperties as any)[key] = propertiesToAnimate[key] || (AnimationsManagerOptionsDefaults as any)[key];
            }
        });

        // Generate tweener object with included pixiPlugin specific properties:
        const tweenObject = { pixi: pixiPluginProperties };

        // Add all other tweener specific properties and options
        Object.keys(propertiesToAnimate).forEach(key => {
            if (!pixiPluginProperties.hasOwnProperty(key)) {
                (tweenObject as any)[key] = propertiesToAnimate[key];
            }
        });

        return tweenObject;
    }

    /**
     * Helper function
     */
    private parseProperties(propertiesToAnimate: any): Array<string> {
        const propertyKeysToAnimate = Object.keys(propertiesToAnimate);

        // Check properties validity:
        const unsupportedProperties = propertyKeysToAnimate.filter(
            key => this.propertiesList.indexOf(key) === -1 && AnimationsManagerProperties.hasOwnProperty(key)
        );
        if (unsupportedProperties.length) {
            console.warn("The following properties are not acceptable by pixiPlugin:", unsupportedProperties);
        }

        const parsedPropertyKeys: Array<string> = propertyKeysToAnimate.filter(
            key => this.propertiesList.indexOf(key) > -1 && AnimationsManagerProperties.hasOwnProperty(key)
        );

        return parsedPropertyKeys;
    }

    /**
     * Helper function
     */
    private parseOptions(tweenOptions: any): Array<string> {
        const pluginOptionsToUse = Object.keys(tweenOptions);

        const parsedOptionKeys: Array<string> = pluginOptionsToUse.filter(
            key => this.optionsList.indexOf(key) > -1 && AnimationsManagerOptions.hasOwnProperty(key)
        );

        return parsedOptionKeys;
    }
}
