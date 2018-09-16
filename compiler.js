/*
Compile code from standardised JSON.
 */

const fs = require('fs');
const standardise = require('./standardiser').standardise;

module.exports.compile = function (source, destination){
    console.log("compiling... hi2 %s", source);

    if (source === destination){
        console.error('Error: source is equal to destination');
        return false
    }
    
    const content = fs.readFileSync(source);
    
    standardise(content, (err, standardised) => {
        if (err){
            console.error(err);
            return false
        }
    
        console.log('\n' + JSON.stringify(standardised, null, 4));
        
        let script = '';
        
        
        for (let p in standardised){
            let parent = standardised[p];

            /*
            Add parent function:
                function{
                    call first function;
                    call connections;
                }
             */

            let code = '';

            let connections = [{check: 'true', target: parent.children[0].id}].concat(parent.connections);

            connections.forEach( connection => {
                code += callMethod(connection.check, connection.target);
            });

            script += newMethod(p, code);


            /*
            Add child functions:
                function{
                    call connections;
                    call next function;
                }
             */

            for (let sc in parent.children){
                let c = parseInt(sc);
                let child = parent.children[c];
                
                code = child.code;
                
                if(c < parent.children.length - 1){
                    child.connections.push({check: 'true', target: parent.children[c+1].id});
                }

                for(let cn in child.connections){
                    let connection = child.connections[cn];
                    
                    code += callMethod(connection.check, connection.target);
                }
                
                script += newMethod(child.id, code);
            }
            
        }
        
        
        fs.writeFileSync(destination, script, 'utf8');
    });
    
    
    
    //console.log(container);
};

function newMethod(name, code){
    return '\nmodule.exports.' + name + ' = function (file) {\n'
        + '    ' + code
        + '\n};\n'
}

function callMethod(check, target){

    /*if(check === 'true'){
        return (
            'module.exports.' + target + '(file);'
        )
    }*/

    return (
        'if(' + check + '){'
        + 'module.exports.' + target + '(file);'
        + '}'
    )

}
