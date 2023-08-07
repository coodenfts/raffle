import React, { useEffect } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Link } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useNavigate, useLocation } from "react-router-dom";

// import Logo from "../assets/2xsolution.png";
import Logo from "../assets/Logo.png";
import CONFIG from "../config";

const Navbar: React.FC = () => {
  const anchorWallet = useAnchorWallet()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname === '/admin/') {
      navigate('/admin')
    }
  }, [location])

  return (
    <div className="border-white border-b-2">
      <div className="flex justify-between items-center py-5 px-4">
        <Link to="/" className="sm:max-w-[165px] max-w-[100px]">
          <img src={Logo} alt="l" />
        </Link>
        <ul className="flex items-center gap-[16px] ">
          {
            anchorWallet && anchorWallet?.publicKey.toBase58() === CONFIG.ADMIN_WALLET && <li>
              <Link
                to="/admin/irl"
                className="text-white text-base font-archia hover:opacity-95 transition-all"
              >
                IRL
              </Link>
            </li>
          }
          {
            anchorWallet && anchorWallet?.publicKey.toBase58() === CONFIG.ADMIN_WALLET && <li>
              <Link
                to="/admin"
                className="text-white text-base font-archia hover:opacity-95 transition-all"
              >
                HOME
              </Link>
            </li>
          }
          {

            anchorWallet && anchorWallet?.publicKey.toBase58() !== CONFIG.ADMIN_WALLET && <li>
              <Link
                to={`/profile/raffle/${anchorWallet?.publicKey.toBase58()}`}
                className="text-white text-base font-archia hover:opacity-95 transition-all"
              >
                PROFILE
              </Link>
            </li>

          }

          <li >
            <WalletMultiButton startIcon={undefined} />
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
