// Vendored from the verify-network-effect repo (packages/contracts Hardhat artifacts) by
// scripts/vendor-artifacts.ts. ABI + creation bytecode only; do not edit by hand.
import type { Hex } from 'viem';

export const routerAbi = [
  {
    inputs: [],
    name: 'DiamondProxyWritable__InvalidInitializationParameters',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DiamondProxyWritable__RemoveTargetNotZeroAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DiamondProxyWritable__ReplaceTargetIsIdentical',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DiamondProxyWritable__SelectorAlreadyAdded',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DiamondProxyWritable__SelectorIsImmutable',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DiamondProxyWritable__SelectorNotFound',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DiamondProxyWritable__SelectorNotSpecified',
    type: 'error',
  },
  {
    inputs: [],
    name: 'DiamondProxyWritable__TargetHasNoCode',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Introspectable__InvalidInterfaceId',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Ownable__NotOwner',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Ownable__NotTransitiveOwner',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Proxy__ImplementationIsNotContract',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Proxy__SenderIsNotAdmin',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'previousAdmin',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'AdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'beacon',
        type: 'address',
      },
    ],
    name: 'BeaconUpgraded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'enum _IERC2535DiamondCut.FacetCutAction',
            name: 'action',
            type: 'uint8',
          },
          {
            internalType: 'bytes4[]',
            name: 'selectors',
            type: 'bytes4[]',
          },
        ],
        indexed: false,
        internalType: 'struct _IERC2535DiamondCut.FacetCut[]',
        name: 'facetCuts',
        type: 'tuple[]',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'DiamondCut',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'implementation',
        type: 'address',
      },
    ],
    name: 'Upgraded',
    type: 'event',
  },
  {
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'enum _IERC2535DiamondCut.FacetCutAction',
            name: 'action',
            type: 'uint8',
          },
          {
            internalType: 'bytes4[]',
            name: 'selectors',
            type: 'bytes4[]',
          },
        ],
        internalType: 'struct _IERC2535DiamondCut.FacetCut[]',
        name: 'facetCuts',
        type: 'tuple[]',
      },
      {
        internalType: 'address',
        name: 'target',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'diamondCut',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'selector',
        type: 'bytes4',
      },
    ],
    name: 'facetAddress',
    outputs: [
      {
        internalType: 'address',
        name: 'facet',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'facetAddresses',
    outputs: [
      {
        internalType: 'address[]',
        name: 'addresses',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'facet',
        type: 'address',
      },
    ],
    name: 'facetFunctionSelectors',
    outputs: [
      {
        internalType: 'bytes4[]',
        name: 'selectors',
        type: 'bytes4[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'facets',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'target',
            type: 'address',
          },
          {
            internalType: 'bytes4[]',
            name: 'selectors',
            type: 'bytes4[]',
          },
        ],
        internalType: 'struct _IERC2535DiamondLoupe.Facet[]',
        name: 'diamondFacets',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getFallbackAddress',
    outputs: [
      {
        internalType: 'address',
        name: 'fallbackAddress',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'fallbackAddress',
        type: 'address',
      },
    ],
    name: 'setFallbackAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
] as const;

export const routerBytecode: Hex =
  '0x6080604052346102765761025e6100146102d7565b61002c6100208261032b565b632c40805960e01b9052565b6101d56101c961003c60016102f5565b61005661004a60018661033d565b639142376560e01b9052565b632f40adcf60e21b5f525f51602061223a5f395f51905f526020527f2de04b09b31861ec8d744fd1bfe2904fc9ab3890fe7ec6d0f7c4b941ed8d5822805460ff191660011790556100bf6100b36100ac836102f5565b928661033d565b6307e4c70760e21b9052565b6307e4c70760e21b5f525f51602061223a5f395f51905f526020527f6c1339b8848595ebb2d0eb2c445356084ad3fc2fe46b7898f4abf3e0d5b280c2805460ff191660011790556101216101156100ac836102f5565b637a0ed62760e01b9052565b61013c6101306100ac836102f5565b6356fe50af60e11b9052565b61015761014b6100ac836102f5565b6314bbdacb60e21b9052565b6101726101666100ac836102f5565b6366ffd66360e11b9052565b6348e2b09360e01b5f525f51602061223a5f395f51905f526020527f7661afff1a97d0ec2e1a9ce3077c6e2019badf127f248508204a29c4f830a08b805460ff191660011790556101c2816102f5565b508361033d565b6301ffc9a760e01b9052565b6301ffc9a760e01b5f525f51602061223a5f395f51905f526020527fa8f5d028d766a70d3486bcf0e3a439c4887bbbbcbedea7130e385c503d65c974805460ff19166001179055610224610351565b9061022d61028e565b308152905f602083015260408201526102458261032b565b5261024f8161032b565b506102586103d4565b906104f7565b610267336106a8565b6040516115ad9081610c6d8239f35b5f80fd5b634e487b7160e01b5f52604160045260245ffd5b60405190606082016001600160401b038111838210176102ad57604052565b61027a565b6040519190601f01601f191682016001600160401b038111838210176102ad57604052565b610120906102e4826102b2565b6008815291601f1901366020840137565b5f1981146103035760010190565b634e487b7160e01b5f52601160045260245ffd5b634e487b7160e01b5f52603260045260245ffd5b8051156103385760200190565b610317565b80518210156103385760209160051b010190565b60409061035d826102b2565b6001815291601f1901825f5b82811061037557505050565b60209061038061028e565b5f81525f838201526060604082015282828501015201610369565b600311156103a557565b634e487b7160e01b5f52602160045260245ffd5b6001600160401b0381116102ad57601f01601f191660200190565b6103de60206102b2565b905f8252565b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b9392909193606081016060825283518091526080820190602060808260051b8501019501915f905b828210610461575050506001600160a01b03909516602082015292935061045e9260408184039101526103e4565b90565b848703607f19018152835180516001600160a01b0316885260208101519497939492939192606083019160038210156103a557604060809160209384870152015193606060408201528451809452019201905f905b8082106104d457505050602080600192980192019201909291610430565b82516001600160e01b0319168452602093840193909201916001909101906104b6565b919061051c6105155f51602061225a5f395f51905f525461ffff1690565b61ffff1690565b9283925f9260078616610692575b5f94935b83518610156105ed57610541868561033d565b5160208101516105508161039b565b604082015151156105de576105648161039b565b80610585575090600195969761057992610a86565b9490965b01949361052e565b610592819893979861039b565b600181036105ac5750906105a7600192610985565b61057d565b806105b860029261039b565b146105c7575b5060019061057d565b946105d5919760019661070f565b949096906105be565b6309547f0d60e11b5f5260045ffd5b61064495505f92967f8faa70878671ccd212d20771b795c50af8fd3ff6cf27f4bde57e5d4de0aeb6739492958103610670575b60078116610646575b505061063b8460405193849384610408565b0390a15f610bfa565b565b6106689060031c5b5f525f51602061227a5f395f51905f5260205260405f2090565b555f80610629565b5f51602061225a5f395f51905f52805461ffff191661ffff8316179055610620565b92506106a161064e8660031c90565b549261052a565b7fb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d61038054604080516001600160a01b0392831681529390911660208401819052927f7e644d79422f17c01e4894b5f4f588d331ebfa28653d42ae832dc59e38c9798f9190a155565b8051929390929091906001600160a01b0316610976575f935b604084015191825186101561096f5761074886610756925f19019461033d565b516001600160e01b03191690565b6001600160e01b031981165f9081525f51602061221a5f395f51905f5260205260408120805491905591606083901c8015610960573014610951576007841660078114610916575b816107ac6107b99260051b90565b1b63ffffffff60e01b1690565b916001600160e01b031990811690831603610894575b6107f261051560076107e6600387901c611fff1683565b951660051b61ffe01690565b926107fd8560031c90565b810361082a57506040926001926001600160e01b031980831c199093169216901c17955b01949050610728565b61088e610872604095600195610858855f51602061227a5f395f51905f529d979d905f5260205260405f2090565b546001600160e01b031980841c19909116911690911c1790565b915f51602061227a5f395f51905f52905f5260205260405f2090565b55610821565b6108dd6108d06108c2845f51602061221a5f395f51905f529063ffffffff60e01b165f5260205260405f2090565b546001600160601b03191690565b6001600160601b03191690565b6001600160e01b031983165f9081525f51602061221a5f395f51905f52602052604090206001600160601b0385169190911790556107cf565b6107ac91506107b99061094761092c8760031c90565b5f51602061227a5f395f51905f52905f5260205260405f2090565b549250905061079e565b631cbd473560e21b5f5260045ffd5b63273f579560e21b5f5260045ffd5b9450925050565b6305d49e0f60e41b5f5260045ffd5b80519091906001600160a01b03163b15610a77575f5b60408301518051821015610a7157610748826109b69261033d565b906109df825f51602061221a5f395f51905f529063ffffffff60e01b165f5260205260405f2090565b54918260601c8015610960573081146109515785516001600160a01b031614610a62578451600193610a5b91610a2d906108d0906001600160a01b03165b60601b6001600160601b03191690565b90858060601b031617915f51602061221a5f395f51905f529063ffffffff60e01b165f5260205260405f2090565b550161099b565b631e1edc6960e11b5f5260045ffd5b50509050565b63753f216760e01b5f5260045ffd5b80519293929091906001600160a01b0316803b15610bb2575081516001600160a01b03166001600160a01b03163014610951575b5f905b60408301518051831015610baa5761074883610ad89261033d565b94610b01865f51602061221a5f395f51905f529063ffffffff60e01b165f5260205260405f2090565b54610b9b5760019160e0610b778493610b266108d0610a1d8a5160018060a01b031690565b8417610b508b5f51602061221a5f395f51905f529063ffffffff60e01b165f5260205260405f2090565b55610b5e6007851660051b90565b996001600160e01b0319808c1c1990921691168a1c1790565b9714610b87575b01910190610abd565b86610b9561092c8360031c90565b55610b7e565b6348d42e7f60e11b5f5260045ffd5b509150509190565b6001600160a01b03163014610aba5763753f216760e01b5f5260045ffd5b3d15610bf5573d90610be9610be4836103b9565b6102b2565b9182523d5f602084013e565b606090565b81516001600160a01b03821690811590158118610c5d5715610c1b57505050565b3003610c48575b815f929160208493519201905af4610c38610bd0565b5015610c4057565b3d5f803e3d5ffd5b803b610c225763753f216760e01b5f5260045ffd5b63cf45f9c560e01b5f5260045ffdfe60806040526004361015610018575b36610e3657610e36565b5f3560e01c806301ffc9a7146100975780631f931c1c146100925780632c4080591461008d57806352ef6b2c146100885780637a0ed62714610083578063914237651461007e578063adfca15e146100795763cdffacc60361000e5761092f565b610828565b61074b565b6104e2565b6102ad565b610224565b610197565b346100f95760203660031901126100f957602060ff6100ed6100b76100fd565b63ffffffff60e01b165f527ffe25b4374cb2b280904a684bb2057f9f429754d871a6b258ad16536918fdbd0060205260405f2090565b54166040519015158152f35b5f80fd5b600435906001600160e01b0319821682036100f957565b35906001600160e01b0319821682036100f957565b602435906001600160a01b03821682036100f957565b600435906001600160a01b03821682036100f957565b35906001600160a01b03821682036100f957565b9181601f840112156100f95782359167ffffffffffffffff83116100f957602083818601950101116100f957565b346100f95760603660031901126100f95760043567ffffffffffffffff81116100f957366023820112156100f95780600401359067ffffffffffffffff82116100f9573660248360051b830101116100f9576101f1610129565b906044359167ffffffffffffffff83116100f957610222936102196024943690600401610169565b94909301610a1c565b005b346100f9575f3660031901126100f9577f85fb9346809a0d51894362fd6f50e7a5ba84526939921b0ff59f80250a25f203546040516001600160a01b039091168152602090f35b60206040818301928281528451809452019201905f5b81811061028e5750505090565b82516001600160a01b0316845260209384019390920191600101610281565b346100f9575f3660031901126100f9576102e06102d95f5160206115385f395f51905f525461ffff1690565b61ffff1690565b6102e981610d17565b5f5f5f5b8482106103095782845260405180610305868261026b565b0390f35b61031281610d66565b545f5b6008811061032e575b505061032990610d53565b6102ed565b91949261033d90969196610d53565b938185116104225761038261037c61036e6103698a61035c8860051b90565b1b63ffffffff60e01b1690565b610b2e565b546001600160601b03191690565b60601c90565b5f6001600160a01b038216815b8481106103df575b50506103d557816103c06103c5926103b160019589610da6565b6001600160a01b039091169052565b610d53565b925b019590959491939294610315565b50916001906103c7565b6104086103fc6103ef838b610da6565b516001600160a01b031690565b6001600160a01b031690565b82146104165760010161038f565b50505060015f80610397565b9392949181965061031e565b90602080835192838152019201905f5b81811061044b5750505090565b82516001600160e01b03191684526020938401939092019160010161043e565b602081016020825282518091526040820191602060408360051b8301019401925f915b83831061049d57505050505090565b90919293946020806104d3600193603f198682030187526040838b51878060a01b0381511684520151918185820152019061042e565b9701930193019193929061048e565b346100f9575f3660031901126100f95761050e6102d95f5160206115385f395f51905f525461ffff1690565b61051781610dba565b61052082610d17565b915f905f5f5b828210610580575050505f5b81811061054a5781835260405180610305858261046b565b8061056a61056461055d60019488610da6565b5160ff1690565b60ff1690565b60206105768387610da6565b5101515201610532565b61058981610d66565b545f5b600881106105a5575b50506105a090610d53565b610526565b926105b69097949197969296610d53565b9481861161073d576105cc8861035c8660051b90565b6105db61037c61036e83610b2e565b5f6001600160a01b038216815b85811061068d575b5050610682579161065d6106709261061e60019561060e858a610da6565b516001600160a01b039091169052565b61062786610d17565b6020610633858a610da6565b51015261064d6020610645858a610da6565b510151610d94565b6001600160e01b03199091169052565b6103c061066a8289610da6565b60019052565b935b019690939695919594929461058c565b505092600190610672565b898589846106af6103fc6106a18785610da6565b51516001600160a01b031690565b146106bf575050506001016105e8565b610734955083945061055d8460ff94610701869561064d60206106e861070d9b61070699610da6565b5101516106fb61056461055d8888610da6565b90610da6565b610da6565b1610610e1e565b61072c61072561072061055d848d610da6565b610e25565b918a610da6565b9060ff169052565b60015f806105f0565b949281949750959195610595565b346100f95760203660031901126100f95761076461013f565b7fb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103546001600160a01b031633036107d6577f85fb9346809a0d51894362fd6f50e7a5ba84526939921b0ff59f80250a25f20380546001600160a01b0319166001600160a01b0392909216919091179055005b6325ecccc360e11b5f5260045ffd5b60206040818301928281528451809452019201905f5b8181106108085750505090565b82516001600160e01b0319168452602093840193909201916001016107fb565b346100f95760203660031901126100f95761084161013f565b61085d6102d95f5160206115385f395f51905f525461ffff1690565b9061086782610d17565b905f906001600160a01b031681805b85821061088e578385526040518061030587826107e5565b61089781610d66565b545f5b600881106108b3575b50506108ae90610d53565b610876565b94926108c490979197969296610d53565b94818611610921576108da8861035c8360051b90565b6108ec6103fc61037c61036e84610b2e565b8614610905575b5060010196909695919594929461089a565b846103c061091a9261064d6001959888610da6565b93906108f3565b8197509591959492946108a3565b346100f95760203660031901126100f957602061094d6103696100fd565b5460601c604051908152f35b634e487b7160e01b5f52604160045260245ffd5b604051906060820182811067ffffffffffffffff82111761098d57604052565b610959565b6040519190601f01601f1916820167ffffffffffffffff81118382101761098d57604052565b67ffffffffffffffff811161098d5760051b60200190565b67ffffffffffffffff811161098d57601f01601f191660200190565b929192610a006109fb836109d0565b610992565b93828552828201116100f957815f926020928387013784010152565b92949390610a2c6109fb826109b8565b93602085838152019160051b8101903682116100f95780925b828410610a685750505050610a669394610a609136916109ec565b91610b51565b565b833567ffffffffffffffff81116100f95782016060813603126100f957610a8d61096d565b90610a9781610155565b8252602081013560038110156100f957602083015260408101359067ffffffffffffffff82116100f9570136601f820112156100f957803590610adc6109fb836109b8565b9160208084838152019160051b830101913683116100f957602001905b828210610b16575050506040820152815260209384019301610a45565b60208091610b2384610114565b815201910190610af9565b63ffffffff60e01b165f525f5160206115185f395f51905f5260205260405f2090565b7fb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103546001600160a01b031633036107d657610b9e6102d95f5160206115385f395f51905f525461ffff1690565b9384935f9360078716610d01575b5f95945b8451871015610c6f57610bc38786610da6565b516020810151610bd281610ecb565b60408201515115610c6057610be681610ecb565b80610c075750906001969798610bfb92611336565b9590975b019594610bb0565b610c148199939899610ecb565b60018103610c2e575090610c29600192611224565b610bff565b80610c3a600292610ecb565b14610c49575b50600190610bff565b95610c579198600197610fc4565b95909790610c40565b6309547f0d60e11b5f5260045ffd5b610a6696507f8faa70878671ccd212d20771b795c50af8fd3ff6cf27f4bde57e5d4de0aeb673939782959293968103610cdf575b60078116610cc6575b5050610cbe8560405193849384610f0d565b0390a16114a5565b610cd79060031c610d66565b610d66565b555f80610cac565b5f5160206115385f395f51905f52805461ffff191661ffff8316179055610ca3565b9350610d10610cd28760031c90565b5493610bac565b90610d246109fb836109b8565b8281528092610d35601f19916109b8565b0190602036910137565b634e487b7160e01b5f52601160045260245ffd5b5f198114610d615760010190565b610d3f565b5f525f5160206115585f395f51905f5260205260405f2090565b634e487b7160e01b5f52603260045260245ffd5b805115610da15760200190565b610d80565b8051821015610da15760209160051b010190565b90610dc76109fb836109b8565b8281528092610dd8601f19916109b8565b015f5b818110610de757505050565b60405190604082019180831067ffffffffffffffff84111761098d576020926040525f815260608382015282828601015201610ddb565b156100f957565b60ff1660ff8114610d615760010190565b5f80356001600160e01b03191681525f5160206115185f395f51905f52602052604090205460601c8015610e9a575b365f80375f803681845af43d5f803e15610e96573d610e92573b610e92576321f27f0d60e21b5f5260045ffd5b3d5ff35b3d5ffd5b507f85fb9346809a0d51894362fd6f50e7a5ba84526939921b0ff59f80250a25f203546001600160a01b0316610e65565b60031115610ed557565b634e487b7160e01b5f52602160045260245ffd5b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b93929091936060810160608252835180915260808201602060808360051b8501019501915f5b818110610f64575050506001600160a01b039095166020820152929350610f61926040818403910152610ee9565b90565b848703607f19018352835180516001600160a01b031688526020810151949793949293919291906003831015610ed557610fb88260606040602095946001978780970152015191816040820152019061042e565b98019401929101610f33565b8051929390929091906001600160a01b0316611215575f935b604084015191825186101561120e57610ffd8661100b925f190194610da6565b516001600160e01b03191690565b6001600160e01b031981165f9081525f5160206115185f395f51905f5260205260408120805491905591606083901c80156111ff5730146111f05760078416600781146111b5575b8161035c6110619260051b90565b916001600160e01b03199081169083160361113c575b61109a6102d9600761108e600387901c611fff1683565b951660051b61ffe01690565b926110a58560031c90565b81036110d257506040926001926001600160e01b031980831c199093169216901c17955b01949050610fdd565b61113661111a604095600195611100855f5160206115585f395f51905f529d979d905f5260205260405f2090565b546001600160e01b031980841c19909116911690911c1790565b915f5160206115585f395f51905f52905f5260205260405f2090565b556110c9565b61117761116a61036e845f5160206115185f395f51905f529063ffffffff60e01b165f5260205260405f2090565b6001600160601b03191690565b6bffffffffffffffffffffffff8416176111af835f5160206115185f395f51905f529063ffffffff60e01b165f5260205260405f2090565b55611077565b61035c9150611061906111e66111cb8760031c90565b5f5160206115585f395f51905f52905f5260205260405f2090565b5492509050611053565b631cbd473560e21b5f5260045ffd5b63273f579560e21b5f5260045ffd5b9450925050565b6305d49e0f60e41b5f5260045ffd5b80519091906001600160a01b03163b15611327575f5b6040830151805182101561132157610ffd8261125592610da6565b9061127e825f5160206115185f395f51905f529063ffffffff60e01b165f5260205260405f2090565b54918260601c80156111ff573081146111f05785516112a5906001600160a01b03166103fc565b1461131257845160019361130b916bffffffffffffffffffffffff906112e39061116a906001600160a01b03165b60601b6001600160601b03191690565b911617915f5160206115185f395f51905f529063ffffffff60e01b165f5260205260405f2090565b550161123a565b631e1edc6960e11b5f5260045ffd5b50509050565b63753f216760e01b5f5260045ffd5b80519293929091906001600160a01b0316803b15611462575081516001600160a01b03166001600160a01b031630146111f0575b5f905b6040830151805183101561145a57610ffd8361138892610da6565b946113b1865f5160206115185f395f51905f529063ffffffff60e01b165f5260205260405f2090565b5461144b5760019160e061142784936113d661116a6112d38a5160018060a01b031690565b84176114008b5f5160206115185f395f51905f529063ffffffff60e01b165f5260205260405f2090565b5561140e6007851660051b90565b996001600160e01b0319808c1c1990921691168a1c1790565b9714611437575b0191019061136d565b866114456111cb8360031c90565b5561142e565b6348d42e7f60e11b5f5260045ffd5b509150509190565b6001600160a01b0316301461136a5763753f216760e01b5f5260045ffd5b3d156114a0573d906114946109fb836109d0565b9182523d5f602084013e565b606090565b81516001600160a01b0382169081159015811861150857156114c657505050565b30036114f3575b815f929160208493519201905af46114e3611480565b50156114eb57565b3d5f803e3d5ffd5b803b6114cd5763753f216760e01b5f5260045ffd5b63cf45f9c560e01b5f5260045ffdfe85fb9346809a0d51894362fd6f50e7a5ba84526939921b0ff59f80250a25f20085fb9346809a0d51894362fd6f50e7a5ba84526939921b0ff59f80250a25f20185fb9346809a0d51894362fd6f50e7a5ba84526939921b0ff59f80250a25f202a264697066735822122019b5e9145b87f76241d1430541e1edf8dc378d4cd15366fd5f0e2aa329417c0064736f6c6343000824003385fb9346809a0d51894362fd6f50e7a5ba84526939921b0ff59f80250a25f200fe25b4374cb2b280904a684bb2057f9f429754d871a6b258ad16536918fdbd0085fb9346809a0d51894362fd6f50e7a5ba84526939921b0ff59f80250a25f20185fb9346809a0d51894362fd6f50e7a5ba84526939921b0ff59f80250a25f202';

export const routerInitAbi = [
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'AccessControl__Unauthorized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Initializable__AlreadyInitialized',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'previousAdminRole',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'newAdminRole',
        type: 'bytes32',
      },
    ],
    name: 'RoleAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleRevoked',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'contract IEnclaveAttestationVerifier',
        name: 'attestationVerifier',
        type: 'address',
      },
      {
        internalType: 'contract IECVRFVerifier',
        name: 'ecvrfVerifier',
        type: 'address',
      },
    ],
    name: 'init',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const routerInitBytecode: Hex =
  '0x608080604052346015576103bb908161001a8239f35b5f80fdfe6080806040526004361015610012575f80fd5b5f3560e01c63f09a401614610025575f80fd5b34610361576040366003190112610361576004356001600160a01b03811690819003610361576024356001600160a01b0381169290839003610361577f3ad28da30acbefd470118e3dbae81a490030b0b23b7e1445ed9d236b8053050054600160ff82161015610352577f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb384740249891600160209260ff1916177f3ad28da30acbefd470118e3dbae81a490030b0b23b7e1445ed9d236b805305005560018152a1335f9081527f66284c0762af713e202e0524bbf74efcdaa2baaf6286c0a3c4935fba6071c33160208190526040909120547f66284c0762af713e202e0524bbf74efcdaa2baaf6286c0a3c4935fba6071c33090156102e9575b505033335f7f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d8180a45f606061016f610365565b8281528260208201528260408201520152624c4b40606061018e610365565b6014815261ea606020820152620f4240604082015201526c4c4b40000f424000000000000063ea6000146dffffffffffffffffffffffffffff197f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6a541617177f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6a5566038d7ea4c680007f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6b556bffffffffffffffffffffffff60a01b7f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6c5416177f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6c556bffffffffffffffffffffffff60a01b7f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6d5416177f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6d555f80f35b80546801000000000000000081101561033e576001810180835581101561032a57815f5260205f20013390555490335f5260205260405f205560015f61013b565b634e487b7160e01b5f52603260045260245ffd5b634e487b7160e01b5f52604160045260245ffd5b6317456d5560e11b5f5260045ffd5b5f80fd5b604051906080820182811067ffffffffffffffff82111761033e5760405256fea264697066735822122085651f8208cfbf32fe779f75fc13fbda7ca862bb455b748b112dc59963297baf64736f6c63430008240033';

export const vrfFacetAbi = [
  {
    inputs: [],
    name: 'AllNodesAtCapacity',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'length',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'max',
        type: 'uint256',
      },
    ],
    name: 'CallbackDataTooLong',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint32',
        name: 'callbackGasLimit',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: 'max',
        type: 'uint32',
      },
    ],
    name: 'CallbackGasLimitTooHigh',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
    ],
    name: 'ChallengeInconclusive',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
    ],
    name: 'ChallengeRejected',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'needed',
        type: 'uint256',
      },
    ],
    name: 'InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'available',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'needed',
        type: 'uint256',
      },
    ],
    name: 'InsufficientFulfillmentGas',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidEnclaveSignature',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoActiveNodes',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'node',
        type: 'address',
      },
    ],
    name: 'NoStake',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
    ],
    name: 'RequestClosed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'staleAt',
        type: 'uint256',
      },
    ],
    name: 'RequestNotStale',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'bits',
        type: 'uint8',
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'SafeCastOverflowedUintDowncast',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'node',
        type: 'address',
      },
    ],
    name: 'UnknownNode',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
    ],
    name: 'UnknownRequest',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'fee',
        type: 'uint256',
      },
    ],
    name: 'ValueBelowFee',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'node',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'challenger',
        type: 'address',
      },
    ],
    name: 'FulfillmentChallenged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'node',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'stake',
        type: 'uint256',
      },
    ],
    name: 'NodeSlashed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'reason',
        type: 'bytes',
      },
    ],
    name: 'RandomnessCallbackFailed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'randomness',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256[4]',
        name: 'proof',
        type: 'uint256[4]',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'enclaveSignature',
        type: 'bytes',
      },
    ],
    name: 'RandomnessFulfilled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'consumer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'fulfiller',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'consumer',
            type: 'address',
          },
          {
            internalType: 'uint64',
            name: 'sequence',
            type: 'uint64',
          },
          {
            internalType: 'address',
            name: 'fulfiller',
            type: 'address',
          },
          {
            internalType: 'uint40',
            name: 'assignedAt',
            type: 'uint40',
          },
          {
            internalType: 'uint96',
            name: 'fee',
            type: 'uint96',
          },
          {
            internalType: 'uint32',
            name: 'callbackGasLimit',
            type: 'uint32',
          },
          {
            internalType: 'bytes',
            name: 'callbackData',
            type: 'bytes',
          },
        ],
        indexed: false,
        internalType: 'struct Request',
        name: 'request',
        type: 'tuple',
      },
    ],
    name: 'RandomnessRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'consumer',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'fulfiller',
        type: 'address',
      },
    ],
    name: 'StaleRequestReported',
    type: 'event',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'consumer',
            type: 'address',
          },
          {
            internalType: 'uint64',
            name: 'sequence',
            type: 'uint64',
          },
          {
            internalType: 'address',
            name: 'fulfiller',
            type: 'address',
          },
          {
            internalType: 'uint40',
            name: 'assignedAt',
            type: 'uint40',
          },
          {
            internalType: 'uint96',
            name: 'fee',
            type: 'uint96',
          },
          {
            internalType: 'uint32',
            name: 'callbackGasLimit',
            type: 'uint32',
          },
          {
            internalType: 'bytes',
            name: 'callbackData',
            type: 'bytes',
          },
        ],
        internalType: 'struct Request',
        name: 'request',
        type: 'tuple',
      },
      {
        internalType: 'uint256[4]',
        name: 'proof',
        type: 'uint256[4]',
      },
      {
        internalType: 'bytes',
        name: 'enclaveSignature',
        type: 'bytes',
      },
    ],
    name: 'challengeFulfillment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'consumer',
            type: 'address',
          },
          {
            internalType: 'uint64',
            name: 'sequence',
            type: 'uint64',
          },
          {
            internalType: 'address',
            name: 'fulfiller',
            type: 'address',
          },
          {
            internalType: 'uint40',
            name: 'assignedAt',
            type: 'uint40',
          },
          {
            internalType: 'uint96',
            name: 'fee',
            type: 'uint96',
          },
          {
            internalType: 'uint32',
            name: 'callbackGasLimit',
            type: 'uint32',
          },
          {
            internalType: 'bytes',
            name: 'callbackData',
            type: 'bytes',
          },
        ],
        internalType: 'struct Request',
        name: 'request',
        type: 'tuple',
      },
    ],
    name: 'computeRequestId',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'consumer',
            type: 'address',
          },
          {
            internalType: 'uint64',
            name: 'sequence',
            type: 'uint64',
          },
          {
            internalType: 'address',
            name: 'fulfiller',
            type: 'address',
          },
          {
            internalType: 'uint40',
            name: 'assignedAt',
            type: 'uint40',
          },
          {
            internalType: 'uint96',
            name: 'fee',
            type: 'uint96',
          },
          {
            internalType: 'uint32',
            name: 'callbackGasLimit',
            type: 'uint32',
          },
          {
            internalType: 'bytes',
            name: 'callbackData',
            type: 'bytes',
          },
        ],
        internalType: 'struct Request',
        name: 'request',
        type: 'tuple',
      },
      {
        internalType: 'uint256[4]',
        name: 'proof',
        type: 'uint256[4]',
      },
      {
        internalType: 'bytes',
        name: 'enclaveSignature',
        type: 'bytes',
      },
    ],
    name: 'fulfillRandomness',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'address',
                name: 'consumer',
                type: 'address',
              },
              {
                internalType: 'uint64',
                name: 'sequence',
                type: 'uint64',
              },
              {
                internalType: 'address',
                name: 'fulfiller',
                type: 'address',
              },
              {
                internalType: 'uint40',
                name: 'assignedAt',
                type: 'uint40',
              },
              {
                internalType: 'uint96',
                name: 'fee',
                type: 'uint96',
              },
              {
                internalType: 'uint32',
                name: 'callbackGasLimit',
                type: 'uint32',
              },
              {
                internalType: 'bytes',
                name: 'callbackData',
                type: 'bytes',
              },
            ],
            internalType: 'struct Request',
            name: 'request',
            type: 'tuple',
          },
          {
            internalType: 'uint256[4]',
            name: 'proof',
            type: 'uint256[4]',
          },
          {
            internalType: 'bytes',
            name: 'enclaveSignature',
            type: 'bytes',
          },
        ],
        internalType: 'struct Fulfillment[]',
        name: 'fulfillments',
        type: 'tuple[]',
      },
    ],
    name: 'fulfillRandomnessBatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'consumer',
            type: 'address',
          },
          {
            internalType: 'uint64',
            name: 'sequence',
            type: 'uint64',
          },
          {
            internalType: 'address',
            name: 'fulfiller',
            type: 'address',
          },
          {
            internalType: 'uint40',
            name: 'assignedAt',
            type: 'uint40',
          },
          {
            internalType: 'uint96',
            name: 'fee',
            type: 'uint96',
          },
          {
            internalType: 'uint32',
            name: 'callbackGasLimit',
            type: 'uint32',
          },
          {
            internalType: 'bytes',
            name: 'callbackData',
            type: 'bytes',
          },
        ],
        internalType: 'struct Request',
        name: 'request',
        type: 'tuple',
      },
    ],
    name: 'reportStaleRequest',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: 'sequence',
        type: 'uint64',
      },
    ],
    name: 'requestIdOf',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'callbackData',
        type: 'bytes',
      },
      {
        internalType: 'uint32',
        name: 'callbackGasLimit',
        type: 'uint32',
      },
    ],
    name: 'requestRandomness',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'callbackData',
        type: 'bytes',
      },
    ],
    name: 'requestRandomness',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

export const vrfFacetBytecode: Hex =
  '0x60808060405234601557611973908161001a8239f35b5f80fdfe60806040526004361015610011575f80fd5b5f3560e01c8063166ef2d3146103fb578063397e84071461037e5780633c0c51491461035b57806370e519ea146103235780637dfaaeb214610239578063c22d702b146100e9578063e6dee7ed1461009e5763f46f5a4c14610071575f80fd5b3461009a57602061009261008d36610088366105ff565b61077d565b610923565b604051908152f35b5f80fd5b602036600319011261009a576004356001600160401b03811161009a576100926100ce6020923690600401610576565b906100d761084e565b9163ffffffff60408401511691610fa5565b3461009a576100f7366105ff565b61010081611268565b906060810164ffffffffff610114826106b6565b16601e81018091116102255780421061020f575064ffffffffff6101cc8192604085019561018561016c61014789610632565b6001600160a01b03165f9081525f5160206118fe5f395f51905f526020526040902090565b9661018061017982610632565b89836114f6565b610632565b906001600160a01b0361019789610632565b16916001600160a01b0316907faca250571c2d1a8910e9db8cb146bf3f13fe87b05a51f768a77f1a99db6dada55f80a46106b6565b925460a01c1691161015806101f5575b6101e257005b6101ee6101f391610632565b610cc8565b005b5061020761020282610632565b610646565b5415156101dc565b8363042cf29f60e41b5f5260045260245260445ffd5b634e487b7160e01b5f52601160045260245ffd5b3461009a57602036600319011261009a576004356001600160401b03811161009a573660238201121561009a5780600401356001600160401b03811161009a573660248260051b8401011161009a573682900360e219015f5b828110156101f35760248160051b85010135908282121561009a576001918501602481016102c761008d3661008884806108bb565b91826102e66102e160206102db86806108bb565b016108d0565b6114c0565b540361031b57610315928261030b610300826044966108bb565b9160c48501906108e4565b94909301916112dc565b01610292565b505050610315565b3461009a57602036600319011261009a576004356001600160401b038116810361009a576103526020916114c0565b54604051908152f35b3461009a576101f361036c366105a3565b9261037981939293611268565b6112dc565b604036600319011261009a576004356001600160401b03811161009a576103a9903690600401610576565b6024359063ffffffff82169283830361009a576103c461084e565b9363ffffffff606086015116908181116103e657602061009287878787610fa5565b631aaf7a3960e31b5f5260045260245260445ffd5b3461009a57610409366105a3565b9261041960408294939401610632565b9361042385610646565b54158015610531575b6105135761044161008d61044a93369061077d565b938385876109f3565b6001600160a01b0383165f9081527f7103b4d0a53003ec91f983abf6fa980e867f1e66bd497d2fb88c0b44a170b766602052604090209082604051805f905b600282106104f95750506104a893506104a36040826106f7565b610b71565b6104e7576104b582610cc8565b33916001600160a01b0316907f24ea7f05b6d88add6416ea559acc12c38d99f4819657f6d97375749b4d1fd7f15f80a4005b63022e577d60e01b5f5260045260245ffd5b855481526001958601958794509190910190602001610489565b63089858e760e11b5f9081526001600160a01b038616600452602490fd5b5061053e606083016106b6565b6001600160a01b0386165f9081525f5160206118fe5f395f51905f52602052604090205460a01c64ffffffffff90811691161061042c565b9181601f8401121561009a578235916001600160401b03831161009a576020838186019501011161009a57565b60c060031982011261009a576004356001600160401b03811161009a5760e0818303600319011261009a57600401918160a41161009a5760249160a435906001600160401b03821161009a576105fb91600401610576565b9091565b602060031982011261009a57600435906001600160401b03821161009a5760e090829003600319011261009a5760040190565b356001600160a01b038116810361009a5790565b6001600160a01b03165f9081527f7103b4d0a53003ec91f983abf6fa980e867f1e66bd497d2fb88c0b44a170b7656020526040902090565b6001600160a01b03165f9081527f20d409567c11d0919b4e92edadabde986fedc1be9872cbd35d9bd2797c19df016020526040902090565b3564ffffffffff8116810361009a5790565b60e081019081106001600160401b038211176106e357604052565b634e487b7160e01b5f52604160045260245ffd5b90601f801991011681019081106001600160401b038211176106e357604052565b35906001600160a01b038216820361009a57565b6001600160401b0381116106e357601f01601f191660200190565b9291926107538261072c565b9161076160405193846106f7565b82948184528183011161009a578281602093845f960137010152565b919060e08382031261009a5760405190610796826106c8565b81936107a181610718565b835260208101356001600160401b038116810361009a5760208401526107c960408201610718565b6040840152606081013564ffffffffff8116810361009a57606084015260808101356001600160601b038116810361009a57608084015260a081013563ffffffff8116810361009a5760a084015260c0810135906001600160401b03821161009a570181601f8201121561009a5760c09181602061084993359101610747565b910152565b60405190608082018281106001600160401b038211176106e35760405281606063ffffffff7f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6a5461ffff81168452818160101c166020850152818160301c16604085015260501c16910152565b90359060de198136030182121561009a570190565b356001600160401b038116810361009a5790565b903590601e198136030182121561009a57018035906001600160401b03821161009a5760200191813603831361009a57565b9190820180921161022557565b60018060a01b03815116906001600160401b036020820151169060018060a01b036040820151169064ffffffffff6060820151166001600160601b036080830151169060c063ffffffff60a08501511693015160208151910120936040519560208701974689523060408901527f7761cd2343be786e645192697256ccf13964ba0842c707c0b5c82927457bbf036060890152608088015260a087015260c086015260e085015261010084015261012083015261014082015261014081526109ed610160826106f7565b51902090565b939190610b2a939160405160806020820192833760808152610a1660a0826106f7565b5190209060405160208101907f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f82527f7761cd2343be786e645192697256ccf13964ba0842c707c0b5c82927457bbf0360408201527fad7c5bef027816a800da1736444fb58a807ef4c9603b7848673f7e3a68eb14a560608201524660808201523060a082015260a08152610aac60c0826106f7565b519020916040519060208201927f540d1d4a3b1e015ee1e083d8e0cd77023873121a4337a572f23ea698268fa7f284526040830152606082015260608152610af56080826106f7565b51902060405190602082019261190160f01b84526022830152604282015260428152610b226062826106f7565b51902061156e565b6001600160a01b03918216911603610b3e57565b63169ae4bb60e31b5f5260045ffd5b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b9091610b7c81611615565b9160018060a01b037f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6d54169060405185602082015260208152610bc06040826106f7565b604051632efa56d360e21b81529384925f600485015b60028210610cae5750505082610c036040959360808394604485013760e060c484015260e4830190610b4d565b03915afa5f9181610c71575b50610c625750503d15610c5b573d610c268161072c565b90610c3460405192836106f7565b81523d5f602083013e5b5115610c4957505f90565b63abb0c06560e01b5f5260045260245ffd5b6060610c3e565b90915015610c6e571590565b90565b9091506040813d604011610ca6575b81610c8d604093836106f7565b8101031261009a5751801515810361009a57905f610c0f565b3d9150610c80565b825181528795506020928301926001929092019101610bd6565b6001600160a01b0381165f8181525f5160206118fe5f395f51905f52602052604090209091610cf681610646565b54825460f81c6003811015610f91576001859114610e43575b7f94c1cb5a30eb84463733f8aa89d572686b6f043379602056dd68dc711c674c476020610df295610d61857f7103b4d0a53003ec91f983abf6fa980e867f1e66bd497d2fb88c0b44a170b76854610916565b7f7103b4d0a53003ec91f983abf6fa980e867f1e66bd497d2fb88c0b44a170b76855546040519485526001600160a01b031693a3825f525f5160206118fe5f395f51905f526020525f60408120555f610db982610646565b556001600160a01b03165f9081527f7103b4d0a53003ec91f983abf6fa980e867f1e66bd497d2fb88c0b44a170b7666020526040902090565b5f5b60028110610e365750505f527f7103b4d0a53003ec91f983abf6fa980e867f1e66bd497d2fb88c0b44a170b76760205260405f2064ffffffffff198154169055565b5f82820155600101610df4565b5f525f5160206118fe5f395f51905f5260205260405f205463ffffffff8160c81c165f51602061191e5f395f51905f52545f19810190811161022557808203610f13575b5050505f51602061191e5f395f51905f52548015610eff577f94c1cb5a30eb84463733f8aa89d572686b6f043379602056dd68dc711c674c476020610df29587935f1901610ed481611639565b81549060018060a01b039060031b1b191690555f51602061191e5f395f51905f525595505050610d0f565b634e487b7160e01b5f52603160045260245ffd5b610f1f610f3791611639565b905460039190911b1c6001600160a01b031691611639565b81546001600160a01b0360039290921b91821b19169083901b1790555f9081525f5160206118fe5f395f51905f5260205260408120805463ffffffff60c81b191663ffffffff60c81b909316929092179091558080610e87565b634e487b7160e01b5f52602160045260245ffd5b91939293612000821161124f57610fda610fd363ffffffff61ffff8160208a01511698511693169687610916565b3a90611669565b9060640161ffff81116102255760649161ffff610ff8921690611669565b046001600160601b038111611238576001600160601b031691346111ed5761101f3361067e565b548084116111d257836110319161162c565b61103a3361067e565b555b7fb030fd56553f4f2dae49dfdc45a72f7c3f0ffc51b5ce5d63ba0b79f996fa9ec6546001600160401b038116916001600160401b0383146102255761115a967f61f0d89cf5862f3be39f040567a6e4e0b352c6d878a279631e439a6044c3446a926001600160401b036001860116906001600160401b031916177fb030fd56553f4f2dae49dfdc45a72f7c3f0ffc51b5ce5d63ba0b79f996fa9ec6556111cd6110e48561169a565b9663ffffffff604051936110f7856106c8565b3385526001600160601b0361114060208701978a8952604088019c60018060a01b03168d52606088019b64ffffffffff42168d526080890196875260a089019485523691610747565b9360c0870194855261115187610923565b809e819b6114c0565b5586518c516040805160208082529a516001600160a01b039081169b82019b909b529a516001600160401b0316908b01529c51881660608a01529a5164ffffffffff166080890152511660a0870152511660c08501525160e0808501529682169691909516948291610100830190610b4d565b0390a4565b839063db42144d60e01b5f523360045260245260445260645ffd5b823410611221578234111561103c57611206833461162c565b61121a6112123361067e565b918254610916565b905561103c565b8263c5c2209b60e01b5f523460045260245260445ffd5b6306dfcc6560e41b5f52606060045260245260445ffd5b5063dbd65ec560e01b5f5260045261200060245260445ffd5b906112856102e1602061127e61008d368761077d565b94016108d0565b54908282146112b85750156112a657637bbe34c960e01b5f5260045260245ffd5b632edf717f60e01b5f5260045260245ffd5b9050565b908060209392818452848401375f828201840152601f01601f1916010190565b9392604082016001600160a01b036112f382610632565b165f525f5160206118fe5f395f51905f5260205260405f20908154908160f81c6003811015610f915715611497579061133b8785888b61133661134b9897610632565b6109f3565b6001600160a01b031690846114f6565b61135483611615565b9182156113c257907f025b8f33a41b03a003154a46303feddb0716230d10bf9260ebaf559394796d88946113ac925f945b156113b1575b5060806040519586958652602086013760c060a085015260c08401916112bc565b0390a2565b6113bc90858961179a565b5f61138b565b90600160208501351660020180600211610225575f602091604051908382019060ff60f81b9060f81b16815287356021830152602182526114046041836106f7565b61144360016022604051809488820196607f60f91b8852600360f81b60218401525180918484015e810187838201520301601e198101845201826106f7565b604051918291518091835e8101838152039060025afa1561148c577f025b8f33a41b03a003154a46303feddb0716230d10bf9260ebaf559394796d88946113ac925f5194611385565b6040513d5f823e3d90fd5b6114a090610632565b63f517438960e01b5f9081526001600160a01b0391909116600452602490fd5b6001600160401b03165f527fb030fd56553f4f2dae49dfdc45a72f7c3f0ffc51b5ce5d63ba0b79f996fa9ec760205260405f2090565b5f6115066102e1602084016108d0565b5561ffff825460e81c1680158015611543575b5050608091500135906001600160601b03821680920361009a5761121261153f9161067e565b9055565b61022557825461ffff60e81b19165f1990910160e81b61ffff60e81b16179091556080905f80611519565b906041830361160e578260201161009a578035918360401161009a57602082013593604010156115fa577f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a084116115f2576020935f9360406080948151948552013560f81c868401526040830152606082015282805260015afa1561148c575f5190565b505050505f90565b634e487b7160e01b5f52603260045260245ffd5b5050505f90565b8035159081611622575090565b6020915001351590565b9190820391821161022557565b5f51602061191e5f395f51905f52548110156115fa575f51602061191e5f395f51905f525f5260205f2001905f90565b8181029291811591840414171561022557565b8115611686570690565b634e487b7160e01b5f52601260045260245ffd5b905f51602061191e5f395f51905f525491821561177a57826001600160401b036116c4921661167c565b5f905b8382106116dd5763141a589360e21b5f5260045ffd5b6116e681611639565b905460039190911b1c6001600160a01b03165f8181525f5160206118fe5f395f51905f5260205260409020805460e81c61ffff16906101f4821061174657505050600181018091116102255761173e8460019261167c565b9101906116c7565b925061ffff919495508093501461022557805461ffff60e81b191660019290920160e81b61ffff60e81b1691909117905590565b636eb533ef60e11b5f5260045ffd5b3563ffffffff8116810361009a5790565b916117a481610632565b91823b156118f75760a08201916117ba83611789565b643fffffffc063ffffffff82169160061b16908082046040149015171561022557603f9004619c40810180911161022557805a106118e1575092845f63ffffffff61185b829661185684976118168b60c06118489d01906108e4565b9b906040519c8d93602085019a63e59646ff60e01b8c52602486015260448501526060606485015260848401916112bc565b03601f1981018b528a6106f7565b611789565b16926060965193f115806118ab575b611872575050565b6113ac7fc516ed2c8da59d8ee3f3a13b91d2e92747ab6bedd57a3fb5dad0032fa9a329a091604051918291602083526020830190610b4d565b3d915061010082116118d7575b60405191601f19603f82011683016040528083525f602084013e61186a565b61010091506118b8565b5a632d6868f160e01b5f5260045260245260445ffd5b5050505056fe7103b4d0a53003ec91f983abf6fa980e867f1e66bd497d2fb88c0b44a170b7637103b4d0a53003ec91f983abf6fa980e867f1e66bd497d2fb88c0b44a170b764a26469706673582212200b1a70182b72d2c3f18ba4f9ddb1dd6c597f2076caebb516db162d0a80f8edf564736f6c63430008240033';

export const nodesFacetAbi = [
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'AccessControl__Unauthorized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'AttestationRejected',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'node',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'until',
        type: 'uint256',
      },
    ],
    name: 'ChallengeWindowOpen',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'held',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'requested',
        type: 'uint256',
      },
    ],
    name: 'InsufficientSlashedStake',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'node',
        type: 'address',
      },
    ],
    name: 'NodeAlreadyRegistered',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'node',
        type: 'address',
      },
    ],
    name: 'NodeNotActive',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'node',
        type: 'address',
      },
    ],
    name: 'NodeNotExiting',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'node',
        type: 'address',
      },
    ],
    name: 'NotOperator',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'TransferFailed',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'sent',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'required',
        type: 'uint256',
      },
    ],
    name: 'WrongStake',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'node',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
    ],
    name: 'NodeExitRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'node',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'stake',
        type: 'uint256',
      },
    ],
    name: 'NodeRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'previousAdminRole',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'newAdminRole',
        type: 'bytes32',
      },
    ],
    name: 'RoleAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'SlashedStakeWithdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'node',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'stake',
        type: 'uint256',
      },
    ],
    name: 'StakeWithdrawn',
    type: 'event',
  },
  {
    inputs: [],
    name: 'activeNodeCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'activeNodes',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'nodeAddress',
        type: 'address',
      },
    ],
    name: 'exitedAtOf',
    outputs: [
      {
        internalType: 'uint40',
        name: '',
        type: 'uint40',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'nodeAddress',
        type: 'address',
      },
    ],
    name: 'node',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'operator',
            type: 'address',
          },
          {
            internalType: 'uint40',
            name: 'registeredAt',
            type: 'uint40',
          },
          {
            internalType: 'uint32',
            name: 'activeIndex',
            type: 'uint32',
          },
          {
            internalType: 'uint16',
            name: 'pending',
            type: 'uint16',
          },
          {
            internalType: 'enum NodeStatus',
            name: 'status',
            type: 'uint8',
          },
        ],
        internalType: 'struct Nodes.Node',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'nodeAddress',
        type: 'address',
      },
    ],
    name: 'publicKeyOf',
    outputs: [
      {
        internalType: 'uint256[2]',
        name: '',
        type: 'uint256[2]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[2]',
        name: 'publicKey',
        type: 'uint256[2]',
      },
      {
        internalType: 'bytes',
        name: 'attestation',
        type: 'bytes',
      },
    ],
    name: 'registerNode',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'nodeAddress',
        type: 'address',
      },
    ],
    name: 'requestExit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'slashedStake',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'nodeAddress',
        type: 'address',
      },
    ],
    name: 'stakeOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdrawSlashedStake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'nodeAddress',
        type: 'address',
      },
    ],
    name: 'withdrawStake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const nodesFacetBytecode: Hex =
  '0x60808060405234601557610e32908161001a8239f35b5f80fdfe6080806040526004361015610012575f80fd5b5f3560e01c90816307f1965114610b0c5750806328cb1e38146109245780632eb1ef5c146108f157806342623360146108c55780634a4c84d3146107af5780635e8af8d21461072157806375340815146106f8578063788fa386146106bc578063a26fd1c314610312578063bffbe61c1461020c5763c23a5cea14610095575f80fd5b34610208576020366003190112610208576100ae610bcc565b6100b781610cc8565b5460f81c60038110156101f4576002036101d45764ffffffffff6100da82610c20565b54166201518081018091116101c05780421061019e57506100fa81610c58565b546001600160a01b0382165f8181525f516020610dbd5f395f51905f52602052604081208190559192909161012e82610c58565b5561013881610c90565b5f5b6002811061019157505061014d90610c20565b805464ffffffffff191690556101638233610d0d565b6040519182527fb7c918e0e249f999e965cafeb6c664271b3f4317d296461500e71da39f0cbda360203393a3005b5f8282015560010161013a565b63759dfc1560e01b5f9081526001600160a01b03909216600452602452604490fd5b634e487b7160e01b5f52601160045260245ffd5b6364f5c6e160e01b5f9081526001600160a01b0391909116600452602490fd5b634e487b7160e01b5f52602160045260245ffd5b5f80fd5b3461020857602036600319011261020857610225610bcc565b5f608060405161023481610be2565b828152826020820152826040820152826060820152015260018060a01b03165f525f516020610dbd5f395f51905f5260205260405f206040519061027782610be2565b5460018060a01b03811682526020820164ffffffffff8260a01c168152604083019163ffffffff8160c81c168352606084019061ffff8160e81c16825260f81c91608085019360038410156101f45764ffffffffff63ffffffff9261ffff9587526040519760018060a01b039051168852511660208701525116604085015251166060830152519060038210156101f45760a0916080820152f35b606036600319011261020857366044116102085760443567ffffffffffffffff811161020857366023820112156102085780600401359067ffffffffffffffff8211610208573660248383010111610208577f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6b548034036106a657508160209160245f60a460018060a01b037f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6c5416936040519788968795869363771afe0160e11b855233600486015260406004838701376080606486015282608486015201848401378181018301849052601f01601f191681010301925af190811561069b575f91610660575b501561065157604051602081016004358152602435604083015260408252610443606083610bfe565b905190206001600160a01b03165f8181525f516020610dbd5f395f51905f52602052604090205460f81c60038110156101f45761063f5763ffffffff5f516020610ddd5f395f51905f5254166040519061049c82610be2565b3382524264ffffffffff16602080840191825260408085019384525f606086018181526001608088019081528883525f516020610dbd5f395f51905f529094529190209451855493519451915160c89290921b63ffffffff60c81b1660a09590951b64ffffffffff60a01b166001600160a01b039091166001600160f81b031990941693909317929092179290921760e89190911b61ffff60e81b161782555160038110156101f45781546001600160f81b031660f89190911b6001600160f81b0319161790555f516020610ddd5f395f51905f52546801000000000000000081101561062b57816105a38260016105c794015f516020610ddd5f395f51905f5255610d78565b81546001600160a01b0393841660039290921b91821b9390911b1916919091179055565b346105d182610c58565b556105db81610c90565b60045f5b600281106106175783604051903482527ff22e9632bbbe87913fdb2f413389be6b979d648eebfe4dc4d1c9fa2b14b84d6060203393a3005b6001906020833593019281850155016105df565b634e487b7160e01b5f52604160045260245ffd5b63295548e560e01b5f5260045260245ffd5b638614ce0960e01b5f5260045ffd5b90506020813d602011610693575b8161067b60209383610bfe565b8101031261020857518015158103610208578161041a565b3d915061066e565b6040513d5f823e3d90fd5b630239dc1360e61b5f523460045260245260445ffd5b34610208575f3660031901126102085760207f7103b4d0a53003ec91f983abf6fa980e867f1e66bd497d2fb88c0b44a170b76854604051908152f35b34610208575f3660031901126102085760205f516020610ddd5f395f51905f5254604051908152f35b346102085760203660031901126102085761073a610bcc565b61075560409182805161074d8282610bfe565b369037610c90565b8151905f825b60028210610799575050506107708282610bfe565b8151905f825b6002821061078357505050f35b6020806001928551815201930191019091610776565b600160208192855481520193019101909161075b565b34610208576040366003190112610208576107c8610bcc565b335f9081527f66284c0762af713e202e0524bbf74efcdaa2baaf6286c0a3c4935fba6071c33160205260409020546024359190156108ae577f7103b4d0a53003ec91f983abf6fa980e867f1e66bd497d2fb88c0b44a170b76854808311610897578281039081116101c0577f52fec009a7bb363351e19fc7928d085c142e7a33b3d503de4dab2aa393f9ad77916020917f7103b4d0a53003ec91f983abf6fa980e867f1e66bd497d2fb88c0b44a170b768556108848482610d0d565b6040519384526001600160a01b031692a2005b9050633b7202ef60e21b5f5260045260245260445ffd5b630c4705d560e01b5f525f6004523360245260445ffd5b346102085760203660031901126102085760206108e86108e3610bcc565b610c58565b54604051908152f35b3461020857602036600319011261020857602064ffffffffff61091a610915610bcc565b610c20565b5416604051908152f35b346102085760203660031901126102085761093d610bcc565b61094681610cc8565b5460f81c60038110156101f457600103610aec576001600160a01b0381165f8181525f516020610dbd5f395f51905f5260205260409020545f516020610ddd5f395f51905f52549192915f1981019160c81c63ffffffff169082116101c057818103610a7e575b50505f516020610ddd5f395f51905f5254908115610a6a57610a2d915f19016109d581610d78565b81546001600160a01b0360039290921b9190911b191690555f516020610ddd5f395f51905f52555f8381525f516020610dbd5f395f51905f526020526040902080546001600160f81b0316600160f91b179055610c20565b805464ffffffffff19164264ffffffffff1617905533907f25506670d438786dfea1245a3c94cb6d555e9d58ffabbc37e8bd84cce342e4985f80a3005b634e487b7160e01b5f52603160045260245ffd5b610a8a610ae592610d78565b905460039190911b1c6001600160a01b0316610aa9816105a384610d78565b5f9081525f516020610dbd5f395f51905f5260205260409020805463ffffffff60c81b191660c89290921b63ffffffff60c81b16919091179055565b82806109ad565b6303398f4160e51b5f9081526001600160a01b0391909116600452602490fd5b34610208575f366003190112610208575f516020610ddd5f395f51905f5254908181526020810180925f516020610ddd5f395f51905f525f5260205f20905f5b818110610bad5750505081610b62910382610bfe565b604051918291602083019060208452518091526040830191905f5b818110610b8b575050500390f35b82516001600160a01b0316845285945060209384019390920191600101610b7d565b82546001600160a01b0316845260209093019260019283019201610b4c565b600435906001600160a01b038216820361020857565b60a0810190811067ffffffffffffffff82111761062b57604052565b90601f8019910116810190811067ffffffffffffffff82111761062b57604052565b6001600160a01b03165f9081527f7103b4d0a53003ec91f983abf6fa980e867f1e66bd497d2fb88c0b44a170b7676020526040902090565b6001600160a01b03165f9081527f7103b4d0a53003ec91f983abf6fa980e867f1e66bd497d2fb88c0b44a170b7656020526040902090565b6001600160a01b03165f9081527f7103b4d0a53003ec91f983abf6fa980e867f1e66bd497d2fb88c0b44a170b7666020526040902090565b6001600160a01b039081165f8181525f516020610dbd5f395f51905f52602052604090208054909392163303610cfb5750565b633b63649d60e11b5f5260045260245ffd5b5f80808085855af13d15610d73573d67ffffffffffffffff811161062b5760405190610d43601f8201601f191660200183610bfe565b81525f60203d92013e5b15610d56575050565b630e21dcbb60e11b5f5260018060a01b031660045260245260445ffd5b610d4d565b5f516020610ddd5f395f51905f5254811015610da8575f516020610ddd5f395f51905f525f5260205f2001905f90565b634e487b7160e01b5f52603260045260245ffdfe7103b4d0a53003ec91f983abf6fa980e867f1e66bd497d2fb88c0b44a170b7637103b4d0a53003ec91f983abf6fa980e867f1e66bd497d2fb88c0b44a170b764a26469706673582212201a94d21b755355417d76a72bebf78b4f6baf158460dd06e44ff5f17cc26aec0564736f6c63430008240033';

export const balancesFacetAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'needed',
        type: 'uint256',
      },
    ],
    name: 'InsufficientBalance',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'TransferFailed',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Deposited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Withdrawn',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const balancesFacetBytecode: Hex =
  '0x608080604052346015576102b5908161001a8239f35b5f80fdfe60806040526004361015610011575f80fd5b5f3560e01c806370a0823114610206578063f340fa01146101945763f3fef3a31461003a575f80fd5b3461019057604036600319011261019057610053610249565b60243590335f525f5160206102605f395f51905f5260205260405f20548083116101755782810390811161016157335f525f5160206102605f395f51905f5260205260405f20555f80808085855af13d1561015c573d67ffffffffffffffff81116101485760405190601f8101601f19908116603f0116820167ffffffffffffffff8111838210176101485760405281525f60203d92013e5b1561012b576040519182526001600160a01b03169033907fd1c19fbcd4551a5edfb66d43d2e337c04837afda3482b42bdf569a8fccdae5fb90602090a3005b630e21dcbb60e11b5f5260018060a01b031660045260245260445ffd5b634e487b7160e01b5f52604160045260245ffd5b6100ec565b634e487b7160e01b5f52601160045260245ffd5b905063db42144d60e01b5f523360045260245260445260645ffd5b5f80fd5b6020366003190112610190576001600160a01b036101b0610249565b16805f525f5160206102605f395f51905f5260205260405f208054903482018092116101615755604051903482527f8752a472e571a816aea92eec8dae9baf628e840f4929fbcc2d155e6233ff68a760203393a3005b346101905760203660031901126101905761021f610249565b60018060a01b03165f525f5160206102605f395f51905f52602052602060405f2054604051908152f35b600435906001600160a01b03821682036101905756fe20d409567c11d0919b4e92edadabde986fedc1be9872cbd35d9bd2797c19df01a2646970667358221220a47bbfde25dfcda6421ae188e4260a11e4fa407cd467adf76f6bb889ee1d35c964736f6c63430008240033';

export const configFacetAbi = [
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'AccessControl__Unauthorized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EnumerableSet__IndexOutOfBounds',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidPricing',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'previousAdminRole',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'newAdminRole',
        type: 'bytes32',
      },
    ],
    name: 'RoleAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'RoleRevoked',
    type: 'event',
  },
  {
    inputs: [],
    name: 'attestationVerifier',
    outputs: [
      {
        internalType: 'contract IEnclaveAttestationVerifier',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ecvrfVerifier',
    outputs: [
      {
        internalType: 'contract IECVRFVerifier',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
    ],
    name: 'getRoleAdmin',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'index',
        type: 'uint256',
      },
    ],
    name: 'getRoleMember',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
    ],
    name: 'getRoleMemberCount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'hasRole',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nodeStake',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pricing',
    outputs: [
      {
        components: [
          {
            internalType: 'uint16',
            name: 'premiumPercent',
            type: 'uint16',
          },
          {
            internalType: 'uint32',
            name: 'fulfillmentOverheadGas',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'defaultCallbackGasLimit',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'maxCallbackGasLimit',
            type: 'uint32',
          },
        ],
        internalType: 'struct Config.Pricing',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'role',
        type: 'bytes32',
      },
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IEnclaveAttestationVerifier',
        name: 'verifier',
        type: 'address',
      },
    ],
    name: 'setAttestationVerifier',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IECVRFVerifier',
        name: 'verifier',
        type: 'address',
      },
    ],
    name: 'setEcvrfVerifier',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'stake',
        type: 'uint256',
      },
    ],
    name: 'setNodeStake',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint16',
            name: 'premiumPercent',
            type: 'uint16',
          },
          {
            internalType: 'uint32',
            name: 'fulfillmentOverheadGas',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'defaultCallbackGasLimit',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'maxCallbackGasLimit',
            type: 'uint32',
          },
        ],
        internalType: 'struct Config.Pricing',
        name: 'next',
        type: 'tuple',
      },
    ],
    name: 'setPricing',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const configFacetBytecode: Hex =
  '0x6080806040523460155761098b908161001a8239f35b5f80fdfe60806040526004361015610011575f80fd5b5f3560e01c8063248a9ca3146106e25780632f2ff15d146105db578063611a212e1461059f5780637ce91411146104f657806382f6f6081461046e578063894eed841461036c5780638bb9c5bf1461034f5780639010d07c146102e457806391d1485414610291578063a9b90c9714610209578063b4b3c5a0146101c2578063ca15c8731461018c578063d547741f14610149578063de44e94a146101025763f73ad1ee146100be575f80fd5b346100fe5760203660031901126100fe576100d761078d565b6004357f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6b55005b5f80fd5b346100fe575f3660031901126100fe577f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6d546040516001600160a01b039091168152602090f35b346100fe5761018a61015a36610721565b90610185610180825f525f5160206109365f395f51905f52602052600260405f20015490565b6107d9565b610826565b005b346100fe5760203660031901126100fe576004355f525f5160206109365f395f51905f52602052602060405f2054604051908152f35b346100fe575f3660031901126100fe577f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6c546040516001600160a01b039091168152602090f35b346100fe5760203660031901126100fe576004356001600160a01b038116908190036100fe5761023761078d565b6bffffffffffffffffffffffff60a01b7f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6d5416177f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6d555f80f35b346100fe5760206102da6102a436610721565b5f9182525f5160206109365f395f51905f52845260408083206001600160a01b0390921683526001909101602052902054151590565b6040519015158152f35b346100fe5760403660031901126100fe576024356004355f525f5160206109365f395f51905f5260205260405f208054821015610340576020916103279161090c565b905460405160039290921b1c6001600160a01b03168152f35b63e637bf3b60e01b5f5260045ffd5b346100fe5760203660031901126100fe5761018a33600435610826565b346100fe5760803660031901126100fe5761038561078d565b61038d610767565b63ffffffff8061039b61077a565b1691161161045f5760043561ffff81168091036100fe577f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6a5460243563ffffffff811681036100fe5765ffffffff000069ffffffff0000000000006103fe610767565b60301b169263ffffffff60501b61041361077a565b60501b169463ffffffff60501b199169ffffffffffffffffffff191617169160101b161717177f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6a555f80f35b6302b87b6760e01b5f5260045ffd5b346100fe5760203660031901126100fe576004356001600160a01b038116908190036100fe5761049c61078d565b6bffffffffffffffffffffffff60a01b7f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6c5416177f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6c555f80f35b346100fe575f3660031901126100fe575f6060610511610747565b8281528260208201528260408201520152608061052c610747565b63ffffffff7f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6a548161ffff8216938481528160208201818560101c1681528160606040850194828860301c168652019560501c168552604051968752511660208601525116604084015251166060820152f35b346100fe575f3660031901126100fe5760207f932f5a960894e1533b50dc61a5ed814ad5141d345b5c48c89b71c631b170bc6b54604051908152f35b346100fe576105e936610721565b61060e610180835f525f5160206109365f395f51905f52602052600260405f20015490565b815f525f5160206109365f395f51905f5260205260405f209060018060a01b03169061064882826001915f520160205260405f2054151590565b15610677575b5033917f2f8788117e7eff1d82e926ec794901d17c78024a50270940304540a733656f0d5f80a4005b8054680100000000000000008110156106ce576106b461069e82600186940185558461090c565b819391549060031b91821b915f19901b19161790565b90556001815491835f520160205260405f2055600161064e565b634e487b7160e01b5f52604160045260245ffd5b346100fe5760203660031901126100fe5760206107196004355f525f5160206109365f395f51905f52602052600260405f20015490565b604051908152f35b60409060031901126100fe57600435906024356001600160a01b03811681036100fe5790565b604051906080820182811067ffffffffffffffff8211176106ce57604052565b60443563ffffffff811681036100fe5790565b60643563ffffffff811681036100fe5790565b335f9081527f66284c0762af713e202e0524bbf74efcdaa2baaf6286c0a3c4935fba6071c3316020526040902054156107c257565b630c4705d560e01b5f525f6004523360245260445ffd5b805f525f5160206109365f395f51905f526020526108083360405f206001915f520160205260405f2054151590565b156108105750565b630c4705d560e01b5f526004523360245260445ffd5b90815f525f5160206109365f395f51905f5260205260405f209060018060a01b0316906001810190825f528160205260405f20548061088b575b50505033917ff6391f5c32d9c69d2a47ea670b442974b53935d1edc7fd64eb21e047a839171b5f80a4565b6108995f198354018361090c565b90549060031b1c806108b161069e5f1985018661090c565b90555f528260205260405f2055805480156108f8575f1901906108d4828261090c565b8154905f199060031b1b1916905555815f526020525f604081205560015f80610860565b634e487b7160e01b5f52603160045260245ffd5b8054821015610921575f5260205f2001905f90565b634e487b7160e01b5f52603260045260245ffdfe409a779b06f7ed4482e4a4bbaf0e0febf249036642c5bc5fb6c71bf2a72d5d00a2646970667358221220f819a57f1fb1da7fd96995f919ce84ceb1c59d341f059d845dc8894611b557c164736f6c63430008240033';

export const iVrfReceiverAbi = [
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'randomness',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'callbackData',
        type: 'bytes',
      },
    ],
    name: 'onRandomnessFulfilled',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const iVrfReceiverBytecode: Hex = '0x';

export const ecvrfVerifierAbi = [
  {
    inputs: [],
    name: 'InvalidProof',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256[2]',
        name: 'publicKey',
        type: 'uint256[2]',
      },
      {
        internalType: 'uint256[4]',
        name: 'proof',
        type: 'uint256[4]',
      },
      {
        internalType: 'bytes',
        name: 'alpha',
        type: 'bytes',
      },
      {
        internalType: 'uint256[2]',
        name: 'uPoint',
        type: 'uint256[2]',
      },
      {
        internalType: 'uint256[4]',
        name: 'vComponents',
        type: 'uint256[4]',
      },
    ],
    name: 'fastVerify',
    outputs: [
      {
        internalType: 'bool',
        name: 'fulfillable',
        type: 'bool',
      },
      {
        internalType: 'bytes32',
        name: 'randomness',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256[2]',
        name: 'publicKey',
        type: 'uint256[2]',
      },
      {
        internalType: 'uint256[4]',
        name: 'proof',
        type: 'uint256[4]',
      },
      {
        internalType: 'bytes',
        name: 'alpha',
        type: 'bytes',
      },
    ],
    name: 'verify',
    outputs: [
      {
        internalType: 'bool',
        name: 'fulfillable',
        type: 'bool',
      },
      {
        internalType: 'bytes32',
        name: 'randomness',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
] as const;

export const ecvrfVerifierBytecode: Hex =
  '0x60808060405234601557611328908161001a8239f35b5f80fdfe60806040526004361015610011575f80fd5b5f3560e01c806345899df4146100345763bbe95b4c1461002f575f80fd5b610114565b346100ab576101a03660031901126100ab5761004f366100af565b610058366100ca565b9060c4359167ffffffffffffffff83116100ab5761007d6100979336906004016100e6565b90610087366100bc565b92610091366100d7565b9461026c565b604080519215158352602083019190915290f35b5f80fd5b906004916044116100ab57565b9060e491610124116100ab57565b9060449160c4116100ab57565b90610124916101a4116100ab57565b9181601f840112156100ab5782359167ffffffffffffffff83116100ab57602083818601950101116100ab57565b346100ab5760e03660031901126100ab5761012e366100af565b610137366100ca565b60c4359167ffffffffffffffff83116100ab5761015b6100979336906004016100e6565b929091610301565b634e487b7160e01b5f52604160045260245ffd5b90601f8019910116810190811067ffffffffffffffff82111761019957604052565b610163565b906101ac6040519283610177565b565b9190604051926101bf604085610177565b8390604081019283116100ab57905b8282106101da57505050565b81358152602091820191016101ce565b9190604051926101fb608085610177565b8390608081019283116100ab57905b82821061021657505050565b813581526020918201910161020a565b92919267ffffffffffffffff82116101995760405191610250601f8201601f191660200184610177565b8294818452818301116100ab578281602093845f960137010152565b939261028961028f92969361028136886101ae565b923691610226565b90610478565b909391156102f5576102a56102cc9536906101ae565b906102c66102be6102b6368a6101ea565b9436906101ae565b9436906101ea565b94610532565b156102e6576102e19060208101359035610637565b600191565b6309bde33960e01b5f5260045ffd5b5050505050505f905f90565b9192610289610315929461028136866101ae565b91939093156103d257836103c59261037b95836103356103c19560600190565b35926103bb6103b3604084013599610361846103598d84356020860135918c610694565b9a9099610726565b909886359d8e9d6103728960200190565b359e8f91610726565b929091610388604061019e565b9a8b5260208b015261039a608061019e565b9a8b5260208b015260408a0152606089015236906101ae565b9236906101ea565b92610532565b1590565b6102e6576102e191610637565b505050505f905f90565b805191908290602001825e015f815290565b607f60f91b8152600160f81b6001820152610417929161041191600201906103dc565b906103dc565b90565b634e487b7160e01b5f52601160045260245ffd5b60ff1660ff811461043f5760010190565b61041a565b61045190600293926103dc565b60f89190911b6001600160f81b03191681525f60018201520190565b6040513d5f823e3d90fd5b6104926104b29161048b81519160200190565b5190610748565b6104a4604051938492602084016103ee565b03601f198101835282610177565b5f5b603260ff8216106104c95750505f905f905f90565b60205f6104ef6040516104e3816104a48789888401610444565b604051918280926103dc565b039060025afa1561052d575f516105058161077f565b61050f81836107e1565b61052357505061051e9061042e565b6104b4565b6001949193509150565b61046d565b9491939290606082018051969061056a6103c160408601998a519961055981519160200190565b518a519160208c019c8d519461088e565b908115610619575b5080156105ec575b6105e1576fffffffffffffffffffffffffffffffff956105d9956105b96105d3968051906105a88160200190565b5160408201519160600151926109c7565b9590946105c882519260200190565b5192519351946109f7565b60801c90565b915191161490565b505050505050505f90565b506106146103c1885185516106018760200190565b5160408901519160608a015b5193610960565b61057a565b61063191506103c190518651858561060d8a60200190565b5f610572565b6106846106726104e3600161064f6020965f96610748565b604051607f60f91b88820152600360f81b602182015293849160228301906103dc565b86815203601e19810184520182610177565b039060025afa1561052d575f5190565b6106f99192936106f16106eb7f483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b87f79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f817986106eb95610b5e565b91610be2565b959094610b5e565b6401000003d01903926401000003d019841161043f57610722936401000003d019900692610aaf565b9091565b916106eb9161072293610b5e565b634e487b7160e01b5f52601260045260245ffd5b90600116600201908160021161043f576040519160ff60f81b9060f81b166020830152602182015260218152610417604182610177565b6107b49063400000f4600160fe1b03906401000003d01990816007815f840908906401000003d0199081818009900908610db0565b6002810180821161043f576001166107c95790565b6401000003d019036401000003d019811161043f5790565b80158015610841575b8015610839575b8015610829575b610823576401000003d01990818180090960076401000003d0199108906401000003d0199080091490565b50505f90565b506401000003d0198210156107f8565b5081156107f1565b506401000003d0198110156107ea565b70014551231950b75fc4402da1732fc9bebe19039070014551231950b75fc4402da1732fc9bebe19821161043f57565b9190820391821161043f57565b9160ff9160209460016108c26108a75f979a999a610851565b70014551231950b75fc4402da1732fc9bebe19900693610851565b70014551231950b75fc4402da1732fc9bebe19900691161515851461095857601c925b60405194859460808601948370014551231950b75fc4402da1732fc9bebe1991098652168785015280604085015270014551231950b75fc4402da1732fc9bebe1991096060830152838052039060015afa1561052d57610947905f5192610a80565b6001600160a01b0390811691161490565b601b926108e5565b9293926020925f926080929091600116156109bf57601c915b60ff60405193868552168684015280604084015270014551231950b75fc4402da1732fc9bebe199109606082015282805260015afa1561052d57610947905f5192610a80565b601b91610979565b91926401000003d01903916401000003d019831161043f57610722936401000003d019935f939085900692610b12565b610411946104115f98610411610a3960209c610a33610a5c9c610a2d6104e39c610a2760019d9c6106729c610748565b9b610748565b97610748565b93610748565b93604051998a97607f60f91b8f8a01528960f91b60218a015260228901906103dc565b039060025afa1561052d575f51806040515290565b8115610a7b570490565b610734565b6040519160208301918252604083015260408252610a9f606083610177565b905190206001600160a01b031690565b929091808403610af557506401000003d019908208610ad05750505f905f90565b610722915f610ae6926401000003d019926111e4565b905b6401000003d01992610cde565b61072293610b0c936401000003d019939291610eba565b90610ae8565b93949390929091808303610b4e57508315610a7b5783908308610b3957505050505f905f90565b61072293610b489284926111e4565b91610cde565b6107229550610b48938593610eba565b929091926001908015610bd8575f94600194869392805b610b825750505050929190565b60018116610bad575b905f610ba49260011c9485946401000003d0199361125a565b92909293610b75565b93610bc9908484845f9a610ba4969c6401000003d01995611050565b90989097509094909150610b8b565b5050909190600190565b919291908315158481610ccd575b5080610cc5575b15610c8f575f936401000003d019856001835b610c3857505050506401000003d01984800991826401000003d0199109936401000003d01992839109900990565b610c458484999599610a71565b928192610a7b57610c81610c6c610c87936401000003d0199087096401000003d019610881565b5f966401000003d019919008939980956112df565b90610881565b929083610c0a565b60405162461bcd60e51b815260206004820152600e60248201526d24b73b30b634b210373ab6b132b960911b6044820152606490fd5b506001610bf7565b6401000003d019141590505f610bf0565b91939291841515838682610d67575b505080610d5e575b15610c8f575f9483159081856001835b610d225750505050610a7b57829081808780098092099509900990565b610d2f84839b959b610a71565b918193610a7b57610c8189610d4a81610d5695870982610881565b5f9708949b80946112df565b929183610d05565b50821515610cf5565b14159050835f610ced565b15610d7957565b60405162461bcd60e51b815260206004820152600f60248201526e4d6f64756c7573206973207a65726f60881b6044820152606490fd5b610dba6001610d72565b8015610823578115610e5157600191600160ff1b9190825b610ddc5750505090565b9091926401000003d019908483161515840a906401000003d019908009096401000003d01990600185901c83161515840a9082908009096401000003d01990600285901c83161515840a9082908009096401000003d01990600385901c83161515840a9082908009099260041c919082610dd2565b5050600190565b60405190610e67608083610177565b6080368337565b15610e7557565b60405162461bcd60e51b815260206004820152601e60248201527f557365206a6163446f75626c652066756e6374696f6e20696e737465616400006044820152606490fd5b9391909492841580611048575b61103c57811580611034575b61102957610edf610e58565b958315610a7b578380938160018009808a529882808b6001099460208301958652604083018c81529a82808e6001099160608601928352610f20608061019e565b9d5190098c5251900960208a0152519009604087015251900960608401528251936040840194855114801590611017575b610f5a90610e6e565b81610f63610e58565b9551610f70865183610881565b9008855281606085015161100c8288818060208b0195610f91875183610881565b900899602083019a8b5281808c8180808089518a5190099360408a01948552610fc18286518c5190099a60600190565b998a52518009610fd2895183610881565b9008610fe8828088518651900960020983610881565b90089d51935190519009610ffc8d83610881565b9008900993519051900983610881565b900894510991929190565b50602084015160608501511415610f51565b505050909190600190565b508015610ed3565b90945092506001919050565b508515610ec7565b96949695939091958015806111dc575b6111d0578315806111c8575b6111bd57611078610e58565b928515610a7b5788948694858093818c800983528183518d0995602084019687528280604086019b81818009808e52900991606086019283526110bb608061019e565b9b5190098a52519009602088015251900960408501525190096060820152818151956110e78360400190565b968751148015906111ab575b6110fc90610e6e565b81611105610e58565b9751611112855183610881565b9008875281606084015161119e828a818060208a0195611133875183610881565b90089860208301998a5281808b8180808089518a5190099360408a019485526111638286518c5190099a60600190565b998a52518009611174895183610881565b900861118a828088518651900960020983610881565b90089c51935190519009610ffc8c83610881565b9008965192969509900990565b506020830151606084015114156110f3565b935050945050929190565b50811561106c565b50959450509050929190565b508215611060565b9391939290928115610a7b578180858009918180808060018009998180808988096004099b800990099280096003090882868008830383811161043f57839081838009088084039284841161043f578480918009600809840384811161043f578460019381809681959b08900908940960020990565b90939194929480156112d7578215610a7b57828086800992818080808680099a8180808a88096004099c80099009928009600309089183878008840384811161043f5784908185800908908185039085821161043f57858091800960080985039085821161043f5785948580949281939b08900908940960020990565b909450919050565b8181029291811591840414171561043f5756fea2646970667358221220f3d0a2c66900944a22fc28c3eb0c1f201ac9b7a2b087e5c3c6b969aab768c82d64736f6c63430008240033';

export const trustedOperatorEnclaveKeyVerifierAbi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'OwnableInvalidOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'trusted',
        type: 'bool',
      },
    ],
    name: 'TrustedOperatorUpdated',
    type: 'event',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: 'trusted',
        type: 'bool',
      },
    ],
    name: 'setTrustedOperator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'trustedOperators',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'operator',
        type: 'address',
      },
      {
        internalType: 'uint256[2]',
        name: '',
        type: 'uint256[2]',
      },
      {
        internalType: 'bytes',
        name: 'proof',
        type: 'bytes',
      },
    ],
    name: 'verify',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const trustedOperatorEnclaveKeyVerifierBytecode: Hex =
  '0x608080604052346071573315605e575f8054336001600160a01b0319821681178355916001600160a01b03909116907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a361033190816100768239f35b631e4fbdf760e01b5f525f60045260245ffd5b5f80fdfe60806040526004361015610011575f80fd5b5f3560e01c8063715018a61461023d5780638da5cb5b14610216578063a285f1c314610199578063b4317d531461015c578063ee35fc02146100e45763f2fde38b1461005b575f80fd5b346100e05760203660031901126100e057610074610294565b61007c6102d5565b6001600160a01b031680156100cd575f80546001600160a01b03198116831782556001600160a01b0316907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09080a3005b631e4fbdf760e01b5f525f60045260245ffd5b5f80fd5b346100e05760803660031901126100e0576100fd610294565b366064116100e05760643567ffffffffffffffff81116100e057366023820112156100e057806004013567ffffffffffffffff81116100e05736602482840101116100e05760209260246101529301906102aa565b6040519015158152f35b346100e05760203660031901126100e0576001600160a01b0361017d610294565b165f526001602052602060ff60405f2054166040519015158152f35b346100e05760403660031901126100e0576101b2610294565b602435908115158092036100e05760207f2e4746592fbf3f346fff4993672957b8e58f533eaaca7a25d1676602f1150a03916101ec6102d5565b60018060a01b031692835f526001825260405f2060ff1981541660ff8316179055604051908152a2005b346100e0575f3660031901126100e0575f546040516001600160a01b039091168152602090f35b346100e0575f3660031901126100e0576102556102d5565b5f80546001600160a01b0319811682556001600160a01b03167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e08280a3005b600435906001600160a01b03821682036100e057565b6001600160a01b03165f9081526001602052604090205460ff1691506102d09050575f90565b600190565b5f546001600160a01b031633036102e857565b63118cdaa760e01b5f523360045260245ffdfea264697066735822122058daae2938774495579cb74f8507f06312a993a29b766dd4a7099cb3cafae8f164736f6c63430008240033';

/** The router seen through every facet at once: what a consumer or a node calls. */
export const verifyNetworkRouterAbi = [
  ...vrfFacetAbi,
  ...nodesFacetAbi,
  ...balancesFacetAbi,
  ...configFacetAbi,
] as const;
