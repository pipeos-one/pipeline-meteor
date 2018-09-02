Pipeline = {}

Pipeline.schemajson = {}
Pipeline.schemas = {}
Pipeline.collections = {}
Pipeline.chains = {
    '1': 'mainnet',
    '3': 'ropsten',
    '4': 'rinkeby',
    '42': 'kovan',
}
Pipeline.contracts = {
    PipelineProxy: {
        kovan: '0xd20c555c3ef80e28f4ba5167a3067467356957aa',
    }
}

export default Pipeline
