import Component from "../core/component.js";
import Position from "../core/position.js";
import {CURSOR} from "../core/constants.js";
import {DEFAULT as ThemeDefault} from "../themes/index.js";

class Input extends Component {
	static NAME = "Input";

	static DEFAULT_POSITION = new Position({
		width: "100%"
	});
	static DEFAULT_STYLE = ThemeDefault.DEFAULT_MAP[Input.NAME];
	static DEFAULT_FOCUS_STYLE = ThemeDefault.DEFAULT_FOCUS_MAP[Input.NAME];

	static DEFAULT_MASK = "*";
	static DEFAUT_ALLOWED_CHARACTERS = /^[a-zA-Z0-9`~!@#$%^&*()_=+;:'",<.>/?|{}\[\]\\\x20-]$/;

	constructor({
		id = "",
		label = "",
		focusTrap = false,
		focusStyle = null,
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
			focusStyle: focusStyle ? focusStyle : Input.DEFAULT_FOCUS_MAP ? Input.DEFAULT_FOCUS_MAP.clone() : null,
			children: null,
			position: position ? position : Input.DEFAULT_POSITION ? Input.DEFAULT_POSITION.clone() : null,
			style: style ? style : Input.DEFAULT_STYLE ? Input.DEFAULT_STYLE.clone() : null
		});

		this.value = value;
		this.maxLength = maxLength;
		this.disabled = disabled;
		this.mask = mask;
		this.allowedCharacters = allowedCharacters;

		this._reactiveProps = [...this._reactiveProps, "value", "maxLength", "disabled", "mask"];
	}

	clone() {
		const {id, label, _children: children, focusTrap, focusStyle, position, style, value, maxLength, disabled, mask, allowedCharacters} = this;
		return new Input({
			id,
			label,
			children,
			focusTrap,
			focusStyle: focusStyle ? focusStyle.clone() : null,
			position: position.clone(),
			style: style.clone(),
			value,
			maxLength,
			disabled,
			mask,
			allowedCharacters
		});
	}

	computePosition(parentDetails, overrides = {}) {
		if (this.position.height <= 0) {
			const hasBorder = this._computedStyle.border !== null;
			if (hasBorder) {
				overrides.height = 3;
			} else {
				overrides.height = 1;
			}
		}
		super.computePosition(parentDetails, overrides);
	}

	drawSelf() {
		const {x, y, width} = this._computedPosition;
		const {border, backgroundColor, color, underline} = this._computedStyle;
		const hasBorder = border !== null;

		const {stdout} = process;
		stdout.write(CURSOR.RESET);
		if (underline) {
			stdout.write(CURSOR.UNDERLINE);
		}
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
