import Theme from "../core/theme.js";

import Style from "../core/style.js";
import {BORDER, COLORS} from "../core/constants.js";

class XTree extends Theme {
	static DEFAULT_MAP = {
		screen: new Style({
			backgroundColor: COLORS.BG.BLUE,
			color: COLORS.FG.WHITE_BRIGHT
		}),
		window: new Style({
			border: BORDER.SINGLE,
			borderColor: COLORS.FG.CYAN_BRIGHT,
			labelColor: COLORS.FG.CYAN_BRIGHT
		}),
		text: new Style(),
		input: new Style({
			border: BORDER.SINGLE,
			borderColor: COLORS.FG.CYAN_BRIGHT,
			labelColor: COLORS.FG.CYAN_BRIGHT
		}),
		button: new Style({
			border: BORDER.SINGLE
		})
	};

	constructor(map = XTree.DEFAULT_MAP) {
		super(map);
	}
}
export default XTree;
