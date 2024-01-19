class Style {
	constructor({
		//Colors
		backgroundColor = null,
		color = null,
		//Border
		border = null,
		borderBackgroundColor = null,
		borderColor = null,
		//Label
		labelBackgroundColor = null,
		labelColor = null
	} = {}) {
		this.backgroundColor = backgroundColor;
		this.color = color;
		this.border = border;
		this.borderBackgroundColor = borderBackgroundColor;
		this.borderColor = borderColor;
		this.labelBackgroundColor = labelBackgroundColor;
		this.labelColor = labelColor;

		this.clone = this.clone.bind(this);
		this.extend = this.extend.bind(this);
		this.compute = this.compute.bind(this);
		this.toString = this.toString.bind(this);
	}

	clone() {
		return new Style(this);
	}

	extend(props, soft = false) {
		const style = this.clone();
		for (const prop in props) {
			if (soft) {
				style[prop] = style[prop] || props[prop];
			} else {
				style[prop] = props[prop];
			}
		}
		return style;
	}

	compute(parentStyle) {
		const {backgroundColor, color, border, borderBackgroundColor, borderColor, labelBackgroundColor, labelColor} = this;
		const computed = this.clone();

		if (parentStyle) {
			computed.backgroundColor = backgroundColor || parentStyle.backgroundColor;
			computed.color = color || parentStyle.color;
		}
		computed.borderBackgroundColor = borderBackgroundColor || computed.backgroundColor;
		computed.borderColor = borderColor || computed.color;
		computed.labelBackgroundColor = labelBackgroundColor || computed.backgroundColor;
		computed.labelColor = labelColor || computed.color;

		return computed;
	}

	toString() {
		const {backgroundColor, color, border, borderBackgroundColor, borderColor, labelBackgroundColor, labelColor} = this;
		return {backgroundColor, color, border, borderBackgroundColor, borderColor, labelBackgroundColor, labelColor};
	}
}
export default Style;
