import React from "react"

interface ButtonProps {
  text: string,
  onClick: () => void
}

export const ButtonGreen = (props: ButtonProps): React.ReactElement => {
  const { text, onClick } = props;

  return (
    <div>
      <button onClick={onClick} className={`bg-[#0C2922] hover:bg-[#091F1A] text-[#01B06E] rounded-md py-2 px-4 cursor-pointer`}  >
        {text}
      </button>
    </div>
  )
}

export const ButtonBlue = (props: ButtonProps): React.ReactElement => {
  const { text, onClick } = props;

  return (
    <div>
      <button onClick={onClick} className={` bg-[#18243A] [hover:bg-[#121B2C] text-[#4687E8] rounded-md py-2 px-4 cursor-pointer`}  >
        {text}
      </button>
    </div>
  )
}

