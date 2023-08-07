import * as AUCTION_IDL from '../constants/idl/auction'
import * as RAFFLE_IDL from '../constants/idl/raffle'
import WINNER_KEYPAIR from './winner_main.json';

export default {
  WINNER_WALLET: WINNER_KEYPAIR,
  ADMIN_WALLET_PUB: 'DBadiSE9HsUhKqSmcNnsVtzUuwAeLtGFVCKY6LC1W9us',
  PROGRAM_ID: '3nYqaNUEhW4gwkNHanSPeTExTuerisrCU71EpxQm3W6N',
  CLUSTER_API: 'https://capable-burned-shape.solana-mainnet.quiknode.pro/904288623a1e9c412e5da6f5204baa74aa652938/',
  BUNDLR_URL: 'https://node1.bundlr.network',
  ENV: 'dev',
  SIGN_KEY: 'VERIFY WALLET',
  DECIMAL: 1000000000,
  PRICEPERBYTE: 0.00000001,
  SOLANA_NETWORK: 'mainnet',
  MAGICEDEN_API_KEY: `c0f5e640-575c-417f-b5c9-4f9c91bbaab4`,
  TOKEN_ADDRESS: '9aeip1QTVXNUVbcQ14UMDssmxNv4ve7sg8cVyfHoeNmT',

  AUCTION: {
    PROGRAM_ID: 'AHXFqPbBRnxPcNStkzQumQBfUV5L7vN1EL3i3jpKzpWn',
    POOL_SEED: 'pool',
    IDL: AUCTION_IDL.IDL,
    PAY_TOKEN_DECIMAL: 1000000000,
    message: 'Auction Message'
  },
  RAFFLE: {
    PROGRAM_ID: '5yCc6fGQwcKSyDKADVKXLAQYB4mDTZiHNZVXjvQqVXgB',
    POOL_SEED: 'pool',
    IDL: RAFFLE_IDL.IDL,
    PAY_TOKEN_DECIMAL: 1000000000,
    message: 'Raffle Message'
  }
}


