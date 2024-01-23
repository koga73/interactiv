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
		this.toString = this.toString.bind(this);

		//Add remaining props
		for (const prop in remaining) {
			if (prop[0] === "_" || typeof remaining[prop] === "function") {
				continue;
			}
			this[prop] = remaining[prop];
		}
	}

	clone() {
		const style = new Style(this);
		style._extended = {...this._extended};
		return style;
	}

	extend(fromStyle, soft = false) {
		const style = this.clone();
		for (const prop in fromStyle) {
			//Skip properies starting with underscore and functions
			if (prop[0] === "_" || typeof fromStyle[prop] === "function") {
				continue;
			}
			if (soft) {
				style[prop] = style._extended[prop] ?? fromStyle[prop];
			} else {
				style[prop] = fromStyle[prop] ?? style[prop];
				if (fromStyle[prop]) {
					style._extended[prop] = fromStyle[prop];
				}
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
