import { useEffect, useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { ToastContainer, toast } from "react-toastify";
import Countdown, { CountdownApi } from 'react-countdown'
import { Link } from "react-router-dom";

import UnionIcons from "../assets/Union-icons.png";
import VerificationIcon from "../assets/Verification-icon.png";
import { buyTicketsForRaffle } from '../services/contracts/raffle';

import "react-toastify/dist/ReactToastify.css";
import { prettyNumber } from '../utils';

const RaffleUserItem = (props: any) => {
  const { item, id, isFeatured, featuredData, setFeaturedData, isAllRaffles, raffleData, setRaffleData, isPastRaffles, pastData, setPastData, buyTicketNFT } = props;
  const anchorWallet = useAnchorWallet()
  const [amount, setAmount] = useState<any>(``);
  const [myTicket, setMyTicket] = useState(item.myTicket)
  const [isLoading, setLoading] = useState(false);
  const currentTime = Math.floor(Date.now() / 1000);

  let startCountdownApi: CountdownApi | null = null
  let endCountdownApi: CountdownApi | null = null

  useEffect(() => {
    setMyTicket(item.myTicket)
  }, [item])

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

  const handleBuyTicket = async (item: any, idx: any) => {
    try {
      const _amount = Number(amount)
      if (idx === 0 || idx) {
        if (_amount <= 0) {
          toast.error('Please enter price value exactly');
          return
        }
        if (!buyTicketNFT.status) {
          toast.error(`No exist Specific NFT in your Wallet`)
          return
        }
        if (buyTicketNFT.status && buyTicketNFT.lists.length < (item.min_nft_count || 1)) {
          toast.error(`You have to ${item.min_nft_count || 1} or more Specific NFTs in your Wallet`)
          return
        }
        if (currentTime < item?.start_date || currentTime + 90 > item?.end_date) {
      
          toast.error(`Time is almost up, You can't buy NFT`);
          return;
        }
        if (item.purchasedTicket + _amount > item.total_tickets) {

          toast.error(`You can buy Max ${item.total_tickets - item.purchasedTicket} tickets`);
          return
        }
        setLoading(true)

        const res = await buyTicketsForRaffle(anchorWallet, item, _amount, buyTicketNFT.lists)
        setMyTicket(myTicket + _amount)

        if (res) {
          toast.success("Success on buying tickets");

          if (isFeatured) {
            const count_increase = featuredData.map((obj: any, id: any) => {
              if (id === idx) { obj.purchasedTicket = obj.purchasedTicket + _amount; } return obj
            })
            setFeaturedData(count_increase)
          }

          if (isAllRaffles) {
            const count_increase = raffleData.map((obj: any, id: any) => {
              if (id === idx) { obj.purchasedTicket = obj.purchasedTicket + _amount; } return obj
            })
            setRaffleData(count_increase)
          }

          if (isPastRaffles) {
            const count_increase = pastData.map((obj: any, id: any) => {
              if (id === idx) { obj.purchasedTicket = obj.purchasedTicket + _amount; } return obj
            })
            setPastData(count_increase)
          }

        } else {
          toast.error("Fail on buying tickets");
        }
        setLoading(false)
      }
    } catch (error) {
      console.log('error', error)
      toast.error("Fail on buying tickets");
      setLoading(false)

    }
  }

  return (
    <>
        {
        isLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
    <div
      className="xl:basis-[24%] lg:basis-[32%] md:basis-[48%] sm:basis-[48%] basis-[100%] mt-6"
      key={id}
    >
      <div className="rounded-[0.9rem] overflow-hidden border-4 border-[#606060]">
        <div className="relative">
          <img
            src={item?.image}
            alt="CoodeImage"
            className="md:min-h-[300px] w-full object-cover"
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
          <div className="pt-2 pl-3 pr-3" style={{ minHeight: "200px"}}>
            <div className="flex justify-between">
              <div className="basis-[50%]">
                <p className="text-sm">Tickets Remaining</p>
                <p className="text-sm text-[#4A4A4A] font-bold">
                  {item.total_tickets - item.purchasedTicket === 0 ? <b>SOLD OUT</b> : `${item.total_tickets - item.purchasedTicket}/${item.total_tickets}` }
                </p>
              </div>
              <div className="basis-[49%]">
                <p className="text-sm">Ticket Price</p>
                <p className="text-sm text-[#4A4A4A] font-bold">{item.price} $COODE</p>  
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <div className="basis-[49%]">
                <p className="text-sm">Time Remaining</p>
                <div className="text-sm text-[#4A4A4A] font-bold">
                  <Countdown
                    ref={setStartCountdownRef}
                    date={item.start_date * 1000}
                    zeroPadTime={3}

                    renderer={startCountdownRenderer}
                  />
                </div>
              </div>
              <div className="basis-[49%]">
                <p className="text-sm">My Tickets</p>
                <p className="text-sm text-[#4A4A4A] font-bold">
                  {myTicket}
                </p>
              </div> 

            </div>
            <div className="flex justify-between pt-2 pb-9">
            {
                currentTime < item.end_date && currentTime > item.start_date && <div className="flex basis-[50%] justify-between items-start">
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    className="w-[48%] text-center outline-none text-sm border border-black bg-[#82828240] text-[#000] py-1 rounded-md"
                    value={amount}
                    onChange={(e) => {
                      if (id >= 0) {
                        setAmount(prettyNumber(e.target.value))
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={`basis-[50%] text-sm bg-black rounded-md text-white py-1 border border-black  ${buyTicketNFT.status ? `opacity-100 cursor-pointer` : `opacity-80 cursor-pointer `} `}
                    onClick={() => handleBuyTicket(item, id)}
                  >
                    {/* <span>&nbsp;+&nbsp;</span> */}
                    BUY
                    {/* <span>&nbsp;-&nbsp;</span> */}
                  </button>
                </div>
              }
              {/* <div className="basis-[49%]">
                <p className="text-sm">Floor Price</p>
                <p className="text-sm text-[#4A4A4A] font-bold">
                  {item.floor_price + ' SOL' || `_`}
                </p>
              </div>  */}
            </div>
          </div>
        </div>
      </div>
      <div className="-mt-[26px] text-center">
        { (currentTime > item.endTime || item.total_tickets - item.purchasedTicket === 0) ? <Link
          to={`/raffle/${item._id}`}
          style={{ fontWeight: "bold"}}
          className={`
                      ${ item.winnerWalletAddress !== `` && item.winnerWalletAddress === anchorWallet?.publicKey.toString() && `bg-black text-[orange] border-[orange]`}
                      ${ item.winnerWalletAddress !== `` && item.winnerWalletAddress !== anchorWallet?.publicKey.toString() && `bg-black text-[grey] border-[grey]`}
                      ${ item.winnerWalletAddress === `` && `bg-black text-[red] border-[red]`}
                      border-4 rounded-md inline-block py-2 px-6    
                    `}
        >
          View Raffle
        </Link> : <Link
          to={`/raffle/${item._id}`}
          style={{ fontWeight: "bold"}}
          className="border-4 rounded-md inline-block py-2 px-6 bg-black text-[white] border-[#606060]"
        >
          View Raffle
        </Link> }
        
      </div>
      <ToastContainer />

    </div>
    </>
 
  );
};

export default RaffleUserItem;
