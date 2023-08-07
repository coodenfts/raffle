import * as anchor from "@project-serum/anchor";
import { useState, useEffect } from "react";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useNavigate, useParams } from "react-router-dom";
import base58 from "bs58";
import { ToastContainer, toast } from "react-toastify";
import {
  Commitment,
  ConnectionConfig,
  PublicKey,
} from "@solana/web3.js";

import { getAuctionById } from "../../../services/api";
import { updateAuction, deleteAuction } from "../../../services/api";
import { datetimeLocal, getSignedMessage, getNftMetaDataByMint } from "../../../utils";
import CONFIG from "../../../config";
import NFTModal from "../../../components/NFTModal";
import { connection } from "../../../utils";
import Navbar from "../../../components/Navbar";
import SelectNFTIcon from "../../../assets/Select-NFT-Icon.png";
import { deleteForAuction, updateForAuction } from "../../../services/contracts/auction";
import { AuctionValidation } from "../../../utils/validation";
import { prettyNumber } from "../../../utils";

const { AUCTION, TOAST_TIME_OUT, ADMIN_WALLET } = CONFIG;

const EditAuction = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setLoading] = useState(false);
  const [isModal, setModal] = useState(false);
  const wallet = useWallet();
  const anchorWallet: any = useAnchorWallet();
  const [updateBtnActive, setUpdateBtnActive] = useState(false)
  const [auctionValue, setAuctionValue] = useState<any>({
    id: 0,
    project: ``,
    description: ``,
    image: ``,
    symbol: ``,
    imageFile: "",
    discord: ``,
    twitter: ``,
    min_bid_amount: ``,
    min_bid_increment: ``,
    min_nft_count: ``,
    start_date: new Date(),
    end_date: new Date(),
    mint: ``,
    kenId: 0,
    tokenName: ``
  });

  const handleAuctionSubmit = async () => {
    try {
      if (!updateBtnActive) {
        toast.error(`You can't update`)
        return
      }
      const validation = AuctionValidation(auctionValue)
      if (!validation) return
      setLoading(true);
      const signedMessage = await getSignedMessage(wallet, AUCTION.message);
      const payload = new FormData();

      payload.append("project", 'yogesh');
      payload.append("description", auctionValue.description);
      payload.append("image", auctionValue.image);
      payload.append("symbol", auctionValue.symbol);
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
      payload.append("mint", auctionValue.mint);
      payload.append("signedMessage", base58.encode(signedMessage!));
      const updateAuctionTx = await updateForAuction(wallet, auctionValue)
      if (updateAuctionTx) {
        const res = await updateAuction(id, payload);
        if (res) {
          toast.success("Success in updating auction", {
            onClose: () => {
              setTimeout(() => {
                navigate("/admin/auction");
              }, TOAST_TIME_OUT);
            },
          });
        } else {
          toast.error("Error in updating auction");
        }
      }

      setLoading(false)
    } catch (error) {
      toast.error("Error in creating auction");
    }
    setLoading(false);
  };

  const handleAuctionDeleteBtn = async () => {
    try {
      if (!updateBtnActive) {
        toast.error(`You can't delete`)
        return
      }

      setLoading(true)

      const signedMessage = await getSignedMessage(wallet, AUCTION.message);

      const deleteAuctionTx: any = await deleteForAuction(anchorWallet, auctionValue)

      if (deleteAuctionTx) {
        const res = await deleteAuction(id, base58.encode(signedMessage!));
        if (res) {
          toast.success("Success in delete auction", {
            onClose: () => {
              setTimeout(() => {
                navigate("/admin/auction");
              }, TOAST_TIME_OUT);
            },
          });
        } else {
          toast.error("Error in delete auction");
        }
      }

      setLoading(false)

    } catch (error) {
      setLoading(false)
      toast.error("Error in delete auction");
    }
  }

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
            start_date: new Date(nftInfoById.start_date * 1000),
            end_date: new Date(nftInfoById.end_date * 1000),
          });


          const provider = new anchor.AnchorProvider(connection, anchorWallet!, {
            skipPreflight: true,
            preflightCommitment: "confirmed" as Commitment,
          } as ConnectionConfig);

          const program = new anchor.Program(
            AUCTION.IDL,
            AUCTION.PROGRAM_ID,
            provider
          );
          const auctionId = new anchor.BN(nftInfoById.id);
          const [pool] = await PublicKey.findProgramAddress(
            [
              Buffer.from(AUCTION.POOL_SEED),
              auctionId.toArrayLike(Buffer, "le", 8),
              new PublicKey(nftInfoById.mint).toBuffer(),
            ],
            program.programId
          );
          const poolData: any = await program.account.pool.fetch(pool);
          console.log('poolData', poolData)

          const currentTime = Math.floor(Date.now() / 1000);
          const smallTimeThanStartDate =  nftInfoById?.start_date  > currentTime;
          const noBidderBigThanEndDate = poolData.count === 0 &&  nftInfoById?.end_date < currentTime


          if (smallTimeThanStartDate || noBidderBigThanEndDate) {
            setUpdateBtnActive(true)
          }
        }
      } catch (error) {
      }
      setLoading(false);
    })();
  }, [anchorWallet, id]);

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
          <h1 className="text-center text-white text-4xl">Edit Auction</h1>
          <div className="border-4 mt-6 md:px-8 px-4 pt-8 pb-14 border-[#606060] bg-[#60606040] rounded-[0.7rem]">
            <div className="md:flex block justify-between items-start">
              <label
                htmlFor="profilePic"
                className="border-2 md:mb-0 mb-4 min-h-[295px] basis-[46%] flex items-center justify-center flex-col p-8 border-[#606060] bg-[#60606040] rounded-[0.7rem] cursor-pointer"
                onClick={() => setModal(true)}
              >
                <img src={auctionValue?.image ? auctionValue?.image : SelectNFTIcon} alt="SelectNFTIcon" />

                <span className="text-[#606060] text-xl mt-3"> {auctionValue.tokenName}</span>
              </label>
              <div className="basis-[48%]">
                <div className="mb-5">
                  <label
                    className="text-white text-lg inline-block mb-1"
                    htmlFor="startdate"
                  >
                    Start Date
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden"  >
                    <input

                      type="datetime-local"
                      id="startdate"
                      name="startdate"
                      value={datetimeLocal(auctionValue.start_date)}

                      onChange={(e) => {
                        setAuctionValue({
                          ...auctionValue,
                          start_date: new Date(e.target.value),
                        });
                      }
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
                      type={`number`}
                      min="0"
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
                      type={`number`}
                      min="0"
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
                    Min NFT Count
                  </label>
                  <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                    <input
                      id="minNftCount"
                      name="minNftCount"
                      placeholder="1-100%"
                      type={`string`}
                      min="0"
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
                    htmlFor="description"
                  >
                    Description
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
                      placeholder="description"
                      className="bg-[#46464680] border-2 border-[#606060] rounded-[0.5rem] w-full text-[#ffffff] placeholder:text-[#606060] p-3 outline-none resize-none h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-[16px] " >
            <div className="flex justify-center -mt-6">
              <p
                onClick={handleAuctionSubmit}
                className={` ${updateBtnActive ? `cursor-pointer opacity-100` : `cursor-not-allowed opacity-70`}  text-black bg-white rounded-[0.5rem] flex items-center py-3 px-5`}
              >
                Update Auction
              </p>
            </div>
            <div className="flex justify-center -mt-6">
              <p
                onClick={handleAuctionDeleteBtn}
                className={` ${updateBtnActive ? `cursor-pointer opacity-100` : `cursor-not-allowed opacity-70`}  text-black bg-white rounded-[0.5rem] flex items-center py-3 px-5`}
              >
                Delete Auction
              </p>
            </div>
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
      />
      <ToastContainer />
    </div>
  );
};

export default EditAuction;
