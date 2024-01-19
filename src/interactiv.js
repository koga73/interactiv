import readline from "readline";

import {ROOT, ORIGIN, BORDER, CURSOR, COLORS} from "./core/constants.js";
import Position from "./core/position.js";
import Style from "./core/style.js";
import Component from "./core/component.js";

import Screen from "./components/screen.js";
import Window from "./components/window.js";
import Text from "./components/text.js";
import Input from "./components/input.js";
import Button from "./components/button.js";

import Theme from "./core/theme.js";
import {Space as ThemeSpace, XTree as ThemeXTree} from "./themes/index.js";

import RenderLog from "./core/render-log.js";

class _class {
	static DEFAULT_FPS = 10;
	static DEFAULT_AUTO_UPDATE = true;

	static debug = false;
	static paused = false;

	static _currentScreen = null;
	static _focus = null;
	static _autoUpdateInterval = 0;

	static initialize({fps = _class.DEFAULT_FPS, autoUpdate = _class.DEFAULT_AUTO_UPDATE} = {}) {
		if (autoUpdate) {
			_class._autoUpdateInterval = setInterval(_class.render, Math.floor(1000 / fps));
		}

		if (process.stdin.isTTY) {
			process.stdin.setRawMode(true);
		}
		readline.emitKeypressEvents(process.stdin);
		process.stdin.on("keypress", _class._handler_keypress);
	}

	static destroy() {
		clearInterval(_class._autoUpdateInterval);

		process.stdin.off("keypress", _class._handler_keypress);
		if (process.stdin.isTTY) {
			process.stdin.setRawMode(false);
		}

		const {cols, rows} = _class.getWindowSize();
		process.stdout.cursorTo(0, rows - 1);
		process.stdout.write(CURSOR.RESET);
		_class.clear();
	}

	static clear() {
		process.stdout.cursorTo(0, 0);
		process.stdout.clearScreenDown();
	}

	static getWindowSize() {
		const [cols, rows] = process.stdout.getWindowSize();
		return {cols, rows};
	}

	static render(screen, force = false) {
		if (screen) {
			_class._currentScreen = screen;
		} else {
			screen = _class._currentScreen;
		}
		if (!screen) {
			return;
		}
		if (_class.paused) {
			return;
		}
		const {cols, rows} = _class.getWindowSize();

		process.stdout.cork();

		const didRender = screen.render(
			ROOT,
			{
				parentComputedPosition: new Position({
					width: cols,
					height: rows
				})
			},
			{force, debug: _class.debug}
		);
		if (didRender) {
			if (!(_class._focus && _class._focus.isRendered())) {
				_class.focusFirst();
			}
			_class._focus.onFocus();

			RenderLog.log("RENDER COMPLETE!\n");
		}

		process.nextTick(() => process.stdout.uncork());
	}

	static showLog() {
		_class.paused = true;

		process.stdout.cork();

		process.stdout.cursorTo(0, 0);
		process.stdout.write(CURSOR.RESET);
		_class.clear();
		RenderLog.messages.map((message) => console.log(message));

		process.nextTick(() => process.stdout.uncork());
	}

	static hideLog() {
		_class.paused = false;
		_class.render(null, true);
	}

	static focus(component) {
		if (!component.focusable) {
			throw new Error("Not focusable");
		}
		if (_class._focus && _class._focus !== component) {
			RenderLog.log(`'${_class._focus.id}' - blur`);
			_class._focus.onBlur();
		}
		RenderLog.log(`'${component.id}' - focus`);
		if (component.isRendered()) {
			component.onFocus();
		}
		_class._focus = component;
	}

	static focusFirst() {
		const focusList = _class._getFocusList(_class._currentScreen);
		if (focusList.length) {
			_class.focus(focusList[0].component);
		}
	}

	static focusNext() {
		if (!_class._focus) {
			return;
		}
		let focusList = _class._getFocusList(_class._currentScreen);
		let focusIndex = focusList.findIndex(({component}) => component === _class._focus);
		if (_class._focus._parent.focusTrap) {
			const thisDepth = focusList[focusIndex].depth;
			focusList = focusList.filter(({depth}) => depth >= thisDepth);
			focusIndex = focusList.findIndex(({component}) => component === _class._focus);
		}
		_class.focus(focusList[(focusIndex + 1) % focusList.length].component);
	}

	static _getFocusList(component, depth = 0) {
		let focusList = [];
		if (component.focusable) {
			focusList.push({component, depth});
		}
		if (component._children) {
			const childrenLen = component._children.length;
			for (let i = 0; i < childrenLen; i++) {
				const child = component._children[i];
				if (child instanceof Component) {
					focusList = focusList.concat(_class._getFocusList(child, depth + 1));
				}
			}
		}
		return focusList;
	}

	static _handler_keypress(str, key) {
		//ctrl+c to quit
		if (key.ctrl === true && key.name === "c") {
			_class.exit();
			return;
		}
		if (key.name === "tab") {
			//Note that on Windows "shift+tab" doesn't come through :\
			_class.focusNext();
			return;
		}

		if (_class.onKeyPress) {
			_class.onKeyPress(str, key);
		}

		//Exit on escape
		if (_class._focus) {
			switch (key.name) {
				case "escape":
					const focusList = _class._getFocusList(_class._currentScreen);
					const focusIndex = focusList.findIndex(({component}) => component === _class._focus);
					if (focusList[focusIndex].depth === 1) {
						_class.exit();
					}
					break;
			}
			_class._focus.onKeyPress(str, key);
		}
	}

	static exit() {
		const {cols, rows} = _class.getWindowSize();
		process.stdout.cursorTo(0, rows - 1);
		process.stdout.write(CURSOR.RESET);
		_class.clear();
		console.log("");
		process.exit();
	}
}

export default _class;
export {ORIGIN, BORDER, CURSOR, COLORS};
export {Position, Style, Component};
export {Screen, Window, Text, Input, Button};

Theme.Space = new ThemeSpace();
Theme.XTree = new ThemeXTree();
export {Theme, ThemeSpace, ThemeXTree};
