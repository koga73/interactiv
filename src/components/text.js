import Component from "../core/component.js";
import Position from "../core/position.js";
import {CURSOR} from "../core/constants.js";
import {DEFAULT as ThemeDefault} from "../themes/index.js";

class Text extends Component {
	static NAME = "Text";

	static DEFAULT_POSITION = new Position({
		width: "100%"
	});
	static DEFAULT_STYLE = ThemeDefault.DEFAULT_MAP[Text.NAME];

	constructor({id = "", label = "", position = null, style = null, value = ""}) {
		super({
			id,
			label,
			focusable: false,
			focusTrap: false,
			children: null,
			position: position ? position : Text.DEFAULT_POSITION ? Text.DEFAULT_POSITION.clone() : null,
			style: style ? style : Text.DEFAULT_STYLE ? Text.DEFAULT_STYLE.clone() : null
		});

		this.value = value;

		this._lines = [];
		this._reactiveProps = [...this._reactiveProps, "value"];

		this.wordWrap = this.wordWrap.bind(this);
	}

	clone() {
		const {id, label, _children: children, focusable, focusTrap, position, style, value} = this;
		return new Text({
			id,
			label,
			children,
			focusable,
			focusTrap,
			position: position.clone(),
			style: style.clone(),
			value
		});
	}

	computePosition(params, parentDetails, overrides = {}) {
		const parentHasBorder = parentDetails.parentComputedStyle ? parentDetails.parentComputedStyle.border !== null : false;
		const width = this.position.calcDimension(
			this.position.width,
			parentDetails.parentComputedPosition.width,
			this.position.marginLeft + this.position.marginRight,
			parentHasBorder
		);
		this._lines = this.wordWrap(this.value, width);
		overrides.width = width;

		if (this.position.height <= 0) {
			const hasBorder = this._computedStyle.border !== null;
			if (hasBorder) {
				overrides.height = this._lines.length + 2;
			} else {
				overrides.height = this._lines.length;
			}
		}
		super.computePosition(params, parentDetails, overrides);
	}

	drawSelf() {
		const {x, y} = this._computedPosition;
		const {border, backgroundColor, color, underline} = this._computedStyle;
		const hasBorder = border !== null;

		const {stdout} = process;
		stdout.write(CURSOR.RESET);
		if (underline) {
			stdout.write(CURSOR.UNDERLINE);
		}
		stdout.write(backgroundColor);
		stdout.write(color);

		const lines = this._lines;
		const linesLen = lines.length;
		for (let i = 0; i < linesLen; i++) {
			if (hasBorder) {
				stdout.cursorTo(x + 1, y + 1 + i);
			} else {
				stdout.cursorTo(x, y + i);
			}
			stdout.write(lines[i]);
		}
	}

	//Separate text into multiple lines
	wordWrap(text, charsPerLine) {
		const lines = [];
		let line = "";
		const words = text.split(" ");
		for (let i = 0; i < words.length; i++) {
			if (line.length + words[i].length > charsPerLine) {
				lines.push(line.trim());
				line = words[i] + " ";
			} else {
				line += words[i] + " ";
			}
		}
		lines.push(line.trim());
		return lines;
	}
}
export default Text;
