import { WalletContextState } from "@solana/wallet-adapter-react";
import { Commitment, Connection, ConnectionConfig, PublicKey } from "@solana/web3.js";
import * as borsh from 'borsh';
import * as anchor from '@project-serum/anchor';
import { Metadata, METADATA_SCHEMA } from './schema';

import CONFIG from '../config';

const { CLUSTER_API } = CONFIG;

const METADATA_PROGRAM_ID_PUBLIC_KEY = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
export const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
);


export const getSignedMessage = async (wallet: WalletContextState, message: string) => {
  try {
    if (!wallet.publicKey) return null;
    const signedMessage = await wallet.signMessage!(new TextEncoder().encode(message));
    return signedMessage;
  }
  catch (error) {
    return null;
  }
}

export const datetimeLocal = (datetime: Date) => {
  let month = datetime.getMonth() + 1;
  let day = datetime.getDate();
  let hour = datetime.getHours();
  let min = datetime.getMinutes();
  const result =
    `${datetime.getFullYear()}-${month >= 10 ? month : `0${month}`}-${day >= 10 ? day : `0${day}`}T${hour >= 10 ? hour : `0${hour}`}:${min >= 10 ? min : `0${min}`}`
  return result;
}

export async function decodeMetadata(buffer: Buffer) {
  const metadata = borsh.deserializeUnchecked(
    METADATA_SCHEMA,
    Metadata,
    buffer,
  );
  metadata.data.name = metadata.data.name.replace(METADATA_REPLACE, '');
  metadata.data.uri = metadata.data.uri.replace(METADATA_REPLACE, '');
  metadata.data.symbol = metadata.data.symbol.replace(METADATA_REPLACE, '');
  return metadata;
}

const METADATA_REPLACE = new RegExp('\u0000', 'g');

export const getNftMetadata = async (uri: string) => {

  const result =
    await fetch(uri)
      .then(res => res.json())
      .catch(() => null)

  return result;
}

export const connection = new Connection(CLUSTER_API, {
  skipPreflight: true,
  preflightCommitment: 'confirmed' as Commitment,
} as ConnectionConfig);

export async function getNftMetaDataByMint(mintAddress: string) {
  const web3 = require('@solana/web3.js');
  let connection = new web3.Connection(
    CONFIG.CLUSTER_API,
    'confirmed',
  );

  const program = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      METADATA_PROGRAM_ID_PUBLIC_KEY.toBytes(),
      new PublicKey(mintAddress).toBytes()
    ],
    METADATA_PROGRAM_ID_PUBLIC_KEY
  )

  let accountInfo = await connection.getAccountInfo(program[0])
  if(!accountInfo)
    return { }
  let metadata: any = await decodeMetadata(accountInfo.data)

  const result = await fetch(metadata?.data.uri)
      .then(res => res.json())
      .catch(() => null)

  return { ...metadata, ...result };
}

export const getMetadataAccount = async (mint: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey> => {
  const result: any = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      new PublicKey(TOKEN_METADATA_PROGRAM_ID).toBuffer(),
      new PublicKey(mint).toBuffer()
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const metaAccount = result[0]
  return metaAccount;
}

export const delay = (ms: any) => new Promise(resolve => setTimeout(resolve, ms))

export const prettyNumber = (newValue: string) => {
  if (newValue.includes('..')) {
    return
  }
  const dotIndex = newValue.indexOf('.')
  if (dotIndex >= 0) {
    const highVal = newValue.slice(0, dotIndex)
    if (highVal[0] === '0' && highVal.length > 1) {
      return
    }
  } else if (newValue[0] === '0' && newValue.length > 1) {
    return
  }
  for (let i = 0; i < newValue.length; i += 1) {
    if (newValue[i] !== '.' && (newValue[i] < '0' || newValue[i] > '9')) {
      return
    }
  }
  return newValue
}
