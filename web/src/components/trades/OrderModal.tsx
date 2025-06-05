import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import { useState } from 'react';
import { ButtonWhite } from '../essentials/Button';
import { handlePlaceLimitOrder } from '@/hooks/trades';
import { handleGetBalanceAndReserve } from '@/hooks/balance';
import { useSetRecoilState } from 'recoil';
import { walletState } from '@/store/balance';

interface OrderModalProps {
  id: string;
}

export const OrderModal = ({ id }: OrderModalProps): React.ReactElement => {
  const [selected, setSelected] = useState<'limit' | 'market'>('limit');

  return (
    <div className="p-3 w-full">
      <div className="flex w-full flex-col md:flex-row">
        <div
          onClick={() => setSelected('limit')}
          className={`w-full md:w-1/2 text-center p-3 cursor-pointer ${selected === 'limit' ? 'bg-[#172236]' : 'bg-[#202127]'
            } rounded-t-md md:rounded-l-lg md:rounded-tr-none`}
        >
          Limit Order
        </div>
        <div
          onClick={() => setSelected('market')}
          className={`w-full md:w-1/2 text-center p-3 cursor-pointer ${selected === 'market' ? 'bg-[#172236]' : 'bg-[#202127]'
            } rounded-b-md md:rounded-r-lg md:rounded-bl-none`}
        >
          Market Order
        </div>
      </div>

      <div>{selected === 'limit' ? <LimitOrder id={id} /> : <MarketOrder />}</div>
    </div>
  );
};

interface LimitOrderProps {
  id: string;
}

const LimitOrder = ({ id }: LimitOrderProps): React.ReactElement => {
  const [side, setSelectedSide] = useState<'yes' | 'no'>('yes');
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const auth = useAuth();
  const setWallet = useSetRecoilState(walletState);

  return (
    <div className="mt-6 w-full">
      <div className="flex flex-col md:flex-row w-full">
        <div
          onClick={() => setSelectedSide('yes')}
          className={`w-full md:w-1/2 text-center p-3 cursor-pointer ${side === 'yes' ? 'bg-[#1D2D2D]' : 'bg-[#202127]'
            } rounded-t-md md:rounded-l-lg md:rounded-tr-none`}
        >
          Buy Yes
        </div>
        <div
          onClick={() => setSelectedSide('no')}
          className={`w-full md:w-1/2 text-center p-3 cursor-pointer ${side === 'no' ? 'bg-[#382429]' : 'bg-[#202127]'
            } rounded-b-md md:rounded-r-lg md:rounded-bl-none`}
        >
          Buy No
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4 px-2">
        <div className="flex flex-col w-full">
          <label className="text-sm text-gray-300 mb-1" htmlFor="quantity">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            placeholder="0"
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="w-full bg-[#14151B] border border-[#2A2B31] rounded-md p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="text-sm text-gray-300 mb-1" htmlFor="price">
            Price
          </label>
          <input
            id="price"
            type="number"
            placeholder="0.00"
            onChange={(e) => setPrice(parseInt(e.target.value))}
            className="w-full bg-[#14151B] border border-[#2A2B31] rounded-md p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-center mt-4 w-full">
          <SignedIn>
            <ButtonWhite
              text="Place Order"
              onClick={async () => {
                if (!auth.userId) return;
                const token = await auth.getToken();
                if (!token) return;
                handlePlaceLimitOrder(id, price, quantity, auth.userId, side === 'yes');
                const { balance, reserve } = await handleGetBalanceAndReserve(token);
                setWallet({ balance, reserve });
              }}
            />
          </SignedIn>
          <SignedOut>
            <ButtonWhite text="Sign Up to Place Order" onClick={() => { }} />
          </SignedOut>
        </div>
      </div>
    </div>
  );
};

const MarketOrder = (): React.ReactElement => {
  const [side, setSelectedSide] = useState<'yes' | 'no'>('yes');

  return (
    <div className="mt-6 w-full">
      <div className="flex flex-col md:flex-row w-full">
        <div
          onClick={() => setSelectedSide('yes')}
          className={`w-full md:w-1/2 text-center p-3 cursor-pointer ${side === 'yes' ? 'bg-[#1D2D2D]' : 'bg-[#202127]'
            } rounded-t-md md:rounded-l-lg md:rounded-tr-none`}
        >
          Buy Yes
        </div>
        <div
          onClick={() => setSelectedSide('no')}
          className={`w-full md:w-1/2 text-center p-3 cursor-pointer ${side === 'no' ? 'bg-[#382429]' : 'bg-[#202127]'
            } rounded-b-md md:rounded-r-lg md:rounded-bl-none`}
        >
          Buy No
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4 px-2">
        <div className="flex flex-col w-full">
          <label className="text-sm text-gray-300 mb-1" htmlFor="quantity">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            placeholder="0"
            className="w-full bg-[#14151B] border border-[#2A2B31] rounded-md p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-center items-center text-lg text-white">
          Estimated Price: 5000
        </div>

        <div className="flex justify-center mt-4 w-full">
          <SignedIn>
            <ButtonWhite text="Place Order" onClick={() => { }} />
          </SignedIn>
          <SignedOut>
            <ButtonWhite text="Sign Up to Place Order" onClick={() => { }} />
          </SignedOut>
        </div>
      </div>
    </div>
  );
};

