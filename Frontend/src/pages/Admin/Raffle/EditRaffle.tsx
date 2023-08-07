import { useState, useEffect } from "react";
import * as anchor from "@project-serum/anchor";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { useNavigate, useParams } from "react-router-dom";
import base58 from "bs58";
import { ToastContainer, toast } from "react-toastify";
import {
  Commitment,
  ConnectionConfig,
  PublicKey,
} from "@solana/web3.js";

import { getRaffleById } from "../../../services/api";
import { updateRaffle, deleteRaffle } from "../../../services/api";
import { connection, datetimeLocal, getSignedMessage } from "../../../utils";
import CONFIG from "../../../config";
import NFTModal from "../../../components/NFTModal";
import Navbar from "../../../components/Navbar";
import SelectNFTIcon from "../../../assets/Select-NFT-Icon.png";
import { deleteForRaffle, editForRaffle } from "../../../services/contracts/raffle";
import { RaffleValidation } from "../../../utils/validation";
import { prettyNumber } from "../../../utils";


const { RAFFLE, TOAST_TIME_OUT, ADMIN_WALLET } = CONFIG;

const EditRaffle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setLoading] = useState(false);
  const [isModal, setModal] = useState(false);
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();

  const [updateBtnActive, setUpdateBtnActive] = useState(false)
  const [raffleValue, setRaffleValue] = useState<any>({
    id: 0,
    project: ``,
    description: ``,
    image: ``,
    symbol: ``,
    discord: ``,
    twitter: ``,
    total_tickets: 0,
    min_nft_count: ``,
    price: 0,
    start_date: new Date(),
    end_date: new Date(),
    mint: ``,
    tokenId: 0,
    tokenName: ``
  });

  const handleRaffleUpdateBtn = async () => {
    try {
      if (!updateBtnActive) {
        toast.error(`You can't update`)
        return
      }

      const validation = RaffleValidation(raffleValue)
      if (!validation) return

      setLoading(true);
      const signedMessage = await getSignedMessage(wallet, RAFFLE.message);
      const payload = new FormData();
      payload.append("project", 'yogesh');
      payload.append("description", raffleValue.description);
      payload.append("image", raffleValue.image);
      payload.append("symbol", raffleValue.symbol);
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
      payload.append("mint", raffleValue.mint);
      payload.append("signedMessage", base58.encode(signedMessage!));
      const updateRaffleRes = await editForRaffle(
        anchorWallet,
        raffleValue
      )
      if (updateRaffleRes) {
        const res = await updateRaffle(id, payload);
        if (res) {
          toast.success("Success in updating raffle", {
            onClose: () => {
              setTimeout(() => {
                navigate("/admin");
              }, TOAST_TIME_OUT);
            },
          });
        } else {
          toast.error("Error in updating raffle");
        }
      }
      setLoading(false)
    } catch (error) {
      toast.error("Error in Update raffle");
      setLoading(false);

    }
  };

  const handleRaffleDeleteBtn = async () => {
    try {
      if (!updateBtnActive) {
        toast.error(`You can't delete`)
        return
      }

      setLoading(true)

      const signedMessage = await getSignedMessage(wallet, RAFFLE.message);

      const deleteRaffleTx = await deleteForRaffle(anchorWallet, raffleValue)
      if (deleteRaffleTx) {
        const res = await deleteRaffle(id, base58.encode(signedMessage!));
        if (res) {
          toast.success("Success in delete raffle", {
            onClose: () => {
              setTimeout(() => {
                navigate("/admin");
              }, TOAST_TIME_OUT);
            },
          });
        } else {
          toast.error("Error in delete raffle");
        }
      }

      setLoading(false)

    } catch (error) {
      console.log('error', error)
      setLoading(false)
      toast.error("Error in delete raffle");
    }
  }

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
            start_date: new Date(nftInfoById.start_date * 1000),
            end_date: new Date(nftInfoById.end_date * 1000),
          });

          const raffleId = new anchor.BN(nftInfoById.id);

          const provider = new anchor.AnchorProvider(connection, anchorWallet!, {
            skipPreflight: true,
            preflightCommitment: "confirmed" as Commitment,
          } as ConnectionConfig);

          const program = new anchor.Program(
            RAFFLE.IDL,
            RAFFLE.PROGRAM_ID,
            provider
          );
          const [pool] = await PublicKey.findProgramAddress(
            [
              Buffer.from(RAFFLE.POOL_SEED),
              raffleId.toArrayLike(Buffer, "le", 8),
              new PublicKey(nftInfoById.mint).toBuffer(),
            ],
            program.programId
          );

          const poolData: any = await program.account.pool.fetch(pool);
          console.log('poolData', poolData)

          const currentTime = Math.floor(Date.now() / 1000);
          const smallTimeThanStartDate =  nftInfoById?.start_date  > currentTime;
          const noBidderBigThanEndDate = poolData.purchasedTicket === 0 &&  nftInfoById?.end_date < currentTime

          if (smallTimeThanStartDate || noBidderBigThanEndDate) {
            setUpdateBtnActive(true)
          }
        }
        setLoading(false);

      } catch (error) {
        setLoading(false);

      }
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
          <h1 className="text-center text-white text-4xl">Edit NFT Raffle</h1>
          <div className="border-4 mt-6 md:px-8 px-4 pt-8 pb-14 border-[#606060] bg-[#60606040] rounded-[0.7rem]">
            <div className="md:flex block justify-between items-start">
              <label
                htmlFor="profilePic"
                className="border-2 md:mb-0 mb-4 min-h-[295px] basis-[46%] flex items-center justify-center flex-col p-8 border-[#606060] bg-[#60606040] rounded-[0.7rem] cursor-pointer"
                onClick={() => setModal(true)}
              >
                <img src={raffleValue?.image ? raffleValue?.image : SelectNFTIcon} alt="SelectNFTIcon" />

                <span className="text-[#606060] text-xl mt-3"> {raffleValue?.tokenName}</span>
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
                      id="ticketprice"
                      name="ticketprice"
                      placeholder="1.00"
                      type={`number`}
                      min="0"
                      value={raffleValue.price}
                      onChange={(e) =>
                        setRaffleValue({
                          ...raffleValue,
                          price: Number(e.target.value),
                        })
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
                      onChange={(e) =>
                        setRaffleValue({
                          ...raffleValue,
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
                      type="text"
                      id="ticketsupply"
                      name="ticketsupply"
                      placeholder="1-100%"
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                      value={raffleValue.total_tickets}
                      onChange={(e) =>
                        setRaffleValue({
                          ...raffleValue,
                          total_tickets: e.target.value,
                        })
                      }
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
                      type="text"
                      id="minNftCount"
                      name="minNftCount"
                      placeholder="0"
                      className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                      value={raffleValue.min_nft_count}
                      onChange={(e) =>
                        setRaffleValue({
                          ...raffleValue,
                          min_nft_count: prettyNumber(e.target.value),
                        })
                      }
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
                    htmlFor="description"
                  >
                    Description
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
                      placeholder="description"
                      className="bg-[#46464680] border-2 border-[#606060] rounded-[0.5rem] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none resize-none h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-[16px] " >
            <div className="flex justify-center -mt-6">
              <p
                onClick={handleRaffleUpdateBtn}
                className={` ${updateBtnActive ? `cursor-pointer opacity-100` : `cursor-not-allowed opacity-70`}  text-black bg-white rounded-[0.5rem] flex items-center py-3 px-5`}
              >
                Update Raffle
              </p>
            </div>
            <div className="flex justify-center -mt-6">
              <p
                onClick={handleRaffleDeleteBtn}
                className={` ${updateBtnActive ? `cursor-pointer opacity-100` : `cursor-not-allowed opacity-70`}  text-black bg-white rounded-[0.5rem] flex items-center py-3 px-5`}
              >
                Delete Raffle
              </p>
            </div>
          </div>

        </div>
      </div>
      <NFTModal
        title="Select an NFT to raffle!"
        show={isModal}
        connection={connection}
        address={wallet?.publicKey?.toString()}
        onCancel={() => setModal(false)}
        raffleValue={raffleValue}
        setRaffleValue={setRaffleValue}
      />
      <ToastContainer />
    </div>
  );
};

export default EditRaffle;
