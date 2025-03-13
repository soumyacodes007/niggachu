// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PokemonBattle
 * @dev Smart contract for managing Pokemon card battle wagers
 */
contract PokemonBattle {
    // Battle structure to store information about each battle
    struct Battle {
        address creator;
        address joiner;
        uint256 betAmount;
        bool isActive;
        bool isPaid;
        address winner;
        uint256 createdAt;
    }

    // Mapping of battle codes to Battle structs
    mapping(string => Battle) public battles;
    
    // Events to track contract actions
    event BattleCreated(string battleCode, address creator, uint256 betAmount, uint256 timestamp);
    event BattleJoined(string battleCode, address joiner, uint256 timestamp);
    event PrizeDistributed(string battleCode, address winner, uint256 amount, uint256 timestamp);
    event BetsRefunded(string battleCode, address creator, address joiner, uint256 amount, uint256 timestamp);
    event BattleCancelled(string battleCode, uint256 timestamp);

    // Modifier to check if the sender is the battle creator
    modifier onlyCreator(string memory battleCode) {
        require(battles[battleCode].creator == msg.sender, "Only battle creator can call this function");
        _;
    }

    // Modifier to check if the battle exists
    modifier battleExists(string memory battleCode) {
        require(battles[battleCode].creator != address(0), "Battle does not exist");
        _;
    }

    // Modifier to check if the battle is active
    modifier battleActive(string memory battleCode) {
        require(battles[battleCode].isActive, "Battle is not active");
        _;
    }

    /**
     * @dev Creates a new battle
     * @param battleCode Unique identifier for the battle
     */
    function createBattle(string memory battleCode) external payable {
        require(msg.value > 0, "Bet amount must be greater than 0");
        require(battles[battleCode].creator == address(0), "Battle code already exists");
        
        battles[battleCode] = Battle({
            creator: msg.sender,
            joiner: address(0),
            betAmount: msg.value,
            isActive: true,
            isPaid: false,
            winner: address(0),
            createdAt: block.timestamp
        });
        
        emit BattleCreated(battleCode, msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Allows a player to join an existing battle
     * @param battleCode Unique identifier for the battle
     */
    function joinBattle(string memory battleCode) external payable battleExists(battleCode) battleActive(battleCode) {
        Battle storage battle = battles[battleCode];
        
        require(battle.joiner == address(0), "Battle already has a joiner");
        require(msg.sender != battle.creator, "Creator cannot join their own battle");
        require(msg.value == battle.betAmount, "Bet amount must match creator's bet");
        
        battle.joiner = msg.sender;
        
        emit BattleJoined(battleCode, msg.sender, block.timestamp);
    }

    /**
     * @dev Distributes the prize to the winner
     * @param battleCode Unique identifier for the battle
     * @param winner Address of the winner
     */
    function distributePrize(string memory battleCode, address winner) 
        external 
        battleExists(battleCode) 
        battleActive(battleCode) 
        onlyCreator(battleCode) 
    {
        Battle storage battle = battles[battleCode];
        
        require(battle.joiner != address(0), "Battle has no joiner");
        require(!battle.isPaid, "Prize already distributed");
        require(winner == battle.creator || winner == battle.joiner, "Winner must be creator or joiner");
        
        battle.isActive = false;
        battle.isPaid = true;
        battle.winner = winner;
        
        uint256 totalPrize = battle.betAmount * 2;
        (bool success, ) = winner.call{value: totalPrize}("");
        require(success, "Failed to send prize");
        
        emit PrizeDistributed(battleCode, winner, totalPrize, block.timestamp);
    }

    /**
     * @dev Refunds bets to both players in case of a tie
     * @param battleCode Unique identifier for the battle
     * @param creatorAddress Address of the battle creator
     * @param joinerAddress Address of the battle joiner
     */
    function refundBets(string memory battleCode, address creatorAddress, address joinerAddress) 
        external 
        battleExists(battleCode) 
        battleActive(battleCode) 
        onlyCreator(battleCode) 
    {
        Battle storage battle = battles[battleCode];
        
        require(battle.joiner != address(0), "Battle has no joiner");
        require(!battle.isPaid, "Bets already refunded or paid out");
        require(creatorAddress == battle.creator, "Invalid creator address");
        require(joinerAddress == battle.joiner, "Invalid joiner address");
        
        battle.isActive = false;
        battle.isPaid = true;
        
        uint256 betAmount = battle.betAmount;
        
        (bool success1, ) = creatorAddress.call{value: betAmount}("");
        require(success1, "Failed to refund creator");
        
        (bool success2, ) = joinerAddress.call{value: betAmount}("");
        require(success2, "Failed to refund joiner");
        
        emit BetsRefunded(battleCode, creatorAddress, joinerAddress, betAmount, block.timestamp);
    }

    /**
     * @dev Cancels a battle and refunds the creator if no one has joined
     * @param battleCode Unique identifier for the battle
     */
    function cancelBattle(string memory battleCode) 
        external 
        battleExists(battleCode) 
        battleActive(battleCode) 
        onlyCreator(battleCode) 
    {
        Battle storage battle = battles[battleCode];
        
        require(battle.joiner == address(0), "Cannot cancel battle after someone has joined");
        
        battle.isActive = false;
        battle.isPaid = true;
        
        (bool success, ) = battle.creator.call{value: battle.betAmount}("");
        require(success, "Failed to refund creator");
        
        emit BattleCancelled(battleCode, block.timestamp);
    }

    /**
     * @dev Checks if a battle exists
     * @param battleCode Unique identifier for the battle
     * @return bool Whether the battle exists
     */
    function battleExists(string memory battleCode) public view returns (bool) {
        return battles[battleCode].creator != address(0);
    }

    /**
     * @dev Gets information about a battle
     * @param battleCode Unique identifier for the battle
     * @return creator Address of the battle creator
     * @return joiner Address of the battle joiner
     * @return betAmount Amount bet by each player
     * @return isActive Whether the battle is active
     * @return isPaid Whether the prize has been paid out
     * @return winner Address of the winner
     */
    function getBattleInfo(string memory battleCode) 
        external 
        view 
        returns (
            address creator,
            address joiner,
            uint256 betAmount,
            bool isActive,
            bool isPaid,
            address winner
        ) 
    {
        Battle memory battle = battles[battleCode];
        return (
            battle.creator,
            battle.joiner,
            battle.betAmount,
            battle.isActive,
            battle.isPaid,
            battle.winner
        );
    }
} 