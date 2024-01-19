import {ORIGIN} from "./constants.js";

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
		paddingTop = 0,
		paddingRight = 0,
		paddingBottom = 0,
		paddingLeft = 0,
		labelOriginX = null
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
		this.paddingTop = paddingTop;
		this.paddingRight = paddingRight;
		this.paddingBottom = paddingBottom;
		this.paddingLeft = paddingLeft;
		this.labelOriginX = labelOriginX;

		this.clone = this.clone.bind(this);
		this.extend = this.extend.bind(this);
		this.compute = this.compute.bind(this);
		this.calcDimension = this.calcDimension.bind(this);
		this.toString = this.toString.bind(this);
	}

	clone() {
		return new Position(this);
	}

	extend(props) {
		return Object.assign(this.clone(), props);
	}

	compute(parentPosition, {parentHasBorder = false, previousChildPosition = null} = {}, overrides = {}) {
		const {originX, originY, x, y, width, height, marginTop, marginRight, marginBottom, marginLeft, labelOriginX} = Object.assign({}, this, overrides);
		const computed = this.clone();

		computed.labelOriginX = labelOriginX || originX;
		if (!parentPosition) {
			return computed;
		}
		const previousChildSameOrigin = previousChildPosition && previousChildPosition.originX === originX && previousChildPosition.originY === originY;
		const relPosition = previousChildSameOrigin ? previousChildPosition : parentPosition;

		//Width/Height
		computed.width = this.calcDimension(width, parentPosition.width, marginLeft + marginRight, parentHasBorder);
		computed.height = this.calcDimension(height, parentPosition.height, marginTop + marginBottom, parentHasBorder);

		//Origin X
		let xOffsetDir = 1;
		computed.x = parentPosition.x + x + marginLeft;
		switch (originX) {
			case ORIGIN.X.LEFT:
				computed.x += 0;
				break;
			case ORIGIN.X.CENTER:
				computed.x += Math.floor((parentPosition.width - computed.width) * 0.5);
				break;
			case ORIGIN.X.RIGHT:
				computed.x += parentPosition.width - computed.width - marginRight;
				xOffsetDir = -1;
				break;
		}
		if (parentHasBorder) {
			computed.x += 1 * xOffsetDir;
		}

		//Origin Y
		let yOffsetDir = 1;
		computed.y = relPosition.y + y + marginTop;
		switch (originY) {
			case ORIGIN.Y.TOP:
				computed.y += 0;
				break;
			case ORIGIN.Y.CENTER:
				computed.y += Math.floor((relPosition.height - computed.height) * 0.5);
				break;
			case ORIGIN.Y.BOTTOM:
				computed.y += relPosition.height - computed.height - marginBottom;
				yOffsetDir = -1;
				break;
		}
		if (previousChildSameOrigin) {
			//Compute relative position
			//Collapse margins
			computed.y += previousChildPosition.height + Math.abs(previousChildPosition.marginBottom - marginTop);
		} else {
			//Only offset the first child
			if (parentHasBorder) {
				computed.y += 1 * yOffsetDir;
			}
		}

		return computed;
	}

	calcDimension(input, parentSize, margin, parentHasBorder) {
		let size = parseInt(input);
		if (size !== 0 && /%$/.test(input)) {
			size = Math.floor(parentSize * (size / 100)) - margin;
			if (parentHasBorder) {
				size -= 2;
			}
		}
		return size;
	}

	toString() {
		const {originX, originY, x, y, width, height, marginTop, marginRight, marginBottom, marginLeft, labelOriginX} = this;
		return {originX, originY, x, y, width, height, marginTop, marginRight, marginBottom, marginLeft, labelOriginX};
	}
}
export default Position;
