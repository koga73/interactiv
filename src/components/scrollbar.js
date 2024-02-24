import Component from "../core/component.js";
import Position from "../core/position.js";
import {CURSOR} from "../core/constants.js";
import {DEFAULT as ThemeDefault} from "../themes/index.js";

class ScrollBar extends Component {
	static NAME = "ScrollBar";

	static DEFAULT_POSITION = new Position({
		width: "100%",
		heightL: "100%"
	});
	static DEFAULT_STYLE = ThemeDefault.DEFAULT_MAP[ScrollBar.NAME];
	static DEFAULT_FOCUS_STYLE = ThemeDefault.DEFAULT_FOCUS_MAP[ScrollBar.NAME];

	constructor({id = "", label = "", children = [], focusable = true, focusStyle = null, position = null, style = null, scrollPosition = 0}) {
		super({
			id,
			label,
			children,
			focusable,
			focusTrap: false,
			focusStyle: focusStyle ? focusStyle : ScrollBar.DEFAULT_FOCUS_MAP ? ScrollBar.DEFAULT_FOCUS_MAP.clone() : null,
			position: position ? position : ScrollBar.DEFAULT_POSITION ? ScrollBar.DEFAULT_POSITION.clone() : null,
			style: style ? style : ScrollBar.DEFAULT_STYLE ? ScrollBar.DEFAULT_STYLE.clone() : null
		});

		this.scrollPosition = scrollPosition;

		this._scrollStep = 0;
		this._reactiveProps = [...this._reactiveProps, "scrollPosition"];
	}

	clone() {
		const {id, label, _children: children, focusable, focusStyle, position, style, scrollPosition} = this;
		return new ScrollBar({
			id,
			label,
			children,
			focusable,
			focusStyle: focusStyle ? focusStyle.clone() : null,
			position: position.clone(),
			style: style.clone(),
			scrollPosition
		});
	}

	compute(params, options) {
		super.compute(params, options);
		if (!this._needsRender) {
			return;
		}
		const {_computedPosition, scrollPosition} = this;

		const {_innerHeight: height} = _computedPosition;
		const childrenHeight = this._children.reduce((acc, child) => acc + child._computedPosition.height, 0);

		const needsScroll = childrenHeight > height;
		if (needsScroll) {
			this._scrollStep = 1 / (childrenHeight - height);
		} else {
			this._scrollStep = 0;
		}
		this._children.forEach((child) => {
			child._computedPosition._scrollY = needsScroll ? Math.floor(scrollPosition * (childrenHeight - height)) : 0;
			child._computedPosition._scrollHeight = needsScroll ? height : 0;
		});
	}

	drawSelf() {
		const {scrollPosition, _computedPosition, _computedStyle} = this;
		const {_innerX: x, _innerY: y, _innerWidth: width, _innerHeight: height} = _computedPosition;
		const {trackCharacter, trackColor, thumbCharacter, thumbColor} = _computedStyle;

		const {stdout} = process;
		stdout.write(CURSOR.RESET);
		stdout.write(trackColor);

		const cursorStart = [x + width, y];
		let thumbY = Math.floor((height - 1) * scrollPosition);
		//Enure that thumb is not at top or bottom unless we are at 0 or 1
		if (thumbY === 0 && scrollPosition > 0) {
			thumbY = 1;
		} else if (thumbY === height - 1 && scrollPosition < 1) {
			thumbY = height - 2;
		}
		for (let i = 0; i < height; i++) {
			let character = trackCharacter;
			switch (i) {
				case thumbY:
					stdout.write(CURSOR.RESET);
					stdout.write(thumbColor);
					character = thumbCharacter;
					break;
				case thumbY + 1:
					stdout.write(CURSOR.RESET);
					stdout.write(trackColor);
					character = trackCharacter;
					break;
			}
			stdout.cursorTo(cursorStart[0], cursorStart[1] + i);
			stdout.write(character);
		}

		//Focus on thumb
		stdout.cursorTo(cursorStart[0], cursorStart[1] + thumbY);
	}

	_handlerKeyPress(str, key) {
		if (this.onKeyPress) {
			if (this.onKeyPress(str, key) === false) {
				return;
			}
		}
		switch (key.name) {
			case "up":
				this.scrollPosition = Math.max(0, this.scrollPosition - this._scrollStep);
				break;
			case "down":
				this.scrollPosition = Math.min(1, this.scrollPosition + this._scrollStep);
				break;
			//TODO: Add page up and page down
			default:
				if (this._parent) {
					this._parent._handlerKeyPress(str, key);
				}
				break;
		}
	}
}
export default ScrollBar;
