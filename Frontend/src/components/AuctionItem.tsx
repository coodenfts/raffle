import { useState, useEffect } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import {
  Connection,
  Commitment,
  ConnectionConfig,
  PublicKey,
} from "@solana/web3.js";
import { Link } from "react-router-dom";
import Countdown, { CountdownApi } from 'react-countdown'

import VerificationIcon from "../assets/Verification-icon.png";
import UnionIcons from "../assets/Union-icons.png";
import CONFIG from "../config";
import { getAuctionById } from "../services/api";
import { ToastContainer, toast } from "react-toastify";

const AuctionItem = (props: any) => {
  const { item } = props;
  const anchorWallet = useAnchorWallet()
  const [isLoading, setLoading] = useState(false);
  const [currentBid, setCurrentBid] = useState(0)
  const currentTime = Math.floor(Date.now() / 1000);

  let startCountdownApi: CountdownApi | null = null
  let endCountdownApi: CountdownApi | null = null

  const setStartCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      startCountdownApi = countdown.getApi()
    }
  }

  const setEndCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      endCountdownApi = countdown.getApi()
    }
  }

  const startCountdownRenderer = ({ api, days, hours, minutes, seconds, completed }: any) => {
    if (api.isPaused()) api.start()
    return (
      completed ?
        <Countdown
          ref={setEndCountdownRef}
          date={item.end_date * 1000}
          zeroPadTime={3}

          renderer={endCountdownRenderer}
        />
        :
        <div>
          <p>Starts In</p>
          <p>
            {days.toString().length === 1 ? `0${days}` : days}:
            {hours.toString().length === 1 ? `0${hours}` : hours}:
            {minutes.toString().length === 1 ? `0${minutes}` : minutes}:
            {seconds.toString().length === 1 ? `0${seconds}` : seconds}
          </p>
        </div>
    )
  }

  const endCountdownRenderer = ({ api, days, hours, minutes, seconds, completed }: any) => {
    if (api.isPaused()) api.start()
    return (
      completed ?
        <p>Ended</p>
        :
        <div>
          <p>Live</p>
          <p>
            {days.toString().length === 1 ? `0${days}` : days}:
            {hours.toString().length === 1 ? `0${hours}` : hours}:
            {minutes.toString().length === 1 ? `0${minutes}` : minutes}:
            {seconds.toString().length === 1 ? `0${seconds}` : seconds}
          </p>
        </div>

    )
  }

  const getUserInfo = async (bids: any[]) => {

    const bid = bids.find((item: any) => {
      return item.bidder.toString() === anchorWallet?.publicKey?.toString();
    });

    if (bid) {
      setCurrentBid(bid.price.toNumber() / CONFIG.DECIMAL)
    }
  };

  useEffect(() => {
    (
      async () => {
        try {
          if (!anchorWallet) return
          setLoading(true)
          const connection = new Connection(CONFIG.CLUSTER_API, {
            skipPreflight: true,
            preflightCommitment: "confirmed" as Commitment,
          } as ConnectionConfig);

          const provider = new anchor.AnchorProvider(connection, anchorWallet, {
            skipPreflight: true,
            preflightCommitment: "confirmed" as Commitment,
          } as ConnectionConfig);

          const program = new anchor.Program(
            CONFIG.AUCTION.IDL,
            CONFIG.AUCTION.PROGRAM_ID,
            provider
          );

          const nftInfoById: any = await getAuctionById(item._id);
          const auctionId = new anchor.BN(nftInfoById.id);
          const [pool] = await PublicKey.findProgramAddress(
            [
              Buffer.from(CONFIG.AUCTION.POOL_SEED),
              auctionId.toArrayLike(Buffer, "le", 8),
              new PublicKey(item.mint).toBuffer(),
            ],
            program.programId
          );
          const poolData = await program.account.pool.fetch(pool);
          console.log('poolData', poolData.bids)
          getUserInfo(poolData.bids);
          setLoading(false)


        } catch (error) {
          setLoading(false)
        }
      }
    )()
  }, [anchorWallet])

  return (
    <>
      {
        isLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      <div
        className="xl:basis-[24%] lg:basis-[32%] md:basis-[48%] sm:basis-[48%] basis-[100%] mt-6"
        key={item._id}
      >

        <div className="rounded-[0.9rem] overflow-hidden border-4 border-[#606060]">
          <div className="relative">
            <img
              src={item?.image}
              alt="CoodeImage"
              className="lg:h-[300px] w-full object-cover"
            />
            <div className="absolute top-0 left-0 h-full w-full">
              <div className="flex flex-col justify-between h-full p-2">
                <div className="flex justify-end">
                  {/* <div className="border-black bg-[#949494] border flex rounded-md overflow-hidden">
                    <p className="bg-white text-base py-1 pl-2 pr-4 para-clip">
                      {item.tokenName}
                    </p>
                    <p className="py-1 px-2 text-base text-white">#{item.tokenId || 1}</p>
                  </div> */}
                </div>
                <div className="flex justify-between items-start">
                  <div className="border-black bg-[#949494] border flex rounded-md overflow-hidden">
                    <p className="bg-white text-[12px] pt-[2px] pl-2 pr-3 para-clip-3">
                      Floor
                    </p>
                    <p className="py-[2px] pl-[2px] pr-[5px] text-[12px] text-white">
                      {item.floor_price || '_'}
                    </p>
                  </div>
                  <div className="border-black bg-[#949494] border flex rounded-md overflow-hidden">
                    <p className="bg-white text-[12px] pt-[2px] pl-2 pr-3 para-clip-3">
                      Min NFT Count
                    </p>
                    <p className="py-[2px] pl-[2px] pr-[5px] text-[12px] text-white">
                      {item.min_nft_count || 1}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white -mt-1">
            <div className="pt-2 pl-3 pb-2 border-b-[#D9D9D9] border">
              <div className="flex items-center">
                <img src={VerificationIcon} alt="VerificationIcon" />
                <span className="text-base leading-none inline-block ml-1">
                  {item.collectionName || `Verified Collection`}
                </span>
              </div>
              <h1 className="text-xl">{item.tokenName}</h1>
            </div>
            <div className="pt-2 pl-3 pr-2">
              <div className="flex justify-between">
                <div className="basis-[49%]">
                  <p className="text-sm font-bold">Time Remaining</p>
                  <div className="text-sm text-[#4A4A4A]">
                    <Countdown
                      ref={setStartCountdownRef}
                      date={item.start_date * 1000}
                      zeroPadTime={3}

                      renderer={startCountdownRenderer}
                    />
                  </div>
                </div>
                <div className="basis-[49%]">
                  <p className="text-sm">Min. Bid Amount</p>
                  <p className="text-sm text-[#4A4A4A] font-bold">{item.min_bid_amount} $COODE</p>
                </div>
              </div>
              <div className="flex justify-between pt-2">
              {/* <div className="basis-[49%]">
                <p className="text-sm">Floor Price</p>
                <p className="text-sm text-[#4A4A4A] font-bold">
                  {item.floor_price + ' SOL' || `_`} 
                </p>
              </div> */}
                {/* <div className="basis-[50%]">
                  <p className="text-sm">My Bid</p>
                  <p className="text-sm text-[#4A4A4A] font-bold">{currentBid} $COODE</p>
                </div> */}
                <div className="basis-[50%]">
                  <p className="text-sm">Top Bid</p>
                  <p className="text-sm text-[#4A4A4A] font-bold">{item.topBidAmount} $COODE</p>
                </div>
              </div>
              <div className="flex justify-between pt-2 pb-9">
            
              </div>
            </div>
          </div>
        </div>
        <div className="-mt-[26px] text-center">
        { currentTime > item.endTime ? <Link
          to={`/auction/${item._id}`}
          style={{ fontWeight: "bold"}}
          className={`
                      ${ item.winnerWalletAddress !== `` && item.winnerWalletAddress === anchorWallet?.publicKey.toString() && `bg-black text-[orange] border-[orange]`}
                      ${ item.winnerWalletAddress !== `` && item.winnerWalletAddress !== anchorWallet?.publicKey.toString() && `bg-black text-[grey] border-[grey]`}
                      ${ item.winnerWalletAddress === `` && `bg-black text-[red] border-[red]`}
                      border-4 rounded-md inline-block py-2 px-6    
                    `}
        >
          View Auction
        </Link> : <Link
          to={`/auction/${item._id}`}
          style={{ fontWeight: "bold"}}
          className="border-4 rounded-md inline-block py-2 px-6 bg-black text-[white] border-[#606060]"
        >
          View Auction
        </Link> }
        
      </div>
      <ToastContainer />

      </div>
    </>
  );
};

export default AuctionItem;
