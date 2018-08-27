#!/usr/bin/env node --harmony
const chalk = require('chalk');
const co = require('co');
const prompt = require('co-prompt');
const program = require('commander');


const compiler = require('./compiler');

const commands = {'compile': compiler.compile};



program
.arguments('<command>')
.option('-s, --source, <source>', 'Supported diagram file')
.option('-d, --destination <destination>', 'Destination for compiled file')
.action(function(command_str) {
    
    if (!(command_str in commands)){
        error(command_str + ' is not a valid command.\nUse --help to view list of commands');
    }
    
    const command = commands[command_str];
    
    co(function *() {
        
        let args = [];
        let pars = getParamNames(command);
        
        for (let i in pars){
            
            let val = pars[i];
            
            if(program[val]){
                args.push(program[val]);
            }else{
                args.push(yield prompt(val + ':'));
            }
            
        }
        
        command.apply(this, args);
        
        process.exit(0);
    });
})
.on('--help', function(){
    console.log('List of commands:');
    
    for (let command in commands){
        console.log('     %s     %s', command, String(commands[command]).replace(',', ', '))
    }
})
.parse(process.argv);


function getParamNames(func) {
    var fnStr = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
    if(result === null)
        result = [];
    return result;
}

function error(e){
    console.error(chalk.red(e));
    process.exit(1);
}