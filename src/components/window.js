import Component from "../core/component.js";
import Position from "../core/position.js";
import {ORIGIN} from "../core/constants.js";

import {DEFAULT as ThemeDefault} from "../themes/index.js";

class Window extends Component {
	static DEFAULT_POSITION = new Position({
		originX: ORIGIN.X.CENTER,
		originY: ORIGIN.Y.CENTER,
		width: "50%",
		height: "50%"
	});

	static DEFAULT_STYLE = ThemeDefault.DEFAULT_MAP.window;

	constructor({id = "", label = "", children = [], position = null, style = null, userClosable = false, onSelect = null}) {
		super({
			id,
			label,
			focusable: false,
			focusTrap: true,
			children,
			position: position ? position : Window.DEFAULT_POSITION.clone(),
			style: style ? style : Window.DEFAULT_STYLE.clone()
		});

		this.userClosable = userClosable;
		this.onSelect = onSelect;
	}

	clone() {
		const {id, label, _children: children, focusable, focusTrap, position, style, userClosable, onSelect} = this;
		return new Window({
			id,
			label,
			children,
			focusable,
			focusTrap,
			position: position.clone(),
			style: style.clone(),
			userClosable,
			onSelect
		});
	}

	onKeyPress(str, key) {
		switch (key.name) {
			case "return":
				if (this.onSelect) {
					this.onSelect();
				}
				break;
			case "escape":
				if (this.userClosable && this._parent) {
					this._parent.removeChild(this);
				}
				break;
		}
	}
}
export default Window;
