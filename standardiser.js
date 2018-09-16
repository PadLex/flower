/*
Convert Draw.io uncompressed XML to standardised JSON format.
*/


const parseXML = require('xml2js').parseString;
const unescape = require('unescape');
const util = require('util');

//Redundant until support for multiple formats
exports.standardise = function(content, callback){
    drawDotIo(content, callback);
};

function drawDotIo(xml, callback){
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
        for (var i in objects) {
            var object = objects[i]['$'];
            
            if (!object.style) {
                continue;
            }
            
            if (object.source && object.target) {
                connections[object.id] = {source: object.source, target: object.target};
                continue;
            }
            
            if (object.style.includes('shape=cloud')) {
                parents[object.id] = {value: object.value, connections: [], start: true};
                continue;
            }
            
            if (object.parent == 1) {
                parents[object.id] = {value: object.value, connections: [], children: [], start: false};
                continue;
            }
            
            if (object.parent) {
                children[object.id] = {value: object.value, parent: object.parent, connections: []};
            }
            
        }
        
        let id;

        //Pass value to parent connections and remove "fake" children
        for (id in children) {
            var child = children[id];
            if (child.parent in connections) {
                connections[child.parent].value = child.value;
                delete children[id];
            }
        }

        //Pass connections to real children
        for (id in connections){
            let connection = connections[id];
            
            let check = connection.value;

            console.log(connection.target);

            if(check){
                console.log(check + ' - ' + check.replace(/<(.|\n)*?>/g, '') + ' - ' + unescape(check.replace(/<(.|\n)*?>/g, '')));
                check = unescape(check.replace(/<(.|\n)*?>/g, ''));
            }else{
                check = 'true'
            }
            
            if (connection.source in parents){
                parents[connection.source].connections.push({check: check, target: connection.target});
            }
            
            if(connection.source in children){
                children[connection.source].connections.push({check: check, target: connection.target});
            }
        }

        //Pass children to parents
        for (id in children) {
            var child = children[id];

            let code = child.value;
            
            if (code){
                code = unescape(code.replace(/<(.|\n)*?>/g, ''));
            }else{
                code = ';';
            }
            
            //if(code[code.length - 1] != ';'){
                //code += ';';
            //}
            
            if (child.parent in parents){
                parents[child.parent].children.push({id: id, code: code, connections: child.connections});
            }
            
            if (child.parent in children){
                callback("Error, nested children", json);
                return false;
            }
            
        }

        //Make id's more human readable and add parents to output
        for (id in parents) {
            var parent = parents[id];

            var title = parent.value;

            idToName[id] = title;

            var i = 0;
            for (var childID in parent.children){
                var child = parent.children[childID];

                idToName[child.id] = title + '_' + i;
                child.id = idToName[child.id];

                i++;
            }

            standardised[title] = {children: parent.children, connections: parent.connections};
        }

        for (title in standardised) {
            var parent = standardised[title];

            var renameConnections = [];

            renameConnections = renameConnections.concat(parent.connections);

            for (var childID in parent.children) {
                var child = parent.children[childID];

                renameConnections = renameConnections.concat(child.connections);
            }

            renameConnections.forEach(connection => {
                connection.target = idToName[connection.target];
            });

        }

        callback(null, standardised);

    });
    
    //util.inspect(content);
    
}