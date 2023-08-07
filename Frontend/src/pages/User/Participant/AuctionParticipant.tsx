import { Link } from "react-router-dom";
import Countdown, { CountdownApi } from 'react-countdown'

import VerificationIcon from "../../../assets/Verification-icon-2.png";
import VeiwIcon from "../../../assets/Veiw-Icon.png";
import TimingIcon from "../../../assets/Subtract-timing-icon.png";
import TicketIcon from "../../../assets/Subtract-ticket-icon.png";
import BoughtIcon from "../../../assets/Subtract-bought-icon.png";
import WinningIcon from "../../../assets/Subtract-winning-icon.png";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";


const AuctionRarticipant = (props: any) => {
  const { item, idx } = props

  const filter_item = item.bids.filter((x: any) => x?.price.toNumber() > 0)

  const get_count = []
  for (let i = 0; i < filter_item.length; i++) {
    get_count.push(filter_item[i].price.toNumber())
  }

  const winner = item.bids.find((item: any) => item.isWinner === 1)

  const highest = Math.max.apply(Math, get_count) / LAMPORTS_PER_SOL

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
          date={item.endTime ? item.endTime * 1000 : 0}
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

  console.log('winnerWalletAddress', item.winnerWalletAddress)

  return (
    <div key={idx} >
      <div className="max-w-[1280px] m-auto px-4">
        <div className={`border-2 border-[${item.winnerWalletAddress ? 'orange' : 'white'}] bg-[#606060A6] rounded-md mb-4`}>
          <div className="flex p-4">
            <div className="flex basis-[30%]">
              <div className="mr-2">
                <img
                  src={item?.image ? item?.image : ``}
                  alt="Coode"
                  className="w-[130px] h-[130px] w-full object-cover"
                />
              </div>
              <div>
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center">
                      <img
                        src={VerificationIcon}
                        alt="VerificationIcon"
                      />
                      <span className="text-lg text-white inline-block ml-1">
                        {item?.tokenName}
                      </span>
                    </div>
                    <h1 className="text-[20px] text-white mt-1">
                      {item?.name}
                    </h1>
                  </div>
                  <div>
                    <Link
                      to={`/auction/${item?.id}`}
                      type="button"
                      className="max-w-fit flex items-center py-2 px-2 bg-white rounded-md"
                    >
                      <img src={VeiwIcon} alt="VeiwIcon" />
                      <span className="ml-1">View Auction</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="basis-[70%] flex justify-around pt-2">
              <div className="text-center flex flex-col items-center">
                <img
                  src={TimingIcon}
                  alt="TimingIcon"
                  className="mb-2 w-[60px]"
                />
                <h1 className="text-[#878787]">Time Remaining</h1>
                <p className="text-white">
                  <Countdown
                    ref={setStartCountdownRef}
                    date={item?.startTime ? item?.startTime * 1000 : 0}
                    zeroPadTime={3}

                    renderer={startCountdownRenderer}
                  />
                </p>
              </div>
              <div className="text-center flex flex-col items-center">
                <img
                  src={TicketIcon}
                  alt="TimingIcon"
                  className="mb-2 w-[60px]"
                />
                <h1 className="text-[#878787]">Min. Bid Bid Amount</h1>
                <p className="text-white">{item?.minPrice.toNumber() / LAMPORTS_PER_SOL}</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <img
                  src={BoughtIcon}
                  alt="TimingIcon"
                  className="mb-2 w-[60px]"
                />
                <h1 className="text-[#878787]">My Bids</h1>
                <p className="text-white">{item?.currentBid}</p>
              </div>
              <div className="text-center flex flex-col items-center">
                <img
                  src={WinningIcon}
                  alt="TimingIcon"
                  className="mb-2 w-[60px]"
                />
                <h1 className="text-[#878787]">Highest Bids</h1>
                <p className="text-white">{highest}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionRarticipant;
