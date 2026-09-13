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

    struct Place {
        address funder;
        uint256 amount;
        uint256 blockHeight;
        uint32 index;
        bool paidBack;
    }

    mapping(bytes32 => Place[]) private line;
    mapping(bytes32 => uint256) public repaid;
    mapping(bytes32 => uint256) public paidOut;
    mapping(bytes32 => bool) public processedProofs;
    uint32 public depositCount;

    event Funded(bytes32 indexed tradeId, address indexed funder, uint256 amount, uint256 place);
    event Repaid(bytes32 indexed tradeId, address indexed payer, uint256 amount);
    event PaidBack(bytes32 indexed tradeId, address indexed funder, uint256 amount, uint256 place);

    constructor(address _trustedSourceVault, uint256 _sourceChainKey) {
        require(_trustedSourceVault != address(0), "invalid vault");
        trustedSourceVault = _trustedSourceVault;
        sourceChainKey = _sourceChainKey;
    }

    function fund(bytes32 tradeId) external payable {
        require(tradeId != bytes32(0), "invalid trade");
        require(msg.value > 0, "invalid amount");
        _addPlace(tradeId, msg.sender, msg.value, block.number);
    }

    function repay(bytes32 tradeId) external payable {
        require(tradeId != bytes32(0), "invalid trade");
        require(msg.value > 0, "invalid amount");
        require(line[tradeId].length > 0, "nobody paid in");
        repaid[tradeId] += msg.value;
        emit Repaid(tradeId, msg.sender, msg.value);
    }

    function getPaidBack(bytes32 tradeId) external {
        Place[] storage places = line[tradeId];
        uint256 available = repaid[tradeId] - paidOut[tradeId];

        for (uint256 i = 0; i < places.length; i++) {
            if (places[i].paidBack) {
                continue;
            }
            require(places[i].funder == msg.sender, "not your turn");
            require(available >= places[i].amount, "loan has not paid back enough");

            places[i].paidBack = true;
            paidOut[tradeId] += places[i].amount;

            (bool ok, ) = payable(msg.sender).call{value: places[i].amount}("");
            require(ok, "payout failed");

            emit PaidBack(tradeId, msg.sender, places[i].amount, i);
            return;
        }

        revert("nothing to collect");
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
        _insertByConfirmOrder(tradeId, funder, amount, blockHeight, txIndex);
        processedProofs[proofHash] = true;
    }

    function lineSize(bytes32 tradeId) external view returns (uint256) {
        return line[tradeId].length;
    }

    function lineAt(
        bytes32 tradeId,
        uint256 i
    ) external view returns (address funder, uint256 amount, uint256 blockHeight, uint32 index, bool paidBack) {
        Place storage place = line[tradeId][i];
        return (place.funder, place.amount, place.blockHeight, place.index, place.paidBack);
    }

    function unpaidTotal(bytes32 tradeId) external view returns (uint256 total) {
        Place[] storage places = line[tradeId];
        for (uint256 i = 0; i < places.length; i++) {
            if (!places[i].paidBack) {
                total += places[i].amount;
            }
        }
    }

    function _addPlace(bytes32 tradeId, address funder, uint256 amount, uint256 blockHeight) internal {
        depositCount += 1;
        line[tradeId].push(
            Place({
                funder: funder,
                amount: amount,
                blockHeight: blockHeight,
                index: depositCount,
                paidBack: false
            })
        );
        emit Funded(tradeId, funder, amount, line[tradeId].length - 1);
    }

    function _insertByConfirmOrder(
        bytes32 tradeId,
        address funder,
        uint256 amount,
        uint256 blockHeight,
        uint32 index
    ) internal {
        Place[] storage places = line[tradeId];
        uint256 n = places.length;
        uint256 at = n;
        for (uint256 i = 0; i < n; i++) {
            Place storage current = places[i];
            if (blockHeight < current.blockHeight || (blockHeight == current.blockHeight && index < current.index)) {
                at = i;
                break;
            }
        }
        for (uint256 j = at; j < n; j++) {
            require(!places[j].paidBack, "cannot cut a paid place");
        }

        Place memory incoming = Place({
            funder: funder,
            amount: amount,
            blockHeight: blockHeight,
            index: index,
            paidBack: false
        });
        places.push(incoming);
        for (uint256 k = n; k > at; k--) {
            places[k] = places[k - 1];
        }
        places[at] = incoming;
        depositCount += 1;
        emit Funded(tradeId, funder, amount, at);
    }
}
