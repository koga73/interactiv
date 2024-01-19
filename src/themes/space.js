import Theme from "../core/theme.js";

import Style from "../core/style.js";
import {BORDER, COLORS} from "../core/constants.js";

class Space extends Theme {
	static DEFAULT_MAP = {
		screen: new Style({
			backgroundColor: COLORS.BG.BLACK,
			color: COLORS.FG.WHITE
		}),
		window: new Style({
			border: BORDER.SINGLE
		}),
		text: new Style(),
		input: new Style({
			border: BORDER.SINGLE
		}),
		button: new Style({
			border: BORDER.SINGLE
		})
	};

	constructor(map = Space.DEFAULT_MAP) {
		super(map);
	}
}
export default Space;
