import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { network } from 'hardhat';
import { type Address, getAddress, parseEther } from 'viem';

describe('BoostShop', async () => {
  const { viem } = await network.getOrCreate();
  const publicClient = await viem.getPublicClient();
  const [owner, buyer, stranger] = await viem.getWalletClients();

  const BOOST_ID = 5; // "Divine Luck"
  const BASE_PRICE = parseEther('10');
  const DOUBLING_GROWTH_BPS = 20_000;
  const MAX_LEVEL = 10;
  const MINT_AMOUNT = parseEther('10000');

  let token: Awaited<ReturnType<typeof viem.deployContract<'MockERC20'>>>;
  let shop: Awaited<ReturnType<typeof deployShop>>;

  async function deployShop() {
    return viem.deployContract('BoostShop', [owner.account.address, token.address]);
  }

  async function configureBoost() {
    const hash = await shop.write.setBoost([BOOST_ID, BASE_PRICE, DOUBLING_GROWTH_BPS, MAX_LEVEL, true], {
      account: owner.account,
    });
    await publicClient.waitForTransactionReceipt({ hash });
  }

  beforeEach(async () => {
    token = await viem.deployContract('MockERC20', []);

    for (const wallet of [buyer, stranger]) {
      const mintHash = await token.write.mint([wallet.account.address, MINT_AMOUNT]);
      await publicClient.waitForTransactionReceipt({ hash: mintHash });
    }

    shop = await deployShop();
    await configureBoost();

    for (const wallet of [buyer, stranger]) {
      const approveHash = await token.write.approve([shop.address, MINT_AMOUNT], { account: wallet.account });
      await publicClient.waitForTransactionReceipt({ hash: approveHash });
    }
  });

  it('quotes the base price before any purchase', async () => {
    assert.equal(await shop.read.currentPrice([BOOST_ID, buyer.account.address]), BASE_PRICE);
  });

  it('doubles the price after each purchase, matching the levels bought', async () => {
    let price = await shop.read.currentPrice([BOOST_ID, buyer.account.address]);
    for (let level = 1; level <= 3; level++) {
      const hash = await shop.write.purchase([BOOST_ID], { account: buyer.account });
      await publicClient.waitForTransactionReceipt({ hash });

      assert.equal(await shop.read.levelOf([BOOST_ID, buyer.account.address]), level);
      price = (price * BigInt(DOUBLING_GROWTH_BPS)) / 10_000n;
      assert.equal(await shop.read.currentPrice([BOOST_ID, buyer.account.address]), price);
    }
  });

  it('pulls exactly the current price via transferFrom', async () => {
    const price = await shop.read.currentPrice([BOOST_ID, buyer.account.address]);
    const balanceBefore = await token.read.balanceOf([buyer.account.address]);

    const hash = await shop.write.purchase([BOOST_ID], { account: buyer.account });
    await publicClient.waitForTransactionReceipt({ hash });

    const balanceAfter = await token.read.balanceOf([buyer.account.address]);
    assert.equal(balanceBefore - price, balanceAfter);
    assert.equal(await token.read.balanceOf([shop.address]), price);
  });

  it('rejects a purchase without enough allowance', async () => {
    const revokeHash = await token.write.approve([shop.address, 0n], { account: buyer.account });
    await publicClient.waitForTransactionReceipt({ hash: revokeHash });

    await assert.rejects(shop.write.purchase([BOOST_ID], { account: buyer.account }));
  });

  it('rejects a purchase without enough balance', async () => {
    const [, , , poor] = await viem.getWalletClients();
    const approveHash = await token.write.approve([shop.address, MINT_AMOUNT], { account: poor.account });
    await publicClient.waitForTransactionReceipt({ hash: approveHash });

    await assert.rejects(shop.write.purchase([BOOST_ID], { account: poor.account }));
  });

  it('rejects a purchase of an unconfigured boost', async () => {
    await assert.rejects(shop.write.purchase([99], { account: buyer.account }));
  });

  it('rejects a purchase of an inactive boost', async () => {
    const hash = await shop.write.setBoost([BOOST_ID, BASE_PRICE, DOUBLING_GROWTH_BPS, MAX_LEVEL, false], {
      account: owner.account,
    });
    await publicClient.waitForTransactionReceipt({ hash });

    await assert.rejects(shop.write.purchase([BOOST_ID], { account: buyer.account }));
  });

  it('stops selling once a buyer reaches the configured max level', async () => {
    const hash = await shop.write.setBoost([BOOST_ID, BASE_PRICE, DOUBLING_GROWTH_BPS, 1, true], {
      account: owner.account,
    });
    await publicClient.waitForTransactionReceipt({ hash });

    const firstHash = await shop.write.purchase([BOOST_ID], { account: buyer.account });
    await publicClient.waitForTransactionReceipt({ hash: firstHash });

    await assert.rejects(shop.write.purchase([BOOST_ID], { account: buyer.account }));
  });

  it('rejects configuration from anyone but the owner', async () => {
    await assert.rejects(
      shop.write.setBoost([BOOST_ID, BASE_PRICE, DOUBLING_GROWTH_BPS, MAX_LEVEL, true], {
        account: stranger.account,
      }),
    );
  });

  it('lets only the owner withdraw collected funds', async () => {
    const price = await shop.read.currentPrice([BOOST_ID, buyer.account.address]);
    const purchaseHash = await shop.write.purchase([BOOST_ID], { account: buyer.account });
    await publicClient.waitForTransactionReceipt({ hash: purchaseHash });

    await assert.rejects(
      shop.write.withdraw([stranger.account.address, price], { account: stranger.account }),
    );

    const strangerAddress: Address = getAddress(stranger.account.address);
    const balanceBefore = await token.read.balanceOf([strangerAddress]);
    const withdrawHash = await shop.write.withdraw([strangerAddress, price], { account: owner.account });
    await publicClient.waitForTransactionReceipt({ hash: withdrawHash });
    const balanceAfter = await token.read.balanceOf([strangerAddress]);

    assert.equal(balanceAfter - balanceBefore, price);
  });
});
