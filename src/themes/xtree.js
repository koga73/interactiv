import Theme from "../core/theme.js";

import Style from "../core/style.js";
import {BORDER, COLORS} from "../core/constants.js";

class XTree extends Theme {
	static DEFAULT_MAP = {
		Screen: new Style({
			backgroundColor: COLORS.BG.BLUE,
			color: COLORS.FG.WHITE_BRIGHT
		}),
		Window: new Style({
			border: BORDER.DOUBLE,
			borderColor: COLORS.FG.CYAN_BRIGHT,
			labelColor: COLORS.FG.CYAN_BRIGHT
		}),
		Text: new Style(),
		Input: new Style({
			border: BORDER.SINGLE,
			borderColor: COLORS.FG.CYAN_BRIGHT,
			labelColor: COLORS.FG.CYAN_BRIGHT
		}),
		Button: new Style({
			border: BORDER.SINGLE
		}),
		List: new Style({
			border: BORDER.SINGLE,
			borderColor: COLORS.FG.CYAN_BRIGHT,
			labelColor: COLORS.FG.CYAN_BRIGHT,
			selectedBackgroundColor: COLORS.BG.WHITE_BRIGHT,
			selectedColor: COLORS.FG.BLUE
		}),
		ScrollBar: new Style({
			border: BORDER.SINGLE,
			borderColor: COLORS.FG.CYAN_BRIGHT,
			labelColor: COLORS.FG.CYAN_BRIGHT,
			trackCharacter: String.fromCharCode(0x2592),
			trackColor: COLORS.FG.CYAN_BRIGHT,
			thumbCharacter: String.fromCharCode(0x2588),
			thumbColor: COLORS.FG.CYAN_BRIGHT
		})
	};

	static DEFAULT_FOCUS_MAP = {
		Button: new Style({
			border: BORDER.SINGLE,
			backgroundColor: COLORS.BG.WHITE_BRIGHT,
			color: COLORS.FG.BLUE
		})
	};

	constructor(map = XTree.DEFAULT_MAP, focusMap = XTree.DEFAULT_FOCUS_MAP) {
		super(map, focusMap);
	}
}
export default XTree;
