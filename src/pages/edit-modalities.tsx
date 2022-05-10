import { get, getDatabase, onValue, ref, set, update } from "firebase/database"
import { FormEvent, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useAuth } from "../hooks/use-auth"
import { PriceMask } from "../services/masks"


export default function EditModalities() {

  const { user } = useAuth()

  const [modalities, setModalities] = useState<any[]>([])
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
  const [forceDom, setForceDom] = useState(0)

  useEffect(() => {
    const db = getDatabase()
    const dbRef = ref(db, "gym_users/" + user?.uid + "/staff")

    onValue(dbRef, res => {
      if (res.exists()) {
        setResponsible(Object.values(res.val()))
      }
    })

    const dbModalitiesRef = ref(db, "gym_users/" + user?.uid + "/modalities")

    get(dbModalitiesRef).then(res => {
      if (res.exists()) {
        setModalities(res.val())
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
      toast.success("Categoria editada com sucesso")
    })
  }

  function loadModalities(e: any) {
    const x = e.target.value

    if (x === "") {
      setName("")
      setPrice("")
      setSeg([]), setTer([]), setQua([]), setQui([]), setSex([]), setSab([]), setDom([])
      return
    }

    setName(modalities[x].name)
    setPrice(modalities[x].price)

    !modalities[x]?.schedules.seg ? setSeg([]) : setSeg(Object.values(modalities[x]?.schedules.seg))
    !modalities[x]?.schedules.ter ? setTer([]) : setTer(Object.values(modalities[x]?.schedules.ter))
    !modalities[x]?.schedules.qua ? setQua([]) : setQua(Object.values(modalities[x]?.schedules.qua))
    !modalities[x]?.schedules.qui ? setQui([]) : setQui(Object.values(modalities[x]?.schedules.qui))
    !modalities[x]?.schedules.sex ? setSex([]) : setSex(Object.values(modalities[x]?.schedules.sex))
    !modalities[x]?.schedules.sab ? setSab([]) : setSab(Object.values(modalities[x]?.schedules.sab))
    !modalities[x]?.schedules.dom ? setDom([]) : setDom(Object.values(modalities[x]?.schedules.dom))
  }

  function removeTime(index: number, day: string) {
    switch (day) {
      case "seg":
        var x = seg
        x.splice(index, 1)
        setSeg(x)
        setForceDom(forceDom + 1)
        break
      case "ter":
        var x = ter
        x.splice(index, 1)
        setTer(x)
        setForceDom(forceDom + 1)
        break
      case "qua":
        var x = qua
        x.splice(index, 1)
        setQua(x)
        setForceDom(forceDom + 1)
        break
      case "qui":
        var x = qui
        x.splice(index, 1)
        setQui(x)
        setForceDom(forceDom + 1)
        break
      case "sex":
        var x = sex
        x.splice(index, 1)
        setSex(x)
        setForceDom(forceDom + 1)
        break
      case "sab":
        var x = sab
        x.splice(index, 1)
        setSab(x)
        setForceDom(forceDom + 1)
        break
      case "dom":
        var x = dom
        x.splice(index, 1)
        setDom(x)
        setForceDom(forceDom + 1)
        break
    }
  }

  return (
    <main className="two-sections">

      <div className="modalities-edit">
        <h3 className="heading">Editar modalidade</h3>

        <select onChange={loadModalities}>
          <option value="">Selecione uma modalidade</option>
          {Object.values(modalities).map(modalitie => (
            <option value={modalitie.name}>{modalitie.name}</option>
          ))}
        </select>

        {name === "" ? "" : (

          <form onSubmit={registerNewModalitie}>
            <div className="form-container">
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

              <div>
                <button
                  type="button"
                  className="btn danger"
                >
                  Excluir modalidade
                </button>

                <button
                  type="submit"
                  className="btn"
                >
                  salvar Alterações
                </button>
              </div>
            </div>
          </form>
        )}
      </div>


      <div>
        <h3 className="sub-heading">Agenda da modalidade</h3>

        <div className="schedules">
          <div className="seg">
            <h5 className="text">Segunda</h5>
            {seg.map((time, index) => (
              <p className="text"><strong onClick={() => removeTime(index, "seg")} className="close-btn danger small">X</strong> {time}</p>
            ))}
          </div>

          <div className="ter">
            <h5 className="text">Terça</h5>
            {ter.map((time, index) => (
              <p className="text"><strong onClick={() => removeTime(index, "ter")} className="close-btn danger">X</strong> {time}</p>
            ))}
          </div>

          <div className="qua">
            <h5 className="text">Quarta</h5>
            {qua.map((time, index) => (
              <p className="text"><strong onClick={() => removeTime(index, "qua")} className="close-btn danger">X</strong> {time}</p>
            ))}
          </div>

          <div className="qui">
            <h5 className="text">Quinta</h5>
            {qui.map((time, index) => (
              <p className="text"><strong onClick={() => removeTime(index, "qui")} className="close-btn danger">X</strong> {time}</p>
            ))}
          </div>

          <div className="sex">
            <h5 className="text">Sexta</h5>
            {sex.map((time, index) => (
              <p className="text"><strong onClick={() => removeTime(index, "sex")} className="close-btn danger">X</strong> {time}</p>
            ))}
          </div>

          <div className="sab">
            <h5 className="text">Sábado</h5>
            {sab.map((time, index) => (
              <p className="text"><strong onClick={() => removeTime(index, "sab")} className="close-btn danger">X</strong> {time}</p>
            ))}
          </div>

          <div className="qua">
            <h5 className="text">Domingo</h5>
            {dom.map((time, index) => (
              <p className="text"><strong onClick={() => removeTime(index, "dom")} className="close-btn danger">X</strong> {time}</p>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}