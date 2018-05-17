#!/usr/bin/env node

const program = require("commander");

program
	.version("0.0.1")
	.arguments("<module>")
	.action((module) => {
		console.log(`You are looking for ${module}`);
	})
	.parse(process.argv);

