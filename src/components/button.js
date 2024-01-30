import Component from "../core/component.js";
import Position from "../core/position.js";

import {ORIGIN, CURSOR} from "../core/constants.js";
import {DEFAULT as ThemeDefault} from "../themes/index.js";

class Button extends Component {
	static NAME = "Button";

	static DEFAULT_POSITION = new Position({
		originX: ORIGIN.X.RIGHT,
		originY: ORIGIN.Y.BOTTOM,
		paddingTop: 0,
		paddingRight: 1,
		paddingBottom: 0,
		paddingLeft: 1
	});
	static DEFAULT_STYLE = ThemeDefault.DEFAULT_MAP[Button.NAME];
	static DEFAULT_FOCUS_STYLE = ThemeDefault.DEFAULT_FOCUS_MAP[Button.NAME];

	constructor({id = "", label = "", position = null, style = null, focusStyle = null, value = "", onSelect = null}) {
		super({
			id,
			label,
			focusable: true,
			focusTrap: false,
			focusStyle: focusStyle ? focusStyle : Button.DEFAULT_FOCUS_STYLE ? Button.DEFAULT_FOCUS_STYLE.clone() : null,
			children: null,
			position: position ? position : Button.DEFAULT_POSITION ? Button.DEFAULT_POSITION.clone() : null,
			style: style ? style : Button.DEFAULT_STYLE ? Button.DEFAULT_STYLE.clone() : null
		});

		this.value = value;
		this.onSelect = onSelect;

		this._reactiveProps = [...this._reactiveProps, "value"];
	}

	clone() {
		const {id, label, _children: children, focusable, focusTrap, focusStyle, position, style, value, onSelect} = this;
		return new Button({
			id,
			label,
			children,
			focusable,
			focusTrap,
			focusStyle: focusStyle ? focusStyle.clone() : null,
			position: position.clone(),
			style: style.clone(),
			value,
			onSelect
		});
	}

	computePosition(parentDetails, overrides = {}) {
		if (!this._needsRender) {
			return;
		}
		const {position, value, _computedStyle} = this;
		if (position.width <= 0) {
			overrides.width = value.length + position.paddingLeft + position.paddingRight;
		}
		if (position.height <= 0) {
			overrides.height = 1 + position.paddingTop + position.paddingBottom;
		}
		const hasBorder = _computedStyle.border !== null;
		if (hasBorder) {
			overrides.width += 2;
			overrides.height += 2;
		}
		super.computePosition(parentDetails, overrides);
	}

	drawSelf() {
		const {x, y, paddingTop, paddingLeft} = this._computedPosition;
		const {backgroundColor, color, border, underline} = this._computedStyle;
		const hasBorder = border !== null;

		const {stdout} = process;
		stdout.write(CURSOR.RESET);
		if (underline) {
			stdout.write(CURSOR.UNDERLINE);
		}
		stdout.write(backgroundColor);
		stdout.write(color);

		const cursorStart = [x + paddingLeft, y + paddingTop];
		if (hasBorder) {
			cursorStart[0] += 1;
			cursorStart[1] += 1;
		}
		stdout.cursorTo(cursorStart[0], cursorStart[1]);
		stdout.write(this.value);
		stdout.cursorTo(cursorStart[0], cursorStart[1]);
	}

	onKeyPress(str, key) {
		switch (key.name) {
			case "return":
				if (this.onSelect) {
					this.onSelect();
				}
				break;
			default:
				if (this._parent) {
					this._parent.onKeyPress(str, key);
				}
				break;
		}
	}
}
export default Button;
