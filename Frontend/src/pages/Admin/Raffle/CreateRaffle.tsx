
import { useState, useEffect } from "react";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useNavigate, useParams } from "react-router-dom";
import base58 from "bs58";
import { ToastContainer, toast } from "react-toastify";
import { getRaffleById } from "../../../services/api";
import { createRaffle } from "../../../services/api";
import { connection, datetimeLocal, getSignedMessage } from "../../../utils";
import CONFIG from "../../../config";
import NFTModal from "../../../components/NFTModal";
import Navbar from "../../../components/Navbar";
import SelectNFTIcon from "../../../assets/Select-NFT-Icon.png";
import { createForRaffle } from "../../../services/contracts/raffle";

import { prettyNumber } from "../../../utils";
import { RaffleValidation } from "../../../utils/validation";

const { RAFFLE, TOAST_TIME_OUT, ADMIN_WALLET } = CONFIG;

const CreateRaffle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [isModal, setModal] = useState(false);
  const anchorWallet: any = useAnchorWallet();
  const wallet = useWallet();
  const [nftName, setNftName] = useState('Select Nft')
  const [raffleValue, setRaffleValue] = useState<any>({
    id: 0,
    project: ``,
    description: ``,
    image: ``,
    discord: ``,
    twitter: ``,
    price: ``,
    total_tickets: ``,
    min_nft_count: ``,
    start_date: new Date(),
    end_date: new Date(),
    mint: ``,
    symbol: ``,
    collectionName: ``,
    tokenId: 0,
    tokenName: ``
  });

  const handleRuffleSubmit = async () => {
    try {
      const raffleValidation = RaffleValidation(raffleValue)
      
      if (!raffleValidation) return
      setLoading(true);
      const signedMessage = await getSignedMessage(wallet, RAFFLE.message);
      const payload: any = new FormData();
      const id: any = Date.now();

      payload.append("id", id);
      payload.append("project", 'Yogesh');
      payload.append("description", raffleValue.description);
      payload.append("image", raffleValue.image);
      payload.append("symbol", raffleValue.symbol);
      payload.append("collectionName", raffleValue.collectionName);
      payload.append("tokenId", raffleValue.tokenId);
      payload.append("tokenName", raffleValue.tokenName);
      payload.append("discord", raffleValue.discord);
      payload.append("twitter", raffleValue.twitter);
      payload.append("total_tickets", raffleValue.total_tickets);
      payload.append("min_nft_count", raffleValue.min_nft_count);
      payload.append("price", raffleValue.price);
      payload.append(
        "start_date",
        Math.floor(raffleValue.start_date?.getTime() / 1000).toString()
      );
      payload.append(
        "end_date",
        Math.floor(raffleValue.end_date?.getTime() / 1000).toString()
      );
      payload.append("floor_price", 0);
      payload.append("last_updated_fp", Math.floor(new Date().getTime() / 1000).toString());
      payload.append("mint", raffleValue.mint);
      payload.append("signedMessage", base58.encode(signedMessage!));
      
      let res = null;
      const createRaffleRes = await createForRaffle(anchorWallet, raffleValue, id)
      if (createRaffleRes) {
        res = await createRaffle(payload);
        console.log("res", res)
        if (res) {
          toast.success("Success in creating raffle", {
            onClose: () => {
              setTimeout(() => {
                navigate("/admin");
              }, TOAST_TIME_OUT);
            },
          });
        } else {
          toast.error("Error in creating raffle");
        }
      }
      setLoading(false)
    } catch (error) {
      toast.error(error + "");
    }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      try {
        if (!anchorWallet) return
        
        if (anchorWallet.publicKey?.toString() !== ADMIN_WALLET) {
          navigate('/')
          return
        }
        
        setLoading(true);
        if (id) {
          const nftInfoById: any = await getRaffleById(id);
          setRaffleValue({
            ...nftInfoById,
            image: "",
            nftName: nftInfoById.name,
            start_date: new Date(nftInfoById.start_date * 1000),
            end_date: new Date(nftInfoById.end_date * 1000),
          });
        }
      } catch (error) {
        setLoading(false)
      }
      setLoading(false);
    })();
  }, [anchorWallet]);


  return (
    <div>
      {
        isLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      <div className="bg-black">
        <Navbar />
        <div className="max-w-[768px] m-auto pt-20 pb-16 px-4 md:px-0">
          <h1 className="text-center text-white text-4xl">Create NFT Raffle</h1>
          <div className="border-4 mt-6 md:px-8 px-4 pt-8 pb-14 border-[#606060] bg-[#60606040] rounded-[0.7rem]">
            <div className="md:flex block justify-between items-start">
              <label
                htmlFor="profilePic"
                className="border-2 md:mb-0 mb-4 min-h-[295px] basis-[46%] flex items-center justify-center flex-col p-8 border-[#606060] bg-[#60606040] rounded-[0.7rem] cursor-pointer"
                onClick={() => setModal(true)}
              >
                <img src={raffleValue?.image ? raffleValue?.image : SelectNFTIcon} alt="SelectNFTIcon" />

                <span className="text-[#606060] text-xl mt-3"> {nftName}</span>
              </label>
              <div className="basis-[48%]">

                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="ticketprice"
                  >
                    Ticket Price
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      type={`number`}
                      id="ticketprice"
                      name="ticketprice"
                      placeholder="0"
                      min="0"
                      value={raffleValue.price}
                      onChange={(e) => {
                        setRaffleValue({
                          ...raffleValue,
                          price: prettyNumber(e.target.value),
                        })
                      }

                      }
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="startdate"
                  >
                    Start Date
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      type="datetime-local"
                      id="startdate"
                      name="startdate"
                      value={datetimeLocal(raffleValue.start_date)}
                      onChange={(e) => {
                        setRaffleValue({
                          ...raffleValue,
                          start_date: new Date(e.target.value),
                        })
                      }}
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="enddate"
                  >
                    End Date
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      type="datetime-local"
                      id="enddate"
                      name="enddate"
                      value={datetimeLocal(raffleValue.end_date)}
                      onChange={(e) =>
                        setRaffleValue({
                          ...raffleValue,
                          end_date: new Date(e.target.value),
                        })
                      }
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="ticketsupply"
                  >
                    Total Ticket Supply
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      type={`number`}
                      id="ticketsupply"
                      name="ticketsupply"
                      placeholder="0"
                      min="0"
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                      value={raffleValue.total_tickets}
                      onChange={(e) =>
                        setRaffleValue({
                          ...raffleValue,
                          total_tickets: prettyNumber(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="nftcount"
                  >
                    Min. NFT Count
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      id="nftcount"
                      name="nftcount"
                      placeholder="0"
                      type={`number`}
                      min="0"
                      value={raffleValue.min_nft_count}
                      onChange={(e) =>
                        setRaffleValue({
                          ...raffleValue,
                          min_nft_count: prettyNumber(e.target.value),
                        })
                      }
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="twitterlink"
                  >
                    Twitter Link
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      type="text"
                      id="twitterlink"
                      name="twitterlink"
                      placeholder="https://twitter.com/xxxxxx"
                      value={raffleValue.twitter}
                      onChange={(e) =>
                        setRaffleValue({
                          ...raffleValue,
                          twitter: e.target.value,
                        })
                      }
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="discordlink"
                  >
                    Discord Link
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      type="text"
                      id="twitterlink"
                      name="twitterlink"
                      placeholder="https://discord.com/xxxxxx"
                      value={raffleValue.discord}
                      onChange={(e) =>
                        setRaffleValue({
                          ...raffleValue,
                          discord: e.target.value,
                        })
                      }
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="Terms & Conditions"
                  >
                    Terms & Conditions
                  </label>
                  <div className="relative  overflow-hidden">
                    <textarea
                      rows={3}
                      value={raffleValue.description}
                      onChange={(e) =>
                        setRaffleValue({
                          ...raffleValue,
                          description: e.target.value,
                        })
                      }
                      placeholder="Terms & Conditions"
                      className="bg-[#46464680] border-2 border-[#606060] rounded-[0.5rem] w-full text-[#ffffff] placeholder:text-[#606060] p-3 outline-none resize-none h-full"
                    />
                  </div>
                </div>
                <div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center -mt-6">
            <p
              onClick={handleRuffleSubmit}
              className="cursor-pointer text-black bg-white rounded-[0.5rem] flex items-center py-3 px-5"
            >
              Create Raffle
            </p>
          </div>
        </div>
      </div>

      <NFTModal
        title="Select an NFT to raffle!"
        show={isModal}
        connection={connection}
        address={wallet?.publicKey?.toString()}
        onCancel={() => setModal(false)}
        setNftName={setNftName}
        raffleValue={raffleValue}
        setRaffleValue={setRaffleValue}
      />
      <ToastContainer />
    </div>
  );
};

export default CreateRaffle;
