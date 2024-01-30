import {ORIGIN} from "./constants.js";

//Basically an implementation of the CSS box model, but with a few differences such as no border since it's size is assumed to be 0 or 1
class Position {
	constructor({
		originX = ORIGIN.X.LEFT,
		originY = ORIGIN.Y.TOP,
		x = 0,
		y = 0,
		width = 0,
		height = 0,
		marginTop = 0,
		marginRight = 0,
		marginBottom = 0,
		marginLeft = 0,
		borderSize = 0,
		paddingTop = 0,
		paddingRight = 0,
		paddingBottom = 0,
		paddingLeft = 0,
		labelOriginX = null,
		...remaining
	} = {}) {
		this.originX = originX;
		this.originY = originY;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.marginTop = marginTop;
		this.marginRight = marginRight;
		this.marginBottom = marginBottom;
		this.marginLeft = marginLeft;
		this.borderSize = borderSize;
		this.paddingTop = paddingTop;
		this.paddingRight = paddingRight;
		this.paddingBottom = paddingBottom;
		this.paddingLeft = paddingLeft;
		this.labelOriginX = labelOriginX;

		this.scrollY = 0;
		this.scrollHeight = 0;

		this.innerX = x;
		this.innerY = y;
		this.innerWidth = width;
		this.innerHeight = height;

		this.clone = this.clone.bind(this);
		this.extend = this.extend.bind(this);
		this.compute = this.compute.bind(this);
		this.calcDimension = this.calcDimension.bind(this);
		this.getScrollContentRange = this.getScrollContentRange.bind(this);
		this.shouldCopyProp = this.shouldCopyProp.bind(this);

		//Add remaining non-function props
		for (const prop in remaining) {
			if (this.shouldCopyProp(prop)) {
				this[prop] = remaining[prop];
			}
		}
	}

	clone(intoPosition = null) {
		if (!intoPosition) {
			return new Position(this);
		}
		//Add remaining non-function props
		for (const prop in this) {
			if (this.shouldCopyProp(prop)) {
				intoPosition[prop] = this[prop];
			}
		}
		return intoPosition;
	}

	extend(props, intoPosition = null) {
		if (!intoPosition) {
			return Object.assign(this.clone(), props);
		}
		//Add remaining non-function props
		for (const prop in props) {
			if (this.shouldCopyProp(prop)) {
				intoPosition[prop] = props[prop];
			}
		}
	}

	compute(parentPosition, {previousChildPosition = null, intoPosition = null} = {}, overrides = {}) {
		const computed = this.clone(intoPosition);
		const {
			originX,
			originY,
			x,
			y,
			width,
			height,
			marginTop,
			marginRight,
			marginBottom,
			marginLeft,
			borderSize,
			paddingTop,
			paddingRight,
			paddingBottom,
			paddingLeft,
			labelOriginX
		} = Object.assign({}, computed, overrides);

		computed.labelOriginX = labelOriginX || originX;
		if (!parentPosition) {
			return computed;
		}
		//Get the relative position, only use the previous child's position if it has the same origin
		const previousChildSameOrigin = previousChildPosition && previousChildPosition.originX === originX && previousChildPosition.originY === originY;
		const relativeY = previousChildSameOrigin ? previousChildPosition.y + previousChildPosition.height : parentPosition.innerY;

		//Width/Height
		computed.width = this.calcDimension(width, parentPosition.innerWidth, marginLeft + marginRight);
		computed.height = this.calcDimension(height, parentPosition.innerHeight, marginTop + marginBottom);

		//Origin X
		computed.x = parentPosition.innerX + x + marginLeft;
		switch (originX) {
			case ORIGIN.X.LEFT:
				computed.x += 0;
				break;
			case ORIGIN.X.CENTER:
				computed.x += Math.floor((parentPosition.innerWidth - computed.width) * 0.5);
				break;
			case ORIGIN.X.RIGHT:
				computed.x += parentPosition.innerWidth - computed.width - marginRight;
				break;
		}

		//Origin Y
		computed.y = relativeY + y + marginTop;
		switch (originY) {
			case ORIGIN.Y.TOP:
				computed.y += 0;
				break;
			case ORIGIN.Y.CENTER:
				computed.y += Math.floor((parentPosition.innerHeight - computed.height) * 0.5);
				break;
			case ORIGIN.Y.BOTTOM:
				computed.y += parentPosition.innerHeight - computed.height - marginBottom;
				break;
		}
		//Collapse margins
		if (previousChildSameOrigin) {
			computed.y += Math.abs(previousChildPosition.marginBottom - marginTop);
		}

		//Inner
		computed.innerX = computed.x + borderSize + paddingLeft;
		computed.innerY = computed.y + borderSize + paddingTop;
		computed.innerWidth = computed.width - borderSize * 2 - paddingLeft - paddingRight;
		computed.innerHeight = computed.height - borderSize * 2 - paddingTop - paddingBottom;

		return computed;
	}

	calcDimension(input, parentSize, margin) {
		let size = parseInt(input);
		if (size !== 0 && /%$/.test(input)) {
			size = Math.floor(parentSize * (size / 100)) - margin;
		}
		return size;
	}

	getScrollContentRange() {
		const {y, innerY, height, innerHeight, scrollY, scrollHeight} = this;
		const contentY = innerY - y - scrollY;
		return {
			y: Math.max(y + contentY, y),
			contentY: Math.max(-contentY, 0),
			//TODO: This is a temporary fix for the scrollHeight being too large, it should be calculated based on the content
			height: scrollHeight > 0 ? Math.min(scrollHeight - Math.floor((height - innerHeight) * 0.5), innerHeight) : innerHeight
		};
	}

	shouldCopyProp(prop) {
		return prop[0] !== "_" && typeof this[prop] !== "function";
	}
}
export default Position;
