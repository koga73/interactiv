import {ROOT, ORIGIN, CURSOR} from "./constants.js";
import Position from "./position.js";
import Style from "./style.js";
import RenderLog from "./render-log.js";

//Note: position is relative, computedPosition is absolute
class Component {
	constructor({id = "", label = "", children = [], focusable = false, focusTrap = false, focusStyle = null, position = null, style = null}) {
		this.id = id;
		if (!this.id) {
			throw new Error("Component must have an id");
		}
		this.label = label;
		this.focusable = focusable;
		this.focusTrap = focusTrap;
		this.focusStyle = focusStyle;
		this.position = position ? position : new Position();
		this.style = style ? style : new Style();

		this.clone = this.clone.bind(this);
		this.extend = this.extend.bind(this);
		this.compute = this.compute.bind(this);
		this.computeStyle = this.computeStyle.bind(this);
		this.computePosition = this.computePosition.bind(this);
		this.render = this.render.bind(this);
		this.drawBackground = this.drawBackground.bind(this);
		this.drawBorder = this.drawBorder.bind(this);
		this.drawLabel = this.drawLabel.bind(this);
		this.drawString = this.drawString.bind(this);
		this.drawSelf = this.drawSelf.bind(this);
		this.renderChildren = this.renderChildren.bind(this);
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
		this._focused = false;
		this._needsRender = false;
		this._reactiveProps = ["label", "focusable", "position", "style", "focusStyle", "_children", "_focused"];
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

	compute(params, {force = false, delta = 0, debug = false} = {}) {
		this._needsRender = force ? true : this.needsRender(false, debug);
		if (this._needsRender) {
			this.computeStyle({...params, debug});
			this.computePosition({...params, delta, debug});
		}

		//Compute children
		const {_children: children} = this;
		if (children) {
			let prevChildPos = null;
			const childrenLen = children.length;
			for (let i = 0; i < childrenLen; i++) {
				const child = children[i];
				if (child instanceof Component) {
					child.compute(
						{
							parentComputedPosition: this._computedPosition,
							parentComputedStyle: this._computedStyle,
							previousChildPosition: prevChildPos
						},
						{force, delta, debug}
					);
					prevChildPos = child._computedPosition;
				}
			}
		}
	}

	computeStyle({parentComputedStyle} = {}) {
		const {style, focusStyle, _focused: focused} = this;
		const styleToCompute = focused ? focusStyle || style : style;
		this._computedStyle = styleToCompute.compute(parentComputedStyle);
	}

	computePosition({parentComputedPosition, parentComputedStyle, previousChildPosition}, overrides = {}) {
		const {position} = this;
		this._computedPosition = position.compute(
			parentComputedPosition,
			{
				parentHasBorder: parentComputedStyle ? parentComputedStyle.border !== null : false,
				previousChildPosition
			},
			overrides
		);
	}

	render(parent) {
		this._parent = parent;

		const {_needsRender: needsRender} = this;
		if (needsRender) {
			this.drawBackground();
			this.drawBorder();
			this.drawLabel();
			this.drawSelf();
		}
		const didRender = this.renderChildren();
		if (needsRender) {
			this._storeLastState();
		}

		return needsRender | didRender;
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
		const {x, y} = this._computedPosition;
		const {stdout} = process;
		stdout.cursorTo(x, y);
	}

	renderChildren() {
		let didRender = false;
		const {_children: children} = this;
		if (!children) {
			return didRender;
		}
		const childrenLen = children.length;
		for (let i = 0; i < childrenLen; i++) {
			const child = children[i];
			if (child instanceof Component) {
				didRender |= child.render(this);
			} else {
				this.drawString(child);
			}
		}
		return didRender;
	}

	drawString(str) {
		const {x, y} = this._computedPosition;
		const {backgroundColor, color} = this._computedStyle;

		const {stdout} = process;
		stdout.write(CURSOR.RESET);
		stdout.write(backgroundColor);
		stdout.write(color);

		stdout.cursorTo(x, y);
		stdout.write(str);
	}

	onFocus() {
		this._focused = true;
		this.drawSelf();
	}

	onBlur() {
		this._focused = false;
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

		//Parent only needs to rerender if the position changes
		if (fromParent) {
			return position !== lastPosition;
		}

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
