import readline from "readline";

import {ROOT, ORIGIN, BORDER, CURSOR, COLORS} from "./core/constants.js";
import Position from "./core/position.js";
import Style from "./core/style.js";
import Component from "./core/component.js";

import {Button, Input, List, Screen, ScrollBar, Text, Window} from "./components/index.js";

import Theme from "./core/theme.js";
import {Space as ThemeSpace, XTree as ThemeXTree, Ocean as ThemeOcean, LavaBit as ThemeLavaBit, Marble as ThemeMarble} from "./themes/index.js";

import Logger from "./utils/logger.js";
import NormalTimer from "./utils/normal-timer.js";

class _class {
	static DEFAULT_FPS = 10;
	static DEFAULT_AUTO_UPDATE = true;

	static debug = false;
	static paused = false;

	static _currentScreen = null;
	static _focus = null;
	static _autoUpdateInterval = 0;
	static _timer = null;
	static _parentComputedPosition = new Position();

	static initialize({fps = _class.DEFAULT_FPS, autoUpdate = _class.DEFAULT_AUTO_UPDATE} = {}) {
		if (autoUpdate) {
			_class._autoUpdateInterval = setInterval(_class.render, Math.floor(1000 / fps));
			_class._timer = new NormalTimer();
		}

		if (process.stdin.isTTY) {
			process.stdin.setRawMode(true);
		}
		readline.emitKeypressEvents(process.stdin);
		process.stdin.on("keypress", _class._handler_keypress);

		//Handle window resize
		process.on("SIGWINCH", _class._handler_resize);

		Logger.createInstance({
			output: Logger.OUTPUT.MEMORY,
			level: Logger.LEVEL.DEBUG
		});
	}

	static destroy() {
		clearInterval(_class._autoUpdateInterval);
		_class._timer = null;

		process.stdin.off("keypress", _class._handler_keypress);
		if (process.stdin.isTTY) {
			process.stdin.setRawMode(false);
		}

		process.off("SIGWINCH", _class._handler_resize);

		const {cols, rows} = _class.getWindowSize();
		process.stdout.cursorTo(0, rows - 1);
		process.stdout.write(CURSOR.RESET);
		_class.clear();

		Logger.destroyInstance();
	}

	static clear() {
		process.stdout.cursorTo(0, 0);
		process.stdout.clearScreenDown();
	}

	static getWindowSize() {
		const [cols, rows] = process.stdout.getWindowSize();
		if (_class._parentComputedPosition.width !== cols || _class._parentComputedPosition.height !== rows) {
			_class._parentComputedPosition = new Position({width: cols, height: rows});
		}
		return {cols, rows};
	}

	static render(screen, force = false) {
		const delta = _class._timer.tick();
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

		//Compute sizes and positions
		_class.getWindowSize();
		screen.compute(
			{
				parentComputedPosition: _class._parentComputedPosition
			},
			{force, delta, debug: _class.debug}
		);

		//Render
		process.stdout.cork();

		const didRender = screen.render(ROOT);
		if (didRender) {
			//Focus
			if (!(_class._focus && _class._focus.isRendered())) {
				_class.focusFirst();
			}
			if (_class._focus) {
				_class._focus.onFocus();
			}

			//Debug
			if (_class.debug) {
				Logger.debug("RENDER COMPLETE!\n");
			}
		}

		process.nextTick(() => process.stdout.uncork());
	}

	static showLog(messages = null) {
		messages = messages ? messages : Logger.getInstance().memory;

		_class.paused = true;

		process.stdout.cork();

		process.stdout.cursorTo(0, 0);
		process.stdout.write(CURSOR.RESET);
		_class.clear();
		messages.map((message) => console.log(message));

		process.nextTick(() => process.stdout.uncork());
	}

	static hideLog() {
		_class.paused = false;
		_class.render(null, true);
	}

	static focus(component) {
		if (!component.focusable) {
			throw new Error(`${component.id} - Not focusable`);
		}
		if (!component.isRendered()) {
			throw new Error(`${component.id} - Not rendered`);
		}
		if (_class._focus && _class._focus !== component) {
			Logger.debug(`'${_class._focus.id}' - blur`);
			_class._focus.onBlur();
		}
		Logger.debug(`'${component.id}' - focus`);
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

	static _handler_resize(signal) {
		_class.render(null, true);
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
export {ROOT, ORIGIN, BORDER, CURSOR, COLORS};
export {Position, Style, Component};
export {Screen, Window, Text, Input, Button, List, ScrollBar};

Theme.Space = new ThemeSpace();
Theme.XTree = new ThemeXTree();
Theme.Ocean = new ThemeOcean();
Theme.LavaBit = new ThemeLavaBit();
Theme.Marble = new ThemeMarble();
export {Theme, ThemeSpace, ThemeXTree, ThemeOcean, ThemeLavaBit, ThemeMarble};

export {Logger, NormalTimer};
