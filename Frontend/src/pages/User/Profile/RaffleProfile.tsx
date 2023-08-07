import { useState, useEffect, startTransition } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as anchor from "@project-serum/anchor";
import { PublicKey, Commitment, ConnectionConfig, LAMPORTS_PER_SOL, Message } from '@solana/web3.js';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Link } from "react-router-dom";
import base58 from "bs58";

import RaffleRarticipant from "../Participant/RaffleParticipant";
import CONFIG from "../../../config";
import { checkDiscordStatus, checkTwitterStatus, createUser, getAllRaffle, getUser } from "../../../services/api";
import { delay, getNftMetaDataByMint } from "../../../utils";
import Navbar from "../../../components/Navbar";
import TwitterBlack from "../../../assets/Twitter-black.png";
import DiscordBlack from "../../../assets/Discord-Black.png";
import infoIconBlack from "../../../assets/InfoIconBlack.png";
import { ToastContainer, toast } from "react-toastify";

const { RAFFLE, SIGN_KEY, Backend_URL } = CONFIG;
var win = null;
const RaffleProfile = () => {
  const { walletAddress } = useParams();
  const wallet = useWallet();
  const anchorWallet: any = useAnchorWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [discord, setDiscord] = useState('');
  const [twitter, setTwitter] = useState('');
  const [social, setSocial] = useState(false);
  const [participantLists, setParticipantLists] = useState<any[]>([])

  const getData = async () => {
    try {
      if (!anchorWallet) return
      if (anchorWallet.publicKey.toBase58() === CONFIG.ADMIN_WALLET) {
        navigate('/')
      }

      if (walletAddress === CONFIG.ADMIN_WALLET) {
        navigate('/')
      }
      const getRaffle: any = await getAllRaffle();
      const provider = new anchor.AnchorProvider(connection, anchorWallet, {
        skipPreflight: true,
        preflightCommitment: "confirmed" as Commitment,
      } as ConnectionConfig);

      const program = new anchor.Program(
        RAFFLE.IDL,
        RAFFLE.PROGRAM_ID,
        provider
      );

      let get_filterField = []
      for (let i = 0; i < getRaffle.length; i++) {
        const raffleId = new anchor.BN(getRaffle[i].id);
        const raffleParam = getRaffle[i]?._id
        const [pool] = await PublicKey.findProgramAddress(
          [
            Buffer.from(RAFFLE.POOL_SEED),
            raffleId.toArrayLike(Buffer, "le", 8),
            new PublicKey(getRaffle[i].mint).toBuffer(),
          ],
          program.programId
        );
        const poolData: any = await program.account.pool.fetch(pool);
        const winner = poolData.buyers.find((item: any) => item.isWinner === 1 && item.buyer.toString() === walletAddress)
        console.log('winner', winner)
        const findMeINPoolData = poolData.buyers.find((item: any) =>
          // item?.buyer?.toString() === anchorWallet?.publicKey?.toString()
          item?.buyer?.toString() === walletAddress
        )

        if (findMeINPoolData) {
          let filter_item = {
            ...getRaffle[i],
            ...poolData,
            id: raffleParam
          }

          if(winner)
            filter_item = {...filter_item,  winnerWalletAddress: walletAddress}

          // const getMetadata = await getNftMetaDataByMint(getRaffle[i].mint)
          // console.log("Object.keys(getMetadata).length", Object.keys(getMetadata).length)
          // if(Object.keys(getMetadata).length > 0) {
          //   filter_item = {
          //     ...filter_item,
          //     image: getMetadata?.image || ``,
          //     name: getMetadata?.data?.name || ``,
          //     tokenName: getMetadata?.data?.name.split('#')[0] || ``,
          //     tokenId: getMetadata?.data?.name.split('#')[1] || ``,
          //   }
          // }
          get_filterField.push({...filter_item})
        }
      }
      console.log('get_filterField=================', get_filterField)
      setParticipantLists(get_filterField)
    } catch (error) {
      console.log('error', error)
    }
  }

  const handleConnectDiscord = async () => {
    try {
      if (discord) {

        toast.error(`You have already Discord Account`)
        return;
      }
      if (!anchorWallet) toast.error("Connect your Wallet!");
      setLoading(true)
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
              setDiscord(user.discordName)
              toast.success(`Successfully connected`)

              break
            }
          }
        }
      }
      setLoading(false)

    }
    catch (error) {
      console.log('error', error);
      setLoading(false)

    }
  }

  const handleConnectTwitter = async () => {
    try {
      if (twitter) {
        toast.error(`You have already Twitter Account`)
        return
      };
      if (!anchorWallet) toast.error("Connect your Wallet!");
      setLoading(true)
      let user = await getUser(anchorWallet!.publicKey.toString());
      let signedMessage: any = null;
      if (!user) {
        signedMessage = await wallet!.signMessage!(new TextEncoder().encode(SIGN_KEY));
      }
      const verifyToken: any = await createUser(anchorWallet!.publicKey.toString(), signedMessage ? base58.encode(signedMessage!) : null);
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
              setTwitter(user?.twitterName)
              toast.success(`Successfully connected`)

              break
            }
          }
        }
      }
      setLoading(false)
    }
    catch (error) {
      console.log('error', error);
      setLoading(false)

    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await getData();
      setLoading(false);
    })();
  }, [anchorWallet, walletAddress]);

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
          <h1 className="text-2xl text-white">Welcome Coode </h1>
          { anchorWallet?.publicKey.toString() === walletAddress &&  <div className="flex">
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
              <span className="ml-3">{discord ? discord : ` Connect Discord`}</span>
            </button>
          </div>}
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
                    <div className="rounded-[0.7rem]">
                      <div className="flex items-center justify-between text-white text-base">
                        <Link
                          to={`/profile/raffle/${walletAddress}`}
                          className=" transition duration-75 btn-background basis-[49%] text-center py-3 rounded-[0.7rem] bg-black"
                        >
                          Raffles
                        </Link>
                        <Link
                          to={`/profile/auction/${walletAddress}`}

                          className="duration-75 transition basis-[49%] text-center text-black py-3 rounded-[0.7rem]"
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
        </div>
      </div>

      {
        participantLists.length > 0 ?
          participantLists.map((item: any, idx: any) =>
            <RaffleRarticipant item={item} idx={idx} key={idx} walletAddress={walletAddress}/>
          )
          :
          isLoading ? <></>
            :
            <div className="max-w-[1280px] m-auto px-4">
              <div className="bg-white rounded-md py-8 px-8 flex items-center">
                <img src={infoIconBlack} alt="infoIconBlack" />
                <h1 className="xl:text-[3.2rem] lg:text-[2.5rem] md:text-[1.8rem] ml-10">
                  { anchorWallet ? (anchorWallet?.publicKey.toString() === walletAddress ? "You havn’t participated in any Raffles!" : "This wallet hasn’t participated in any Raffles!") : "Please login with your wallet!"}
                  
                </h1>
              </div>
            </div>
      }
      <ToastContainer />
    </>
  );
};

export default RaffleProfile;
