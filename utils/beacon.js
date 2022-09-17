const config = require('../config');
const sdk = require('api')('@alchemy-docs/v1.0#4y8wt5c9l79g4ign');

class BeaconService {
  constructor({ chain }) {
    this.key = config.ALCHEMY_KEY;
    this.chain = chain;
  }

  setNetworkProvider() {
    if (this.chain === 'polygon') {
        sdk.server('https://polygon-mainnet.g.alchemyapi.io/v2');
        return;
    }
    sdk.server('https://eth-mainnet.alchemyapi.io/v2');
    return;
  }

  async getTransactionsFromAddress(address) {
    await this.setNetworkProvider();
    const res = await sdk.alchemyGetAssetTransfers({
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [
          {
            fromBlock: '0x0',
            withMetadata: false,
            category: (this.chain === 'polygon') ? ['external'] : ['external', 'internal'],
            maxCount: '0x1',
            fromAddress: address
          }
        ]
      }, { apiKey: this.key });
    return res;
  }

  async getTransactionsToAddress(address) {
    await this.setNetworkProvider();
    const res = await sdk.alchemyGetAssetTransfers({
        id: 1,
        jsonrpc: '2.0',
        method: 'alchemy_getAssetTransfers',
        params: [
          {
            fromBlock: '0x0',
            withMetadata: false,
            category: (this.chain === 'polygon') ? ['external'] : ['external', 'internal'],
            maxCount: '0x1',
            toAddress: address
          }
        ]
      }, { apiKey: this.key });
    return res;
  }

  async confirmActivity(address) {
    const fromRes = await this.getTransactionsFromAddress(address);
    const fromTransfer = fromRes.result && fromRes.result.transfers;
    const fromActivity =  fromTransfer && fromTransfer.length > 0;
    if (fromActivity) return fromActivity;
    const toRes = await this.getTransactionsToAddress(address);
    const toTransfer = toRes.result && toRes.result.transfers;
    const toActivity =  toTransfer && toTransfer.length > 0;
    return fromActivity || toActivity;
  };
}

module.exports = BeaconService;
