const fs = require('fs');
const standardise = require('./standardiser').standardise;
const util = require('util');

module.exports.compile = function (source, destination){
    console.log("compiling... %s", source);
    
    const content = fs.readFileSync(source);
    
    standardise(content, (err, standardised) => {
        if (err){
            console.error(err);
        }
    
        //console.log('\n' + JSON.stringify(standardised, null, 4));
        
        let script = '';
        
        
        for (let p in standardised){
            let parent = standardised[p];
            
            for (let sc in parent.children){
                let c = parseInt(sc);
                let child = parent.children[c];
                
                let code = child.code;
                
                if(c < parent.children.length - 1){
                    child.connections.push({check: 'true', target: parent.children[c+1].id});
                }
                
                for(let cn in child.connections){
                    let connection = child.connections[cn];
                    
                    code += (
                        '\nif(' + connection.check + '){'
                        + 'module.exports.' + connection.target + '(file)'
                        + '}'
                    )
                }
                
                script += newMethod(child.id, code);
            }
            
            
        }
        
        
        fs.writeFileSync(destination, script, 'utf8');
    });
    
    
    
    //console.log(container);
};

function newMethod(name, code){
    return 'module.exports.' + name + ' = function (file) {\n'
        + '    ' + code
        + '\n};\n'
}
