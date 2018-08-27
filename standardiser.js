const parseXML = require('xml2js').parseString;
const unescape = require('unescape');

//Redundant until support for multiple formats
exports.standardise = function(content, callback){
    drawDotIo(content, callback);
};

function drawDotIo(xml, callback){
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
            
            //console.log(object);
            
            if (!object.style) {
                continue;
            }
            
            if (object.source && object.target) {
                connections[object.id] = {source: object.source, target: object.target};
                continue;
            }
            
            if (object.style.includes('shape=cloud')) {
                console.log(object);
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
        
        for (id in children) {
            var child = children[id];
            if (child.parent in connections) {
                connections[child.parent].value = child.value;
            }
        }
        
        for (id in connections){
            let connection = connections[id];
            
            let check = connection.value;
            
            if(check){
                check = unescape(check.replace(/<(.|\n)*?>/g, ''));
            }else{
                check = 'true'
            }
            
            if (connection.source in parents){
                parents[connection.source].connections.push({check: check, target: 'a' + connection.target.replace('-', '_')});
            }
            
            if(connection.source in children){
                children[connection.source].connections.push({check: check, target: 'a' + connection.target.replace('-', '_')});
            }
        }
        
        for (id in children) {
            var child = children[id];
            
            //console.log(child);
            
            let code = child.value;
            
            if (code){
                code = unescape(code.replace(/<(.|\n)*?>/g, ''));
            }else{
                code = ';'
            }
            
            if(code[code.length - 1] != ';'){
                code += ';';
            }
            
            if (child.parent in parents){
                parents[child.parent].children.push({id: 'a' + id.replace('-', '_'), code: code, connections: child.connections});
            }
            
            if (child.parent in children){
                callback("Error, nested children", json);
                return;
            }
            
        }
        
        console.log('\nparents: ');
        
        for (id in parents) {
            var parent = parents[id];
            
            /*let title = parent.value;
            
            if (title){
                title = title.replace(' ', '-').replace(/<(.|\n)*?>/g, '') + '-' + id.split('-')[1];
            }else{
                title = id;
            }*/
            let title = 'a' + id.replace('-', '_');
            
            standardised[title] = {children: parent.children, connections: parent.connections};
        }
        
        callback(null, standardised);
    });
    
    //util.inspect(content);
    
}