solidity = {
    "file_p0" : "pragma solidity ^0.4.24;\npragma experimental ABIEncoderV2;\n\n",
    "proxy": "\ncontract SethProxy {\nfunction proxyCallInternal(address _to, bytes input_bytes, uint256 output_size) payable public returns (bytes);\n}\n",
    "import_p0": "//import \"",
    "import_p1": "\";\n",
    "contract_p0": "\ncontract ",
    "contract_p1": " {\nSethProxy public seth_proxy;\n",
    "contract_p2": "}\n",
    "member_p0": ";\n",
    "function_p0": "\nfunction ",
    "function_pp0": "(  ",
    "function_pp1": ")",
    "function_p1": " payable public ",
    "function_ret0": " returns (",
    "function_ret1": ")",
    "function_p2": " {\nbytes4 signature42;\nbytes memory input42;\nbytes memory answer42;\nuint wei_value = msg.value;\naddress tx_sender = msg.sender;\n",
    "function_p3": "}\n",
    "comma": ",",


    "part1": ""
}

export default solidity;
