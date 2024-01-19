import util from "util";

class RenderLog {
	static MAX_SIZE = 100;

	static messages = [];

	static log() {
		RenderLog.messages.push(util.format.apply(this, arguments));
		if (RenderLog.messages.length >= RenderLog.MAX_SIZE) {
			RenderLog.messages.shift();
		}
	}

	static clear() {
		RenderLog.messages = [];
	}
}
export default RenderLog;
