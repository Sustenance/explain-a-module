#!/usr/bin/env node

const program = require("commander");
const marked = require("marked");
const TerminalRenderer = require("marked-terminal");
const globalPaths = require("global-paths");

const path = require("path");
const fs = require("fs");

marked.setOptions({
	renderer: new TerminalRenderer()
});

program
	.version("1.0.0")
	.arguments("<module>")
	.action((module) => {
		checkLocalMachine(module)
			.then((modulePath) => {
				if (modulePath) {
					return readFileFromDisk(modulePath);
				} else {
					throw new Error("README not installed on local machine");
				}
			})
			.then((markdown) => {
				renderMarkdown(markdown);
			})
			.catch((err) => {
				console.log(err);
			});
	})
	.parse(process.argv);

function checkLocalMachine(module) {
	const pathsPromiseArray = globalPaths().map((possiblePath) => {
		possiblePath = path.join(possiblePath, "README.md");
		return new Promise((resolve, reject) => {
			fs.access(possiblePath, fs.constants.F_OK | fs.constants.R_OK, (err) => {
				resolve(!err ? possiblePath : null);
			});
		});
	});

	pathsPromiseArray.push(new Promise((resolve, reject) => {
		const localPath = path.join(".", "node_modules", module, "README.md");
		fs.access(localPath, fs.constants.F_OK | fs.constants.R_OK, (err) => {
			resolve(!err ? localPath : null);
		});
	}));

	return Promise.all(pathsPromiseArray).then((pathsResults) => {
			return pathsResults.find((possiblePath) => !!possiblePath);
		}).catch((err) => {
			console.log(err);
		});
}

function readFileFromDisk(filePath) {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, "utf8", (err, data) => {
			if (err || !data) {
				reject(err || "Tried to read local file, but no data was read");
			} else {
				resolve(data);
			}
		});
	});
}

// TODO if README not found locally, try to find it online
function retrieveFromRemoteRepository(module) {

}

function renderMarkdown(markdown) {
	console.log(marked(markdown));
}
