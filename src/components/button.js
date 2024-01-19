import Component from "../core/component.js";
import Position from "../core/position.js";

import {ORIGIN} from "../core/constants.js";
import {DEFAULT as ThemeDefault} from "../themes/index.js";

class Button extends Component {
	static DEFAULT_POSITION = new Position({
		originX: ORIGIN.X.RIGHT,
		originY: ORIGIN.Y.BOTTOM,
		paddingTop: 0,
		paddingRight: 1,
		paddingBottom: 0,
		paddingLeft: 1
	});

	static DEFAULT_STYLE = ThemeDefault.DEFAULT_MAP.button;

	constructor({id = "", label = "", position = null, style = null, value = "", onSelect = null}) {
		super({
			id,
			label,
			focusable: true,
			focusTrap: false,
			children: null,
			position: position ? position : Button.DEFAULT_POSITION.clone(),
			style: style ? style : Button.DEFAULT_STYLE.clone()
		});

		this.value = value;
		this.onSelect = onSelect;

		this._reactiveProps = [...this._reactiveProps, "value"];
	}

	clone() {
		const {id, label, _children: children, focusable, focusTrap, position, style, value, onSelect} = this;
		return new Button({
			id,
			label,
			children,
			focusable,
			focusTrap,
			position: position.clone(),
			style: style.clone(),
			value,
			onSelect
		});
	}

	computePosition(params, parentDetails, overrides = {}) {
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
		super.computePosition(params, parentDetails, overrides);
	}

	drawSelf() {
		const {stdout} = process;
		const {x, y, paddingTop, paddingLeft} = this._computedPosition;
		const hasBorder = this._computedStyle.border !== null;
		if (hasBorder) {
			stdout.cursorTo(x + paddingLeft + 1, y + paddingTop + 1);
		} else {
			stdout.cursorTo(x + paddingLeft, y + paddingTop);
		}
		stdout.write(this.value);
	}

	onFocus() {
		const {stdout} = process;
		const {x, y, paddingTop, paddingLeft} = this._computedPosition;
		const hasBorder = this._computedStyle.border !== null;
		if (hasBorder) {
			stdout.cursorTo(x + paddingLeft + 1, y + paddingTop + 1);
		} else {
			stdout.cursorTo(x + paddingLeft, y + paddingTop);
		}
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
