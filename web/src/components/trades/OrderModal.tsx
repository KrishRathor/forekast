import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { useState } from 'react'
import { ButtonWhite } from '../essentials/Button'

export const OrderModal = (): React.ReactElement => {
  const [selected, setSelected] = useState<'limit' | 'market'>('limit')

  return (
    <div className="p-3 w-full">
      <div className="flex w-full flex-col md:flex-row">
        <div
          onClick={() => setSelected('limit')}
          className={`w-full md:w-1/2 text-center p-3 cursor-pointer ${selected === 'limit' ? 'bg-[#172236]' : 'bg-[#202127]'
            } rounded-l-lg`}
        >
          Limit Order
        </div>
        <div
          onClick={() => setSelected('market')}
          className={`w-full md:w-1/2 text-center p-3 cursor-pointer ${selected === 'market' ? 'bg-[#172236]' : 'bg-[#202127]'
            } rounded-r-lg`}
        >
          Market Order
        </div>
      </div>
      <div>

        {
          selected === "limit" ? <LimitOrder /> : <MarketOrder />
        }

      </div>
    </div>
  )
}

const LimitOrder = (): React.ReactElement => {

  const [side, setSelectedSide] = useState<'yes' | 'no'>('yes')

  return (
    <div>
      <div className="flex w-full mt-12 flex-col md:flex-row">

        <div
          onClick={() => setSelectedSide('yes')}
          className={`w-full md:w-1/2 text-center p-3 cursor-pointer ${side === 'yes' ? 'bg-[#1D2D2D]' : 'bg-[#202127]'
            } rounded-l-lg`}
        >
          Buy Yes
        </div>
        <div
          onClick={() => setSelectedSide('no')}
          className={`w-full md:w-1/2 text-center p-3 cursor-pointer ${side === 'no' ? 'bg-[#382429]' : 'bg-[#202127]'
            } rounded-r-lg`}
        >
          Buy No
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1" htmlFor="quantity">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            placeholder="0"
            className="bg-[#14151B] border border-[#2A2B31] rounded-md p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1" htmlFor="price">
            Price
          </label>
          <input
            id="price"
            type="number"
            placeholder="0.00"
            className="bg-[#14151B] border border-[#2A2B31] rounded-md p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className='flex justify-center mt-4' >
          <SignedIn>
            <ButtonWhite text='Place Order' onClick={() => { }} />
          </SignedIn>
          <SignedOut>
            <ButtonWhite text='Sign Up to Place Order' onClick={() => { }} />
          </SignedOut>
        </div>
      </div>
    </div>
  )
}

const MarketOrder = (): React.ReactElement => {

  const [side, setSelectedSide] = useState<'yes' | 'no'>('yes')

  return (
    <div>
      <div className="flex w-full mt-12 flex-col md:flex-row">
        <div
          onClick={() => setSelectedSide('yes')}
          className={`w-full md:w-1/2 text-center p-3 cursor-pointer ${side === 'yes' ? 'bg-[#1D2D2D]' : 'bg-[#202127]'
            } rounded-l-lg`}
        >
          Buy Yes
        </div>
        <div
          onClick={() => setSelectedSide('no')}
          className={`w-full md:w-1/2 text-center p-3 cursor-pointer ${side === 'no' ? 'bg-[#382429]' : 'bg-[#202127]'
            } rounded-r-lg`}
        >
          Buy No
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-300 mb-1" htmlFor="quantity">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            placeholder="0"
            className="bg-[#14151B] border border-[#2A2B31] rounded-md p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-center items-center text-lg">
          Estimated Price : 5000
        </div>

        <div className='flex justify-center mt-4' >
          <SignedIn>
            <ButtonWhite text='Place Order' onClick={() => { }} />
          </SignedIn>
          <SignedOut>
            <ButtonWhite text='Sign Up to Place Order' onClick={() => { }} />
          </SignedOut>
        </div>
      </div>
    </div>)
}
