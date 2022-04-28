import { FormEvent, useState } from "react"
import {
  getDatabase,
  onValue,
  ref as DatabaseRef,
  set as DatabaseSet,
  get as DatabaseGet,
  child,
} from "firebase/database";
import { toast, Zoom } from "react-toastify"

type User = {
  name: string
  email: string
  phone: string

}

export default function InsertNewUser() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [cpf, setCpf] = useState("")

  async function registerNewUser(e: FormEvent) {
    e.preventDefault()

    const database = getDatabase();
    const userRef = DatabaseRef(database, "users/" + cpf)
    const dbRef = DatabaseRef(database)

    await DatabaseGet(child(dbRef, "users")).then(res => {
      const users: any = Object.values(res.val())

      for (var x = 0; x < users.length; x++) {
        if (users[x].email === email) {
          toast.warning("Existe um usuário com esse E-mail")
          return
        }
      }

      onValue(userRef, res => {
        if (res.exists() && res.val().email !== email) {
          toast.warning("Existe um usuário com esse CPF")
        } else {
          DatabaseSet(userRef, {
            name,
            email,
            phone,
            address,
            city,
            cpf
          }).then(res => {
            toast.success('Usuário registrado com sucesso!!');
          }).catch(err => {
            toast.error('Erro ao registrar usuário!!');
          })
        }
      })
    })

  }

  return (
    <main className="two-sections">
      <form onSubmit={registerNewUser}>
        <h3>Inserir novo usuário</h3>
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Telefone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Endereço"
          value={address}
          onChange={e => setAddress(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Cidade"
          value={city}
          onChange={e => setCity(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="CPF"
          value={cpf}
          onChange={e => setCpf(e.target.value)}
          required
        />

        <button
          type="submit"
          className="btn"
        >
          Cadastrar novo usuário
        </button>
      </form>
    </main>
  )
}

