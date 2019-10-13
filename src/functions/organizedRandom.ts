'use strict';

import { Canvas } from 'canvas';

import { Point } from '../interfaces';

import { canvasify, CanvasifyInput } from './canvasify';
import { contextify } from './contextify';

const getRandomArbitrary = (min: number, max: number) => {
	return (Math.random() * (max - min)) + min;
};

export interface OrganziedRandomConfig {
	source: CanvasifyInput;
	originalPosition: Point;
	randomCircle: {
		x: number,
		y: number,
		range: {
			min?: number;
			max: number;
		},
		scaleX?: number;
		scaleY?: number;
	};
}

/**
 * Puts an element on an image or canvas in a controlled random manner
 *
 * @param on The canvas to draw on
 * @param config The config
 * @param original Whether to actually randomize or just to return the original image
 *
 * @returns A Promise with a Canvas
 */
export async function organizedRandom(on: CanvasifyInput, config: OrganziedRandomConfig, original: boolean): Promise<Canvas> {
	const canvas = await canvasify(config.source);
	const onCtx = await contextify(on);

	// If original image is requested and original position provided
	if (original && config.originalPosition) {
		onCtx.drawImage(canvas, config.originalPosition.x, config.originalPosition.y);

		return onCtx.canvas;
	}

	// Random placement in an elipse
	if (config.randomCircle) {
		const distance = getRandomArbitrary(config.randomCircle.range.min || 0, config.randomCircle.range.max);
		const angle = getRandomArbitrary(0, Math.PI * 2);

		const scaleX = isNaN(config.randomCircle.scaleX) ? 1 : config.randomCircle.scaleX;
		const scaleY = isNaN(config.randomCircle.scaleY) ? 1 : config.randomCircle.scaleY;

		const x = (distance * Math.cos(angle) * scaleX) + config.randomCircle.x;
		const y = (distance * Math.sin(angle) * scaleY) + config.randomCircle.y;

		onCtx.drawImage(canvas, x, y);
	}

	return onCtx.canvas;
}
