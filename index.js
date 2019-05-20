#!/usr/bin/env node
const chalk = require("chalk");
const co = require("co");
const prompt = require("co-prompt");
const program = require("commander");
const compiler = require("./compiler");

const commands = {
	"compile": compiler.compile,
	"test": test
};


program
	.arguments("<command>")
	.option("-s, --source, <source>", "Supported diagram file")
	.option("-d, --destination <destination>", "Destination for compiled file")
	.action(command_str => {
		if (!(command_str in commands)) {
			error(command_str + " is not a valid command.\nUse --help to view list of commands");
		}
		
		const command = commands[command_str];
		
		co(function* () {
			let args = [];
			let pars = getParamNames(command);
			
			for (const i in pars) {
				let val = pars[i];
				
				args.push(program[val] || (yield prompt(val + ":")));
			}
			
			command.apply(this, args);
			
			process.exit(0);
		});
	})
	.on("--help", () => {
		console.log("List of commands:");
		
		for (let command in commands) {
			console.log(`     ${command}     ${String(commands[command]).replace(",", ", ")}`);
		}
	})
	.parse(process.argv);


function getParamNames(func) {
	let fnStr = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, "");
	let result = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(/([^\s,]+)/g);
	
	if (result === null) {
		result = [];
	}
	
	return result;
}

function error(e) {
	console.error(chalk.red(e));
	process.exit(1);
}


function test() {
	console.log("Successful installation");
}