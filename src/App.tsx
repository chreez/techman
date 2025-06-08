import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Vite + React + DaisyUI</h1>
        <button className="btn btn-primary" onClick={() => setCount(count + 1)}>
          Count is {count}
        </button>
      </div>
    </div>
  )
}

export default App
