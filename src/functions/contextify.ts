'use strict';

import { Canvas, CanvasRenderingContext2D } from 'canvas';

import { canvasify, CanvasifyInput } from './canvasify';

export async function contextify(input: CanvasifyInput): Promise<CanvasRenderingContext2D> {
	if (input instanceof CanvasRenderingContext2D) {
		return input;
	}
	if (input instanceof Canvas) {
		return input.getContext('2d');
	}
	if (typeof input === 'string' || input instanceof Buffer || typeof input === 'object' && !isNaN(input.width) && !isNaN(input.height)) {
		return (await canvasify(input)).getContext('2d');
	}

	throw new Error(`contextify: Input parameter invalid`);
}
