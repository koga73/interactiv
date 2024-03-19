import Component from "../core/component.js";
import Position from "../core/position.js";
import {CURSOR} from "../core/constants.js";
import {DEFAULT as ThemeDefault} from "../themes/index.js";

class List extends Component {
	static NAME = "List";

	static DEFAULT_POSITION = new Position();
	static DEFAULT_STYLE = ThemeDefault.DEFAULT_MAP[List.NAME];
	static DEFAULT_FOCUS_STYLE = ThemeDefault.DEFAULT_FOCUS_MAP[List.NAME];

	constructor({
		id = "",
		label = "",
		position = null,
		style = null,
		focusStyle = null,
		items = [],
		selectedIndex = -1,
		activeIndex = -1,
		autoSelect = false,
		onSelect = null,
		onChange = null,
		...props
	}) {
		super({
			id,
			label,
			focusable: true,
			focusStyle: focusStyle ? this.focusStyle : List.DEFAULT_FOCUS_STYLE ? List.DEFAULT_FOCUS_STYLE.clone() : null,
			focusTrap: false,
			children: null,
			position: position ? position : List.DEFAULT_POSITION ? List.DEFAULT_POSITION.clone() : null,
			style: style ? style : List.DEFAULT_STYLE ? List.DEFAULT_STYLE.clone() : null,
			...props
		});

		this.items = items;
		this.selectedIndex = selectedIndex;
		this.activeIndex = activeIndex;
		this.autoSelect = autoSelect;
		this.onSelect = onSelect;
		this.onChange = onChange;

		this._longestItem = 0;
		this._reactiveProps = [...this._reactiveProps, "items", "selectedIndex", "activeIndex"];

		this.gotoActivePrevious = this.gotoActivePrevious.bind(this);
		this.gotoActiveNext = this.gotoActiveNext.bind(this);
		this.gotoActiveIndex = this.gotoActiveIndex.bind(this);
		this.selectIndex = this.selectIndex.bind(this);
	}

	clone() {
		const {id, label, _children: children, focusable, focusTrap, focusStyle, position, style, items, selectedIndex, activeIndex, autoSelect, onSelect, onChange} = this;
		return new List({
			id,
			label,
			children,
			focusable,
			focusTrap,
			focusStyle: focusStyle ? focusStyle.clone() : null,
			position: position.clone(),
			style: style.clone(),
			items,
			selectedIndex,
			activeIndex,
			autoSelect,
			onSelect,
			onChange
		});
	}

	computePosition(parentDetails, overrides = {}) {
		if (!this._needsRender) {
			return;
		}
		const {position, items, _computedStyle} = this;
		const hasBorder = _computedStyle.border !== null;

		this._longestItem = Math.max(...items.map((item) => item.length));
		if (position.width <= 0) {
			overrides.width = this._longestItem + position.paddingLeft + position.paddingRight;
			if (hasBorder) {
				overrides.width += 2;
			}
		}
		if (position.height <= 0) {
			overrides.height = items.length + position.paddingTop + position.paddingBottom;
			if (hasBorder) {
				overrides.height += 2;
			}
		}
		super.computePosition(parentDetails, overrides);
	}

	drawSelf() {
		const {items, selectedIndex, activeIndex, _computedPosition, _computedStyle, _longestItem} = this;
		const {_innerX: x} = _computedPosition;
		const {y, height, contentY} = _computedPosition.getScrollContentRange();
		const {backgroundColor, color, underline, selectedBackgroundColor, selectedColor, selectedUnderline, activeBackgroundColor, activeColor, activeUnderline} = _computedStyle;

		const {stdout} = process;
		stdout.write(CURSOR.RESET);
		stdout.write(backgroundColor);
		stdout.write(color);

		for (let i = 0; i < height; i++) {
			const itemIndex = contentY + i;

			//No switch here since itemIndex can be selectedIndex AND activeIndex
			if (itemIndex === selectedIndex + 1 || itemIndex === activeIndex + 1) {
				stdout.write(CURSOR.RESET);
				stdout.write(backgroundColor);
				stdout.write(color);
				if (underline) {
					stdout.write(CURSOR.UNDERLINE);
				}
			}
			if (itemIndex === selectedIndex) {
				stdout.write(CURSOR.RESET);
				stdout.write(selectedBackgroundColor);
				stdout.write(selectedColor);
				if (selectedUnderline) {
					stdout.write(CURSOR.UNDERLINE);
				}
			}
			if (itemIndex === activeIndex) {
				stdout.write(CURSOR.RESET);
				stdout.write(activeBackgroundColor);
				stdout.write(activeColor);
				if (activeUnderline) {
					stdout.write(CURSOR.UNDERLINE);
				}
			}

			stdout.cursorTo(x, y + i);
			const item = items[itemIndex];
			const remainingLen = _longestItem - item.length;
			stdout.write(item + " ".repeat(remainingLen));
		}

		//Move cursor to active
		stdout.cursorTo(x, y + (activeIndex - contentY));
	}

	gotoActivePrevious() {
		this.gotoActiveIndex(this.activeIndex - 1);
	}

	gotoActiveNext() {
		this.gotoActiveIndex(this.activeIndex + 1);
	}

	gotoActiveIndex(index) {
		const newActiveIndex = Math.max(0, Math.min(this.items.length - 1, index));
		if (newActiveIndex !== this.activeIndex) {
			this.activeIndex = newActiveIndex;
			if (this.onChange) {
				this.onChange({
					activeIndex: this.activeIndex,
					activeItem: this.items[this.activeIndex]
				});
			}
			if (this.autoSelect) {
				this.selectIndex(this.activeIndex);
			}
		}
	}

	selectIndex(index) {
		this.selectedIndex = index;
		if (this.onSelect) {
			this.onSelect({
				selectedIndex: this.selectedIndex,
				selectedItem: this.items[this.selectedIndex]
			});
		}
	}

	_handlerKeyPress(str, key) {
		const {onKeyPress, gotoActivePrevious, gotoActiveNext, selectIndex, _parent} = this;
		if (onKeyPress) {
			if (onKeyPress(str, key) === false) {
				return;
			}
		}
		switch (key.name) {
			case "up":
				gotoActivePrevious();
				if (_parent) {
					_parent._handlerKeyPress(str, key);
				}
				break;
			case "down":
				gotoActiveNext();
				if (_parent) {
					_parent._handlerKeyPress(str, key);
				}
				break;
			case "return":
				selectIndex(this.activeIndex);
				break;
			default:
				if (_parent) {
					_parent._handlerKeyPress(str, key);
				}
				break;
		}
	}
}
export default List;
