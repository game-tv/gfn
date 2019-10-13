'use strict';

import { Canvas, createCanvas } from 'canvas';

import { GfnColorInput, parseColor, Validator } from '../util';

import { canvasify, CanvasifyInput } from './canvasify';

export interface ColorizeOptions {
	source: CanvasifyInput;
	color: GfnColorInput;
	mode?: ColorizeMode;
	on?: CanvasifyInput;
}

export enum ColorizeMode {
	HSL_COLOR = 'hsl-color',
	DARKEN = 'darken',
	LIGHTEN = 'lighten',
	HARD_LIGHT = 'hard-light',
	SOFT_LIGHT = 'soft-light',
	HSL_HUE = 'hsl-hue',
	HSL_SATURATION = 'hsl-saturation',
	HSL_LUMINOSITY = 'hsl-luminosity',
}

// tslint:disable-next-line: variable-name
export const ColorizeModes = Object.values(ColorizeMode);

export async function colorize(options: ColorizeOptions): Promise<Canvas> {
	Validator.inputObject(options, 'colorize');

	let canvas = await canvasify(options.source);

	// If a color exists, colorize, if not just skip to use as normal layer
	if (options.color) {
		const color = parseColor(options.color);
		if (!color.isValid()) {
			throw new Error(`colorize: Invalid color: ${color}`);
		}
		const mode = options.mode || ColorizeMode.HSL_COLOR;
		const ctx = canvas.getContext('2d');

		if (ColorizeModes.includes(mode)) {
			const innerCanvas = createCanvas(canvas.width, canvas.height);
			const innerCtx = innerCanvas.getContext('2d');

			innerCtx.fillStyle = color.toRgbString();
			innerCtx.fillRect(0, 0, canvas.width, canvas.height);
			innerCtx.globalCompositeOperation = 'destination-in';
			innerCtx.drawImage(canvas, 0, 0);

			ctx.save();
			ctx.globalCompositeOperation = mode;
			ctx.drawImage(innerCanvas, 0, 0);
			ctx.restore();
		} else {
			throw new Error(`colorize: Invalid mode: ${mode}`);
		}
	}

	if (options.on) {
		const onCanvas = await canvasify(options.on);
		const onCtx = onCanvas.getContext('2d');
		onCtx.drawImage(canvas, 0, 0);
		canvas = onCanvas;
	}

	return canvas;
}
