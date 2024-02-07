import Theme from "../core/theme.js";

import Style from "../core/style.js";
import {BORDER, COLORS} from "../core/constants.js";

class Ocean extends Theme {
	static DEFAULT_MAP = {
		Screen: new Style({
			backgroundColor: COLORS.BG.BLACK,
			color: COLORS.FG.BLUE_BRIGHT
		}),
		Window: new Style({
			border: BORDER.DOUBLE,
			borderColor: COLORS.FG.CYAN,
			labelColor: COLORS.FG.CYAN_BRIGHT
		}),
		Text: new Style(),
		Input: new Style({
			border: BORDER.SINGLE,
			borderColor: COLORS.FG.CYAN,
			labelColor: COLORS.FG.CYAN_BRIGHT
		}),
		Button: new Style({
			border: BORDER.SINGLE
		}),
		List: new Style({
			border: BORDER.SINGLE,
			borderColor: COLORS.FG.CYAN,
			labelColor: COLORS.FG.CYAN_BRIGHT,
			selectedBackgroundColor: COLORS.BG.BLACK,
			selectedColor: COLORS.FG.CYAN,
			selectedUnderline: true,
			activeBackgroundColor: COLORS.BG.CYAN,
			activeColor: COLORS.FG.BLACK,
			activeUnderline: false
		}),
		ScrollBar: new Style({
			border: BORDER.SINGLE,
			borderColor: COLORS.FG.CYAN,
			labelColor: COLORS.FG.CYAN,
			trackCharacter: String.fromCharCode(0x2592),
			trackColor: COLORS.FG.CYAN,
			thumbCharacter: String.fromCharCode(0x2588),
			thumbColor: COLORS.FG.CYAN
		})
	};

	static DEFAULT_FOCUS_MAP = {
		Button: new Style({
			border: BORDER.SINGLE,
			backgroundColor: COLORS.BG.BLUE_BRIGHT,
			color: COLORS.FG.BLACK
		})
	};

	constructor(map = Ocean.DEFAULT_MAP, focusMap = Ocean.DEFAULT_FOCUS_MAP) {
		super(map, focusMap);
	}
}
export default Ocean;
