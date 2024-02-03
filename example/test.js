import DeluxeCLI, {Position, Style, ORIGIN, BORDER, COLORS, Theme} from "../src/deluxe-cli.js";
import {Screen, Window, Text, Input, Button, List, ScrollBar} from "../src/deluxe-cli.js";

const windowText1 = new Text({
	id: "windowText1",
	value: "Lorem Ipsum Dolar Lorem Ipsum Dolar Lorem Ipsum Dolar Lorem Ipsum Dolar Lorem Ipsum Dolar Lorem Ipsum Dolar Lorem Ipsum Dolar Lorem Ipsum",
	position: Text.DEFAULT_POSITION.extend({
		marginTop: 1,
		marginRight: 1,
		marginBottom: 1,
		marginLeft: 1
	})
});
const windowText2 = windowText1.extend({
	id: "windowText1",
	value: "This is the bottom message."
});
const input1 = new Input({
	id: "name",
	label: " Name ",
	position: Input.DEFAULT_POSITION.extend({
		marginTop: 1,
		marginRight: 2,
		marginBottom: 1,
		marginLeft: 2
	})
});
const input2 = input1.extend({
	id: "password",
	label: " Password ",
	mask: Input.DEFAULT_MASK
});
const btn = new Button({
	id: "btn",
	value: "Submit",
	position: Button.DEFAULT_POSITION.extend({
		marginRight: 2,
		marginBottom: 1
	}),
	onSelect: () => {
		window.remove();
	}
});
const window = new Window({
	id: "window",
	label: " My Window ",
	children: [windowText1, input1, windowText2, input2, btn],
	focusTrap: false,
	userClosable: true,
	onSelect: () => {
		window.remove();
	}
});
const input3 = input1.extend({
	id: "bg",
	label: " Some Input "
});
const statusBar = new Text({
	id: "statusBar",
	position: Text.DEFAULT_POSITION.extend({
		originX: ORIGIN.X.LEFT,
		originY: ORIGIN.Y.BOTTOM,
		width: "100%",
		height: 1
	}),
	value: "Status Bar 100%"
});
const sbContent = new List({
	id: "sbContent",
	items: new Array(30).fill(1).map((_, i) => `Line ${i + 1}`),
	selectedIndex: 0,
	position: List.DEFAULT_POSITION.extend({
		marginLeft: 2,
		marginBottom: 1,
		paddingTop: 1,
		paddingRight: 2,
		paddingBottom: 1,
		paddingLeft: 2
	}),
	autoSelect: true,
	onSelect: ({selectedItem}) => {}
});
const sb = new ScrollBar({
	id: "sb",
	focusable: false,
	position: ScrollBar.DEFAULT_POSITION.extend({
		marginTop: 1,
		marginBottom: 1,
		marginLeft: 2,
		width: "50%",
		height: "10"
	}),
	label: " Text Scroller ",
	children: [sbContent]
});
const list = new List({
	id: "list",
	label: " Theme ",
	items: ["Space", "XTree", "Ocean", "LavaBit", "Marble"],
	selectedIndex: 0,
	position: List.DEFAULT_POSITION.extend({
		marginLeft: 2,
		marginBottom: 1,
		paddingTop: 1,
		paddingRight: 2,
		paddingBottom: 1,
		paddingLeft: 2
	}),
	autoSelect: true,
	onSelect: ({selectedItem}) => {
		Theme[selectedItem.trim()].applyToComponent(screen);
	}
});
const screen = new Screen({
	id: "main",
	position: Screen.DEFAULT_POSITION.extend({
		labelOriginX: ORIGIN.X.CENTER
	}),
	style: Screen.DEFAULT_STYLE.extend({
		border: BORDER.DOUBLE
	}),
	label: " My Application ",
	children: [statusBar, input3, list, sb, window],
	onSelect: () => {
		DeluxeCLI.destroy();
		console.log("Back to the terminal.");
	}
});

DeluxeCLI.debug = true;
DeluxeCLI.initialize();
DeluxeCLI.clear();
DeluxeCLI.focus(input1);
DeluxeCLI.render(screen);

let showingLog = false;
DeluxeCLI.onKeyPress = (str, key) => {
	//ctrl+l to view render log
	if (key.ctrl === true && key.name === "l") {
		showingLog = !showingLog;
		if (showingLog) {
			DeluxeCLI.showLog();
		} else {
			DeluxeCLI.hideLog();
		}
	}
};
