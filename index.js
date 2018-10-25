#!/usr/bin/env node --harmony
const chalk = require('chalk');
const co = require('co');
const prompt = require('co-prompt');
const program = require('commander');

const compiler = require('./compiler');


const commands = {
	compile: compiler.compile,
	test: () => console.log("Successful installation")
};


program
	.arguments('<command>')
	.option('-s, --source, <source>', 'Supported diagram file')
	.option('-d, --destination <destination>', 'Destination for compiled file')
	.action(commandStr => {
		if (!(commandStr in commands)) return error(`${commandStr} is not a valid command.\nUse --help to view list of commands`);

		const command = commands[commandStr];

		co(function *() {
			const args = [];
			const pars = getParamNames(command);

			for (const val of pars) {
				if (program[val]) {
					args.push(program[val]);
				} else {
					args.push(yield prompt(`${val}:`));
				}
			}

			command.apply(this, args);

			process.exit(0);
		});
	})
	.on('--help', () => {
		console.log('List of commands:');

		for (const command in commands) {
			console.log('     %s     %s', command, String(commands[command]).replace(',', ', '));
		}
	})
	.parse(process.argv);


function getParamNames(callback) {
	//let result = callback.toString().match(/\((.*)\)/)[1].split(/,/).map(arg => arg.trim());
	const fnStr = callback.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
	let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
	if (!result) result = [];
	return result;
}

function error(e) {
	console.error(chalk.red(e));
	process.exit(1);
}
