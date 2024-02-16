import Component from "../core/component.js";
import Position from "../core/position.js";
import {DEFAULT as ThemeDefault} from "../themes/index.js";

class Screen extends Component {
	static NAME = "Screen";

	static DEFAULT_POSITION = new Position({
		width: "100%",
		height: "100%"
	});
	static DEFAULT_STYLE = ThemeDefault.DEFAULT_MAP[Screen.NAME];

	constructor({id = "", label = "", children = [], position = null, style = null, onSelect = null}) {
		super({
			id,
			label,
			focusable: false,
			focusTrap: true,
			children,
			position: position ? position : Screen.DEFAULT_POSITION ? Screen.DEFAULT_POSITION.clone() : null,
			style: style ? style : Screen.DEFAULT_STYLE ? Screen.DEFAULT_STYLE.clone() : null
		});

		this.onSelect = onSelect;
	}

	clone() {
		const {id, label, _children: children, focusable, focusTrap, position, style, onSelect} = this;
		return new Screen({
			id,
			label,
			children,
			focusable,
			focusTrap,
			position: position.clone(),
			style: style.clone(),
			onSelect
		});
	}

	drawBackground() {
		const {id, _computedStyle} = this;
		const {backgroundColor, color} = _computedStyle;
		if (!backgroundColor) {
			throw new Error(`'${id}' - Cannot drawBackground - backgroundColor: null`);
		}
		if (!color) {
			throw new Error(`'${id}' - Cannot drawBackground - color: null`);
		}
		super.drawBackground();
	}

	onKeyPress(str, key) {
		switch (key.name) {
			case "return":
				if (this.onSelect) {
					this.onSelect();
				}
				break;
		}
	}
}
export default Screen;
