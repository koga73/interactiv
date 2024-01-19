import {ROOT, ORIGIN, CURSOR} from "./constants.js";
import Position from "./position.js";
import Style from "./style.js";
import RenderLog from "./render-log.js";

//Note: position is relative, computedPosition is absolute
class Component {
	constructor({id = "", label = "", children = [], focusable = false, focusTrap = false, position = null, style = null}) {
		this.id = id;
		if (!this.id) {
			throw new Error("Component must have an id");
		}
		this.label = label;
		this.focusable = focusable;
		this.focusTrap = focusTrap;
		this.position = position ? position : new Position();
		this.style = style ? style : new Style();

		this.clone = this.clone.bind(this);
		this.extend = this.extend.bind(this);
		this.render = this.render.bind(this);
		this.computeStyle = this.computeStyle.bind(this);
		this.computePosition = this.computePosition.bind(this);
		this.drawBackground = this.drawBackground.bind(this);
		this.drawBorder = this.drawBorder.bind(this);
		this.drawLabel = this.drawLabel.bind(this);
		this.drawChild = this.drawChild.bind(this);
		this.drawSelf = this.drawSelf.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onKeyPress = this.onKeyPress.bind(this);
		this.addChild = this.addChild.bind(this);
		this.removeChild = this.removeChild.bind(this);
		this.remove = this.remove.bind(this);
		this.needsRender = this.needsRender.bind(this);
		this._storeLastState = this._storeLastState.bind(this);
		this.isRendered = this.isRendered.bind(this);

		this._children = [];
		this._parent = null;
		this._computedPosition = null;
		this._computedStyle = null;
		this._reactiveProps = ["label", "_children", "focusable", "position", "style"];
		this._lastState = {};

		if (children) {
			const childrenLen = children.length;
			for (let i = 0; i < childrenLen; i++) {
				this.addChild(children[i]);
			}
		}
	}

	clone() {
		const {id, label, _children: children, focusable, focusTrap, position, style} = this;
		return new Component({
			id,
			label,
			children,
			focusable,
			focusTrap,
			position: position.clone(),
			style: style.clone()
		});
	}

	extend(props) {
		return Object.assign(this.clone(), props);
	}

	render(parent, {parentComputedPosition, parentComputedStyle, previousChildPosition} = {}, {force = false, debug = false} = {}) {
		let didRender = false;

		this._parent = parent;
		const {id, position, style, _children: children} = this;

		const needsRender = force ? true : this.needsRender(false, debug);
		if (needsRender) {
			if (force) {
				RenderLog.log(`'${id}' - force`);
			}
			this.computeStyle(style, {parentComputedStyle});
			this.computePosition(position, {parentComputedPosition, parentComputedStyle, previousChildPosition});
			this.drawBackground();
			this.drawBorder();
			this.drawLabel();
			this.drawSelf();
		}

		//Render children
		if (children) {
			let prevChildPos = null;
			const childrenLen = children.length;
			for (let i = 0; i < childrenLen; i++) {
				const child = children[i];
				if (child instanceof Component) {
					didRender |= child.render(
						this,
						{parentComputedPosition: this._computedPosition, parentComputedStyle: this._computedStyle, previousChildPosition: prevChildPos},
						{force: force | needsRender, debug}
					);
					prevChildPos = child._computedPosition;
				} else if (needsRender) {
					this.drawChild(child);
				}
			}
		}

		if (needsRender) {
			this._storeLastState();
		}

		return didRender | needsRender;
	}

	computeStyle(style, {parentComputedStyle}) {
		this._computedStyle = style.compute(parentComputedStyle);
	}

	computePosition(position, {parentComputedPosition, parentComputedStyle, previousChildPosition}, overrides = {}) {
		this._computedPosition = position.compute(
			parentComputedPosition,
			{
				parentHasBorder: parentComputedStyle ? parentComputedStyle.border !== null : false,
				previousChildPosition
			},
			overrides
		);
	}

	drawBackground() {
		const {id, _computedPosition, _computedStyle} = this;
		const {x, y, width, height} = _computedPosition;
		if (width <= 0) {
			throw new Error(`'${id}' - Cannot drawBackground - width: ${width}`);
		}
		if (height <= 0) {
			throw new Error(`'${id}' - Cannot drawBackground - height: ${height}`);
		}
		const {backgroundColor, color} = _computedStyle;

		const {stdout} = process;
		stdout.write(CURSOR.RESET);
		stdout.write(backgroundColor);
		stdout.write(color);

		for (let i = 0; i < height; i++) {
			stdout.cursorTo(x, y + i);
			stdout.write(" ".repeat(width));
		}
	}

	drawBorder() {
		const {id, _computedPosition, _computedStyle} = this;
		if (!_computedStyle.border) {
			return;
		}
		const {x, y, width, height} = _computedPosition;
		if (width <= 0) {
			throw new Error(`'${id}' - Cannot drawBorder - width: ${width}`);
		}
		if (height <= 0) {
			throw new Error(`'${id}' - Cannot drawBorder - height: ${height}`);
		}
		const {border, borderBackgroundColor, borderColor} = _computedStyle;

		const {stdout} = process;
		stdout.write(CURSOR.RESET);
		stdout.write(borderBackgroundColor);
		stdout.write(borderColor);

		stdout.cursorTo(x, y);
		stdout.write(border.topLeft);
		stdout.write(border.horizontal.repeat(width - 2));
		stdout.write(border.topRight);
		for (let i = 1; i < height - 1; i++) {
			stdout.cursorTo(x, y + i);
			stdout.write(border.vertical);
			stdout.cursorTo(x + width - 1, y + i);
			stdout.write(border.vertical);
		}
		stdout.cursorTo(x, y + height - 1);
		stdout.write(border.bottomLeft);
		stdout.write(border.horizontal.repeat(width - 2));
		stdout.write(border.bottomRight);
	}

	drawLabel() {
		const {label, _computedPosition, _computedStyle} = this;
		if (!label) {
			return;
		}
		const labelWidth = label.length;
		if (!labelWidth) {
			return;
		}
		const {x, y, width, labelOriginX} = _computedPosition;
		const {labelBackgroundColor, labelColor} = _computedStyle;

		const {stdout} = process;
		stdout.write(CURSOR.RESET);
		stdout.write(labelBackgroundColor);
		stdout.write(labelColor);

		switch (labelOriginX) {
			case ORIGIN.X.LEFT:
				stdout.cursorTo(x + 2, y);
				break;
			case ORIGIN.X.CENTER:
				stdout.cursorTo(x + Math.floor((width - labelWidth) * 0.5), y);
				break;
			case ORIGIN.X.RIGHT:
				stdout.cursorTo(x + width - labelWidth - 2, y);
				break;
		}
		stdout.write(label);
	}

	drawSelf() {
		//Not implemented
	}

	drawChild(child) {
		const {x, y} = this._computedPosition;
		const {backgroundColor, color} = this._computedStyle;

		const {stdout} = process;
		stdout.write(CURSOR.RESET);
		stdout.write(backgroundColor);
		stdout.write(color);

		stdout.cursorTo(x, y);
		stdout.write(child);
	}

	onFocus() {
		const {x, y} = this._computedPosition;

		const {stdout} = process;
		if (this.border) {
			stdout.cursorTo(x + 1, y + 1);
		} else {
			stdout.cursorTo(x, y);
		}
	}

	onBlur() {
		//Not implemented
	}

	onKeyPress(str, key) {
		//Not implemented
	}

	addChild(child) {
		const {_children: children} = this;
		if (!children) {
			throw new Error("Cannot add child to non-container");
		}
		if (child instanceof Component) {
			child._parent = this;
		}
		this._children = [...children, child];
	}

	removeChild(child) {
		const {_children: children} = this;
		if (!children) {
			throw new Error("Cannot remove child from non-container");
		}
		const childIndex = children.indexOf(child);
		if (childIndex !== -1) {
			children.splice(childIndex, 1);
		}
		if (child instanceof Component) {
			child._parent = null;
		}
		this._children = [...children];
	}

	//Self
	remove() {
		if (this._parent) {
			this._parent.removeChild(this);
		}
	}

	//Compare current state to previous state
	needsRender(fromParent, debug = false) {
		const {id, position, _children: children, _reactiveProps: reactiveProps} = this;
		const {position: lastPosition} = this._lastState;

		//See if any children need to rerender
		if (children) {
			const childrenLen = children.length;
			for (let i = 0; i < childrenLen; i++) {
				const child = children[i];
				if (child instanceof Component) {
					if (child.needsRender(true)) {
						if (debug) {
							RenderLog.log(`'${id}' - needsRender - child: '${child.id}'`);
						}
						return true;
					}
				}
			}
		}
		//Parent only needs to rerender if the position changes
		if (fromParent) {
			return position !== lastPosition;
		}

		const reactivePropsLen = reactiveProps.length;
		for (let i = 0; i < reactivePropsLen; i++) {
			const prop = reactiveProps[i];
			if (this[prop] !== this._lastState[prop]) {
				if (debug) {
					RenderLog.log(`'${id}' - needsRender - '${prop}'`);
				}
				return true;
			}
		}
		return false;
	}

	_storeLastState() {
		const {_reactiveProps: reactiveProps} = this;
		const lastState = {};

		const reactivePropsLen = reactiveProps.length;
		for (let i = 0; i < reactivePropsLen; i++) {
			const prop = reactiveProps[i];
			lastState[prop] = this[prop];
		}
		this._lastState = lastState;
	}

	isRendered() {
		let p = this._parent;
		while (p) {
			p = p._parent;
			if (p === ROOT) {
				return true;
			}
		}
		return false;
	}
}
export default Component;
