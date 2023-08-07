import * as AUCTION_IDL from '../constants/idl/auction'
import * as RAFFLE_IDL from '../constants/idl/raffle'

export const Backend_URL = 'https://coodebe.herokuapp.com'
// export const Backend_URL = 'http://10.10.17.152:3030'

export const API_URL = `${Backend_URL}/api`

// export const CLUSTER_API = 'https://metaplex.devnet.rpcpool.com/';
export const CLUSTER_API = 'https://api.devnet.solana.com';
export const BUNDLR_URL = 'https://devnet.bundlr.network';

export const SOLANA_NETWORK = 'devnet';

export const PRICEPERBYTE = 0.00000001;
export const DECIMAL = 1000000000
export const TOAST_TIME_OUT = 2000;
export const AUCTION: any = {
  ADMIN_WALLET: '3ttYrBAp5D2sTG2gaBjg8EtrZecqBQSBuFRhsqHWPYxX',
  PROGRAM_ID: 'G4xDbEByUfbwPivCKjrZ4HeHGuUnrkrZJq5yfdytqbVr',
  POOL_SEED: 'pool',
  IDL: AUCTION_IDL.IDL,
  message: 'Auction Message'
}

export const RAFFLE = {
  PROGRAM_ID: 'FinEbPq6qYgmjmF3qZTi6NLLDRnz2n3N1SgMnZTyKpvt',
  POOL_SEED: 'pool',
  IDL: RAFFLE_IDL.IDL,
  message: 'Raffle Message'
}

export const TokenAddress = '55u5jMiJtwsvyo834R2mmcrxMGu7x2KvbrguJNbHFnEJ'

export const INTERVAL = 6 * 1000;
export const ADMIN_WALLET = "3ttYrBAp5D2sTG2gaBjg8EtrZecqBQSBuFRhsqHWPYxX"
export const SIGN_KEY = 'VERIFY WALLET';
export const CREATOR_ADDRESS = '91jNpHwSpuUFY8tyEa2zrAjHnufQd8QtDaoptbxqiXVT'