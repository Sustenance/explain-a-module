#!/usr/bin/env node

const program = require("commander");
const marked = require("marked");
const TerminalRenderer = require("marked-terminal");
const npmRoot = require("npm-root");
const glob = require("glob");

const fs = require("fs");

marked.setOptions({
	renderer: new TerminalRenderer()
});

program
	.version("1.0.0")
	.usage("[options] <module_name>")
	.option("-g, --global", "Search global cache")
	.arguments("<module>")
	.action((module, cmd) => {
		checkLocalMachine(module, !!cmd.global)
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

function checkLocalMachine(module, searchGlobal) {
	const pathsPromiseArray = [];

	pathsPromiseArray.push(new Promise((resolve, reject) => {
		glob(`node_modules/**/${module}/[rR][eE][aA][dD][mM][eE].[mM][dD]`, (globErr, files) => {
			if (!globErr && files && files.length > 0) {
				resolve(files[0]);
			} else {
				resolve(null);
			}
		})
	}));

	if (searchGlobal) {
		// glob search the npm globule modules directory
		pathsPromiseArray.push(new Promise((resolve, reject) => {
			npmRoot({global: true}, (rootErr, globalPath) => {
				if (!rootErr && globalPath) {
					glob(`${globalPath}/**/${module}/[rR][eE][aA][dD][mM][eE].[mM][dD]`, (globErr, files) => {
						if (!globErr && files && files.length > 0) {
							resolve(files[0]);
						} else {
							resolve(null);
						}
					});
				}
			});
		}));
	}

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
