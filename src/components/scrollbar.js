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

	constructor({id = "", label = "", children = [], focusStyle = null, position = null, style = null, scrollPosition = 0}) {
		super({
			id,
			label,
			children,
			focusable: true,
			focusTrap: false,
			focusStyle: focusStyle ? focusStyle : ScrollBar.DEFAULT_FOCUS_MAP ? ScrollBar.DEFAULT_FOCUS_MAP.clone() : null,
			position: position ? position : ScrollBar.DEFAULT_POSITION ? ScrollBar.DEFAULT_POSITION.clone() : null,
			style: style ? style : ScrollBar.DEFAULT_STYLE ? ScrollBar.DEFAULT_STYLE.clone() : null
		});

		this.scrollPosition = scrollPosition;

		this._childrenHeight = 0;
		this._innerHeight = 0;
		this._scrollStep = 0;
		this._reactiveProps = [...this._reactiveProps, "scrollPosition"];
	}

	clone() {
		const {id, label, _children: children, focusStyle, position, style, scrollPosition} = this;
		return new ScrollBar({
			id,
			label,
			children,
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

		const {_computedStyle, _computedPosition, scrollPosition} = this;
		const hasBorder = _computedStyle.border !== null;

		const {height} = _computedPosition;
		this._innerHeight = hasBorder ? height - 2 : height;
		this._childrenHeight = this._children.reduce((acc, child) => acc + child._computedPosition.height, 0);

		const needsScroll = this._childrenHeight > this._innerHeight;
		if (needsScroll) {
			this._scrollStep = 1 / (this._childrenHeight - this._innerHeight);
		} else {
			this._scrollStep = 0;
		}
		this._children.forEach((child) => {
			child._computedPosition.scrollY = needsScroll ? Math.floor(scrollPosition * (this._childrenHeight - this._innerHeight)) : 0;
			child._computedPosition.scrollHeight = needsScroll ? this._innerHeight : 0;
		});
	}

	drawSelf() {
		const {scrollPosition, _computedPosition, _computedStyle, _innerHeight} = this;
		const {x, y, width} = _computedPosition;
		const {border, trackCharacter, trackColor, thumbCharacter, thumbColor} = _computedStyle;
		const hasBorder = border !== null;

		const {stdout} = process;
		stdout.write(CURSOR.RESET);
		stdout.write(trackColor);

		const cursorStart = [x + width, y];
		if (hasBorder) {
			cursorStart[0] -= 1;
			cursorStart[1] += 1;
		}
		let thumbY = Math.floor((_innerHeight - 1) * scrollPosition);
		//Enure that thumb is not at top or bottom unless we are at 0 or 1
		if (thumbY === 0 && scrollPosition > 0) {
			thumbY = 1;
		} else if (thumbY === _innerHeight - 1 && scrollPosition < 1) {
			thumbY = _innerHeight - 2;
		}
		for (let i = 0; i < _innerHeight; i++) {
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

	onKeyPress(str, key) {
		switch (key.name) {
			case "up":
				this.scrollPosition = Math.max(0, this.scrollPosition - this._scrollStep);
				break;
			case "down":
				this.scrollPosition = Math.min(1, this.scrollPosition + this._scrollStep);
				break;
			default:
				if (this._parent) {
					this._parent.onKeyPress(str, key);
				}
				break;
		}
	}
}
export default ScrollBar;
