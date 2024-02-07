import DeluxeCLI, {Screen, Theme, Text, List, Window, Input, Button, ScrollBar, ORIGIN, BORDER, COLORS} from "../src/deluxe-cli.js";

//Login window
const txtHeading = new Text({
	id: "txtHeading",
	value: "Please enter your credentials",
	position: Text.DEFAULT_POSITION.extend({
		originX: ORIGIN.X.CENTER, //Center the text horizontally
		marginTop: 1
	})
});
const inputUser = new Input({
	id: "inputUser",
	label: " Username ",
	position: Input.DEFAULT_POSITION.extend({
		y: 2,
		marginTop: 1,
		marginRight: 2,
		marginBottom: 1,
		marginLeft: 2
	}),
	onChange: ({value}) => {
		//Called when the value of the input changes
	}
});
const inputPass = new Input({
	id: "inputPass",
	label: " Password ",
	mask: Input.DEFAULT_MASK,
	position: Input.DEFAULT_POSITION.extend({
		marginTop: 1,
		marginRight: 2,
		marginBottom: 2,
		marginLeft: 2
	}),
	onChange: ({value}) => {
		//Called when the value of the input changes
	}
});
const btnSubmit = new Button({
	id: "btnSubmit",
	value: "Submit",
	position: Button.DEFAULT_POSITION.extend({
		marginRight: 2,
		marginBottom: 1
	}),
	onSelect: () => {
		//Called when enter is pressed on the button
		windowLogin.remove();
	}
});
const windowLogin = new Window({
	id: "windowLogin",
	label: " Login ",
	position: Window.DEFAULT_POSITION.extend({
		height: 0 //Auto
	}),
	children: [txtHeading, inputUser, inputPass, btnSubmit],
	onSelect: () => {
		//Called when enter is pressed on the window
		//TODO: Login logic
		windowLogin.remove();
	}
});

//Theme list
const listTheme = new List({
	id: "listTheme",
	label: " Theme ",
	items: ["Space", "XTree", "Ocean", "LavaBit", "Marble"],
	selectedIndex: 0,
	position: List.DEFAULT_POSITION.extend({
		marginTop: 1,
		marginRight: 2,
		marginBottom: 1,
		marginLeft: 2,
		paddingTop: 1,
		paddingRight: 2,
		paddingBottom: 1,
		paddingLeft: 2
	}),
	autoSelect: true,
	onSelect: ({selectedItem}) => {
		Theme[selectedItem.trim()].applyToComponent(screenMain);
	}
});

//T and C
const txtTandC = new Text({
	id: "txtTandC",
	value:
		"Terms and Conditions...\n" +
		new Array(100)
			.fill(1)
			.map((_, i) => `Line ${i + 1}`)
			.join("\n"),
	position: Text.DEFAULT_POSITION.extend({
		width: "100%"
		//No height 100% because height 0 = auto height
	})
});
const sbTxtTandC = new ScrollBar({
	id: "sbTxtTandC",
	position: ScrollBar.DEFAULT_POSITION.extend({
		width: "100%",
		height: "10",
		marginLeft: 2,
		marginRight: 2
	}),
	label: " Terms and Conditions ",
	children: [txtTandC]
});

//Screen
const screenMain = new Screen({
	id: "screenMain",
	position: Screen.DEFAULT_POSITION.extend({
		labelOriginX: ORIGIN.X.CENTER //Center the label horizontally
	}),
	style: Screen.DEFAULT_STYLE.extend({
		border: BORDER.DOUBLE //Add a double border around the edge
	}),
	label: " My Application ",
	children: [listTheme, sbTxtTandC, windowLogin],
	onSelect: () => {
		//Called when enter is pressed on the screen
		DeluxeCLI.destroy();
		console.log("Back to the terminal.");
	}
});

DeluxeCLI.debug = true;
DeluxeCLI.initialize();
DeluxeCLI.clear();
DeluxeCLI.render(screenMain);
DeluxeCLI.focus(inputUser);

listTheme.selectedIndex = 1;
listTheme.activeIndex = 1;
Theme.XTree.applyToComponent(screenMain);

//Swap tor render log on ctrl+l
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
