import { getParsedNftAccountsByOwner } from "@nfteyez/sol-rayz";
import { useEffect, useState } from "react";
import axios from "axios";
import { getNftMetadata } from "../../utils";
import "./index.css";
import VerificationIcon from "../../assets/Verification-icon-2.png";

const NFTModal = (props: any) => {
  const { show, address, connection, title, setNftName, raffleValue, setRaffleValue, auctionValue, setAuctionValue } = props;

  const [isModalLoading, setModalLoading] = useState(true);
  const [nfts, setNfts] = useState<any[]>([]);
  const [selectedNft, setSelectedNft] = useState<any>(null);
  const [isActive, setActive] = useState(-1)

  useEffect(() => {
    (async () => {
      setModalLoading(true);
      if (show === true) {

        try {
          setNfts([]);
          const lists = await getParsedNftAccountsByOwner({
            publicAddress: address,
            connection,
          });
      
          const metadataList: any[] = await Promise.all(
            lists.map((item) => {
              let meta = getNftMetadata(item?.data?.uri);
              return meta;
            })
          );
          console.log('metadataList', metadataList)
          setNfts(
            lists.map((item, index) => ({
              ...item,
              ...metadataList[index],
            }))
          );
        } catch (error) {
        }
        setModalLoading(false);
      }

      setModalLoading(false);

    })();
  }, [show]);

  const onOkBtn = async () => {
    if (raffleValue) {
      const uri = selectedNft?.data?.uri || ``;
      if(uri !== "") {
        const metadata = (await axios.get(uri)).data
        console.log('metadata', metadata)
      }

      setRaffleValue({
        ...raffleValue,
        symbol: selectedNft?.data?.symbol || ``,
        collectionName: selectedNft?.collection?.name || ``,
        mint: selectedNft?.mint,
        image: selectedNft?.image ? selectedNft?.image : ``,
        tokenName: selectedNft?.name ? selectedNft?.name : ``,
        tokenId: selectedNft?.edition ? selectedNft?.edition : ``
      })
    }

    if (auctionValue) {
      setAuctionValue({
        ...auctionValue,
        symbol: selectedNft?.data?.symbol || ``,
        collectionName: selectedNft?.collection?.name || ``,
        mint: selectedNft?.mint,
        image: selectedNft?.image,
        tokenName: selectedNft?.name ? selectedNft?.name : ``,
        tokenId: selectedNft?.edition ? selectedNft?.edition : ``
      })
    }

    props.onCancel()
  }

  console.log("selectedNft", selectedNft)
  const handleSelect = (index: number) => {
    try {
      if (isModalLoading) return;
      if (index >= 0) {
        setActive(index)
      }
      setSelectedNft({
        ...nfts[index],
        index,
      });
    } catch (error) {
    }
  };

  return (
    <>
      {
        isModalLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      {show ? (
        <div className="fixed w-full h-full top-0 left-0 custom-blur-bg flex items-center justify-center z-50 px-2 py-12 overflow-y-auto">
          <div className="w-full max-w-[920px] m-auto border-4 md:px-8 px-4 md:py-8 py-4 border-[#606060] bg-[#60606040] rounded-[0.7rem]">
            <div className="flex items-center justify-between">
              <h1 className="text-white md:text-3xl text-xl">{title}</h1>
              <button
                onClick={() => props.onCancel()}
                className="bg-white text-xl rounded-[0.6rem] py-1 px-3 font-bold"
              >
                X
              </button>
            </div>
            <div className=" max-h-[500px] overflow-y-scroll flex items-start mt-6 gap-[0.7rem] flex-wrap min-h-[250px]">
              {nfts.map((nft, index: any) => {
                return (
                  <div key={index} className={`cursor-pointer basis-[22%] rounded-[18px] ${isActive === index ? `border-[4px] border-[#85ff00] border-solid ` : ` border-solid `} `} onClick={() => handleSelect(index)} >
                    <div className={`  rounded-[0.9rem] overflow-hidden   transition duration-1000`}>
                      <div className="relative">
                        <img
                          src={nft?.image}
                          alt="CoodeImage"
                          className={`object-cover min-h-[250px] w-full border-solid border-[grey] border-[1px] `}

                        />
                      </div>
                      <div className="bg-[#606060] pt-2 -mt-1">
                        <div className="flex items-center mb-1">
                          <img
                            src={VerificationIcon}
                            alt="VerificationIcon"
                            style={{ width: "16px" }}
                          />
                          <span className="text-white text-sm leading-none inline-block ml-1">
                            {nft?.data?.name.split('#')[0]}
                          </span>
                        </div>
                        <div className="bg-[#949494] flex overflow-hidden">
                          <p className="bg-white text-sm  px-2 py-1 para-clip-create basis-[67%]">
                            Token ID
                          </p>
                          <p className="text-center basis-[30%] py-1 px-1 text-sm text-white">
                            #{nft?.data?.name.split('#')[1] || 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              )}
            </div>
            <div className="flex item-center justify-end mt-6">
              <button
                // onClick={() => props.onOk(selectedNft?.mint, selectedNft?.baseUri)}
                onClick={onOkBtn}
                className="bg-white text-black py-2 px-6 rounded-[0.6rem]"
              >
                Ok
              </button>
              <button
                onClick={() => props.onCancel()}
                className="bg-[#AA0000] ml-4 text-white py-2 px-6 rounded-[0.6rem]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </>
  );
};

export default NFTModal;
