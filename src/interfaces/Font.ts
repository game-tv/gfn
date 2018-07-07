'use strict';

export interface Font {
	/**
	 * Color for the font
	 */
	color?: ColorInput;
	/**
	 * Size of the font
	 */
	size?: number;
	/**
	 * Family of the font
	 */
	family?: string;
	/**
	 *  Horizontal separation (pixels between words)
	 */
	hs?: number;
	/**
	 * Vertical separation (pixels between starts of a line, usually font size)
	 */
	vs?: number;
}
