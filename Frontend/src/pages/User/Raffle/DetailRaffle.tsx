import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import * as anchor from "@project-serum/anchor";
import {
  Commitment,
  ConnectionConfig,
  PublicKey,
} from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Countdown, { CountdownApi } from 'react-countdown'

import CONFIG from "../../../config";
import Navbar from "../../../components/Navbar";
import {
  VerifyCollection,
  buyTicketsForRaffle,
  claimPrizeForRaffle,
  claimCoodeForAdmin
} from "../../../services/contracts/raffle";
import { getRaffleById } from "../../../services/api";
import ReturnIcon from "../../../assets/return-icon.png";
import ReportIcon from "../../../assets/Report-icon.png";
import ShareIcon from "../../../assets/Share-icon.png";
import PricetagIcon from "../../../assets/pricetag-icon.png";
import VerificationIcon from "../../../assets/Verification-icon-2.png";
import UnionIcons from "../../../assets/Union-icons.png";
import TimingIcon from "../../../assets/Subtract-timing-icon.png";
import TicketIcon from "../../../assets/Subtract-ticket-icon.png";
import DateIcon from "../../../assets/Subtract.-date-icon.png";
import { connection, delay } from "../../../utils";
import commonService from "../../../services/common.service";
import { prettyNumber } from "../../../utils";
import FilterRaffles from "../../Admin/Raffle/FilterRaffle";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const { RAFFLE, API_URL, ADMIN_WALLET } = CONFIG;

const UserDetailRaffle = () => {
  const { id } = useParams();
  const anchorWallet = useAnchorWallet();
  const [isLoading, setLoading] = useState(false);
  const [nftInfo, setNftInfo] = useState<any>([]);
  const [amount, setAmount] = useState<any>(``);
  const [raffleStatus, setRaffleStatus] = useState(0);
  const [buyerInfo, setBuyerInfo] = useState<any>(null);
  const [raffleInfo, showraffleInfo] = React.useState<string>("raffleinfo");
  const [ownerBiddingStatus, setOwnerBiddingStatus] = useState(false)
  const [isWinner, setWinner] = useState(false)
  const [ticketBuyerLists, setTicketBuyerLists] = useState<any>([])
  const [remainTickets, setRemainTickets] = useState(0)
  const [myTickets, setMyTickets] = useState(0)
  const [buyTicketStatus, setBuyTicketStatus] = useState({
    status: false,
    lists: []
  })
  const [winnerPrized, setWinnerPrized] = useState({
    winner: false,
    prized: false
  })
  const [floorPrice, setFloorPrice] = useState('')
  const [winnerWalletAddress, setWinnerWalletAddress] = useState('')
  const [winnerTicket, setWinnerTicket] = useState(0)
  const currentTime = Math.floor(Date.now() / 1000);

  let startCountdownApi: CountdownApi | null = null
  let countdownEndApi: CountdownApi | null = null

  const setStartCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      startCountdownApi = countdown.getApi()
    }
  }

  const setEndCountdownRef = (countdown: Countdown | null) => {
    if (countdown) {
      countdownEndApi = countdown.getApi()
    }
  }

  const startCountdownRenderer = ({ api, days, hours, minutes, seconds, completed }: any) => {
    if (api.isPaused()) api.start()
    return (
      completed ?
        <Countdown
          ref={setEndCountdownRef}
          date={nftInfo.end_date * 1000}
          zeroPadTime={3}
          onComplete={handleEndComplete}
          renderer={countdownEndRenderer}
        />
        :
        <div className="flex gap-1" >
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


  const countdownEndRenderer = ({ api, days, hours, minutes, seconds, completed }: any) => {
    if (api.isPaused()) api.start()
    return (
      completed ?
        <p>ENDED</p>
        :
        <div className="flex gap-1"  >
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

  const handleBuyTicket = async () => {
    try {
      if (!buyTicketStatus.status) {
        toast.error(`No exist Specific NFT in your Wallet`)
        return
      }
      if (buyTicketStatus.status && buyTicketStatus.lists.length < (nftInfo.min_nft_count || 1)) {
        toast.error(`You have to ${nftInfo.min_nft_count || 1} or more Specific NFTs in your Wallet`)
        return
      }

      if (raffleStatus !== 1) {
        toast.error(`You can't buy ticket.`)
        return
      };
      if (nftInfo.purchasedTicket === nftInfo.total_tickets) {
        toast.error('Already Sold Out')
        return
      }
      if (amount <= 0) {
        toast.error('Please enter price value exactly');
        return
      }
      if (amount > nftInfo.total_tickets - nftInfo.purchasedTicket) {

        toast.error(`You can buy Max ${nftInfo.total_tickets - nftInfo.purchasedTicket} tickets`);
        return
      }
      setLoading(true);
      const res = await buyTicketsForRaffle(anchorWallet, nftInfo, amount, buyTicketStatus.lists);
      const _amount = Number(amount)
      if (res) {
        toast.success("Success on buying tickets");
        setBuyerInfo({
          ...buyerInfo,
          purchasedTicket: buyerInfo?.purchasedTicket
            ? buyerInfo?.purchasedTicket + _amount
            : _amount,
        });
        setNftInfo({
          ...nftInfo,
          purchasedTicket: nftInfo?.purchasedTicket
            ? nftInfo?.purchasedTicket + _amount
            : _amount,
          count: nftInfo.count + _amount
        });
        setRemainTickets(remainTickets - _amount)
        setMyTickets(buyerInfo?.purchasedTicket + _amount)
        setOwnerBiddingStatus(true)
        // change amount or push field
        const finditem = ticketBuyerLists.find((item: any) =>
          item?.buyer?.toString() === anchorWallet?.publicKey?.toString())
        const findIdx = ticketBuyerLists.findIndex((item: any) =>
          item?.buyer?.toString() === anchorWallet?.publicKey?.toString())
        if (finditem) {
          const new_buyerLists = ticketBuyerLists.map((item: any, idx: any) => {
            return idx === findIdx ? { ...ticketBuyerLists[findIdx], purchasedTicket: ticketBuyerLists[findIdx].purchasedTicket + _amount } : item
          })
          setTicketBuyerLists(new_buyerLists)
        } else {
          setTicketBuyerLists([...ticketBuyerLists, {
            buyer: new PublicKey(anchorWallet?.publicKey?.toString()!),
            purchasedTicket: _amount,
            isWinner: 0
          }])
        }
      } else {
        toast.error("Fail on buying tickets");
      }
      setLoading(false);
    } catch (error) {

      setLoading(false);
      toast.error("Fail on buying tickets");
    }
  };

  const handleClaimPrize = async () => {
    try {
      if (winnerPrized.prized) {
        toast.error(`You have already claimed`)
        return
      }

      setLoading(true);
      const res = await claimPrizeForRaffle(anchorWallet, nftInfo);
      if (res) {
        toast.success("Success on claiming prize");
        setRaffleStatus(2)
        setWinnerPrized({
          ...winnerPrized,
          prized: true
        })
      } else {
        toast.error("Fail on claiming prize");
      }
      setLoading(false);
    } catch (error) {

      setLoading(false);
      toast.error("Fail on claiming prize");
    }
  };

  const handleClaimCoode = async () => {
    try {
      setLoading(true);
      const res = await claimCoodeForAdmin(anchorWallet, nftInfo);
      if (res) {
        toast.success("Success on claiming coode");
        setWinnerPrized({
          ...winnerPrized,
          prized: true
        })
      } else {
        toast.error("Fail on claiming coode");
      }
      setLoading(false);
    } catch (error) {

      setLoading(false);
      toast.error("Fail on claiming coode");
    }
  };

  const getUserInfo = async (buyers: any[]) => {
    const filterBuyerLists = buyers.filter((item: any) => item.purchasedTicket > 0)
    const winnerInfo = buyers.find((item: any) => item.purchasedTicket >0 && item.isWinner === 1)
    if(winnerInfo){
      setWinnerWalletAddress(winnerInfo.buyer.toString())
      setWinnerTicket(winnerInfo.purchasedTicket) 
    }

    const get_user: any = await commonService({
      method: `get`,
      route: `${API_URL}/user/${anchorWallet?.publicKey.toBase58()}`
    })
    if (get_user) {
      if (get_user?.twitterName) {
        const filter = filterBuyerLists.map((item) => {
          return item?.buyer?.toString() === get_user?.walletAddress ? { ...item, name: get_user?.twitterName }
            : item
        })
        setTicketBuyerLists(filter)
      } else if (get_user?.discordName) {
        const filter = filterBuyerLists.map((item) => {
          return item?.buyer?.toString() === get_user?.walletAddress ? { ...item, name: get_user?.discordName }
            : item
        })
        setTicketBuyerLists(filter)
      } else {
        setTicketBuyerLists(filterBuyerLists)
      }

    } else {
      setTicketBuyerLists(filterBuyerLists)

    }

    const buyer = buyers.find((item: any) => {
      return item.buyer.toString() === anchorWallet?.publicKey?.toString();
    });
    if (buyer) {
      setBuyerInfo(buyer);
      setOwnerBiddingStatus(true)
    } else {

      setOwnerBiddingStatus(false)
    }
  };

  const getRaffleStatus = async (poolData: any) => {
    let status = 0;

    if (currentTime + 90 > poolData.endTime) {
      status = 2
    } else if (currentTime > poolData.startTime) {
      status = 1
    }
    setRaffleStatus(status);
  

    if (poolData?.state === 1) {

        try {
          const claim_status = poolData?.buyers.find((item: any) => item?.isWinner === 1)

        } catch (error) {
          console.log('error', error)
        }

     


      setWinnerPrized({
        ...winnerPrized,
        winner: true,
      })
    }

    if (poolData.state === 2) {
      setWinnerPrized({
        ...winnerPrized,
        prized: true,
      })
    }

  };

  useEffect(() => {
    (async () => {
      try {
        if (!anchorWallet) return
        const nftInfoById: any = await getRaffleById(id);

        setLoading(true);

        const provider = new anchor.AnchorProvider(connection, anchorWallet!, {
          skipPreflight: true,
          preflightCommitment: "confirmed" as Commitment,
        } as ConnectionConfig);

        const program = new anchor.Program(
          RAFFLE.IDL,
          RAFFLE.PROGRAM_ID,
          provider
        );

        
        const verifyCollection: any = await VerifyCollection(anchorWallet?.publicKey.toBase58(), connection)
        
        if (verifyCollection?.status) {
          setBuyTicketStatus({
            status: true,
            lists: verifyCollection.lists
          })

        } else {
          setBuyTicketStatus({
            status: false,
            lists: []
          })
        }

        const raffleId = new anchor.BN(nftInfoById.id);
        
        const [pool] = await PublicKey.findProgramAddress(
          [
            Buffer.from(RAFFLE.POOL_SEED),
            raffleId.toArrayLike(Buffer, "le", 8),
            new PublicKey(nftInfoById.mint).toBuffer(),
          ],
          program.programId
        );

        try {
          
          const poolData: any = await program.account.pool.fetch(pool);
          setRemainTickets(poolData?.totalTicket - poolData?.purchasedTicket)
          getUserInfo(poolData.buyers);
          getRaffleStatus(poolData);
        } catch (error) {
          console.log('poolData Error!', error)
        }


        setInterval(async () => {
          if (anchorWallet) {
            const poolData: any = await program.account.pool.fetch(pool);
            // if (claim_status?.buyer.toBase58() === anchorWallet.publicKey.toBase58()  ) {
            //   setWinner(true)
            // } else {
            //   setWinner(false)
            // }
            setRemainTickets(poolData?.totalTicket - poolData?.purchasedTicket)
            getUserInfo(poolData.buyers);
            getRaffleStatus(poolData);
          }

        }, 7000);

        startCountdownApi?.start()
        countdownEndApi?.start()
        setLoading(false);

      } catch (error) {

      }
    })();
  }, [anchorWallet]);

  useEffect(()=>{
    (
      async() => {
      
        try {
          // setLoading(true);
      
        const nftInfoById: any = await getRaffleById(id);
        document.title = `Coode | Raffle | ${nftInfoById?.tokenName}`;
        setFloorPrice(nftInfoById?.floor_price || '_');
        const provider = new anchor.AnchorProvider(connection, anchorWallet!, {
          skipPreflight: true,
          preflightCommitment: "confirmed" as Commitment,
        } as ConnectionConfig);

        const program = new anchor.Program(
          RAFFLE.IDL,
          RAFFLE.PROGRAM_ID,
          provider
        );

        const raffleId = new anchor.BN(nftInfoById.id);
        const [pool] = await PublicKey.findProgramAddress(
          [
            Buffer.from(RAFFLE.POOL_SEED),
            raffleId.toArrayLike(Buffer, "le", 8),
            new PublicKey(nftInfoById.mint).toBuffer(),
          ],
          program.programId
        );

        const poolData: any = await program.account.pool.fetch(pool);
        const startDateFormat = new Date(nftInfoById.start_date * 1000)
        const start_date = startDateFormat.getDate() +
          "/" + (startDateFormat.getMonth() + 1) +
          "/" + startDateFormat.getFullYear() +
          " " + startDateFormat.getHours() +
          ":" + startDateFormat.getMinutes() +
          ":" + startDateFormat.getSeconds()

        const endDateFormat = new Date(nftInfoById.end_date * 1000)
        const end_date = endDateFormat.getDate() +
          "/" + (endDateFormat.getMonth() + 1) +
          "/" + endDateFormat.getFullYear() +
          " " + endDateFormat.getHours() +
          ":" + endDateFormat.getMinutes() +
          ":" + endDateFormat.getSeconds()
          
          console.log('poolData============', poolData)
          setNftInfo({
          ...nftInfoById,
          project: nftInfoById.project,
          price: nftInfoById.price,
          count: poolData.count,
          purchasedTicket: poolData?.purchasedTicket ? poolData?.purchasedTicket : 0,
          total_tickets: poolData?.totalTicket,
          start: start_date,
          end: end_date,
          end_date: poolData?.endTime
        });
        // setLoading(false)

        } catch (error) {
          
        }
      }
    )()
  },[])

  const handleStartComplete = () => {
    if (Date.now() > nftInfo.start_date * 1000 && Date.now() < nftInfo.end_date * 1000) {
      setRaffleStatus(1)
    }
  }

  const handleEndComplete = () => {
    if (currentTime + 90 > nftInfo.end_date) {
      setRaffleStatus(2)
    }
  }

  console.log('raffleStatus', raffleStatus)

  return (
    <div>
      {
        isLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      <div className="bg-black">
        <Navbar />
        <div className="max-w-[1240px] m-auto pt-8 pb-16 px-4">
          <div className="xl:flex justify-between block">
            {/* Info Left  */}
            <div className="xl:basis-[35%] max-w-[450px] m-auto xl:max-w-auto xl:m-0 pb-6 xl:pb-0">
              <div className="rounded-[0.9rem] overflow-hidden border-4 border-[#606060] transition duration-1000">
                <div className="relative">
                  <img
                    src={nftInfo?.image}
                    alt="CoodeImage"
                    className="h-[450px] w-full object-cover"
                  />
                  <div className="absolute top-0 left-0 h-full w-full">
                    <div className="flex justify-between items-end h-full p-2">
                      <div className="flex justify-between items-start w-full">
                        {/* <div className="border-black bg-[#949494] border flex rounded-md overflow-hidden">
                          <p className="bg-white text-base pt-[4px] pl-2 pr-3 para-clip-2">
                            <img
                              src={UnionIcons}
                              alt="UnionIcons"
                              className="w-[10px]"
                            />
                          </p>
                          <p className="py-[2px] pl-[2px] pr-[5px] text-[12px] text-white">
                            #0001
                          </p>
                        </div> */}
                        <div className="border-black bg-[#949494] border flex rounded-md overflow-hidden">
                          <p className="bg-white text-[12px] pt-[2px] pl-2 pr-3 para-clip-3">
                            Min NFT Count
                          </p>
                          <p className="py-[2px] pl-[2px] pr-[5px] text-[12px] text-white">
                            { nftInfo?.min_nft_count || 1 }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex items-cetner justify-center">
                <button
                  type="button"
                  className="text-black bg-white rounded-[0.7rem] flex items-center py-3 px-5"
                >
                  <img
                    src={PricetagIcon}
                    alt="Pricetag-icon"
                    className="w-[22px]"
                  />
                  <span className="ml-3 text-lg">
                    Price: {nftInfo.price} $COODE per Ticket
                  </span>
                </button>
              </div>
              <div className="mt-5">
                { !anchorWallet && <div className="flex items-cetner justify-center">
                  <WalletMultiButton startIcon={undefined} />
                </div> }
                { anchorWallet && <>
                { isLoading ? <></> : 
                  <div className="text-center mt-5">
                      <div className="flex items-center justify-between">
                        <input
                          type="number"
                          name="solValue"
                          value={amount}
                          min={0}
                          placeholder="0"
                          onChange={(e) => setAmount(prettyNumber(e.target.value))}
                          className="w-[48%] block text-white text-base text-center outline-none bg-[#82828240] border border-[#606060] rounded-[0.7rem] py-3 px-5"
                          disabled={raffleStatus !== 1}
                        />
                        <button
                          type="button"
                          onClick={handleBuyTicket}
                          className={`basis-[48%]  text-black bg-white rounded-[0.7rem]  py-3 sm:px-5 ${raffleStatus === 2 || raffleStatus === 1 && remainTickets === 0 ? ` opacity-80 cursor-no-drop ` : ` opacity-100 cursor-pointer `} `}
                        >
                          <span className="sm:text-lg text-sm text-black">
                            Buy Ticket(s)
                          </span>
                        </button>
                        {/* <button
                          type="button"
                          className="text-black bg-white rounded-[0.7rem] flex items-center justify-center py-3 px-5"
                        >
                          <img
                            src={ShareIcon}
                            alt="Pricetag-icon"
                            className="w-[22px]"
                          />
                        </button> */}
                      </div>
                    {/* <h1 className="text-3xl text-[#15BFFD] bold text-center mt-10 mb-9" style={{ textShadow: '0px 8px 56px rgba(21, 191, 253, 0.5), 0px 6px 4px rgba(21, 191, 253, 0.18)' }}>Raffle Info</h1> */}
                    {/* {
                      raffleStatus === 0 ?
                        <p className="text-white text-[1.25rem]">None</p> :
                        raffleStatus === 1 ?
                          <p className="text-white text-[1.25rem]">Pending</p> :
                          isWinner ?
                            <p className="text-white text-[1.25rem]">Win</p> :
                            <p className="text-white text-[1.25rem]">Fail</p>
                    } */}
                    {/* {
                      !isLoading && raffleStatus === 0 && <p className="text-white text-[1.25rem]">None</p>
                    } */}
                    {/* {
                      (raffleStatus === 1 && remainTickets === 0) &&  <p className="text-white text-[1.25rem]">Pending</p>
                    } */}
                    {
                      (raffleStatus === 1 && remainTickets === 0 && winnerWalletAddress === '') &&  <p className="text-white text-[1.25rem]">Waiting</p>
                    }
                   {
                    (raffleStatus === 2 || raffleStatus === 1 && remainTickets === 0) && <>
                      <div className="flex items-center justify-between mt-5">
                        <div className="text-white" style={{ 
                          padding: "20px",
                          width:  "100%",
                          border: "3px solid orange", 
                          borderRadius: "10px"
                        }}>
                          <p className="text-[orange]">Raffle Winner!</p>
                          <h1 style={{fontSize: "26px", fontWeight: "bold"}}>
                              { winnerWalletAddress !=='' && winnerWalletAddress === anchorWallet?.publicKey.toString() && `You win!`}
                              { winnerWalletAddress !=='' && winnerWalletAddress !== anchorWallet?.publicKey.toString() && <Link to={`/profile/raffle/${winnerWalletAddress}`}>{winnerWalletAddress.substr(0, 6)}...{winnerWalletAddress.substr(winnerWalletAddress.length - 4, 4)}</Link>}
                              { winnerWalletAddress === '' && `No winner`}

                          </h1>
                          { winnerWalletAddress !=='' && winnerWalletAddress === anchorWallet?.publicKey.toString() && !winnerPrized.prized && <div className="btn-gradient rounded-full p-[1px]">
                            <div className="btn-background-absolute rounded-full">
                              <p className={`text-[1.25rem] text-center py-2 px-8 block text-[#15BFFD] m-0 ${!winnerPrized.prized ? 'cursor-pointer' : 'cursor-no-drop'}`}
                                onClick={handleClaimPrize}
                              >
                                Claim Prize
                              </p>
                            </div>
                          </div>}
                          { winnerWalletAddress !== '' && <p className="text-[orange]">Won with {winnerTicket} ticket(s)</p>}
                        </div>
                      </div>
                    </>
                  }
                  {/* { anchorWallet?.publicKey.toString() === ADMIN_WALLET && <div className="btn-gradient rounded-full p-[1px] mb-3">
                    <div className="btn-background-absolute rounded-full">
                      <p className={`text-[1.25rem] text-center py-2 px-8 block text-[#15BFFD] m-0 cursor-pointer`}
                        onClick={handleClaimCoode}
                      >
                        Claim Coode
                      </p>
                    </div>
                  </div>} */}
                </div>}
                </>}
              </div>
            </div>


            {/* Info Right  */}
            <div className="basis-[63%]">
              <div className="border-4 border-[#606060] bg-[#60606040] rounded-[0.7rem]">
                <div className="flex justify-between p-4">
                  <div>
                    <div className="flex items-center">
                      <img
                        src={VerificationIcon}
                        alt="VerificationIcon"
                        className="w-[20px]"
                      />
                      &nbsp;
                      <p className="text-white">{nftInfo.collectionName || `Verified Collecion`}</p>
                    </div>
                    <h1 className="text-3xl text-white mt-1">{nftInfo.tokenName}</h1>
                    <p className="text-[#A0A0A0] text-lg">
                      Total Ticket Value:&nbsp;
                      {buyerInfo ? Number(nftInfo.price * nftInfo.purchasedTicket).toFixed(2) : 0} $COODE
                    </p>
                    <div className="flex items-center mt-4">
                      <button
                        type="button"
                        className={`${raffleInfo === "raffleinfo"
                          ? "border border-white bg-black text-white py-2 rounded-[0.6rem] sm:px-4 px-2 text-sm sm:text-base"
                          : "text-white"
                          } `}
                        onClick={() => showraffleInfo("raffleinfo")}
                      >
                        Raffle Info
                      </button>
                      <button
                        type="button"
                        onClick={() => showraffleInfo("participants")}
                        // className="ml-3 text-white py-2 rounded-[0.6rem] px-4"
                        className={`${raffleInfo === "participants"
                          ? "border border-white ml-6 bg-black text-white py-2 rounded-[0.6rem] sm:px-4 px-2 text-sm sm:text-base"
                          : "text-white ml-6"
                          } `}
                      >
                        Participants
                      </button>
                    </div>
                  </div>
                  <div>
                    <Link to='/' >
                      <button
                        type="button"
                        className="text-black bg-white rounded-[0.7rem] flex items-center py-3 px-5"
                      >
                        <img src={ReturnIcon} alt="ReturnIcon" />
                        <span className="text-black inline-block ml-1">
                          Return
                        </span>
                      </button>
                    </Link>
                    {/* <div className="flex items-center">
                      <img src={ReportIcon} alt="ReportIcon" />
                      <span className="text-[#AA0000] inline-block ml-1">
                        Report
                      </span>
                    </div> */}
                  </div>
                </div>
                <div className="h-[2px] w-[95%] m-auto bg-[#606060]"></div>
                {raffleInfo === "raffleinfo" && (
                  <div className="bg-[#323232] py-4 px-4 sm:px-0 mt-4">
                    <div className="sm:flex block justify-between sm:w-[85%] m-auto">
                      <div className="text-center">
                        <img
                          src={TimingIcon}
                          alt="TimingIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[#878787]">Time Remaining</p>
                        <div className="text-white">
                          {
                            nftInfo?.start_date && <Countdown
                              ref={setStartCountdownRef}
                              date={nftInfo?.start_date * 1000}
                              zeroPadTime={3}
                              renderer={startCountdownRenderer}
                              onComplete={handleStartComplete}
                            />
                          }

                        </div>
                      </div>
                      <div className="text-center md:px-10 px-6 py-4 sm:py-0 my-4 sm:my-0 sm:border-r sm:border-l border-dashed">
                        <img
                          src={TicketIcon}
                          alt="TimingIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[#878787]">Tickets Remaining</p>
                        <p className="text-white">
                            {remainTickets === 0 ? 'SOLD OUT' : `${remainTickets}/${nftInfo.total_tickets}` }
                          </p>
                      </div>
                      <div className="text-center">
                        <img
                          src={DateIcon}
                          alt="TimingIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[#878787]">Start Date</p>
                        <p className="text-white">{nftInfo?.start}</p>
                      </div>
                    </div>
                    <div className="sm:flex block justify-between sm:w-[85%] m-auto mt-5">
                      <div className="text-center">
                        <img
                          src={TicketIcon}
                          alt="TicketIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[#878787]">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Floor Price&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
                        <p className="text-white">{floorPrice}</p>
                      </div>
                      <div className="text-center md:px-10 px-6 py-4 sm:py-0 my-4 sm:my-0 sm:border-r sm:border-l border-dashed">
                        <img
                          src={TicketIcon}
                          alt="TimingIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[#878787]">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;My Tickets&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
                        { anchorWallet ? <p className="text-white">
                          {buyerInfo ? buyerInfo.purchasedTicket : 0}
                        </p> : <p className="text-white">_</p>}
                      </div>
                      <div className="text-center">
                        <img
                          src={DateIcon}
                          alt="TimingIcon"
                          className="max-w-[60px] m-auto"
                        />
                        <p className="text-[#878787]">End Date</p>
                        <p className="text-white">{nftInfo?.end}</p>
                      </div>
                    </div>
                  </div>
                )}
                {raffleInfo === "participants" && (
                  <div
                    className="text-white py-4 max-h-[447px] overflow-y-auto"
                    id="wallet-list"
                  >
                    <ul className="py-3 px-4 w-full flex justify-between">
                      <li className="basis-[50%] text-xl">Wallet</li>
                      <li className="basis-[50%] text-xl text-center">
                        Tickets Bought
                      </li>
                    </ul>
                    {
                      ticketBuyerLists.map((item: any) => {
                        return (
                          <ul className="py-2 px-4 w-full flex justify-between">
                            <li className="basis-[50%] text-base">
                              { item?.name ? item?.name : <Link to={`/profile/raffle/${item?.buyer.toBase58()}`}>{item?.name ? item?.name : item?.buyer.toBase58()?.substr(0, 6) + '...' + item?.buyer.toBase58()?.substr(item?.buyer.toBase58().length - 4, 4)}</Link> }
                              { item.isWinner === 1 && <span style={{ color: "yellow"}}>&nbsp;&nbsp;&nbsp;Winner</span>}
                              {/* {item?.name} */}
                            </li>
                            <li className="basis-[50%] text-base text-center">{item?.purchasedTicket}</li>
                          </ul>
                        )
                      })
                    }
                  </div>
                )}
                <div className="p-4">
                  <h1 className="text-2xl text-white">Terms & Conditions</h1>
                  <div className="text-white mt-2 text-base list-decimal px-5">
                    <pre>{nftInfo.description}</pre>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};
export default UserDetailRaffle;
