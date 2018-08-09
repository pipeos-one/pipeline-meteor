import joint from '/imports/client/lib/external/joint.js';
import '/imports/client/lib/external/joint.css';
import solidity from '../pipecodepreview/codepatterns.js';

import './pipecanvas.html';
import './pipecanvas.css';

Template.pipecanvas.onCreated(function() {
    this.functionAbi = this.data.functionAbi;
    this.pipecode = this.data.pipecode;
})

Template.pipecanvas.onRendered(function() {
    let self = this
    self.nodes = []

    joint.dia.ElementView.prototype.pointerdown = function(evt, x, y) {
       var data = this.eventData(evt);
        if (data.stopPropagation) return;
        joint.dia.CellView.prototype.pointerdown.apply(this, arguments);
        this.notify('element:pointerdown', evt, x, y);
        this.dragStart(evt, x, y);
    };

    self.graph = new joint.dia.Graph;
    self.paper = new joint.dia.Paper({
        el: document.getElementById('paper'),
        width: "100%",
        height: "100%",
        gridSize: 2,
        model: self.graph,
        snapLinks: true,
        defaultLink: new joint.dia.Link({
            router: { name: 'manhattan', args: { startDirections: ['left','right'],endDirections: ['left','right'] } },
            attrs: {
                '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z', fill: '#fff', stroke: '#000' },
                '.link-tools .tool-remove circle, .marker-vertex': { r: 8 },
                '.connection': {
                    stroke: '#000', 'stroke-width': 2
                }
            }
        }),
        highlighting: {
            'default': {
                name: 'stroke',
                options: {
                    padding: 6
                }
            },
            'embedding': {
                name: 'addClass',
                options: {
                    className: 'highlighted-parent'
                }
            }
        },

        validateEmbedding: function(childView, parentView) {

            return parentView.model instanceof joint.shapes.devs.Coupled;
        },

        validateConnection: function(sourceView, sourceMagnet, targetView, targetMagnet, e) {
            // console.log(sourceView,sourceMagnet.getAttribute("port"),targetMagnet)
            let src = sourceMagnet.getAttribute("port").split(": ");
            let trg = targetMagnet.getAttribute("port").split(": ");
            let sio = sourceMagnet.getAttribute("port-group");
            let tio = targetMagnet.getAttribute("port-group");

            return src[0] == trg[0] && sourceMagnet != targetMagnet && sio != tio;
        },
        markAvailable: true
    });

    self.paper.options.defaultConnector = {
        name: 'rounded',
        args: {
            radius: 10
        }
    }

    self.paper.on('cell:pointerdblclick',
        function(cellView, evt, x, y) {
            cellView.model.remove();
            let code = toSolidity(self.graph);
            self.pipecode.set(code);
        }
    );

    self.graph.on('change', function() {
        console.log('change graph')
        let code = toSolidity(self.graph);
        self.pipecode.set(code);
    });

    Tracker.autorun(function() {
        let contract_function = self.functionAbi.get();
        if (contract_function) {
            addNode(self.graph, self.nodes, contract_function)
        }
    });

});

var gr, sol, run, cells, funcs=[];

function addNode(graph, nodes, contract_function) {
    abi = contract_function.abi
    pname = contract_function.contract.name
    nodetext = abi.name
    ins = abi.inputs.map(function(input) {
        return `${input.type}: ${input.name}`
    })
    outs = abi.outputs.map(function(output) {
        return `${output.type}: ${output.name}`
    })

    let color = "#ddd";
    if (!abi.constant) {
        color = "#edd";
    }

    nodes.push(
            new joint.shapes.devs.Atomic({
            position: {
                x: 200,
                y: 100
            },
            size: {
                width: Math.max(pname.length +nodetext.length)*8+20,
                height: Math.max(ins.length,outs.length)*22+20
            },
            inPorts: ins,
            outPorts: outs,
            attrs: {'.label': { text: pname+".\n"+nodetext, 'ref-x': .5, 'ref-y': 0.1 },
                rect: { rx:10, ry:10,
                    fill: color,
                    stroke: '#222',
                    'stroke-width': 2
                }
            }
        }).addTo(graph)
    )
    return nodes
}

function toSolidity(graph){
    preRun(graph)

    gr = graph.toJSON();

    sol = solidity.file_p0;
    sol = sol + solidity.import_p0+ solidity.import_p1;
    sol = sol + solidity.proxy;
    sol = sol + solidity.contract_p0;
    sol = sol + 'PipedContract';

    sol = sol + solidity.contract_p1;
    let contrs =[], ffunc=[], fffunc=[], tm=""
    for (let nx in funcs){
        sol = sol + "address public "+funcs[nx].attrs[".label"].text.split(".\n")[0]+"_address;\n";
        ffunc.push("address _"+funcs[nx].attrs[".label"].text.split(".\n")[0]+"_address")
        tm = funcs[nx].attrs[".label"].text.split(".\n")[0]+"_address"
        fffunc.push(tm+" = _"+tm+";\n")
    }

    sol = sol + "\nconstructor( address _seth_proxy, "+ffunc.join(",")+") public {\nseth_proxy = SethProxy(_seth_proxy);\n";
    sol = sol + fffunc.join("");
    sol = sol + "\n}\n"

    sol = sol + solidity.function_p0;
    sol = sol + 'PipedFunction';
    sol = sol + solidity.function_pp0;
    console.log(inputs)
    inputs.forEach((inP, ndx) => {
        if (inP.split(".")[1] == "uint256: wei_value") return;
        if (inP.split(".")[1] == "address: tx_sender") return;
        sol = sol+inP.split(".")[1].replace(": "," ")+", "
    })
    sol = sol.substring(0, sol.length - 2);

    sol = sol + solidity.function_pp1;
    sol = sol + solidity.function_p1;
    if (run.outPorts.length > 0) {
        sol = sol + solidity.function_ret0;
        run.outPorts.forEach((inP, ndx) => {
            sol = sol+inP.split(".")[1].replace(": "," ")+", "
        })
        sol = sol.substring(0, sol.length - 2);
        sol = sol + solidity.function_ret1
    }

    sol = sol + solidity.function_p2;

    let inArgs = "", outArgs="";
    for (let nx in funcs){
        forFunc(funcs[funcs.length-nx-1])
    }

    if (run.outPorts.length > 0) {
        sol = sol + "return ("
        run.outPorts.forEach((inP, ndx) => {
            sol = sol+inP.split(".")[1].replace(": "," ")+", "
        })
        sol = sol.substring(0, sol.length - 2)+");\n";
    }

    sol = sol + solidity.function_p3;
    sol = sol + solidity.contract_p2;
    return sol;
    // $('#source_textarea').val(sol);
}

function forFunc(func){
    console.log(func)
        let outs = [], ins = [], touts = [], tins = [], tins2=[], ttins=[]
        func.outPorts.forEach((out, dx)=>{
            outs.push(getIO(func.id, out, 1))
            touts.push(out)
        })
        func.inPorts.forEach((inn, dx)=>{
            let inIt = getIO(func.id, inn, 0);
            if (!inIt) {
                ins.push(inn.split(" ")[1])
            } else {
                ins.push(inIt)
            }
            tins.push(inn.split(": ")[0])
            tins2.push(getIO2(func.id, inn, 0))
            ttins.push(inn.split(": ")[1])

        })
        if (outs.length >0 ) {
            if (!outs[0]) {
                //sol = sol + "("+run.outPorts.join(", ").replace(": "," ")+") = ";
            } else {
                //sol = sol + "("+outs.join(", ").replace(": "," ")+") = ";
            }

        }
        console.log(ins)
        sol = sol + "\nsignature42 = bytes4(keccak256(\""+func.attrs[".label"].text.split(".\n")[1]+"("+tins.join(",")+")\"));\ninput42 = abi.encodeWithSelector(signature42, "+tins2.join(",")+");\n"
        if (touts.length > 0){
            sol = sol + "answer42 = ";
        }
        sol = sol + "seth_proxy.proxyCallInternal";
        if (func.attrs["rect"].fill == "#edd") {
            sol = sol + ".value(msg.value)";
        }
        sol = sol +"("+func.attrs[".label"].text.split(".\n")[0]+"_address , input42, 32);\n"
        touts.forEach((o,n)=>{
            sol = sol +o.split(": ").join(" ")+";\n"
        })
        if (touts.length > 0){
            sol = sol +"assembly {\n"
            touts.forEach((o,n)=>{
                sol = sol +o.split(" ")[1]+" := mload(add(answer42, 32))\n"
            })
            sol = sol +"}\n"
        }




}

var gr, sol, run, cells, funcs=[];

function getNext(edge, port){
    let next = {}
    console.log(cells)
    for (let i in cells){
        if (cells[i].type == "link") {
            if (edge == cells[i].source.id){
                next[cells[i].source.port] = cells[i].target
            }
        }

    }
    return next
}

function getIO(node, port, io){
    let dir = "target", extra = "";
    if (io === 1) {
        dir = "source"
    }
    for (let i in cells){
        if (cells[i].type == "link") {
            if (node == cells[i][dir].id && port == cells[i][dir].port){
                //next[cells[i].source.port] = cells[i].target
                //console.log(cells[i].id)
                if (io === 1){
                    extra = port.split(": ")[0]
                }
                return (extra+" e_"+cells[i].source.id+cells[i].source.port).replace(/: /g,"")
            }
        }
    }
    return false;
}

function getIO2(node, port, io){
    let dir = "target", extra = "";
    if (io === 1) {
        dir = "source"
    }
    for (let i in cells){
        if (cells[i].type == "link") {
            if (node == cells[i][dir].id && port == cells[i][dir].port){
                //next[cells[i].source.port] = cells[i].target
                //console.log(cells[i].id)
                if (io === 1){
                    extra = port.split(": ")[0]
                }
                return cells[i].source.port.split(": ")[1]
            }
        }
    }

    for (let ndx in run.inPorts){
        if (run.inPorts[ndx].split(".")[1] == port) {
            console.log("hi hi ",port.split(": ")[1])
            return port.split(": ")[1]
        }
    }

    return false;
}


function preRun(graph) {
    run={inPorts:[], outPorts:[], toRun:[], ready:[]}
    proc ={}
    funcs = []
    cells = graph.toJSON().cells;
    for (let i in cells){
        if (cells[i].type == "devs.Atomic") {
            //run.inPorts.push()
            cells[i].inPorts.forEach((inP, index) => {
                run.inPorts.push(cells[i].id+"."+inP)
            })
            cells[i].outPorts.forEach((inP, index) => {
                run.outPorts.push(cells[i].id+"."+inP)
            })
            run.toRun.push(cells[i])
        }
    }



    cells.forEach((cell, index) => {
        if (cell.type == "link") {
            //console.log(cell.source.id+"."+cell.source.port)
            run.outPorts.splice(run.outPorts.indexOf(cell.source.id+"."+cell.source.port), 1);
            run.inPorts.splice(run.inPorts.indexOf(cell.target.id+"."+cell.target.port), 1);
        }
    })
    inputs = $.extend(true, [], run.inPorts);
    process(run)
}

function process(proc){
    proc.ready =[]

    proc.toRun.forEach((cell, index) => {
        proc.ready.push(cell);
        cell.outPorts.forEach((port,ndx)=> {
            if (run.outPorts.indexOf(cell.id+"."+port ) <0 ){
                //console.log((cell.id+"."+port))
                proc.ready.pop();
            }
        })

    })
    //console.log(proc)
    if (proc.ready.length == 0) return;
    console.log(proc.ready)

    proc.ready.forEach((cell, index) => {

        proc.toRun.splice(proc.toRun.indexOf(cell), 1)
        proc.outPorts = []
        proc.toRun.forEach((rcell, ndx)=> {
            if (rcell.type == "devs.Atomic") {
                //run.inPorts.push()
                rcell.outPorts.forEach((inP, index2) => {
                    proc.outPorts.push(rcell.id+"."+inP)
                })
            }
        })
        runFunc(cell)
    })
    process(proc)
}

function runFunc(arg){
    //console.log(arg)
    funcs.push(arg)
}
