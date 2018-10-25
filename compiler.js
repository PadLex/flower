/*
Compile code from standardised JSON.
*/

const fs = require('fs');
const standardise = require('./standardiser').standardise;

module.exports.compile = (source, destination) => {
	console.log(`compiling... hi2 ${source}`);

	if (source === destination) {
		console.error('Error: source is equal to destination');
		return false;
	}

	const content = fs.readFileSync(source);

	standardise(content, (err, standardised) => {
		if (err) {
			console.error(err);
			return false;
		}

		console.log(`\n${JSON.stringify(standardised, null, 4)}`);

		let script = '';


		for (const p in standardised) {
			const parent = standardised[p];

			//Sort children to assign appropriate connections
			// (redundant if standardiser already sorts but still necessary both for future proofing
			// and to follow the JSON standard of not guaranteeing priority order)
			parent.children.sort((a, b) => a.order - b.order);

			/*
			Add parent function:
			function{
			call first function;
			call connections;
		}
		*/

			let code = '';

			const connections = [{condition: 'true', target: parent.children[0].id}].concat(parent.connections);

			connections.forEach( connection => {
				code += callMethod(connection.condition, connection.target);
			});

			script += newMethod(p, code);


			/*
			Add child functions:
			function{
			call connections;
			call next function;
		}
		*/

			for (const sc in parent.children){
				const c = parseInt(sc, 10);
				const child = parent.children[c];

				code = child.code;

				if (c < parent.children.length - 1){
					child.connections.push({
						condition: 'true',
						target: parent.children[c + 1].id
					});
				}

				for (const cn in child.connections){
					const connection = child.connections[cn];

					code += callMethod(connection.condition, connection.target);
				}

				script += newMethod(child.id, code);
			}
		}


		fs.writeFileSync(destination, script, 'utf8');
	});



//console.log(container);
};

function newMethod(name, code) {
	return `\nmodule.exports.${name} = function (file) {\n    ${code}\n};\n`;
}

function callMethod(condition, target) {
	if (condition === 'true') {
		return `\nmodule.exports.${target}(file);`;
	}

	return `if (${condition}) {module.exports.${target}(file);}`;
}
