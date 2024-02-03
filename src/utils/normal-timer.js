class NormalTimer {
	constructor() {
		this.startTime = new Date().getTime();
		this.lastTime = this.startTime;
	}

	elapsed() {
		return (new Date().getTime() - this.startTime) * 0.001;
	}

	tick() {
		const currentTime = new Date().getTime();
		const delta = (currentTime - this.lastTime) * 0.001;
		this.lastTime = currentTime;
		return delta;
	}
}
export default NormalTimer;
