import Component from "../core/component.js";
import Position from "../core/position.js";
import {CURSOR} from "../core/constants.js";
import {DEFAULT as ThemeDefault} from "../themes/index.js";

class Input extends Component {
	static DEFAULT_POSITION = new Position({
		width: "100%"
	});

	static DEFAULT_STYLE = ThemeDefault.DEFAULT_MAP.input;

	static DEFAULT_MASK = "*";
	static DEFAUT_ALLOWED_CHARACTERS = /^[a-zA-Z0-9`~!@#$%^&*()_=+;:'",<.>/?|{}\[\]\\\x20-]$/;

	constructor({
		id = "",
		label = "",
		focusTrap = false,
		position = null,
		style = null,
		value = "",
		maxLength = 0,
		disabled = false,
		mask = null,
		allowedCharacters = Input.DEFAUT_ALLOWED_CHARACTERS
	}) {
		super({
			id,
			label,
			focusable: true,
			focusTrap,
			children: null,
			position: position ? position : Input.DEFAULT_POSITION.clone(),
			style: style ? style : Input.DEFAULT_STYLE.clone()
		});

		this.value = value;
		this.maxLength = maxLength;
		this.disabled = disabled;
		this.mask = mask;
		this.allowedCharacters = allowedCharacters;

		this._reactiveProps = [...this._reactiveProps, "value", "maxLength", "disabled", "mask"];
	}

	clone() {
		const {id, label, _children: children, focusable, focusTrap, position, style, value, maxLength, disabled, mask, allowedCharacters} = this;
		return new Input({
			id,
			label,
			children,
			focusable,
			focusTrap,
			position: position.clone(),
			style: style.clone(),
			value,
			maxLength,
			disabled,
			mask,
			allowedCharacters
		});
	}

	computePosition(params, parentDetails, overrides = {}) {
		if (this.position.height <= 0) {
			const hasBorder = this._computedStyle.border !== null;
			if (hasBorder) {
				overrides.height = 3;
			} else {
				overrides.height = 1;
			}
		}
		super.computePosition(params, parentDetails, overrides);
	}

	drawSelf() {
		const {x, y, width} = this._computedPosition;
		const {border, backgroundColor, color} = this._computedStyle;
		const hasBorder = border !== null;

		const {stdout} = process;
		stdout.write(CURSOR.RESET);
		stdout.write(backgroundColor);
		stdout.write(color);

		if (hasBorder) {
			stdout.cursorTo(x + 1, y + 1);
		} else {
			stdout.cursorTo(x, y);
		}
		const innerWidth = hasBorder ? width - 2 : width;
		const val = this.mask ? this.mask.repeat(this.value.length) : this.value;
		stdout.write(val.length > innerWidth ? val.slice(-innerWidth) : val);
	}

	onFocus() {
		const {x, y, width} = this._computedPosition;
		const hasBorder = this._computedStyle.border !== null;
		const valLen = Math.min(this.value.length, hasBorder ? width - 2 : width);

		const {stdout} = process;
		if (hasBorder) {
			stdout.cursorTo(x + 1 + valLen, y + 1);
		} else {
			stdout.cursorTo(x + valLen, y);
		}
	}

	onKeyPress(str, key) {
		const {maxLength, disabled, allowedCharacters} = this;

		if (allowedCharacters.test(str)) {
			if (disabled) {
				return;
			}
			if (maxLength > 0) {
				if (this.value + 1 <= maxLength) {
					this.value += str;
				}
			} else {
				this.value += str;
			}
		} else {
			switch (key.name) {
				case "backspace":
					this.value = this.value.slice(0, -1);
					break;
				case "delete":
					this.value = "";
					break;
				default:
					if (this._parent) {
						this._parent.onKeyPress(str, key);
					}
					break;
			}
		}
	}
}
export default Input;
