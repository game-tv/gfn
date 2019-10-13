'use strict';

import * as util from 'util';

export class Validator {
	public static inputObject(obj: any, prefix = '') {
		if (obj == null || typeof obj !== 'object') {
			throw new Error(`${prefix ? prefix + ': ' : ''}Invalid input object: ${util.inspect(obj, false, 1)}`);
		}
	}

	public static box(box: any, prefix = '') {
		if (!box || isNaN(box.x) || isNaN(box.y) || isNaN(box.w) || isNaN(box.h)) {
			throw new Error(`${prefix ? prefix + ': ' : ''}Invalid box: ${util.inspect(box, false, 1)}`);
		}
	}

	public static rotation(rotation: any, prefix = '') {
		if (!rotation || isNaN(rotation.x) || isNaN(rotation.y) || isNaN(rotation.angle)) {
			throw new Error(`${prefix ? prefix + ': ' : ''}Invalid rotate: ${util.inspect(rotation, false, 1)}`);
		}
	}
}
