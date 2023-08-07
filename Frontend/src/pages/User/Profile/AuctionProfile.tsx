import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as anchor from "@project-serum/anchor";
import { PublicKey, Commitment, ConnectionConfig } from '@solana/web3.js';
import { useAnchorWallet, useConnection, useWallet, } from '@solana/wallet-adapter-react';
import { Link, useParams } from "react-router-dom";
import base58 from "bs58";

import AuctionRarticipant from "../Participant/AuctionParticipant";
import CONFIG from "../../../config";
import { checkDiscordStatus, checkTwitterStatus, createUser, getAllAuctions, getUser } from "../../../services/api";
import { delay, getNftMetaDataByMint } from "../../../utils";
import Navbar from "../../../components/Navbar";
import TwitterBlack from "../../../assets/Twitter-black.png";
import DiscordBlack from "../../../assets/Discord-Black.png";
import infoIconBlack from "../../../assets/InfoIconBlack.png";
import { ToastContainer, toast } from "react-toastify";
import { signAndSendTransactions } from "../../../helper/composables/sol/connection";

import { claimAllBid } from "../../../services/contracts/auction";
import { DECIMAL } from "../../../config/main";
import { TextField } from "@material-ui/core";

const { AUCTION, Backend_URL, SIGN_KEY } = CONFIG;

const AuctionProfile = () => {
  const { walletAddress } = useParams();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [discord, setDiscord] = useState('');
  const [twitter, setTwitter] = useState('');
  const [social, setSocial] = useState(false);

  const [participantLists, setParticipantLists] = useState<any[]>([])
  const [unclaimedLists, setUnclaimedLists] = useState<any[]>([])

  const [isAllTab, setAllTab] = useState(true);
  const [isUnclaimedTab, setUnclaimedTab] = useState(false);
  const [claimableTokenAmount, setClaimableTokenAmout] = useState(0)

  const getData = async () => {
    try {
      if (!anchorWallet) return
      if (anchorWallet.publicKey.toBase58() === CONFIG.ADMIN_WALLET) {
        navigate('/auction')
      }

      if (walletAddress === CONFIG.ADMIN_WALLET) {
        navigate('/')
      }

      const getAuctions: any = await getAllAuctions();

      const provider = new anchor.AnchorProvider(connection, anchorWallet, {
        skipPreflight: true,
        preflightCommitment: "confirmed" as Commitment,
      } as ConnectionConfig);

      const program = new anchor.Program(
        AUCTION.IDL,
        AUCTION.PROGRAM_ID,
        provider
      );

      let get_filterField = []
      let _claimableTokenAmount: number = 0;
      for (let i = 0; i < getAuctions.length; i++) {
        const auctionId = new anchor.BN(getAuctions[i].id);
        const raffleParam = getAuctions[i]?._id

        const [pool] = await PublicKey.findProgramAddress(
          [
            Buffer.from(AUCTION.POOL_SEED),
            auctionId.toArrayLike(Buffer, "le", 8),
            new PublicKey(getAuctions[i].mint).toBuffer(),
          ],
          program.programId
        );
        const poolData: any = await program.account.pool.fetch(pool);
        console.log('poolData', poolData)
        const findMeINPoolData = poolData.bids.find((item: any) =>
          // item?.bidder?.toString() === anchorWallet?.publicKey?.toString()
          item?.bidder?.toString() === walletAddress
        )

        const filterBidderLists: any = []
        for (let i = 0; i < poolData?.bids.length; i++) {
          if (i < poolData?.count) {
            filterBidderLists.push(poolData?.bids[i])
          }
        }
    
        let winner_bidderLists = [];
        for (let i = 0; i < filterBidderLists.length; i++) {
          winner_bidderLists.push(filterBidderLists[i].price.toNumber())
        }
        let high = 0;
        if(winner_bidderLists.length > 0)
          high = Math.max.apply(Math, winner_bidderLists);
       
        const result: any = filterBidderLists.find((item: any) => item.price.toNumber() === high)

        const winner = poolData.bids.find((item: any) => item.isWinner === 1 && item.bidder.toString() === walletAddress)


        const currentBid = Number(findMeINPoolData?.price) / CONFIG.DECIMAL
        const isClaimed = findMeINPoolData?.claimed
        const isWinner = findMeINPoolData?.isWinner
        const topBidder = result?.bidder?.toString()

        const getMetadata = await getNftMetaDataByMint(getAuctions[i].mint)
        
        if (findMeINPoolData) {
          let filter_item = {
            ...getAuctions[i],
            ...poolData,
            id: raffleParam,
            currentBid,
            isClaimed,
            isWinner,
            topBidder,
          }

          if(winner)
           filter_item = {...filter_item,  winnerWalletAddress: walletAddress}

          // get_filterField.push({
          //   image: getMetadata?.image,
          //   name: getMetadata?.data?.name,
          //   tokenName: getMetadata?.data?.name.split('#')[0],
          //   tokenId: getMetadata?.data?.name.split('#')[1],
          // })

          get_filterField.push({...filter_item})
        }
      }
      setParticipantLists(get_filterField)

      const currentTime = Math.floor(Date.now() / 1000);

      let _unclaimedList = get_filterField.filter((item, index) => item.isClaimed === 0 && item.isWinner === 0 && currentTime > item.endTime && item.topBidder !== walletAddress)

      _unclaimedList.map((item:any)=> {
        if(item.currentBid && item.topBidder !== walletAddress){
          _claimableTokenAmount += item.currentBid
          console.log('currentBid', item.currentBid)
        }
      })
      setClaimableTokenAmout(_claimableTokenAmount)
      setUnclaimedLists(_unclaimedList)
    } catch (error) {
      console.log('error', error)
    }
  }

  const handleAllTab = async () => {
    setUnclaimedTab(false)
    setAllTab(true)
  }

  const handleUnclaimedTab = async () => {
    setUnclaimedTab(true)
    setAllTab(false)
  }

  const handleCliamAll = async () => {
    let getTx = null;
    let transactions: any[] = [];

    if(unclaimedLists.length > 0) {
      getTx = await claimAllBid(anchorWallet, unclaimedLists)
      if(getTx) {
        transactions.push(getTx);
      }
    } else {
      toast.error("There is no unclaimed NFT");
      return
    }

    try {
      const res = await signAndSendTransactions(connection, anchorWallet!, transactions);
      if (res?.txid) {
        toast.success("Success on Claim All");
        setUnclaimedLists([])
      } else {
        toast.error("Fail on Claim All");
        return
      }
    
    } catch (error) {
      toast.error("Fail on Claim All");
      return
    }

  }

  const handleConnectDiscord = async () => {
    try {
      if (discord) {
        toast.error(`You have already Discord Account`)
        return;
      }
      if (!anchorWallet) toast.error("Connect your Wallet!");
      let user = await getUser(anchorWallet!.publicKey.toString());
      let signedMessage = null;
      if (!user) {
        signedMessage = await wallet!.signMessage!(new TextEncoder().encode(SIGN_KEY));
      }
      const verifyToken: any = await createUser(anchorWallet!.publicKey.toString(), signedMessage ? base58.encode(signedMessage!) : null);
      localStorage.setItem('token', JSON.stringify(verifyToken));
      setToken(verifyToken);
      if (verifyToken) {
        const res = window.open(Backend_URL + "/api/oauth/discord?token=" + verifyToken);
        setSocial(!social);

        if (res) {
          setTimeout(() => {
            toast.error(`It's time out to discord connecting`)
            setLoading(false)
            return
          }, 300 * 1000)
          for (let i = 0; i < 1;) {
            const user: any = await getUser(anchorWallet!.publicKey.toString());
            await delay(5 * 1000)
            if (user.discordName) {
              setDiscord(user?.discordName)
              toast.success(`Successfully connected`)

              break
            }
          }
        }

      }
    }
    catch (error) {
      console.log('error', error);
    }
  }

  const handleConnectTwitter = async () => {
    try {
      if (twitter) {
        toast.error(`You have already Twitter Account`)
        return
      };

      if (!anchorWallet) toast.error("Connect your Wallet!");
      let user = await getUser(anchorWallet!.publicKey.toString());
      let signedMessage: any = null;
      if (!user) {
        signedMessage = await wallet!.signMessage!(new TextEncoder().encode(SIGN_KEY));
      }
      const verifyToken: any = await createUser(anchorWallet!.publicKey.toString(),  signedMessage ? base58.encode(signedMessage!) : null);
      localStorage.setItem('token', JSON.stringify(verifyToken));
      setToken(verifyToken);
      if (verifyToken) {
        const res = window.open(CONFIG.Backend_URL + "/api/oauth/twitter?token=" + verifyToken);
        setSocial(!social);
        if (res) {
          setTimeout(() => {
            toast.error(`It's time out to twitter connecting`)
            setLoading(false)
            return
          }, 300 * 1000)
          for (let i = 0; i < 1;) {
            const user: any = await getUser(anchorWallet!.publicKey.toString());
            await delay(5 * 1000)
            if (user.twitterName) {
              setDiscord(user?.twitterName)
              toast.success(`Successfully connected`)
              break
            }
          }
        }
      }
    }
    catch (error) {
      console.log('error', error);
    }
  }

  useEffect(() => {
    (async () => {
      if (!anchorWallet) return;
      const discord: any = await checkDiscordStatus(anchorWallet?.publicKey.toString());
      if (discord) setDiscord(discord);
      const twitter: any = await checkTwitterStatus(anchorWallet?.publicKey.toString());
      if (twitter) setTwitter(twitter);
    })();
  }, [anchorWallet, token, social])

  useEffect(() => {
    (async () => {
      setLoading(true);
      await getData();
      setLoading(false);
    })();
  }, [anchorWallet]);

  useEffect(() => {
    (async () => {
      if (!anchorWallet) return;
      const discord: any = await checkDiscordStatus(anchorWallet.publicKey.toBase58());
      if (discord) setDiscord(discord);
      const twitter: any = await checkTwitterStatus(anchorWallet.publicKey.toBase58());
      if (twitter) setTwitter(twitter);
    })();
  }, [anchorWallet, token, social])

  return (
    <>
      {
        isLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      <Navbar />
      <div className="border-white border-b-2">
        <div className="flex items-center justify-between py-5 px-4">
          <h1 className="text-2xl text-white">Welcome Coode</h1>
          { anchorWallet?.publicKey.toString() === walletAddress && <div className="flex">
            <button
              type="button"
              className="py-3 px-4 bg-white rounded-md flex items-center"
              onClick={handleConnectTwitter}
            >
              <img src={TwitterBlack} alt="TwitterBlack" className="w-[25px]" />
              <span className="ml-3">{twitter ? twitter : `Connect Twitter`}</span>
            </button>
            <button
              type="button"
              className="py-3 px-4 bg-white rounded-md flex items-center ml-4"
              onClick={handleConnectDiscord}
            >
              <img src={DiscordBlack} alt="TwitterBlack" className="w-[25px]" />
              <span className="ml-3">{discord ? discord : `Connect Discord`}</span>
            </button>
          </div> }
        </div>
      </div>
      <div className="max-w-[1360px] m-auto px-4 py-4">
        <h1 className="text-4xl text-white">Participations</h1>
        <div className="relative h-[100px] w-full">
          <div className="absolute -mt-5 top-0 left-[-12px] ">
            <div className="sm:px-4 px-2">

              <div className="sm:mt-12 mt-8 flex justify-end max-w-[1280px] m-auto">
                <div className="flex justify-between items-center max-w-3xl w-full">
                  <div className="w-[300px] border bg-white rounded-[0.7rem] p-[1px]">
                    <div className="flex items-center justify-between text-white text-base">
                      <Link
                        to={`/profile/raffle/${walletAddress}`}
                        className="duration-75 transition basis-[49%] text-center text-black py-3 rounded-[0.7rem]"

                      >
                        Raffles
                      </Link>
                      <Link
                        to={`/profile/auction/${walletAddress}`}
                        className=" transition duration-75 btn-background basis-[49%] text-center py-3 rounded-[0.7rem] bg-black"
                      >
                        Auctions
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        {/* { anchorWallet?.publicKey.toString() === walletAddress && <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={handleAllTab}
              className={`${isAllTab
                ? "border border-white rounded-[0.7rem] bg-[#46464680]  text-[#9B9B9B] py-3 px-7"
                : "  bg-black  text-white py-3 px-7"
                }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={handleUnclaimedTab}
              className={`${isUnclaimedTab
                ? "border border-white rounded-[0.7rem] bg-[#46464680]  text-[#9B9B9B] py-3 px-7"
                : " bg-black  text-white py-3 px-7"
                }`}
            >
              Unclaimed
            </button>
         </div>} */}
      </div>

      {
        isAllTab && (participantLists.length > 0 ?
          participantLists.map((item: any, idx: any) =>
              <AuctionRarticipant item={item} idx={idx} key={idx} />
            )
            :
            isLoading ? <></>
              :
              <div className="max-w-[1280px] m-auto px-4">
                <div className="bg-white rounded-md py-8 px-8 flex items-center">
                  <img src={infoIconBlack} alt="infoIconBlack" />
                  <h1 className="xl:text-[3.2rem] lg:text-[2.5rem] md:text-[1.8rem] ml-10">
                  { anchorWallet ? (anchorWallet?.publicKey.toString() === walletAddress ? "You havn’t participated in any Auctions!" : "This wallet hasn’t participated in any Auctions!") : "Please login with your wallet!" }
                  </h1>
                </div>
              </div>
              )
      }

      {
        isUnclaimedTab && <>
            <div className="flex items-center justify-end max-w-[1360px] m-auto px-4 py-4">
              <span className="text-[#FFFFFF]">Claimable Token Amount: {claimableTokenAmount}</span>
              <button
                type="button"
                className="py-3 px-4 bg-white rounded-md flex items-center ml-5 justify-end mr-20"
                onClick={handleCliamAll}
              >
                <span>Claim All</span>
              </button>
              </div>
              {
              (unclaimedLists.length > 0 ?
                unclaimedLists.map((item: any, idx: any) =>
                    <>
                        <AuctionRarticipant item={item} idx={idx} key={idx} />
                    </>
                  )
                  :
                  isLoading ? <></>
                    :
                    <div className="max-w-[1280px] m-auto px-4">
                      <div className="bg-white rounded-md py-8 px-8 flex items-center">
                        <img src={infoIconBlack} alt="infoIconBlack" />
                        <h1 className="xl:text-[3.2rem] lg:text-[2.5rem] md:text-[1.8rem] ml-10">
                        { anchorWallet ? (anchorWallet?.publicKey.toString() === walletAddress ? "There is no unclaimed bid" : "This wallet hasn’t participated in any Auctions!") : "Please login with your wallet" }
                        </h1>
                      </div>
                    </div>
                    )
              }
        </>
      }
      <ToastContainer />
    </>
  );
};

export default AuctionProfile;
