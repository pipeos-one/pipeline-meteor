solidity = {
    "file_p0" : "pragma solidity ^0.4.24;\npragma experimental ABIEncoderV2;\n\n",
    "proxy": "\ncontract SethProxy {\n    function proxyCallInternal(address _to, bytes input_bytes, uint256 output_size) payable public returns (bytes);\n}\n",
    "import_p0": "//import \"",
    "import_p1": "\";\n",
    "interface_p0": "\ninterface ",
    "contract_p0": "\ncontract ",
    "contract_p1": " {\n    SethProxy public seth_proxy;\n",
    "contract_p2": "}\n",
    "member_p0": ";\n",
    "function_p0": "\n    function ",
    "function_pp0": "(  ",
    "function_pp1": ")",
    "function_p1": " payable public ",
    "function_ret0": " returns (",
    "function_ret1": ")",
    "function_p2": " {\n    bytes4 signature42;\n    bytes memory input42;\n    bytes memory answer42;\n    uint wei_value = msg.value;\n    address tx_sender = msg.sender;\n",
    "function_p3": "    }\n",
    "comma": ",",


    "part1": ""
}

export default solidity;
