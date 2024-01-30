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

	computePosition(parentDetails, overrides = {}) {
		if (!this._needsRender) {
			return;
		}
		const width = this.position.calcDimension(this.position.width, parentDetails.parentComputedPosition.innerWidth, this.position.marginLeft + this.position.marginRight);
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
		super.computePosition(parentDetails, overrides);
	}

	drawSelf() {
		const {innerX: x} = this._computedPosition;
		const {y, height, contentY} = this._computedPosition.getScrollContentRange();
		const {backgroundColor, color, underline} = this._computedStyle;

		const {stdout} = process;
		stdout.write(CURSOR.RESET);
		if (underline) {
			stdout.write(CURSOR.UNDERLINE);
		}
		stdout.write(backgroundColor);
		stdout.write(color);

		const lines = this._lines;
		for (let i = 0; i < height; i++) {
			stdout.cursorTo(x, y + i);
			stdout.write(lines[i + contentY]);
		}
	}

	//Separate text into multiple lines
	wordWrap(text, charsPerLine) {
		return text.split("\n").reduce((lines, line) => {
			line = line.trim();
			if (line.length <= charsPerLine) {
				lines.push(line);
			} else {
				let newLine = "";
				const words = line.replace(/\s+/g, " ").split(" ");
				const wordsLen = words.length;
				for (let i = 0; i < wordsLen; i++) {
					const word = words[i];
					if (newLine.length + word.length > charsPerLine) {
						lines.push(newLine);
						newLine = word + " ";
					} else {
						newLine += word + " ";
					}
				}
				lines.push(newLine.slice(0, -1));
			}
			return lines;
		}, []);
	}
}
export default Text;
