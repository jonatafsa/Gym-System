import { getDatabase, onValue, ref, set, update } from "firebase/database"
import { FormEvent, useEffect, useState } from "react"
import { toast } from "react-toastify"
import Header from "../components/header"
import Navigation from "../components/navigation"
import { useAuth } from "../hooks/use-auth"
import { PriceMask } from "../services/masks"


export default function InsertNewModalitie() {

  const { user } = useAuth()

  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [responsible, setResponsible] = useState([])
  const [responsibleDoc, setResponsibleDoc] = useState("")
  const [day, setDay] = useState("")
  const [seg, setSeg] = useState<any[]>([])
  const [ter, setTer] = useState<any[]>([])
  const [qua, setQua] = useState<any[]>([])
  const [qui, setQui] = useState<any[]>([])
  const [sex, setSex] = useState<any[]>([])
  const [sab, setSab] = useState<any[]>([])
  const [dom, setDom] = useState<any[]>([])
  const [time, setTime] = useState("")

  useEffect(() => {
    const db = getDatabase()
    const dbRef = ref(db, "gym_users/" + user?.uid + "/staff")

    onValue(dbRef, res => {
      if (res.exists()) {
        setResponsible(Object.values(res.val()))
      }
    })
  }, [])

  function insertNewTime() {

    if (day === "") {
      toast.warning("Selecione um dia da semana!")
    }

    if (day === "seg") {
      var x = seg
      x.push(time)
      setSeg(x)
      setTime("")
    }

    if (day === "ter") {
      var x = ter
      x.push(time)
      setTer(x)
      setTime("")
    }

    if (day === "qua") {
      var x = qua
      x.push(time)
      setQua(x)
      setTime("")
    }

    if (day === "qui") {
      var x = qui
      x.push(time)
      setQui(x)
      setTime("")
    }

    if (day === "sex") {
      var x = sex
      x.push(time)
      setSex(x)
      setTime("")
    }

    if (day === "sab") {
      var x = sab
      x.push(time)
      setSab(x)
      setTime("")
    }

    if (day === "dom") {
      var x = dom
      x.push(time)
      setDom(x)
      setTime("")
    }
  }

  function registerNewModalitie(e: FormEvent) {
    e.preventDefault()

    const db = getDatabase()
    const dbRef = ref(db, "gym_users/" + user?.uid + "/modalities/" + name)
    const dbStaffRef = ref(db, "gym_users/" + user?.uid + "/staff/" + responsibleDoc)

    set(dbRef, {
      name,
      price: price.replace('.', '').replace(',', '').replace(/\D/g, ''),
      responsible: responsibleDoc,
      schedules: {
        "seg": seg,
        "ter": ter,
        "qua": qua,
        "qui": qui,
        "sex": sex,
        "sab": sab,
        "dom": dom
      }
    }).then(() => {
      update(dbStaffRef, {
        assignments: name
      })
    })
  }

  return (
    <div className="container" >
      <Navigation />
      <main>
        <Header />

        <div className="two-sections">

          <form onSubmit={registerNewModalitie}>
            <div className="form-container">
              <h3 className="heading">Inserir nova modalidade</h3>
              <input
                type="text"
                placeholder="Modalidade"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="R$ Valor da mensalidade"
                value={PriceMask(price)}
                onChange={e => setPrice(e.target.value)}
                required
              />

              <select onChange={e => setResponsibleDoc(e.target.value)} required>
                <option value="" selected>Instrutor ou responsável</option>
                {responsible.map((res: any) => (
                  <>
                    <option value={res.cpf}>
                      {res.function} - {res.name}
                    </option>
                  </>
                ))}
                <option value="">Sem instrutor ou responsável</option>
              </select>

              <div>
                <select onChange={e => setDay(e.target.value)}>
                  <option value="" selected>Dia</option>
                  <option value="seg">Segunda</option>
                  <option value="ter">Terça</option>
                  <option value="qua">Quarta</option>
                  <option value="qui">Quinta</option>
                  <option value="sex">Sexta</option>
                  <option value="sab">Sábado</option>
                  <option value="dom">Domingo</option>
                </select>

                <input
                  type="time"
                  placeholder="Escolha um horário"
                  onChange={e => setTime(e.target.value)}
                  value={time}
                />

                <button className="btn" type="button" onClick={insertNewTime}>Inserir</button>
              </div>

              <button
                type="submit"
                className="btn"
              >
                Cadastrar nova modalidade
              </button>
            </div>
          </form>

          <div>
            <h3 className="sub-heading">Agenda da modalidade</h3>

            <div className="schedules">
              <div className="seg">
                <h5 className="text">Segunda</h5>
                {seg.map(time => (
                  <p className="text">{time}</p>
                ))}
              </div>

              <div className="ter">
                <h5 className="text">Terça</h5>
                {ter.map(time => (
                  <p className="text">* {time}</p>
                ))}
              </div>

              <div className="qua">
                <h5 className="text">Quarta</h5>
                {qua.map(time => (
                  <p className="text">* {time}</p>
                ))}
              </div>

              <div className="qui">
                <h5 className="text">Quinta</h5>
                {qui.map(time => (
                  <p className="text">* {time}</p>
                ))}
              </div>

              <div className="sex">
                <h5 className="text">Sexta</h5>
                {sex.map(time => (
                  <p className="text">* {time}</p>
                ))}
              </div>

              <div className="sab">
                <h5 className="text">Sábado</h5>
                {sab.map(time => (
                  <p className="text">* {time}</p>
                ))}
              </div>

              <div className="qua">
                <h5 className="text">Domingo</h5>
                {dom.map(time => (
                  <p className="text">* {time}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}