
'use strict';

import { Canvas } from 'canvas';

import { Box, Font, Rotation } from '../interfaces';
import { Validator } from '../util';
import { CanvasifyInput } from './canvasify';
import { contextify } from './contextify';
import { drawImage, ImageRenderMode } from './drawImage';
import { drawText } from './drawText';

export interface DrawImageOrTextOptions {
	/**
	 * The canvas or context to draw on
	 */
	on: CanvasifyInput;
	/**
	 * The template image that should be used
	 */
	image?: CanvasifyInput;
	/**
	 * The image render mode
	 */
	mode?: ImageRenderMode;
	/**
	 * The text that should be used. Only used if image is not set.
	 */
	text?: string;
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
	 * If the text should be stroked or not
	 */
	stroke?: boolean;
	/**
	 * The background color
	 */
	bgColor?: ColorInput;
	/**
	 * A mask that should be applied on the created context to cut it in shape
	 */
	mask?: CanvasifyInput;
}

export async function drawImageOrText(options: DrawImageOrTextOptions): Promise<Canvas> {
	Validator.inputObject(options, 'drawImageOrText');

	const ctx = await contextify(options.on);

	if (options.image) {
		// Draw the image
		await drawImage({
			on: ctx,
			image: options.image,
			box: options.boxImage || options.box,
			mode: options.mode,
			rotate: options.rotate,
		});
	} else {
		// Draw the text
		await drawText({
			on: ctx,
			text: options.text,
			box: options.boxText || options.box,
			font: options.font,
			offset: {
				y: options.font.size,
			},
			rotate: options.rotate,
			stroke: options.stroke,
		});
	}

	return ctx.canvas;
}
