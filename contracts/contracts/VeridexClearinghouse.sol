// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IBlockProver {
    function verifySingle(
        uint256 chainKey,
        uint256 blockHeight,
        bytes calldata txBytes,
        bytes32[] calldata merkleProof,
        bytes calldata continuityProof
    ) external view returns (bool);

    function calculateTxIndex(bytes32[] calldata merkleProof) external pure returns (uint32);
}

contract VeridexClearinghouse {
    address public constant BLOCK_PROVER = 0x0000000000000000000000000000000000000FD2;

    address public immutable trustedSourceVault;
    uint256 public immutable sourceChainKey;

    struct SeniorityRecord {
        address funder;
        uint256 blockHeight;
        uint32 txIndex;
        uint256 seniorityKey;
        uint256 amount;
    }

    mapping(bytes32 => SeniorityRecord) public seniority;
    mapping(bytes32 => bool) public processedProofs;
    uint32 public depositCount;

    event SeniorityEstablished(bytes32 indexed tradeId, address indexed funder, uint256 blockHeight, uint32 txIndex);
    event JuniorPosition(bytes32 indexed tradeId, address indexed funder, uint32 txIndex, uint32 seniorTxIndex);

    constructor(address _trustedSourceVault, uint256 _sourceChainKey) {
        require(_trustedSourceVault != address(0), "invalid vault");
        trustedSourceVault = _trustedSourceVault;
        sourceChainKey = _sourceChainKey;
    }

    function fund(bytes32 tradeId) external payable {
        require(tradeId != bytes32(0), "invalid trade");
        require(msg.value > 0, "invalid amount");

        depositCount += 1;
        _recordPosition(tradeId, msg.sender, msg.value, block.number, depositCount);
    }

    function processCapitalLock(
        bytes32 tradeId,
        address funder,
        uint256 amount,
        uint256 blockHeight,
        bytes calldata txBytes,
        bytes32[] calldata merkleProof,
        bytes calldata continuityProof
    ) external {
        require(funder != address(0), "invalid funder");
        require(amount > 0, "invalid amount");
        require(merkleProof.length > 0, "empty proof");

        bytes32 proofHash = keccak256(abi.encode(sourceChainKey, blockHeight, txBytes, merkleProof));
        require(!processedProofs[proofHash], "proof processed");

        bool valid = IBlockProver(BLOCK_PROVER).verifySingle(
            sourceChainKey,
            blockHeight,
            txBytes,
            merkleProof,
            continuityProof
        );
        require(valid, "invalid proof");

        uint32 txIndex = IBlockProver(BLOCK_PROVER).calculateTxIndex(merkleProof);
        _recordPosition(tradeId, funder, amount, blockHeight, txIndex);
        processedProofs[proofHash] = true;
    }

    function _recordPosition(
        bytes32 tradeId,
        address funder,
        uint256 amount,
        uint256 blockHeight,
        uint32 txIndex
    ) internal {
        uint256 seniorityKey = (blockHeight << 32) | uint256(txIndex);
        SeniorityRecord storage current = seniority[tradeId];

        if (current.seniorityKey == 0 || seniorityKey < current.seniorityKey) {
            if (current.funder != address(0) && current.funder != funder) {
                emit JuniorPosition(tradeId, current.funder, current.txIndex, txIndex);
            }

            seniority[tradeId] = SeniorityRecord({
                funder: funder,
                blockHeight: blockHeight,
                txIndex: txIndex,
                seniorityKey: seniorityKey,
                amount: amount
            });

            emit SeniorityEstablished(tradeId, funder, blockHeight, txIndex);
            return;
        }

        emit JuniorPosition(tradeId, funder, txIndex, current.txIndex);
    }
}
