class Theme {
	constructor(map = {}, focusMap = {}) {
		this.map = map;
		this.focusMap = focusMap;

		this.applyToComponent = this.applyToComponent.bind(this);
	}

	applyToComponent(component) {
		const componentType = component.constructor.name;

		const style = this.map[component.id] || this.map[componentType];
		if (style) {
			component.style = component.style.extend(style, true);
		}
		const focusStyle = this.focusMap[component.id] || this.focusMap[componentType];
		if (focusStyle) {
			component.focusStyle = component.focusStyle ? component.focusStyle.extend(focusStyle, true) : focusStyle.clone();
		} else {
			component.focusStyle = null;
		}

		const childrenLen = component._children.length;
		for (let i = 0; i < childrenLen; i++) {
			this.applyToComponent(component._children[i]);
		}
	}
}
export default Theme;
