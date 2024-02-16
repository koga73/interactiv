/*
 * AJ Savino
 * February 2024
 */
import fs from "fs";
import path from "path";
import util from "util";

const TOKEN = {
	LEVEL: "level",
	TIMESTAMP: "timestamp",
	MESSAGE: "message",
	STACK: "stack"
};

class Logger {
	static OUTPUT = {
		MEMORY: 1 << 0,
		CONSOLE: 1 << 1,
		FILE: 1 << 2
	};
	static LEVEL = {
		DEBUG: 0,
		INFO: 1,
		LOG: 2,
		WARN: 3,
		ERROR: 4
	};
	static TOKEN = TOKEN;
	static FORMAT = {
		FILENAME: "YYYY-MM-DD.log", //2023-03-01.log
		TIMESTAMP: "YYYY-MM-DD HH:mm:ss.SSS", //2023-03-01 11:20:38.533
		MEMORY: `${TOKEN.LEVEL}: ${TOKEN.MESSAGE}`, //INFO: message
		CONSOLE: `${TOKEN.MESSAGE}`, //message
		FILE: `[${TOKEN.TIMESTAMP}] [${TOKEN.LEVEL}] ${TOKEN.MESSAGE}\n`, //[2023-03-01 11:20:38.533] [INFO] message
		ERROR_MESSAGE: `${TOKEN.MESSAGE}\n${" ".repeat(4)}${TOKEN.STACK}\n` //message\nstack
	};

	//Singleton for ease-of-use global logger
	static _instance = null;
	static createInstance(options) {
		Logger._instance = new Logger(options);

		//Create static methods
		for (let prop in Logger._instance) {
			if (typeof this[prop] !== "function") {
				((prop) => {
					Logger[prop] = (...args) => {
						const instance = Logger.getInstance();
						instance[prop].apply(instance, args);
					};
				})(prop);
			}
		}
	}
	static destroyInstance() {
		Logger._instance = null;
	}
	static getInstance() {
		if (!Logger._instance) {
			throw new Error("Logger instance not created");
		}
		return Logger._instance;
	}

	constructor({
		output = Logger.OUTPUT.CONSOLE,
		level = Logger.LEVEL.INFO,
		levelMemory = null,
		levelConsole = null,
		levelFile = null,
		filePath = null,
		formatFileName = Logger.FORMAT.FILENAME,
		formatTimestamp = Logger.FORMAT.TIMESTAMP,
		formatMemory = Logger.FORMAT.MEMORY,
		formatConsole = Logger.FORMAT.CONSOLE,
		formatFile = Logger.FORMAT.FILE,
		formatErrorMessage = Logger.FORMAT.ERROR_MESSAGE,
		memorySize = 100
	}) {
		this.output = output;
		this.level = level;
		this.levelMemory = levelMemory || level;
		this.levelConsole = levelConsole || level;
		this.levelFile = levelFile || level;
		this.filePath = filePath;
		this.formatFileName = formatFileName;
		this.formatTimestamp = formatTimestamp;
		this.formatMemory = formatMemory;
		this.formatConsole = formatConsole;
		this.formatFile = formatFile;
		this.formatErrorMessage = formatErrorMessage;
		this.memorySize = memorySize;

		this.memory = [];

		this.debug = this.debug.bind(this);
		this.info = this.info.bind(this);
		this.log = this.log.bind(this);
		this.warn = this.warn.bind(this);
		this.error = this.error.bind(this);
		this.doLog = this.doLog.bind(this);
		this.toMemory = this.toMemory.bind(this);
		this.toConsole = this.toConsole.bind(this);
		this.toFile = this.toFile.bind(this);
		this.clearMemory = this.clearMemory.bind(this);
		this._formatMessage = this._formatMessage.bind(this);
		this._formatError = this._formatError.bind(this);
		this._formatFileName = this._formatFileName.bind(this);
		this._formatTimestamp = this._formatTimestamp.bind(this);
	}

	debug(...args) {
		this.doLog("DEBUG", ...args);
	}
	info(...args) {
		this.doLog("INFO", ...args);
	}
	log(...args) {
		this.doLog("LOG", ...args);
	}
	warn(...args) {
		this.doLog("WARN", ...args);
	}
	error(...args) {
		this.doLog("ERROR", ...args);
	}

	doLog(level, ...args) {
		//Update error object output
		const formattedArgs = args.reduce((args, arg) => {
			if (arg instanceof Error) {
				args.push(this._formatError(this.formatErrorMessage, arg));
			} else {
				args.push(arg);
			}
			return args;
		}, []);

		//To memory
		if (this.output & Logger.OUTPUT.MEMORY) {
			if (this.levelMemory <= Logger.LEVEL[level]) {
				this.toMemory(level, ...formattedArgs);
			}
		}

		//To console
		if (this.output & Logger.OUTPUT.CONSOLE) {
			if (this.levelConsole <= Logger.LEVEL[level]) {
				this.toConsole(level, ...formattedArgs);
			}
		}

		//To file
		if (this.output & Logger.OUTPUT.FILE) {
			if (this.levelFile <= Logger.LEVEL[level]) {
				this.toFile(level, ...formattedArgs);
			}
		}
	}

	toMemory(level, ...args) {
		this.memory.push(this._formatMessage(this.formatMemory, level, ...args));
		if (this.memory.length > this.memorySize) {
			this.memory.shift();
		}
	}

	toConsole(level, ...args) {
		const method = level.toLowerCase();
		const consoleMethod = method in console ? console[method] : console.log;
		consoleMethod(this._formatMessage(this.formatConsole, level, ...args));
	}

	toFile(level, ...args) {
		if (!this.filePath) {
			throw new Error("Undefined 'filePath'");
		}
		const file = path.join(this.filePath, _formatFileName(this.formatFileName));
		fs.appendFileSync(file, this._formatMessage(this.formatFile, level, ...args));
	}

	clearMemory() {
		this.memory = [];
	}

	_formatMessage(format, level, ...args) {
		let output = format;
		if (format.indexOf(Logger.TOKEN.TIMESTAMP) !== -1) {
			output = output.replace(Logger.TOKEN.TIMESTAMP, this._formatTimestamp(this.formatTimestamp));
		}
		if (format.indexOf(Logger.TOKEN.LEVEL) !== -1) {
			output = output.replace(Logger.TOKEN.LEVEL, level);
		}
		if (format.indexOf(Logger.TOKEN.MESSAGE) !== -1) {
			output = output.replace(Logger.TOKEN.MESSAGE, util.format(...args));
		}
		return output;
	}

	_formatError(format = Logger.FORMAT.ERROR_MESSAGE, err) {
		return format.replace(Logger.TOKEN.MESSAGE, err.message).replace(Logger.TOKEN.STACK, err.stack);
	}

	_formatFileName(format = Logger.FORMAT.FILENAME) {
		const date = new Date();
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const monthStr = month.toString().length === 1 ? `0${month}` : month;
		const day = date.getDate();
		const dayStr = day.toString().length === 1 ? `0${day}` : day;
		return format.replace("YYYY", year).replace("MM", monthStr).replace("DD", dayStr);
	}

	_formatTimestamp(format = Logger.FORMAT.TIMESTAMP) {
		const date = new Date();
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const monthStr = month.toString().length === 1 ? `0${month}` : month;
		const day = date.getDate();
		const dayStr = day.toString().length === 1 ? `0${day}` : day;
		const hours = date.getHours();
		const hoursStr = hours.toString().length === 1 ? `0${hours}` : hours;
		const minutes = date.getMinutes();
		const minutesStr = minutes.toString().length === 1 ? `0${minutes}` : minutes;
		const seconds = date.getSeconds();
		const secondsStr = seconds.toString().length === 1 ? `0${seconds}` : seconds;
		const milliseconds = date.getMilliseconds();
		let millisecondsStr = milliseconds.toString();
		if (millisecondsStr.length === 1) {
			millisecondsStr = `00${millisecondsStr}`;
		} else if (millisecondsStr.length === 2) {
			millisecondsStr = `0${millisecondsStr}`;
		}
		return format
			.replace("YYYY", year)
			.replace("MM", monthStr)
			.replace("DD", dayStr)
			.replace("HH", hoursStr)
			.replace("mm", minutesStr)
			.replace("ss", secondsStr)
			.replace("SSS", millisecondsStr);
	}
}
export default Logger;
