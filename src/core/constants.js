class Constants {
	static ROOT = "root";

	static ORIGIN = {
		X: {
			LEFT: "left",
			CENTER: "center",
			RIGHT: "right"
		},
		Y: {
			TOP: "top",
			CENTER: "center",
			BOTTOM: "bottom"
		}
	};

	static BORDER = {
		NONE: null,
		SINGLE: {
			topLeft: "┌",
			topRight: "┐",
			bottomLeft: "└",
			bottomRight: "┘",
			horizontal: "─",
			vertical: "│"
		},
		DOUBLE: {
			topLeft: "╔",
			topRight: "╗",
			bottomLeft: "╚",
			bottomRight: "╝",
			horizontal: "═",
			vertical: "║"
		}
	};

	//Node console cursor
	static CURSOR = {
		RESET: "\x1b[0m",
		BOLD: "\x1b[1m",
		DIM: "\x1b[2m",
		ITALIC: "\x1b[3m",
		UNDERLINE: "\x1b[4m",
		OVERLINE: "\x1b[53m",
		BLINK: "\x1b[5m",
		RAPID_BLINK: "\x1b[6m",
		INVERSE: "\x1b[7m",
		HIDDEN: "\x1b[8m",
		STRIKETHROUGH: "\x1b[9m"
	};

	//Node console colors
	static COLORS = {
		FG: {
			BLACK: "\x1b[30m",
			RED: "\x1b[31m",
			GREEN: "\x1b[32m",
			YELLOW: "\x1b[33m",
			BLUE: "\x1b[34m",
			MAGENTA: "\x1b[35m",
			CYAN: "\x1b[36m",
			WHITE: "\x1b[37m",
			// Bright
			BLACK_BRIGHT: "\x1b[90m",
			RED_BRIGHT: "\x1b[91m",
			GREEN_BRIGHT: "\x1b[92m",
			YELLOW_BRIGHT: "\x1b[93m",
			BLUE_BRIGHT: "\x1b[94m",
			MAGENTA_BRIGHT: "\x1b[95m",
			CYAN_BRIGHT: "\x1b[96m",
			WHITE_BRIGHT: "\x1b[97m"
		},
		BG: {
			BLACK: "\x1b[40m",
			RED: "\x1b[41m",
			GREEN: "\x1b[42m",
			YELLOW: "\x1b[43m",
			BLUE: "\x1b[44m",
			MAGENTA: "\x1b[45m",
			CYAN: "\x1b[46m",
			WHITE: "\x1b[47m",
			// Bright
			BLACK_BRIGHT: "\x1b[100m",
			RED_BRIGHT: "\x1b[101m",
			GREEN_BRIGHT: "\x1b[102m",
			YELLOW_BRIGHT: "\x1b[103m",
			BLUE_BRIGHT: "\x1b[104m",
			MAGENTA_BRIGHT: "\x1b[105m",
			CYAN_BRIGHT: "\x1b[106m",
			WHITE_BRIGHT: "\x1b[107m"
		}
	};
}
export default Constants;
export const ROOT = Constants.ROOT;
export const ORIGIN = Constants.ORIGIN;
export const BORDER = Constants.BORDER;
export const CURSOR = Constants.CURSOR;
export const COLORS = Constants.COLORS;
