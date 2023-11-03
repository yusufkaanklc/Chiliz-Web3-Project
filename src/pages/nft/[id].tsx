import NFTDetails from "@/components/NFTDetails";
import Layout from "@/layout/Layout";
import { getMarketplaceContract, getNFTContract } from "@/util/getContracts";
import { useNFT, useValidDirectListings } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import CancelSellingCard from "@/components/CancelSelling";
import SellNFTCard from "@/components/SellNFTCard";
import { useRouter } from "next/router";

function NFTDetailsPage() {
    const router = useRouter();
    const [price, setPrice] = useState(0.01);
    const [symbol, setSymbol] = useState("");
    const [listingID, setListingID] = useState("");
    const [nftID, setNftID] = useState("");
    const { marketplace } = getMarketplaceContract();
    const { nft_contract } = getNFTContract();
    const { data: nft, isLoading: isNFTLoading } = useNFT(nft_contract, nftID);
    const { data: directListings } = useValidDirectListings(marketplace, {
        start: 0,
        count: 100,
    });
    const [address, setAddress] = useState(""); // Address state'i
    const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setAddress(event.target.value); // Adresi güncelle
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const { id } = router.query;
            setNftID(id as string);
        }
        let listedNFT = directListings?.find((item) => item.tokenId === nftID);
        if (listedNFT) {
            setListingID(listedNFT.id);
            setPrice(Number(listedNFT.currencyValuePerToken.displayValue));
            setSymbol(listedNFT.currencyValuePerToken.symbol);
        }
    }, [directListings, price, listingID, router.query]);
    
    const transferNFT = async () => {
        if (address && nftID) {
          try {
            // Transfer işlemini çağır
            await nft_contract?.erc721.transfer(address, nftID);
            // Transfer başarılı oldu, gerekirse başka bir işlem yapabilirsiniz.
          } catch (error) {
            console.error("NFT transfer error:", error);
            // Transfer sırasında bir hata oluştu, hatayı işleyebilirsiniz.
          }
        }
      };
      

    return (
        <Layout>
            <div>
                <h1 className="text-6xl font-semibold my-4 text-center">
                    NFT Details
                </h1>

                {isNFTLoading || !nft ? (
                    <div className="text-center">
                        {`Loading NFT with id ${nftID} `}
                    </div>
                ) : (
                    <>
                        <NFTDetails {...nft} />
                        <div>
                            <input
                                type="text"
                                value={address}
                                onChange={handleAddressChange} // Adres değişikliklerini işle
                                placeholder="Recipient Wallet Address"
                              />
                              {/* Diğer girişler */}
                              <button onClick={transferNFT}>Transfer NFT</button>
                            </div>

                        {listingID ? (
                            <CancelSellingCard
                                price={price}
                                symbol={symbol}
                                listingID={listingID}
                            />
                        ) : (
                            <SellNFTCard
                                price={price}
                                onUpdatePrice={setPrice}
                                id={nftID}
                            />
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
}
export default NFTDetailsPage;
