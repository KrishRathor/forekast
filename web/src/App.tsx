import './App.css'
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '@clerk/clerk-react'

function App() {

  const { getToken } = useAuth()

  const handleClick = async () => {
    console.log("click")
    const data = {
      data: {
        balance: 20.0
      }
    }
    const token = await getToken()
    await fetch('http://localhost:3000/wallet/addBalance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
  }

  const handleSpendClick = async () => {
    console.log("click")
    const data = {
      data: {
        balance: 200.0
      }
    }
    const token = await getToken()
    const request = await fetch('http://localhost:3000/wallet/subtractBalance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })
    const response = await request.json()
    console.log(response)
  }


  return (
    <div>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>

      <button onClick={handleClick} >click me</button>
      <button onClick={handleSpendClick} >spend</button>

    </div>
  )
}

export default App
