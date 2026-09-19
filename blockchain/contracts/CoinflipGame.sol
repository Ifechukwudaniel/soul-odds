// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { ICasinoGameV2, SessionContext, SessionPhase, StepResult } from './ICasinoGameV2.sol';

/// @notice Flip `coinCount` coins (1-10), call heads or tails, win if at least `minWins` land on
///         the picked side. Coin `i` is heads iff bit `i` of the VRF word is set. Fixed 98% RTP:
///         payout = wager * 0.98 * 2^coinCount / winningWays(coinCount, minWins).
/// @dev `gameData` = abi.encode(bool pickHeads, uint8 coinCount, uint8 minWins).
///      `gameState` = abi.encode(bool pickHeads, uint8 coinCount, uint8 minWins, bytes32 randomness),
///      with `randomness == 0` meaning "not settled yet" — mirrored client-side in
///      `src/components/casino-coinflip/lib/coinflip.ts`.
contract CoinflipGame is ICasinoGameV2 {
  uint256 private constant BASIS_POINTS = 10_000;
  uint256 private constant RTP_BPS = 9800;
  uint8 private constant MAX_COIN_COUNT = 10;

  error CoinflipGame__InvalidCoinCount(uint8 coinCount);
  error CoinflipGame__InvalidGameData();
  error CoinflipGame__InvalidMinWins(uint8 minWins, uint8 coinCount);
  error CoinflipGame__InvalidState();
  error CoinflipGame__NoPlayerAction();

  function quoteCaps(
    uint256 wager,
    bytes calldata gameData
  ) external pure returns (uint256 maxEscrowStake, uint256 maxReservedProfit) {
    (, uint8 coinCount, uint8 minWins) = _decodeBet(gameData);
    maxEscrowStake = wager;
    maxReservedProfit = _maxReservedProfit(wager, coinCount, minWins);
  }

  function quoteRiskParams(
    uint256 wager,
    bytes calldata gameData
  )
    external
    pure
    returns (uint256 maxPayout, uint256 probabilityWad, uint256 expectedPayout, uint256 subJackpotVarianceScaled)
  {
    (, uint8 coinCount, uint8 minWins) = _decodeBet(gameData);
    maxPayout = _maxPayout(wager, coinCount, minWins);
    probabilityWad = (_winningWays(coinCount, minWins) * 1e18) / (1 << coinCount);
    expectedPayout = (wager * RTP_BPS) / BASIS_POINTS;
    subJackpotVarianceScaled = 0;
  }

  function onSessionStart(SessionContext calldata ctx) external pure returns (StepResult memory stepResult) {
    (bool pickHeads, uint8 coinCount, uint8 minWins) = _decodeBet(ctx.gameData);
    uint256 maxReservedProfit = _maxReservedProfit(ctx.wagerBase, coinCount, minWins);

    stepResult.newGameState = abi.encode(pickHeads, coinCount, minWins, bytes32(0));
    stepResult.escrowDelta = 0;
    stepResult.reservedProfitDelta = int256(maxReservedProfit);
    stepResult.nextPhase = SessionPhase.WAITING_RANDOMNESS;
    stepResult.requestRandomnessNow = true;
    stepResult.payout = 0;
  }

  function onPlayerAction(SessionContext calldata, bytes calldata) external pure returns (StepResult memory) {
    revert CoinflipGame__NoPlayerAction();
  }

  function onRandomness(
    SessionContext calldata ctx,
    bytes32 randomness
  ) external pure returns (StepResult memory stepResult) {
    (bool pickHeads, uint8 coinCount, uint8 minWins, bytes32 settledRandomness) =
      abi.decode(ctx.gameState, (bool, uint8, uint8, bytes32));
    if (settledRandomness != bytes32(0)) revert CoinflipGame__InvalidState();

    uint8 headsCount = _countHeads(randomness, coinCount);
    uint8 pickedSideWins = pickHeads ? headsCount : coinCount - headsCount;
    bool won = pickedSideWins >= minWins;

    stepResult.newGameState = abi.encode(pickHeads, coinCount, minWins, randomness);
    stepResult.escrowDelta = 0;
    // Reserve stays put on the settling step — the facet releases it itself (see
    // CONTRACT_CONSTRAINTS.md, "Don't release reserved profit on the settling step").
    stepResult.reservedProfitDelta = 0;
    stepResult.nextPhase = SessionPhase.SETTLED;
    stepResult.requestRandomnessNow = false;
    stepResult.payout = won ? _maxPayout(ctx.wagerBase, coinCount, minWins) : 0;
  }

  function quoteForfeitPayout(SessionContext calldata) external pure returns (uint256 cashoutValue) {
    // Instant game: never sits in WAITING_PLAYER_ACTION, so there is nothing to cash out mid-round.
    return 0;
  }

  /// @dev Coin `i` is heads iff bit `i` of `randomness` is set.
  function _countHeads(bytes32 randomness, uint8 coinCount) private pure returns (uint8 headsCount) {
    uint256 word = uint256(randomness);
    for (uint8 i = 0; i < coinCount; i++) {
      if ((word >> i) & 1 == 1) headsCount++;
    }
  }

  function _decodeBet(bytes calldata gameData) private pure returns (bool pickHeads, uint8 coinCount, uint8 minWins) {
    if (gameData.length != 96) revert CoinflipGame__InvalidGameData();
    (pickHeads, coinCount, minWins) = abi.decode(gameData, (bool, uint8, uint8));
    if (coinCount == 0 || coinCount > MAX_COIN_COUNT) revert CoinflipGame__InvalidCoinCount(coinCount);
    if (minWins == 0 || minWins > coinCount) revert CoinflipGame__InvalidMinWins(minWins, coinCount);
  }

  /// @dev Sum_{wins=minWins}^{coinCount} C(coinCount, wins), computed via the standard
  ///      multiplicative binomial-coefficient formula (mirrors the client's `nCk`/`winningWays`).
  function _winningWays(uint8 coinCount, uint8 minWins) private pure returns (uint256 ways) {
    for (uint8 wins = minWins; wins <= coinCount; wins++) {
      ways += _nCk(coinCount, wins);
    }
  }

  function _nCk(uint8 n, uint8 k) private pure returns (uint256 result) {
    if (k > n) return 0;
    uint8 effectiveK = k < n - k ? k : n - k;
    result = 1;
    for (uint8 i = 1; i <= effectiveK; i++) {
      result = (result * (n - effectiveK + i)) / i;
    }
  }

  /// @dev Floor math: wager * RTP_BPS * 2^coinCount / (BASIS_POINTS * winningWays).
  function _maxPayout(uint256 wager, uint8 coinCount, uint8 minWins) private pure returns (uint256) {
    uint256 totalWays = 1 << coinCount;
    uint256 ways = _winningWays(coinCount, minWins);
    return (wager * RTP_BPS * totalWays) / (BASIS_POINTS * ways);
  }

  function _maxReservedProfit(uint256 wager, uint8 coinCount, uint8 minWins) private pure returns (uint256) {
    uint256 payout = _maxPayout(wager, coinCount, minWins);
    return payout > wager ? payout - wager : 0;
  }
}
