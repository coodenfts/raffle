import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios';
// import passport from 'passport';
import routes from './routes';
import RaffleModel from './models/raffle';
import AuctionModel from './models/auction';
import { setWinner, sendBackNftForRaffle } from './helpers/contract/raffle';
import { sendBackNftForAuction, sendBackFTforAuction, setWinnerForAuction } from './helpers/contract/auction';
import { signAndSendTransactions } from "./helper/composables/sol/connection";
import * as anchor from "@project-serum/anchor";
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import fetchDataWithAxios from './helpers/fetchDataWithAxios';
import { 
  PublicKey,   
  Keypair,
  Connection,
  Commitment,
  ConnectionConfig,
} from '@solana/web3.js';
import { delay } from './helpers/utils';
import { getUnixTs } from './helpers/solana/connection';
import CONFIG from './config'
const Promise1 = require('bluebird') ;

const { RestClient, CollectionMintsRequest, CollectionFloorpriceRequest }: any = require("@hellomoon/api");
const { WINNER_WALLET, DECIMAL, MAGICEDEN_API_KEY, CLUSTER_API } = CONFIG
const connection = new Connection(CLUSTER_API);
const ADMIN_WALLET = Keypair.fromSeed(Uint8Array.from(WINNER_WALLET).slice(0, 32));
const wallet = new NodeWallet(ADMIN_WALLET);
// require('./helpers/discordPassport');
// require('./helpers/twitterPassport');

dotenv.config();
mongoose.connect(
  process.env.MONGO_URI).then(
    () => console.log("Database Connected"))
  .catch(() => console.log("Database Connection Failed")
  )
  console.log("mongo uri", process.env.MONGO_URI)
const app = express();

app.use(cors());
app.use(bodyParser.json())
app.use(
  require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  })
);
// app.use(passport.initialize());
// app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(`${__dirname}/build`))
app.use(express.static(`${__dirname}/uploads`))
app.use(express.json({ limit: '100mb' }));
app.use('/api', routes);
app.use('/*', (req, res) => {
  res.sendFile(`${__dirname}/build/index.html`)
})

const port = process.env.PORT
app.listen(port, () => {
  console.info(`server started on port ${port}`)
})

const get_pool_data = async (id, mint, program_id, idl) => {
  const connection = new Connection(CONFIG.CLUSTER_API, {
    skipPreflight: true,
    preflightCommitment: "confirmed" as Commitment,
  } as ConnectionConfig);


  const provider = new anchor.AnchorProvider(connection,  wallet, {
    skipPreflight: true,
    preflightCommitment: "confirmed" as Commitment,
  } as ConnectionConfig);

  const program = new anchor.Program(
    idl,
    program_id,
    provider
  );
    
  const anchorId = new anchor.BN(id);
  const [pool] = await PublicKey.findProgramAddress(
    [
      Buffer.from(CONFIG.AUCTION.POOL_SEED),
      anchorId.toArrayLike(Buffer, "le", 8),
      new PublicKey(mint).toBuffer(),
    ],
    program.programId
  );
  const poolData = await program.account.pool.fetch(pool);
  return poolData
}


const checkRaffles = async () => {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const raffles = await RaffleModel.find({ state: 0 });

    await Promise1.all(raffles.map(async (raffle) => {
      let res1;
      try {
        res1 = await setWinner(raffle.id, new PublicKey(raffle.mint));
      } catch(error) {
        // console.log('error', error)
      }
      if (res1) {
        raffle.state = 1;
        await raffle.save();
      }

      if (currentTime > raffle.end_date) {
        let res2;
        try {
          res2 = await sendBackNftForRaffle(raffle.id, new PublicKey(raffle.mint));
        } catch(error) {
        
        }
        if (res2) {
          raffle.state = 3;
          await raffle.save();
        } else {
          const poolData: any = await get_pool_data(raffle.id, raffle.mint, CONFIG.RAFFLE.PROGRAM_ID, CONFIG.RAFFLE.IDL)
          if(poolData.state === 2) {
            raffle.state = 2;
            await raffle.save();
          }
        }
      }
    }))
  }
  catch (error) {
    // console.log('error', error);
  }
}

const checkAuctions = async () => {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const auctions = await AuctionModel.find({ state: 0 });

    await Promise1.all(auctions.map(async (auction: any) => {
      if (currentTime > auction.end_date) {
        let res1;
        try {
          res1 = await setWinnerForAuction(auction.id, new PublicKey(auction.mint));
        } catch(error) {
          // console.log('error', error)
        }

        if(res1) {
          // await delay(60 * 1000)
          const poolData: any = await get_pool_data(auction.id, auction.mint, CONFIG.AUCTION.PROGRAM_ID, CONFIG.AUCTION.IDL)
          if(poolData?.state === 1) {
            const otherBids = poolData.bids.filter(item => item.isWinner === 0 && item.price.toNumber() > 0)
            console.log('otherBids', otherBids)
            let getTx = null;
            let transactions: any[] = [];
    
            if(otherBids.length > 0) {
              try {
                getTx = await sendBackFTforAuction(auction.id, auction.mint, otherBids)
                if(getTx) {
                  transactions.push(getTx);
                }
              } catch (error) {
                console.log('sendBackFt Error:', error)
              }
    
              try {
                await signAndSendTransactions(connection, wallet, transactions);
          
              } catch (error) {
                console.log('signAndSendTransactionsError')
              }
    
            }
            auction.state = 1;
            await auction.save();
          }

        }
        
        let res;
        try {
          res = await sendBackNftForAuction(auction.id, new PublicKey(auction.mint));
          
        } catch(error) {
          // console.log('error', error)
        }
        
        if (res) {
          auction.state = 3;
          await auction.save();
        } else {
          const poolData: any = await get_pool_data(auction.id, auction.mint, CONFIG.AUCTION.PROGRAM_ID, CONFIG.AUCTION.IDL)
          
          if(poolData?.state === 2) {
            auction.state = 2;
            await auction.save();

            poolData.bids.filter(item => item.price.toNumber() > 0 && item.isWinner)
          }
        }
      }
    }))
  }
  catch (error) {
    // console.log('error', error);
  }
}

const updateFloorPrice = async () => {
  try {
    const currentTime = Math.floor(Date.now() / 1000);
    const auctions = await AuctionModel.find();
    console.log('auctions', auctions)
    for (let i = 0; i < auctions.length; i++) {
      let auction = auctions[i];
      // if (currentTime > auction.start_date && auction.end_date) {
        // const ME_Api = `https://api-mainnet.magiceden.dev/v2/collections/${auction.symbol || ''}/stats`
        // let result:any
 
        // try {
        //    result = await fetchDataWithAxios({
        //      method: `get`,
        //      route: `${ME_Api}`,
        //      headerCred: {
        //        autherization: MAGICEDEN_API_KEY
        //      }
        //    });
        //  }
        //  catch (err) {
        //    console.log(`Error in communicating with magic eden`, err)
        //  }
        let result: any
        try {
          const client = new RestClient(process.env.HELLOMOON_API_KEY);
          const res = await client.send(new CollectionMintsRequest({ nftMint: auction.mint }))
          console.log("res", res)
          if(res && res.data) {
            const helloMoonCollectionId = res.data[0]?.helloMoonCollectionId       
            const client = new RestClient(process.env.HELLOMOON_API_KEY);
            result = await client.send(new CollectionFloorpriceRequest({ helloMoonCollectionId, granularity: "ONE_MIN" }))
          }

        } catch (error) {
          console.log(`Error in communicating with Hellomoon Api`, error)
        }
 
        console.log('result', result)
        if(result && result.data){
          const floorPrice = result?.data[0]?.floorPriceLamports
          await AuctionModel.findOneAndUpdate({ id: auction.id}, { floor_price: Number(floorPrice) / DECIMAL, last_updated_fp: Math.floor(getUnixTs())})
        }
      // }
    }

    const raffles = await RaffleModel.find();
    for (let i = 0; i < raffles.length; i++) {
      let raffle = raffles[i];
      // if (currentTime > raffle.start_date && currentTime < raffle.end_date) {
        // const ME_Api = `https://api-mainnet.magiceden.dev/v2/collections/${raffle.symbol || ''}/stats`
        // let result:any

        // try {
        //   result = await fetchDataWithAxios({
        //     method: `get`,
        //     route: `${ME_Api}`,
        //     headerCred: {
        //       autherization: MAGICEDEN_API_KEY
        //     }
        //   });
        // }
        // catch (err) {
        //   console.log(`Error in communicating with magic eden`, err)
        // }

        let result: any
        try {
          const client = new RestClient(process.env.HELLOMOON_API_KEY);
          const res = await client.send(new CollectionMintsRequest({ nftMint: raffle.mint }))
          console.log("res", res)
          if(res && res.data) {
            const helloMoonCollectionId = res.data[0]?.helloMoonCollectionId       
            const client = new RestClient(process.env.HELLOMOON_API_KEY);
            result = await client.send(new CollectionFloorpriceRequest({ helloMoonCollectionId, granularity: "ONE_MIN" }))
          }

        } catch (error) {
          console.log(`Error in communicating with Hellomoon Api`, error)
        }
 
        console.log('result', result)
        if(result && result.data){
          const floorPrice = result?.data[0]?.floorPriceLamports
          await RaffleModel.findOneAndUpdate({ id: raffle.id}, { floor_price: Number(floorPrice) / DECIMAL, last_updated_fp: Math.floor(getUnixTs())})
        }
      // }
    }
  }
  catch (error) {
    console.log('error', error);
  }
}


(async () => {
  for (let i = 0; i < 1;) {
    await checkRaffles();
    await checkAuctions();
    await delay(60 * 1000)
  }
})()

setInterval(async () => {
  await updateFloorPrice();

},  15 * 60 * 1000);


