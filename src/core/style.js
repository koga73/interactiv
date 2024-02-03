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
		labelColor = null,
		underline = false,
		...remaining
	} = {}) {
		this.backgroundColor = backgroundColor;
		this.color = color;
		this.border = border;
		this.borderBackgroundColor = borderBackgroundColor;
		this.borderColor = borderColor;
		this.labelBackgroundColor = labelBackgroundColor;
		this.labelColor = labelColor;
		this.underline = underline;

		//Place to store extended prop values so they don't get overwritten by theme
		this._extended = {};

		this.clone = this.clone.bind(this);
		this.extend = this.extend.bind(this);
		this.compute = this.compute.bind(this);
		this.shouldCopyProp = this.shouldCopyProp.bind(this);

		//Add remaining props
		for (const prop in remaining) {
			if (this.shouldCopyProp(prop)) {
				this[prop] = remaining[prop];
			}
		}
	}

	clone(intoStyle = null) {
		if (!intoStyle) {
			const style = new Style(this);
			style._extended = {...this._extended};
			return style;
		}
		for (const prop in this) {
			if (this.shouldCopyProp(prop)) {
				intoStyle[prop] = this[prop];
			}
		}
		return intoStyle;
	}

	extend(fromStyle, soft = false, intoStyle = null) {
		const style = this.clone(intoStyle);
		for (const prop in fromStyle) {
			//Skip properies starting with underscore and functions
			if (!this.shouldCopyProp(prop)) {
				continue;
			}
			const propVal = fromStyle[prop];
			if (soft) {
				style[prop] = typeof style._extended[prop] !== typeof undefined ? style._extended[prop] : propVal;
			} else {
				const isFromDefined = typeof propVal !== typeof undefined;
				style[prop] = isFromDefined ? propVal : style[prop];
				if (isFromDefined) {
					style._extended[prop] = propVal;
				}
			}
		}
		return style;
	}

	compute(parentStyle, {intoStyle} = {}, overrides = {}) {
		const computed = this.clone(intoStyle);
		const {backgroundColor, color, border, borderBackgroundColor, borderColor, labelBackgroundColor, labelColor} = Object.assign({}, this, overrides);

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

	shouldCopyProp(prop) {
		return prop[0] !== "_" && typeof this[prop] !== "function";
	}
}
export default Style;
