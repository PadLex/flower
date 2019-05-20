/*
Convert Draw.io uncompressed XML to standardised JSON format.
*/

const parseXML = require("xml2js").parseString;
const unescape = require("unescape");
//const util = require("util");

//Redundant until support for multiple formats
exports.standardise = function (content, callback) {
	drawDotIo(content, callback);
};

function drawDotIo(xml, callback) {
	let idToName = {};
	
	parseXML(xml, (err, json) => {
		if (err) {
			callback(err, json);
			return;
		}
		
		const objects = json.mxGraphModel.root[0].mxCell;
		
		//Connections
		let connections = {};
		//Code
		let children = {};
		//Titles, no code
		let parents = {};
		
		//Standardised JSON output, ready for compiling
		let standardised = {};
		
		//Classify objects
		for (let i in objects) {
			const object = objects[i].$;
			
			if (!object.style) {
				continue;
			}
			
			if (object.source && object.target) {
				connections[object.id] = {
					source: object.source,
					target: object.target
				};
				
				continue;
			}
			
			if (object.style.includes("shape=cloud")) {
				parents[object.id] = {
					value: object.value,
					connections: [],
					start: true
				};
				
				continue;
			}
			
			if (object.parent == 1) {
				parents[object.id] = {
					value: object.value,
					connections: [],
					children: [],
					start: false
				};
				
				continue;
			}
			
			console.log(objects[i].mxGeometry[0].$);
			
			if (object.parent) {
				children[object.id] = {
					value: object.value,
					parent: object.parent,
					connections: [],
					y: objects[i].mxGeometry[0].$.y
				};
			}
		}
		
		let id;
		
		//Pass value to parent connections and remove "fake" children
		for (id in children) {
			const child = children[id];
			
			if (child.parent in connections) {
				connections[child.parent].value = child.value;
				delete children[id];
			}
		}
		
		//Pass connections to real children
		for (id in connections) {
			const connection = connections[id];
			let condition = connection.value;
			
			console.log(connection.target);
			
			if (condition) {
				console.log(condition + " - " + condition.replace(/<(.|\n)*?>/g, "") + " - " + unescape(condition.replace(/<(.|\n)*?>/g, "")));
				condition = unescape(condition.replace(/<(.|\n)*?>/g, ""));
			} else {
				condition = "true";
			}
			
			if (connection.source in parents) {
				parents[connection.source].connections.push({
					condition: condition,
					target: connection.target
				});
			}
			
			if (connection.source in children) {
				children[connection.source].connections.push({
					condition: condition,
					target: connection.target
				});
			}
		}
		
		//Pass children to parents
		for (id in children) {
			const child = children[id];
			let code = child.value;
			
			if (code) {
				code = unescape(code.replace(/<(.|\n)*?>/g, ""));
			} else {
				code = ";";
			}
			
			console.log("Y: " + child.y);
			
			if (child.parent in parents) {
				parents[child.parent].children.push({
					id: id,
					code: code,
					connections: child.connections,
					order: child.y
				});
			}
			
			if (child.parent in children) {
				callback("Error, nested children", json);
				return false;
			}
			
		}
		
		// Sort children
		// Make id's more human readable
		// Add parents to output
		for (id in parents) {
			let parent = parents[id];
			const title = parent.value;
			
			idToName[id] = title;
			
			//Sort children to assign appropriate names
			parent.children.sort((a, b) => a.order - b.order);
			
			let i = 0;
			for (const childID in parent.children) {
				let child = parent.children[childID];
				
				idToName[child.id] = title + "_" + i;
				child.id = idToName[child.id];
				
				i++;
			}
			
			if (parent.children.length > 0) {
				standardised[title] = {
					children: parent.children,
					connections: parent.connections
				};
			}
			
		}
		
		for (const title in standardised) {
			const parent = standardised[title];
			let renameConnections = [];
			
			renameConnections = renameConnections.concat(parent.connections);
			
			for (const childID in parent.children) {
				const child = parent.children[childID];
				
				renameConnections = renameConnections.concat(child.connections);
			}
			
			renameConnections.forEach(connection => connection.target = idToName[connection.target]);
			
		}
		
		
		callback(null, standardised);
	});
	
	//util.inspect(content);
	
}