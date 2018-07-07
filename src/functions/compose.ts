'use strict';

import { Canvas, createCanvas } from 'canvas';
import * as tinycolor from 'tinycolor2';

import { Box, Font, Rotation } from '../interfaces';
import { Validator } from '../util';
import { canvasify, CanvasifyInput } from './canvasify';
import { ImageRenderMode } from './drawImage';
import { drawImageOrText } from './drawImageOrText';

export interface ComposeTemplate {
	/**
	 * The template image that should be used
	 */
	image: CanvasifyInput;
	/**
	 * The fallback position on the template where the text or image should be drawn
	 */
	box?: Box;
	/**
	 * The position on the template where the text should be drawn
	 */
	boxText?: Box;
	/**
	 * The position on the template where the image should be drawn
	 */
	boxImage?: Box;
	/**
	 * The rotation of the image or text that should be drawn
	 */
	rotate?: Rotation;
	/**
	 * The font definition for the text that should be drawn
	 */
	font?: Font;
	/**
	 * The background color
	 */
	bgColor?: ColorInput;
	/**
	 * A mask that should be applied on the created context to cut it in shape
	 */
	mask?: CanvasifyInput;
}

export interface ComposeOptions {
	/**
	 * The image that should be drawn under the template
	 */
	image?: CanvasifyInput;
	/**
	 * The text that should be drawn under the template. This will only happen if no image is provided
	 */
	text?: string;
	/**
	 * The image placing mode. See drawImage for all modes
	 */
	mode?: ImageRenderMode;
}

export async function compose(template: ComposeTemplate, options: ComposeOptions): Promise<Canvas> {
	Validator.inputObject(template, 'compose (template)');
	Validator.inputObject(options, 'compose (options)');

	// Load base image, this is the image that gets rendered on top of everything at the end
	// This should be a transparent image that has an empty area somewhere
	const baseCanvas = await canvasify(template.image);

	// Create a canvas with the same size where we can draw all the stuff on that goes behind the template image
	const canvas = createCanvas(baseCanvas.width, baseCanvas.height);
	const ctx = canvas.getContext('2d');

	// Apply the background color for the cutout area if present
	if (template.bgColor) {
		const bgColor = tinycolor(template.bgColor as any);
		if (bgColor.isValid()) {
			ctx.fillStyle = bgColor.toHexString();
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		} else {
			throw new Error(`compose: Background color ${template.bgColor} isn't valid`);
		}
	}

	await drawImageOrText({
		on: ctx,
		image: options.image,
		box: template.box,
		boxImage: template.boxImage,
		boxText: template.boxText,
		mode: options.mode,
		rotate: template.rotate,
		text: options.text,
		font: template.font,
	});

	// Apply mask if needed
	if (template.mask) {
		ctx.globalCompositeOperation = 'destination-in';
		const mask = await canvasify(template.mask);
		ctx.drawImage(mask, 0, 0);
		ctx.globalCompositeOperation = 'source-over';
	}

	// Draw the full image on the canvas
	ctx.drawImage(baseCanvas, 0, 0, baseCanvas.width, baseCanvas.height);

	return canvas;
}
