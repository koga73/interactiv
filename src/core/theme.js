class Theme {
	constructor(map = {}) {
		this.map = map;

		this.applyToComponent = this.applyToComponent.bind(this);
	}

	applyToComponent(component) {
		const componentType = component.constructor.name.toLowerCase();
		const style = this.map[component.id] || this.map[componentType];
		if (style) {
			component.style = component.style.extend(style);
		}
		const childrenLen = component._children.length;
		for (let i = 0; i < childrenLen; i++) {
			this.applyToComponent(component._children[i]);
		}
	}
}
export default Theme;
