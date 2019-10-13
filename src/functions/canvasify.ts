'use strict';

import * as fs from 'fs';
import { URL } from 'url';
import * as util from 'util';

import Axios from 'axios';
import { Canvas, CanvasRenderingContext2D, createCanvas, Image } from 'canvas';

const asyncReadFile = util.promisify(fs.readFile);

export type CanvasifyInput = Canvas | CanvasRenderingContext2D | string | Buffer | { width: number, height: number };

export async function canvasify(input: CanvasifyInput): Promise<Canvas> {
	if (input instanceof Canvas) {
		return input;
	}
	if (input instanceof CanvasRenderingContext2D) {
		return input.canvas;
	}

	if (typeof input === 'string' || input instanceof Buffer) {
		let data: Buffer;

		if (input instanceof Buffer) {
			data = input;
		} else if (input.startsWith('url+')) {
			let url;
			try {
				url = new URL(input.substr(4));
			} catch (e) {
				throw new Error(`Invalid URL`);
			}

			if (!['http:', 'https:'].includes(url.protocol)) {
				throw new Error(`Invalid URL protocol`);
			}

			let response;
			try {
				response = await Axios.get(url.href, { responseType: 'arraybuffer' });
			} catch (e) {
				throw new Error('Failed to load image from URL');
			}

			if (!['image/jpeg', 'image/png', 'image/gif'].includes(response.headers['content-type'])) {
				throw new Error(`Invalid content type`);
			}

			data = response.data;
		} else {
			try {
				data = await asyncReadFile(input);
			} catch (e) {
				throw new Error(`Failed to load file`);
			}
		}

		try {
			const image = new Image();
			image.src = data;

			const canvas = createCanvas(image.width, image.height);
			const ctx = canvas.getContext('2d');
			ctx.drawImage(image, 0, 0);

			return canvas;
		} catch (e) {
			throw new Error(`Failed to create image or canvas`);
		}
	}

	if (typeof input === 'object' && !isNaN(input.width) && !isNaN(input.height)) {
		return createCanvas(input.width, input.height);
	}

	throw new Error(`canvasify: Input parameter invalid`);
}
