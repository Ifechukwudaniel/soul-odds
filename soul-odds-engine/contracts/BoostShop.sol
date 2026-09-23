// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20Minimal {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/// @notice Sells leveled and one-shot gameplay boosts, paid in `token` (the game's wager ERC20).
///
/// Each boost has a base price and a per-purchase growth multiplier (in
/// basis points): the price of the next purchase is `basePrice *
/// growthBps^level / 10_000^level`, matching the doubling-cost curve the
/// game already used off-chain (`cost * 2` per purchase) by default
/// (`growthBps = 20_000`).
///
/// This contract only tracks what was paid and each buyer's level per
/// boost — it has no opinion on what a boost *does* in-game. That mapping
/// (boostId -> gameplay effect) lives off-chain, same as today.
///
/// Pricing here is a placeholder curve, not an actuarial one: nothing in
/// this repo currently ties a boost's price to the expected extra payout
/// it grants (e.g. boost id 5's +1% payout/level pays real balance on
/// every future win). `setBoost` lets the owner retune price/growth/cap
/// per boost without a redeploy once real numbers are worked out — ship
/// conservative starting prices and tighten `maxLevel` before opening
/// this to real funds.
///
/// Buyers must `token.approve(shop, ...)` before calling `purchase`, same as any ERC20 spend.
contract BoostShop is Ownable {
    struct BoostDefinition {
        uint96 basePrice;
        uint32 growthBps; // 10_000 = no growth, 20_000 = doubles each purchase
        uint32 maxLevel; // 0 means the boost has not been configured yet
        bool active;
    }

    error BoostShop__UnknownBoost(uint8 boostId);
    error BoostShop__BoostInactive(uint8 boostId);
    error BoostShop__MaxLevelReached(uint8 boostId, uint32 level);
    error BoostShop__InvalidGrowth();
    error BoostShop__InvalidMaxLevel();
    error BoostShop__TransferFailed();

    event BoostConfigured(uint8 indexed boostId, uint96 basePrice, uint32 growthBps, uint32 maxLevel);
    event BoostPurchased(address indexed buyer, uint8 indexed boostId, uint32 newLevel, uint256 pricePaid);
    event Withdrawn(address indexed to, uint256 amount);

    address public immutable token;

    mapping(uint8 => BoostDefinition) public boosts;
    mapping(uint8 => mapping(address => uint32)) public levelOf;

    constructor(address owner_, address token_) Ownable(owner_) {
        token = token_;
    }

    /// @notice Configures (or reconfigures) one boost slot. Existing buyer levels are untouched.
    function setBoost(uint8 boostId, uint96 basePrice, uint32 growthBps, uint32 maxLevel, bool active)
        external
        onlyOwner
    {
        if (growthBps == 0) revert BoostShop__InvalidGrowth();
        if (maxLevel == 0) revert BoostShop__InvalidMaxLevel();

        boosts[boostId] = BoostDefinition({
            basePrice: basePrice,
            growthBps: growthBps,
            maxLevel: maxLevel,
            active: active
        });

        emit BoostConfigured(boostId, basePrice, growthBps, maxLevel);
    }

    /// @notice The price (in `token` units) `buyer`'s next purchase of `boostId` would cost right now.
    function currentPrice(uint8 boostId, address buyer) public view returns (uint256 price) {
        BoostDefinition memory boost = boosts[boostId];
        if (boost.maxLevel == 0) revert BoostShop__UnknownBoost(boostId);

        uint32 level = levelOf[boostId][buyer];
        price = boost.basePrice;
        for (uint32 i; i < level; ++i) {
            price = (price * boost.growthBps) / 10_000;
        }
    }

    /// @notice Buys the next level of `boostId` for `msg.sender`, pulling payment via `token`.
    function purchase(uint8 boostId) external {
        BoostDefinition memory boost = boosts[boostId];
        if (boost.maxLevel == 0) revert BoostShop__UnknownBoost(boostId);
        if (!boost.active) revert BoostShop__BoostInactive(boostId);

        uint32 level = levelOf[boostId][msg.sender];
        if (level >= boost.maxLevel) revert BoostShop__MaxLevelReached(boostId, level);

        uint256 price = currentPrice(boostId, msg.sender);

        uint32 newLevel = level + 1;
        levelOf[boostId][msg.sender] = newLevel;

        emit BoostPurchased(msg.sender, boostId, newLevel, price);

        if (!IERC20Minimal(token).transferFrom(msg.sender, address(this), price)) {
            revert BoostShop__TransferFailed();
        }
    }

    /// @notice Sweeps collected `token` to `to`.
    function withdraw(address to, uint256 amount) external onlyOwner {
        if (!IERC20Minimal(token).transfer(to, amount)) revert BoostShop__TransferFailed();
        emit Withdrawn(to, amount);
    }
}
