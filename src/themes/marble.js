import Theme from "../core/theme.js";

import Style from "../core/style.js";
import {BORDER, COLORS} from "../core/constants.js";

class Marble extends Theme {
	static DEFAULT_MAP = {
		Screen: new Style({
			backgroundColor: COLORS.BG.WHITE,
			color: COLORS.FG.BLACK,
			borderColor: COLORS.FG.BLACK_BRIGHT,
			labelBackgroundColor: COLORS.BG.WHITE_BRIGHT,
			labelColor: COLORS.FG.BLACK
		}),
		Window: new Style({
			border: BORDER.DOUBLE,
			borderColor: COLORS.FG.BLACK_BRIGHT,
			labelBackgroundColor: COLORS.BG.WHITE_BRIGHT
		}),
		Text: new Style(),
		Input: new Style({
			backgroundColor: COLORS.BG.WHITE_BRIGHT,
			border: BORDER.SINGLE,
			borderBackgroundColor: COLORS.BG.WHITE,
			borderColor: COLORS.FG.BLACK_BRIGHT,
			labelBackgroundColor: COLORS.BG.WHITE,
			labelColor: COLORS.FG.BLACK
		}),
		Button: new Style({
			border: BORDER.SINGLE,
			borderBackgroundColor: COLORS.BG.WHITE,
			borderColor: COLORS.FG.BLACK_BRIGHT,
			backgroundColor: COLORS.BG.WHITE_BRIGHT,
			color: COLORS.FG.BLACK
		}),
		List: new Style({
			backgroundColor: COLORS.BG.WHITE_BRIGHT,
			border: BORDER.SINGLE,
			borderBackgroundColor: COLORS.BG.WHITE,
			borderColor: COLORS.FG.BLACK_BRIGHT,
			labelBackgroundColor: COLORS.BG.WHITE,
			labelColor: COLORS.FG.BLACK,
			selectedBackgroundColor: COLORS.BG.BLACK_BRIGHT,
			selectedColor: COLORS.FG.WHITE
		}),
		ScrollBar: new Style({
			backgroundColor: COLORS.BG.WHITE_BRIGHT,
			border: BORDER.SINGLE,
			borderBackgroundColor: COLORS.BG.WHITE,
			borderColor: COLORS.FG.BLACK_BRIGHT,
			labelBackgroundColor: COLORS.BG.WHITE,
			labelColor: COLORS.FG.BLACK,
			trackCharacter: String.fromCharCode(0x2592),
			trackColor: COLORS.FG.WHITE,
			thumbCharacter: String.fromCharCode(0x2588),
			thumbColor: COLORS.FG.BLACK
		})
	};

	static DEFAULT_FOCUS_MAP = {
		Input: new Style({
			backgroundColor: COLORS.BG.WHITE_BRIGHT,
			border: BORDER.SINGLE,
			borderBackgroundColor: COLORS.BG.WHITE_BRIGHT
		}),
		Button: new Style({
			backgroundColor: COLORS.BG.WHITE_BRIGHT,
			border: BORDER.SINGLE,
			borderBackgroundColor: COLORS.BG.WHITE_BRIGHT
		}),
		List: new Style({
			backgroundColor: COLORS.BG.WHITE_BRIGHT,
			border: BORDER.SINGLE,
			borderBackgroundColor: COLORS.BG.WHITE_BRIGHT
		}),
		ScrollBar: new Style({
			backgroundColor: COLORS.BG.WHITE_BRIGHT,
			border: BORDER.SINGLE,
			borderBackgroundColor: COLORS.BG.WHITE_BRIGHT,
			trackCharacter: String.fromCharCode(0x2592),
			trackColor: COLORS.FG.WHITE,
			thumbCharacter: String.fromCharCode(0x2588),
			thumbColor: COLORS.FG.BLACK
		})
	};

	constructor(map = Marble.DEFAULT_MAP, focusMap = Marble.DEFAULT_FOCUS_MAP) {
		super(map, focusMap);
	}
}
export default Marble;
