import { useState } from "react"


export default function InsertNewModalitie() {

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [cpf, setCpf] = useState("")

  function registerNewModalitie() {
    console.log("INSERIR MODALIDADE")
  }

  return (
    <main>
    <form onSubmit={registerNewModalitie}>
      <h3>Inserir nova modalidade</h3>
      <input
        type="text"
        placeholder="Modalidade"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />

      <h1>INSERIR HORÁRIOS</h1>

      <button
        type="submit"
        className="btn"
      >
        Cadastrar nova modalidade
      </button>
    </form>
  </main>   
    )
}