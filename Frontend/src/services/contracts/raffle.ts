import * as anchor from '@project-serum/anchor'
import {
  Connection,
  Commitment,
  ConnectionConfig,
  SystemProgram,
  PublicKey,
  SYSVAR_RENT_PUBKEY
} from '@solana/web3.js';

import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'

import CONFIG from "../../config";
import { getParsedNftAccountsByOwner, getParsedAccountByMint } from '@nfteyez/sol-rayz';
import { delay, getMetadataAccount } from '../../utils';
import { makeTransaction } from '../../helper/composables/sol/connection';
import createAssociatedTokenAccountInstruction from '../../helper/composables';

const Promise = require('bluebird') ;

const {
  RAFFLE,
  CLUSTER_API,
  TokenAddress,
  ADMIN_WALLET
} = CONFIG;

const connection = new Connection(CLUSTER_API, {
  skipPreflight: true,
  preflightCommitment: 'confirmed' as Commitment,
} as ConnectionConfig);


export const createForRaffle = async (
  wallet: any,
  nftInfo: any,
  id: any
) => {
  try {
    const raffleId = new anchor.BN(id)
    console.log("raffleId", raffleId)
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)
    console.log("connection", connection)
    const program = new anchor.Program(RAFFLE.IDL, RAFFLE.PROGRAM_ID, provider);
    console.log("program", program)
    const [pool] = await PublicKey.findProgramAddress([
      Buffer.from(RAFFLE.POOL_SEED),
      raffleId.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo?.mint).toBuffer()
    ], new PublicKey(RAFFLE.PROGRAM_ID))

    // let ataFrom = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), wallet.publicKey);
    const mintInfo = await getParsedAccountByMint({ mintAddress: nftInfo.mint, connection })
    let ataFrom = mintInfo.pubkey
    console.log("ataFrom======", ataFrom)
    let ataTo = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), pool, true)
    console.log("wallet public key", wallet.publicKey.toString())
    // console.log("ataFrom", ataFrom.toBase58())
    console.log("ataTo", ataTo.toBase58())
    const startTime: any = Math.floor(nftInfo.start_date?.getTime() / 1000).toString()
    const endTime: any = Math.floor(nftInfo.end_date?.getTime() / 1000).toString()
    const totalTicket: any = Number(nftInfo.total_tickets)
    const price: any = Number(nftInfo.price)
    const minNftCount = Number(nftInfo.min_nft_count)

    let builder: any;
    try {
      builder = program.methods.createRaffle(raffleId, startTime, endTime, totalTicket, new anchor.BN(price * CONFIG.DECIMAL), minNftCount);
    } catch (error) {
      console.log('error in createRaffle method', error);
    }
    
    builder.accounts({
      admin: wallet.publicKey,
      mint: new PublicKey(nftInfo.mint),
      pool: pool,
      ataFrom: ataFrom,
      ataTo: ataTo,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    });

    let txId;
    
    try {
      txId = await builder.rpc();
      console.log('txId', txId)
    } catch(error) {
      console.log('error', error)
    }
    if (!txId) return false;

    return true;

  }
  catch (error) {
    return false;
  }
}

export const editForRaffle = async (
  wallet: any,
  nftInfo: any,
) => {
  try {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)
    const program = new anchor.Program(RAFFLE.IDL, RAFFLE.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id)

    const [pool] = await PublicKey.findProgramAddress([
      Buffer.from(RAFFLE.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo.mint).toBuffer()
    ], program.programId)

    const startTime: any = Math.floor(nftInfo.start_date?.getTime() / 1000).toString()
    const endTime: any = Math.floor(nftInfo.end_date?.getTime() / 1000).toString()
    const totalTicket = nftInfo.total_tickets
    const minNftCount = Number(nftInfo.min_nft_count)
    const price: any = new anchor.BN(nftInfo.price * CONFIG.DECIMAL)
    const builder = program.methods.editRaffle(startTime, endTime, totalTicket, price, minNftCount);
    builder.accounts({
      admin: wallet.publicKey,
      pool: pool,
    });
    builder.signers([]);

    let txId
    try {
      txId = await builder.rpc();
      console.log('txId', txId)
    } catch(error) {
      console.log('error in buidler rpc', error)
    }

    if (!txId) return false;

    return true;

  }
  catch (error) {
    return null;
  }
}

export const deleteForRaffle = async (
  wallet: any,
  nftInfo: any,

) => {
  try {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)

    const program = new anchor.Program(RAFFLE.IDL, RAFFLE.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id)
    const [pool] = await PublicKey.findProgramAddress([
      Buffer.from(RAFFLE.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo.mint).toBuffer()
    ], new PublicKey(RAFFLE.PROGRAM_ID))

    let ataFrom = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), pool, true);
    let ataTo = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), wallet.publicKey)

    const builder = program.methods.deleteRaffle();


    builder.accounts({
      admin: wallet.publicKey,
      pool: pool,
      mint: new PublicKey(nftInfo.mint),
      ataFrom: ataFrom,
      ataTo: ataTo,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    });
    builder.signers([]);

    const txId = await builder.rpc();
    console.log('txId', txId)
    if (!txId) return false;

    return true;

  }
  catch (error) {
    return null;
  }
}

export const buyTicketsForRaffle = async (
  wallet: any,
  nftInfo: any,
  amount: number,
  lists: any
) => {
  try {
    console.log('nftInfo',nftInfo)
    console.log('lists',lists)
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)


    const program = new anchor.Program(RAFFLE.IDL, RAFFLE.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id)
    const [pool] = await PublicKey.findProgramAddress([
      Buffer.from(RAFFLE.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo.mint).toBuffer()
    ], new PublicKey(RAFFLE.PROGRAM_ID))

    let ataFrom = await getAssociatedTokenAddress(new PublicKey(TokenAddress), wallet.publicKey, true);
    let ataTo = await getAssociatedTokenAddress(new PublicKey(TokenAddress), new PublicKey(ADMIN_WALLET))

    console.log('ataTo', ataTo)

    let MintTokenAccount = await getAssociatedTokenAddress(new PublicKey(lists[0].mint), wallet.publicKey)
    const metadata = await getMetadataAccount(lists[0].mint)
    // let metadatas: any = []; 
    // lists.map(async (item: any) => {
    //   const _metadata = await getMetadataAccount(item.mint)
    //   metadatas.push(_metadata)
    // })

    const builder = program.methods.buyTicket(amount, lists.length);
    builder.accounts({
      buyer: wallet.publicKey,
      admin: new PublicKey(ADMIN_WALLET),
      pool: pool,
      mint: new PublicKey(lists[0].mint),
      mintToken: MintTokenAccount,
      payMint: new PublicKey(TokenAddress),
      ataFrom: ataFrom,
      ataTo: ataTo,
      metadata: metadata,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    });

    builder.signers([]);
    let txId
    try {
      txId = await builder.rpc();
      await delay(7  * 1000)
      console.log('txId', txId)
    } catch(error) {

    }


    if (!txId) return false;

    return true;

  }
  catch (error) {
    return null;
  }
}

export const setWinnerForRaffle = async (
  wallet: any,
  nftInfo: any,

) => {
  try {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)


    const program = new anchor.Program(RAFFLE.IDL, RAFFLE.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id)
    const [pool] = await PublicKey.findProgramAddress([
      Buffer.from(RAFFLE.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      nftInfo.mint.toBuffer()
    ], new PublicKey(RAFFLE.PROGRAM_ID))


    const hash = '12123123sdfsdf1'
    const builder = program.methods.setWinner();
    builder.accounts({
      admin: wallet.publicKey,
      pool: pool,
      slothash: hash,
    });

    builder.signers([wallet]);
    const response = await builder.simulate({
      commitment: 'confirmed'
    });

    if (!response) return false;
    const txId = await builder.rpc();
    console.log('txId', txId)
    if (!txId) return false;

    return true;

  }
  catch (error) {
    return null;
  }
}

export const claimPrizeForRaffle = async (
  wallet: any,
  nftInfo: any,

) => {
  try {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)


    const program = new anchor.Program(RAFFLE.IDL, RAFFLE.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id)
    const [pool] = await PublicKey.findProgramAddress([
      Buffer.from(RAFFLE.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo.mint).toBuffer()
    ], new PublicKey(RAFFLE.PROGRAM_ID))

    let ataFrom = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), pool, true);
    let ataTo = await getAssociatedTokenAddress(new PublicKey(nftInfo.mint), wallet?.publicKey)

    const builder = program.methods.claimPrize();
    builder.accounts({
      buyer: wallet.publicKey,
      pool: pool,
      mint: new PublicKey(nftInfo.mint),
      ataFrom: ataFrom,
      ataTo: ataTo,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    });

    builder.signers([]);
    let txId
    try {
      txId = await builder.rpc();
      await delay(7  * 1000)
      console.log('txId', txId)
    } catch(error) {

    }
    if (!txId) return false;

    return true;

  }
  catch (error) {
    return null;
  }
}

export const claimCoodeForAdmin = async (
  wallet: any,
  nftInfo: any,

) => {
  try {
    const provider = new anchor.AnchorProvider(connection, wallet, {
      skipPreflight: true,
      preflightCommitment: 'confirmed' as Commitment,
    } as ConnectionConfig)


    const program = new anchor.Program(RAFFLE.IDL, RAFFLE.PROGRAM_ID, provider);

    const id = new anchor.BN(nftInfo.id)
    const [pool] = await PublicKey.findProgramAddress([
      Buffer.from(RAFFLE.POOL_SEED),
      id.toArrayLike(Buffer, 'le', 8),
      new PublicKey(nftInfo.mint).toBuffer()
    ], new PublicKey(RAFFLE.PROGRAM_ID))
    let ataFrom = await getAssociatedTokenAddress(new PublicKey(TokenAddress), pool, true);
    let ataTo = await getAssociatedTokenAddress(new PublicKey(TokenAddress), new PublicKey(ADMIN_WALLET))

    const builder = program.methods.claimCoode();
    builder.accounts({
      admin: wallet.publicKey,
      pool: pool,
      payMint: new PublicKey(TokenAddress),
      ataFrom: ataFrom,
      ataTo: ataTo,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    });

    builder.signers([]);
    const txId = await builder.rpc();
    console.log('txId', txId)
    if (!txId) return false;

    return true;

  }
  catch (error) {
    return null;
  }
}

// export const claimCoodeForAdmin = async (
//   wallet: any,
//   nftInfos: any[],
// ) => {
//   try {
//     const provider = new anchor.AnchorProvider(connection, wallet, {
//       skipPreflight: true,
//       preflightCommitment: 'confirmed' as Commitment,
//     } as ConnectionConfig)

//     const program = new anchor.Program(RAFFLE.IDL, RAFFLE.PROGRAM_ID, provider);
//     let instructions: any = [], signers: any = [];
    
//     for(let i = 0; i < nftInfos.length; i++) { 
//       const id = new anchor.BN(nftInfos[i].id)
//       const [pool] = await PublicKey.findProgramAddress([
//         Buffer.from(RAFFLE.POOL_SEED),
//         id.toArrayLike(Buffer, 'le', 8),
//         new PublicKey(nftInfos[i].mint).toBuffer()
//       ], new PublicKey(RAFFLE.PROGRAM_ID))
  
//       let ataFrom = await getAssociatedTokenAddress(new PublicKey(TokenAddress), pool, true);
//       let ataTo = await getAssociatedTokenAddress(new PublicKey(TokenAddress), wallet.publicKey)

//       const ataToInfo = await connection.getAccountInfo(ataTo);
//       if (!ataToInfo) {
//         instructions.push(createAssociatedTokenAccountInstruction(wallet.publicKey, ataTo, wallet.publicKey, new PublicKey(CONFIG.TokenAddress)))
//       }

//       instructions.push(program.instruction.claimCoode({
//         accounts: {
//           admin: new PublicKey(ADMIN_WALLET),
//           pool: pool,
//           payMint: TokenAddress,
//           ataFrom: ataFrom,
//           ataTo: ataTo,
//           tokenProgram: TOKEN_PROGRAM_ID,
//           associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//           systemProgram: SystemProgram.programId,
//           rent: SYSVAR_RENT_PUBKEY
//         }
//       }))
//     }
//     const transaction = await makeTransaction(connection, instructions, signers, wallet.publicKey)
  
//     return transaction

//   }
//   catch (error) {
//     console.log('error', error)
//     return null;
//   }
// }


export const VerifyCollection = async (
  walletAddress: any,
  connection: any
) => {
  try {
    const lists = Promise.all(await getParsedNftAccountsByOwner({
      publicAddress: walletAddress,
      connection
    }))
    try {
       const filter_lists = await Promise.all(await lists.filter((item: any) => item.data?.creators && item.data?.creators[0]?.address === CONFIG.CREATOR_ADDRESS));

       if (filter_lists.length > 0) {
         return {
           status: true,
           lists: filter_lists
         }
       } else {
         return {
           status: false,
           lists: []
         }
       }
    } catch (error) {
      console.log('error', error)
    }
   

  } catch (error) {

    return null
  }
}




