import Component from "../core/component.js";
import Position from "../core/position.js";
import {ORIGIN} from "../core/constants.js";
import {DEFAULT as ThemeDefault} from "../themes/index.js";

class Window extends Component {
	static NAME = "Window";

	static DEFAULT_POSITION = new Position({
		originX: ORIGIN.X.CENTER,
		originY: ORIGIN.Y.CENTER,
		width: "50%",
		height: "50%"
	});
	static DEFAULT_STYLE = ThemeDefault.DEFAULT_MAP[Window.NAME];

	constructor({id = "", label = "", children = [], position = null, style = null, focusTrap = true, userClosable = false, onClose = null, onSelect = null}) {
		super({
			id,
			label,
			focusable: false,
			focusTrap,
			children,
			position: position ? position : Window.DEFAULT_POSITION ? Window.DEFAULT_POSITION.clone() : null,
			style: style ? style : Window.DEFAULT_STYLE ? Window.DEFAULT_STYLE.clone() : null
		});

		this.userClosable = userClosable;
		this.onClose = onClose;
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

	compute(params, options) {
		super.compute(params, options);
		if (!this._needsRender) {
			return;
		}
		const {position, _computedPosition, _children} = this;
		const childrenLen = _children.length;

		//Determine height of children
		if (position.height <= 0 && childrenLen > 0) {
			position.childrenHeight = _children.reduce((acc, child) => {
				const {_computedPosition: childPosition} = child;
				return acc + childPosition.marginTop + childPosition.height + childPosition.marginBottom;
			}, 0);

			//Recompute
			super.compute(params, {...options, force: true});
		}
	}

	computePosition(parentDetails, overrides = {}) {
		if (!this._needsRender) {
			return;
		}
		const {position, _computedStyle} = this;
		const hasBorder = _computedStyle.border !== null;

		//Auto-height
		if (position.height <= 0) {
			overrides.height = position.childrenHeight || 0 + position.paddingTop + position.paddingBottom;
			if (hasBorder) {
				overrides.height += 2;
			}
		}

		super.computePosition(parentDetails, overrides);
	}

	onKeyPress(str, key) {
		switch (key.name) {
			case "return":
				if (this.onSelect) {
					this.onSelect();
				}
				break;
			case "escape":
				if (this.userClosable) {
					if (this.onClose) {
						this.onClose();
					} else if (this._parent) {
						this._parent.removeChild(this);
					}
				}
				break;
		}
	}
}
export default Window;
