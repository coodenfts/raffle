import Countdown, { CountdownApi } from 'react-countdown'
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Link } from "react-router-dom";
import UnionIcons from "../assets/Union-icons.png";
import VerificationIcon from "../assets/Verification-icon.png";

const RaffleItem = (props: any) => {
  const anchorWallet = useAnchorWallet()
  const { item } = props;
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

  return (
    <div
    className="xl:basis-[24%] lg:basis-[32%] md:basis-[48%] sm:basis-[48%] basis-[100%] mt-6"
    key={item.id}
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
        <div className="pt-2 pl-3 pr-3">
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
            {/* <div className="basis-[49%]">
                <p className="text-sm">Floor Price</p>
                <p className="text-sm text-[#4A4A4A] font-bold">
                  {item.floor_price + ' SOL' || `_`}
                </p>
              </div>  */}
            {/* <div className="basis-[49%]">
              <p className="text-sm">My Tickets</p>
              <p className="text-sm text-[#4A4A4A] font-bold">
                {item.myTicket}
              </p>
            </div>  */}

          </div>
          <div className="flex justify-between pt-2 pb-9">
      
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

  </div>
  );
};

export default RaffleItem;
