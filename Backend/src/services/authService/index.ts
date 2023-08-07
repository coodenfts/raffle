import { PublicKey } from "@solana/web3.js"
import * as anchor from "@project-serum/anchor";

import bs58 from 'bs58';
import nacl from 'tweetnacl';
import CONFIG from "../../config";
const { AUCTION, RAFFLE, SIGN_KEY } = CONFIG;

const verify = async (address: string, signature: string, type: number): Promise<boolean> => {
  try {
    console.log('address', address, 'signature', signature);
    console.log('address type', typeof address);
    let message = ''
    if (type === 0) message = AUCTION.message;
    else if (type === 1) message = RAFFLE.message;
    else message = SIGN_KEY;
    console.log('message', message);
    if (PublicKey.isOnCurve(new anchor.web3.PublicKey(address).toBytes())) {
      const verified = nacl.sign.detached.verify(new TextEncoder().encode(message), bs58.decode(signature), new anchor.web3.PublicKey(address).toBuffer());
      console.log('verified', verified)
      return !!verified;
    }
  }
  catch (err) {
    console.log(`wallet address validation err:`, err);
  }

  return false;
}


export default {
  verify
}