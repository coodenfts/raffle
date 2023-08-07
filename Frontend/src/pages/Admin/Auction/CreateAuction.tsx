import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import base58 from "bs58";
import { ToastContainer, toast } from "react-toastify";
import { getAuctionById } from "../../../services/api";
import { createAuction, updateAuction } from "../../../services/api";
import { datetimeLocal, getSignedMessage } from "../../../utils";
import CONFIG from "../../../config";
import NFTModal from "../../../components/NFTModal";
import { connection } from "../../../utils";
import Navbar from "../../../components/Navbar";
import SelectNFTIcon from "../../../assets/Select-NFT-Icon.png";
import { createForAuction } from "../../../services/contracts/auction";
import { prettyNumber } from "../../../utils";
import { AuctionValidation } from "../../../utils/validation";

const { AUCTION, TOAST_TIME_OUT, ADMIN_WALLET } = CONFIG;

const CreateAuction = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setLoading] = useState(false);
  const [isModal, setModal] = useState(false);
  const wallet: any = useWallet();
  const anchorWallet = useAnchorWallet();
  const [nftName, setNftName] = useState('Select Nft')

  const [auctionValue, setAuctionValue] = useState<any>({
    id: 0,
    project: ``,
    description: ``,
    image: ``,
    imageFile: "",
    discord: ``,
    twitter: ``,
    min_bid_amount: ``,
    min_bid_increment: ``,
    min_nft_count: ``,
    start_date: new Date(),
    end_date: new Date(),
    symbol: ``,
    collectionName: ``,
    mint: ``,
    tokenId: 0,
    tokenName: ``
  });

  const handleAuctionSubmit = async () => {
    try {
      const validation = AuctionValidation(auctionValue)
      if (!validation) return
      setLoading(true);
      const signedMessage = await getSignedMessage(wallet, AUCTION.message);
      const payload: any = new FormData();
      const id: any = Date.now();

      payload.append("id", id);
      payload.append("project", 'Yogesh');
      payload.append("description", auctionValue.description);
      payload.append("image", auctionValue.image);
      payload.append("symbol", auctionValue.symbol);
      payload.append("collectionName", auctionValue.collectionName);
      payload.append("tokenId", auctionValue.tokenId);
      payload.append("tokenName", auctionValue.tokenName);
      payload.append("discord", auctionValue.discord);
      payload.append("twitter", auctionValue.twitter);
      payload.append("min_bid_amount", auctionValue.min_bid_amount);
      payload.append("min_bid_increment", auctionValue.min_bid_increment);
      payload.append("min_nft_count", auctionValue.min_nft_count);
      payload.append(
        "start_date",
        Math.floor(auctionValue.start_date?.getTime() / 1000).toString()
      );
      payload.append(
        "end_date",
        (Math.floor(auctionValue.end_date?.getTime()) / 1000).toString()
      );
      payload.append("floor_price", 0);
      payload.append("last_updated_fp", Math.floor(new Date().getTime() / 1000).toString());
      payload.append("mint", auctionValue.mint);
      payload.append("signedMessage", base58.encode(signedMessage!));

      const createAuctionTx: any = await createForAuction(anchorWallet, auctionValue, id)
      console.log('auctionTx', createAuctionTx)

      if (createAuctionTx) {
        const res = await createAuction(payload);
        if (res) {
          toast.success("Success in creating auction", {
            onClose: () => {
              setTimeout(() => {
                navigate("/admin/auction");
              }, TOAST_TIME_OUT);
            },
          });
        } else {
          toast.error("Error in creating auction");
        }
      }
      setLoading(false)

    } catch (error) {
      toast.error("Error in creating auction");
      setLoading(false);

    }
  };

  useEffect(() => {
    (async () => {
      try {
        if (!anchorWallet) return;
        if (anchorWallet.publicKey?.toString() !== ADMIN_WALLET) {
          navigate('/')
          return
        }
        setLoading(true);
        if (id) {
          const nftInfoById: any = await getAuctionById(id);
          setAuctionValue({
            ...nftInfoById,
            image: "",
            start_date: new Date(nftInfoById.start_date * 1000),
            end_date: new Date(nftInfoById.end_date * 1000),
          });
        }
      } catch (error) {
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
          <h1 className="text-center text-white text-4xl">Create Auction</h1>
          <div className="border-4 mt-6 md:px-8 px-4 pt-8 pb-14 border-[#606060] bg-[#60606040] rounded-[0.7rem]">
            <div className="md:flex block justify-between items-start">
              <label
                htmlFor="profilePic"
                className="border-2 md:mb-0 mb-4 min-h-[295px] basis-[46%] flex items-center justify-center flex-col p-8 border-[#606060] bg-[#60606040] rounded-[0.7rem] cursor-pointer"
                onClick={() => setModal(true)}
              >
                <img src={auctionValue?.image ? auctionValue?.image : SelectNFTIcon} alt="SelectNFTIcon" />

                <span className="text-[#606060] text-xl mt-3"> {nftName}</span>

              </label>
              <div className="basis-[48%]">
                {/* <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="project"
                  >
                    Project
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      type="text"
                      id="project"
                      name="project"
                      placeholder="Project"
                      value={auctionValue.project}
                      onChange={(e) =>
                        setAuctionValue({
                          ...auctionValue,
                          project: e.target.value,
                        })
                      }
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div> */}
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
                      value={datetimeLocal(auctionValue.start_date)}
                      onChange={(e) =>
                        setAuctionValue({
                          ...auctionValue,
                          start_date: new Date(e.target.value),
                        })
                      }
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="ticketdate"
                  >
                    End Date
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      type="datetime-local"
                      id="ticketdate"
                      name="ticketdate"
                      value={datetimeLocal(auctionValue.end_date)}
                      onChange={(e) =>
                        setAuctionValue({
                          ...auctionValue,
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
                    htmlFor="bidprice"
                  >
                    Min. Bid Amount
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      id="bidprice"
                      name="bidprice"
                      placeholder="0"
                      type={`string`}
                      value={auctionValue.min_bid_amount}
                      onChange={(e) =>
                        setAuctionValue({
                          ...auctionValue,
                          min_bid_amount: prettyNumber(e.target.value),
                        })
                      }
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="bidIncrement"
                  >
                    Min. Bid Increment
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      id="bidIncrement"
                      name="bidIncrement"
                      placeholder="0"
                      type={`string`}
                      value={auctionValue.min_bid_increment}
                      onChange={(e) =>
                        setAuctionValue({
                          ...auctionValue,
                          min_bid_increment: prettyNumber(e.target.value),
                        })
                      }
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="minNftCount"
                  >
                    Min Nft Count
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      id="minNftCount"
                      name="minNftCount"
                      placeholder="0"
                      type={`string`}
                      value={auctionValue.min_nft_count}
                      onChange={(e) =>
                        setAuctionValue({
                          ...auctionValue,
                          min_nft_count: prettyNumber(e.target.value),
                        })
                      }
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div>
                {/* <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="bidprice"
                  >
                    Time Extension
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      type="text"
                      id="bidprice"
                      name="bidprice"
                      placeholder="5-100 Minutes"
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div> */}
                {/* <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="bidprice"
                  >
                    Bid Royalty
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      type="text"
                      id="bidprice"
                      name="bidprice"
                      placeholder="10%"
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                    />
                  </div>
                </div> */}
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
                      value={auctionValue.twitter}
                      onChange={(e) =>
                        setAuctionValue({
                          ...auctionValue,
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
                      value={auctionValue.discord}
                      onChange={(e) =>
                        setAuctionValue({
                          ...auctionValue,
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
                      value={auctionValue.description}
                      onChange={(e) =>
                        setAuctionValue({
                          ...auctionValue,
                          description: e.target.value,
                        })
                      }
                      placeholder="Terms & Conditions"
                      className="bg-[#46464680] border-2 border-[#fff] rounded-[0.5rem] w-full text-[#ffffff] placeholder:text-[#606060] p-3 outline-none resize-none h-full"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div className="flex justify-center -mt-6">
            <p
              onClick={handleAuctionSubmit}
              className="cursor-pointer text-black bg-white rounded-[0.5rem] flex items-center py-3 px-5"
            >
              Create Auction
            </p>
          </div>
        </div>
      </div>

      <NFTModal
        title="Select an NFT to Auction!"
        show={isModal}
        connection={connection}
        address={wallet?.publicKey?.toString()}
        onCancel={() => setModal(false)}
        auctionValue={auctionValue}
        setAuctionValue={setAuctionValue}
        setNftName={setNftName}
      />
      <ToastContainer />
    </div>
  );
};

export default CreateAuction;
