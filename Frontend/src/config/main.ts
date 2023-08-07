import * as AUCTION_IDL from '../constants/idl/auction'
import * as RAFFLE_IDL from '../constants/idl/raffle'

export const Backend_URL = 'https://coodebe.herokuapp.com'

export const API_URL = `${Backend_URL}/api`

export const CLUSTER_API = 'https://capable-burned-shape.solana-mainnet.quiknode.pro/904288623a1e9c412e5da6f5204baa74aa652938/';
export const BUNDLR_URL = 'https://node1.bundlr.network';

export const SOLANA_NETWORK = 'mainnet';

export const PRICEPERBYTE = 0.00000001;
export const DECIMAL = 1000000000
export const TOAST_TIME_OUT = 2000;
export const AUCTION: any = {
  PROGRAM_ID: 'AHXFqPbBRnxPcNStkzQumQBfUV5L7vN1EL3i3jpKzpWn',
  POOL_SEED: 'pool',
  IDL: AUCTION_IDL.IDL,
  message: 'Auction Message'
}

export const RAFFLE = {
  PROGRAM_ID: '5yCc6fGQwcKSyDKADVKXLAQYB4mDTZiHNZVXjvQqVXgB',
  POOL_SEED: 'pool',
  IDL: RAFFLE_IDL.IDL,
  message: 'Raffle Message'
}

export const TokenAddress = '9aeip1QTVXNUVbcQ14UMDssmxNv4ve7sg8cVyfHoeNmT'

export const INTERVAL = 6 * 1000;
export const ADMIN_WALLET = "DBadiSE9HsUhKqSmcNnsVtzUuwAeLtGFVCKY6LC1W9us"
export const SIGN_KEY = 'VERIFY WALLET';
export const CREATOR_ADDRESS = 'CaYsVNkgS5yBMK1BVTmbpapumjbyXNsBFZ2W1zbbk374'


