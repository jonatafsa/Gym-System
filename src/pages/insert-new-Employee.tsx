import { child, get, getDatabase, onValue, ref, set } from "firebase/database"
import { FormEvent, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useAuth } from "../hooks/use-auth"


export default function InsertNewEmployee() {

  const { user } = useAuth()

  const [category, setCategory] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [categories, setNewCategories] = useState<any[]>(["arroz", "feijão"])
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [cpf, setCpf] = useState("")
  const [remuneration, setRemuneration] = useState("")
  const [birthdate, setBirthdate] = useState("")

  useEffect(() => {
    const db = getDatabase()
    const dbRef = ref(db,  "gym_users/" + user?.uid + "/job-categories")

    onValue(dbRef, res => {
      if(res.exists()) {
        setNewCategories(Object.values(res.val()))
      }
    })
  }, [])

  function registerNewEmployee(e: FormEvent) {
    e.preventDefault()

    const db = getDatabase()
    const dbRef = ref(db,  "gym_users/" + user?.uid + "/staff/" + cpf)

    get(dbRef).then(res => {
      if (res.exists()) {
        toast.warning("Existe um funcionário com esse CPF")
      } else {

        set(dbRef, {
          name,
          phone,
          address,
          city,
          cpf,
          birthdate,
          remuneration,
          function: category
        }).then(() => {
          toast.success("Novo funcionário inserido com sucesso!!")
        })
      }
    })
  }

  function registerNewJobCategory(e: FormEvent) {
    e.preventDefault()

    const db = getDatabase()
    const dbRef = ref(db,  "gym_users/" + user?.uid + "/job-categories/" + newCategory)

    set(dbRef, {
      name: newCategory
    }).then(() => {
      setCategory("")
      setNewCategory("")
      toast.success("Categoria inserida com sucesso!!")
    }).catch(err => {
      console.log(err)
    })
  }

  return (
    <main className="two-sections">

      <div className="category">
        <h4 className="sub-heading">Selecione uma categoria</h4>
        <select onChange={e => setCategory(e.target.value)}>
          <option value="">Selecione uma categoria</option>
          {categories.map(category => (
            <>
              <option
                value={category.name}
                key={category.name}
              >
                {category.name}
              </option>
            </>
          ))}
          <option value="insert-new">Inserir nova categoria ++</option>
        </select>
      </div>

      {category === "insert-new" ? (
        <form onSubmit={registerNewJobCategory}>
          <div className="form-container">
            <h3 className="heading">Cadastrar nova categoria</h3>

            <input
              type="text"
              placeholder="Categoria"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              required
            />

            <button
              type="submit"
              className="btn"
            >
              Cadastrar nova categoria
            </button>
          </div>
        </form>
      ) : (
        category === "" ? "" : (
          <form onSubmit={registerNewEmployee}>
            <div className="form-container">
            <h3 className="heading">Inserir novo usuário</h3>

<input
  type="text"
  placeholder="Nome"
  value={name}
  onChange={e => setName(e.target.value)}
  required
/>

<div>
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
</div>

<div>
  <input
    type="text"
    placeholder="CPF"
    value={cpf}
    onChange={e => setCpf(e.target.value)}
    required
  />

  <input
    type="text"
    placeholder="Telefone"
    value={phone}
    onChange={e => setPhone(e.target.value)}
    required
  />
</div>

<div>
  <input
    type="text"
    placeholder="Data de nascimento"
    value={birthdate}
    onChange={e => setBirthdate(e.target.value)}
    required
  />
  <input
    type="text"
    placeholder="Remuneração Base"
    value={remuneration}
    onChange={e => setRemuneration(e.target.value)}
    required
  />
</div>

<button
  type="submit"
  className="btn"
>
  Cadastrar novo usuário
</button>
            </div>
          </form>
        )
      )}

    </main>
  )
}