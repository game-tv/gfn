
'use strict';

import { Canvas } from 'canvas';

import { Box, Font, Offset, Rotation } from '../interfaces';
import { parseColor, Validator } from '../util';
import { CanvasifyInput } from './canvasify';
import { contextify } from './contextify';

export interface DrawTextOptions {
	/**
	 * The text to write
	 */
	text: string;
	/**
	 * The canvas or context to draw on
	 */
	on: CanvasifyInput;
	/**
	 * The box where the text should be drawn in
	 */
	box: Box;
	/**
	 * The offset of the text in the box
	 */
	offset?: Offset;
	/**
	 * The font
	 */
	font?: Font;
	/**
	 * Text rotation
	 */
	rotate?: Rotation;
	/**
	 * Whether to draw the stroke (outlines of each character) or not
	 */
	stroke?: boolean;
}

interface Line {
	width: number;
	sizes: Array<{ width: number, height: number }>;
	words: string[];
}

/**
 * Draws text in a box on a canvas context, excess /\S/ are removed
 */
// tslint:disable-next-line:cyclomatic-complexity
export async function drawText(options: DrawTextOptions): Promise<Canvas> {
	// Validation
	if (!options.text) {
		options.text = 'weeb.sh';
	}
	Validator.box(options.box, 'drawText');
	options.offset = options.offset || { x: 0, y: 0 };
	if (options.offset.x == null) {
		options.offset.x = 0;
	}
	if (options.offset.y == null) {
		options.offset.y = 0;
	}

	// Load image
	const ctx = await contextify(options.on);

	// Save context state
	ctx.save();

	// Apply font
	if (options.font) {
		if (options.font.color) {
			const color = parseColor(options.font.color);
			if (!color.isValid()) {
				throw new Error(`drawText: Template font color ${color} isn't valid`);
			}
			ctx.fillStyle = color.toHexString();
		} else {
			ctx.fillStyle = '#000';
		}

		if (options.font.size && options.font.family) {
			ctx.font = `${options.font.size}px ${options.font.family}`;
		}
	} else {
		options.font = {};
	}

	// More validation
	options.font.hs = options.font.hs == null ? ctx.measureText(' ').width : options.font.hs;
	if (options.font.vs == null) {
		const font = ctx.font.match(/^(\d+)px/);
		if (font) {
			options.font.vs = parseInt(font[1], 10);
		} else {
			throw new Error(`drawText: Either options.font.verticalSpacing has to be defined or ctx.font's size must be in pixels`);
		}
	}

	// Get words
	const regex = /\S+/g;
	const words = [];
	let match = null;
	do {
		match = regex.exec(options.text);
		if (match) {
			words.push(match[0]);
		}
	} while (match);

	// Get word sizes
	const sizes = words.map(e => ctx.measureText(e));

	// Get text width from->to adding horizontal spacing
	const getWidth = (from: number, to: number) => sizes.slice(from, to).reduce((a, c) => a + c.width + options.font.hs, 0);

	const lines: Line[] = [];
	// Current word
	let current = 0;
	// While we still have words left
	while (current < words.length) {
		if ((lines.length + 1) * options.font.vs > options.box.h) {
			// Prevent up and down bleeding, could be put as an option
			break;
		}

		// Width and size of the current line
		let width;
		let size = 1;
		while (current + size <= words.length) {
			width = getWidth(current, current + size);
			if (width > options.box.w) {
				// If not first word in line, reduce size and recalc width
				if (size > 1) {
					size--;
					width = getWidth(current, current + size);
				}
				break;
			}
			size++;
		}
		lines.push({ width: width, sizes: sizes.slice(current, current + size), words: words.slice(current, current + size) });

		current += size;
	}

	// Rotate if wanted
	if (options.rotate) {
		ctx.translate(options.rotate.x, options.rotate.y);
		ctx.rotate(options.rotate.angle * Math.PI / 180);
		ctx.translate(-options.rotate.x, -options.rotate.y);
	}

	// Draw text for every line
	lines.forEach((line, lindex) => {
		// Cumulative X offset for drawing words and spacing them
		let xoffset = 0;
		line.words.forEach((word, windex) => {
			ctx.fillText(
				word,
				options.box.x + ((options.box.w - line.width) / 2) + xoffset + options.offset.x,
				options.box.y + ((options.box.h - (lines.length * options.font.vs)) / 2) + (lindex * options.font.vs) + options.offset.y,
			);
			if (options.stroke) {
				ctx.strokeText(
					word,
					options.box.x + ((options.box.w - line.width) / 2) + xoffset + options.offset.x,
					options.box.y + ((options.box.h - (lines.length * options.font.vs)) / 2) + (lindex * options.font.vs) + options.offset.y,
				);
			}

			// Add the current word's width and horizontal spacing
			xoffset += line.sizes[windex].width + options.font.hs;
		});
	});

	// Restore context state
	ctx.restore();

	// Return canvas
	return ctx.canvas;
}
