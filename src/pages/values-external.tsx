import { get, getDatabase, ref, set } from "firebase/database"
import { FormEvent, useEffect, useState } from "react"
import { toast } from "react-toastify"
import Header from "../components/header"
import Navigation from "../components/navigation"
import { useAuth } from "../hooks/use-auth"
import { PriceMask } from "../services/masks"


export default function ExternalValues() {

  const { user } = useAuth()

  const [category, setCategory] = useState("")
  const [newValue, setNewvalue] = useState("")
  const [name, setName] = useState("")

  useEffect(() => {
    const unsubscribe = () => {
      setName("")
      setNewvalue("")
    }

    unsubscribe()
  }, [category])

  function registerPositiveExternalValue(e: FormEvent) {
    e.preventDefault()

    const db = getDatabase()
    const dbRef = ref(db,
      "gym_users/" + user?.uid + "/external-values/positive/" +
      new Date().getFullYear() + "/" +
      new Date().toLocaleDateString('pt-br', { month: 'short' }).replace(".", "")
      + "/" + new Date()
    )

    set(dbRef, {
      name,
      newValue: newValue.replace('.', '').replace(',', '').replace(/\D/g, ''),
      date: new Date().toLocaleDateString("pt-br")
    }).then(() => {
      toast.success("Novo valor positivo registrado!!!")
      setCategory("")
    })

  }

  function registerNegativeExternalValue(e: FormEvent) {
    e.preventDefault()

    const db = getDatabase()
    const dbRef = ref(db,
      "gym_users/" + user?.uid + "/external-values/negative/" +
      new Date().getFullYear() + "/" +
      new Date().toLocaleDateString('pt-br', { month: 'short' }).replace(".", "")
      + "/" + new Date()
    )

    set(dbRef, {
      name,
      newValue: newValue.replace('.', '').replace(',', '').replace(/\D/g, ''),
      date: new Date().toLocaleDateString("pt-br")
    }).then(() => {
      toast.success("Novo valor positivo registrado!!!")
      setCategory("")
    })

  }

  return (
    <div className="container" >
      <Navigation />
      <main>
        <Header />

        <div className="two-sections">

          <div className="category">
            <h4 className="sub-heading">Selecione uma categoria</h4>
            <select onChange={e => setCategory(e.target.value)}>
              <option value=""></option>
              <option value="entry">Lucro externo</option>
              <option value="output">Débito externo</option>
            </select>
          </div>

          {category === "entry" ? (
            <form onSubmit={registerPositiveExternalValue}>
              <div className="form-container">
                <h3 className="heading positive">
                  Entrada externa de valores
                  <svg version="1.1" id="Capa_1" x="0px" y="0px"
                    viewBox="0 0 26.775 26.775">
                    <path d="M13.915,0.379l8.258,9.98c0,0,1.252,1.184-0.106,1.184c-1.363,0-4.653,0-4.653,0s0,0.801,0,2.025
                c0,3.514,0,9.9,0,12.498c0,0,0.184,0.709-0.885,0.709c-1.072,0-5.783,0-6.55,0c-0.765,0-0.749-0.592-0.749-0.592
                c0-2.531,0-9.133,0-12.527c0-1.102,0-1.816,0-1.816s-2.637,0-4.297,0c-1.654,0-0.408-1.24-0.408-1.24s7.025-9.325,8.001-10.305
                C13.24-0.414,13.915,0.379,13.915,0.379z"/>
                  </svg>
                </h3>

                <input
                  type="text"
                  placeholder="Descrição da entrada"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />


                <input
                  type="text"
                  placeholder="valor"
                  value={PriceMask(newValue)}
                  onChange={e => setNewvalue(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  className="btn"
                >
                  Inserir novo valor positivo
                </button>
              </div>
            </form>
          ) : (
            category === "" ? "" : (
              <form onSubmit={registerNegativeExternalValue}>
                <div className="form-container">
                  <h3 className="heading negative">
                    Saída externa de valores
                    <svg version="1.1" id="Capa_1" x="0px" y="0px"
                      viewBox="0 0 26.775 26.775">
                      <path d="M13.915,0.379l8.258,9.98c0,0,1.252,1.184-0.106,1.184c-1.363,0-4.653,0-4.653,0s0,0.801,0,2.025
                c0,3.514,0,9.9,0,12.498c0,0,0.184,0.709-0.885,0.709c-1.072,0-5.783,0-6.55,0c-0.765,0-0.749-0.592-0.749-0.592
                c0-2.531,0-9.133,0-12.527c0-1.102,0-1.816,0-1.816s-2.637,0-4.297,0c-1.654,0-0.408-1.24-0.408-1.24s7.025-9.325,8.001-10.305
                C13.24-0.414,13.915,0.379,13.915,0.379z"/>
                    </svg>
                  </h3>

                  <input
                    type="text"
                    placeholder="Descrição da entrada"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />


                  <input
                    type="text"
                    placeholder="valor"
                    value={PriceMask(newValue)}
                    onChange={e => setNewvalue(e.target.value)}
                    required
                  />

                  <button
                    type="submit"
                    className="btn"
                  >
                    Inserir novo valor negativo
                  </button>
                </div>
              </form>
            )
          )}
        </div>
      </main>
    </div>
  )
}