'use strict';

import { Canvas } from 'canvas';

import { Box, Rotation } from '../interfaces';
import { Validator } from '../util';
import { canvasify, CanvasifyInput } from './canvasify';
import { contextify } from './contextify';

export interface DrawImageOptions {
	/**
	 * The canvas to draw on
	 */
	on: CanvasifyInput;
	/**
	 * The image that should be drawn
	 */
	image: CanvasifyInput;
	/**
	 * The box where the image should be drawn
	 */
	box: Box;
	/**
	 * The rotation of the image that should be drawn
	 */
	rotate?: Rotation;
	/**
	 * The mode for drawing the image
	 */
	mode?: ImageRenderMode;
}

export enum ImageRenderMode {
	FIT = 'fit',
	FILL = 'fill',
}

export const ImageRenderModes = Object.values(ImageRenderMode);

export async function drawImage(options: DrawImageOptions): Promise<Canvas> {
	// Validation
	Validator.inputObject(options, 'drawImage');
	Validator.box(options.box, 'drawImage');
	if (options.rotate) {
		Validator.rotation(options.rotate, 'drawImage');
	}
	options.mode = options.mode || ImageRenderMode.FILL;
	if (!Object.values(ImageRenderMode).includes(options.mode)) {
		throw new Error(`drawImage: Invalid mode ${options.mode}`);
	}

	// Load images
	const ctx = await contextify(options.on);
	const image = await canvasify(options.image);

	// Save current context
	ctx.save();

	// Rotate if wanted
	if (options.rotate) {
		ctx.translate(options.rotate.x, options.rotate.y);
		ctx.rotate(options.rotate.angle * Math.PI / 180);
		ctx.translate(-options.rotate.x, -options.rotate.y);
	}

	// Drawing position calculation magic
	let w = image.width;
	let h = image.height;
	const rh = options.box.h / h;
	const rw = options.box.w / w;
	const scale = options.mode === ImageRenderMode.FILL ? Math.max(rh, rw) : Math.min(rh, rw);
	w *= scale;
	h *= scale;

	// Drawing the image
	ctx.drawImage(image, options.box.x + ((options.box.w - w) / 2), options.box.y + ((options.box.h - h) / 2), w, h);

	// Restoring previous state
	ctx.restore();

	// Return the canvas
	return ctx.canvas;
}
