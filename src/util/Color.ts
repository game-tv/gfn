'use strict';

import * as tinycolor from 'tinycolor2';
import { ColorInput } from 'tinycolor2';

export type GfnColorInput = ColorInput;

export interface GfnColor {
	isValid(): boolean;
	toRgbString(): string;
	toHexString(): string;
}

export function parseColor(input: GfnColorInput): GfnColor {
	return tinycolor(input as any);
}
