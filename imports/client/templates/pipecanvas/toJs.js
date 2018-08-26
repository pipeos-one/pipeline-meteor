export default function toJavascript(graph, inputs) {

    // let code =
    //     `web3.eth.sendTransaction({
    //         from: '',
    //         to: '',
    //         value: 0,
    //     }, function(error, hash) {
    //         console.log(error, hash);
    //     })`;

    let func_input_initialize = '';

    let func_inputs = Object.values(inputs).map(function(input) {
        return input.split(': ')[1]
    });

    if (func_inputs.length > 0) {
        func_input_initialize = `// Will be set in the UI by the user.
` + func_inputs.map(function(input) {
            return `let ${input} = null;`
        }).join(`
`);
    }

    func_input_initialize += `

`;
    let code =
        `PipedContract.methods.PipedFunction(${func_inputs}).send(
            {},
            function(error2, transactionHash){
                console.log(error2, transactionHash);
        });`

    let wrap_stop = `
    }
});`

    cells = graph.toJSON().cells;
    for (let i in cells) {
        if (cells[i].type == "devs.Atomic" && cells[i].attrs.pipeline.abi.type == 'event') {
            // console.log(cells[i])
            let contract_address = cells[i].attrs.pipeline.contract.address || '0x0000000000000000000000000000';
            let indexed_params = [];
            let event_arguments = [];
            cells[i].attrs.pipeline.abi.inputs.forEach(function(input) {
                if (input.indexed) {
                    indexed_params.push(`${input.name}: ${input.type}`);
                }
                // TODO: input name should be corresponding function input
                event_arguments.push(`${input.name} = event.returnValues["${input.name}"];`);
            });
            indexed_params = indexed_params.join(`,
        `)
            event_arguments = event_arguments.join(`
    `)

//             let wrap_start = `let subscription = web3.eth.subscribe('logs', {
//     fromBlock: 0,
//     address: '${contract_address}',
//     topics: [null, ['option1', 'option2']]
// }, function(error, result){
//     if (!error) {
//             `

            let wrap_start = `${cells[i].attrs.pipeline.contract.name}.events.${cells[i].attrs.pipeline.abi.name}({
    filter: {
        ${indexed_params}
    },
    fromBlock: 0
}, function(error, event) {
    if (error) {
        console.log(error);
        return;
    }
    ${event_arguments}
    `
            //run.inPorts.push()
            // cells[i].inPorts.forEach((inP, index) => {
            //     run.inPorts.push(cells[i].id+"."+inP)
            // })
            // cells[i].outPorts.forEach((inP, index) => {
            //     run.outPorts.push(cells[i].id+"."+inP)
            // })
            // run.toRun.push(cells[i])

            code = func_input_initialize + wrap_start + code + wrap_stop;
        }
    }

    return code;
}
