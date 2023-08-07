use anchor_lang::prelude::Pubkey;

pub const POOL_SEED: &str = "pool";


pub const MAX_BID_COUNT: usize = 100;
pub const MAX_AUCTION_ID_LEN: usize = 50;
pub const DECIMAL: u64 = 1000000000;
// ===================================================== mainnet ==================================================== //
pub const ADMIN_KEY: Pubkey = anchor_lang::solana_program::pubkey!("DBadiSE9HsUhKqSmcNnsVtzUuwAeLtGFVCKY6LC1W9us"); 
pub const PAY_TOKEN: Pubkey = anchor_lang::solana_program::pubkey!("9aeip1QTVXNUVbcQ14UMDssmxNv4ve7sg8cVyfHoeNmT");

// ===================================================== devnet ==================================================== //
// pub const ADMIN_KEY: Pubkey = anchor_lang::solana_program::pubkey!("3ttYrBAp5D2sTG2gaBjg8EtrZecqBQSBuFRhsqHWPYxX");
// pub const PAY_TOKEN: Pubkey = anchor_lang::solana_program::pubkey!("55u5jMiJtwsvyo834R2mmcrxMGu7x2KvbrguJNbHFnEJ");
