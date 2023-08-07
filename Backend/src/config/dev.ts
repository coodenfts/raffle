import WINNER_KEYPAIR from './winner_dev.json';
import * as AUCTION_IDL from '../constants/idl/auction'
import * as RAFFLE_IDL from '../constants/idl/raffle'

export default {
  WINNER_WALLET: WINNER_KEYPAIR,
  ADMIN_WALLET_PUB: '3ttYrBAp5D2sTG2gaBjg8EtrZecqBQSBuFRhsqHWPYxX',
  PROGRAM_ID: '3nYqaNUEhW4gwkNHanSPeTExTuerisrCU71EpxQm3W6N',
  CLUSTER_API: 'https://api.devnet.solana.com',
  BUNDLR_URL: 'https://devnet.bundlr.network',
  ENV: 'dev',
  SIGN_KEY: 'VERIFY WALLET',
  DECIMAL: 1000000000,
  PRICEPERBYTE: 0.00000001,
  SOLANA_NETWORK: 'devnet',
  MAGICEDEN_API_KEY: `c0f5e640-575c-417f-b5c9-4f9c91bbaab4`,
  TOKEN_ADDRESS: '55u5jMiJtwsvyo834R2mmcrxMGu7x2KvbrguJNbHFnEJ',

  AUCTION: {
    PROGRAM_ID: 'G4xDbEByUfbwPivCKjrZ4HeHGuUnrkrZJq5yfdytqbVr',
    POOL_SEED: 'pool',
    IDL: AUCTION_IDL.IDL,
    PAY_TOKEN_DECIMAL: 1000000000,
    message: 'Auction Message'
  },
  RAFFLE: {
    PROGRAM_ID: 'FinEbPq6qYgmjmF3qZTi6NLLDRnz2n3N1SgMnZTyKpvt',
    POOL_SEED: 'pool',
    IDL: RAFFLE_IDL.IDL,
    PAY_TOKEN_DECIMAL: 1000000000,
    message: 'Raffle Message'
  }
}