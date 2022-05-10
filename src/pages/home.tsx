import { getDatabase, onValue, ref, set } from "firebase/database"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../hooks/use-auth"

type Users = {
  name: string
  cpf: string
  phone: string
  address: string
  registeredIn: string
  payment: any
  paymentShedules: any
  userModalities: any
  birthdate: any
}

export default function Home() {
  const { user } = useAuth()

  const [users, setUsers] = useState<Users[]>([])
  const [dueDate, setDueDate] = useState(0)
  const [pendingUser, setPendingUser] = useState<Users[]>([])
  const [birthdays, setBirthdays] = useState<Users[]>([])

  useEffect(() => {
    const db = getDatabase()
    const dbRef = ref(db, "gym_users/" + user?.uid + "/users")

    onValue(dbRef, res => {
      setUsers(Object.values(res.val()))
    })

    let date = new Date()
    let getDay = new Date(date).getDate()
    let nextMouth = new Date(date).setMonth(date.getMonth() + 1)
    let dueDate = new Date(nextMouth).setDate(5)

    if (getDay > 5) {
      setDueDate(dueDate)
    }

    if (getDay <= 5) {
      setDueDate(new Date(date).setDate(5))
    }
  }, [])

  useEffect(() => {
    const usersArr = Object.values(users)
    const pendingUser: Users[] = []
    const birthdays: Users[] = []

    usersArr.forEach(res => {
      if (res.payment < dueDate) {
        pendingUser.push(res)
      }
    })

    usersArr.forEach(res => {
      let data = new Date()
      let atualDay = new Date(data)
      let birthdaysWeek = data.setDate(data.getDate() + 7)
      let userBirthdate = new Date(res.birthdate)
      let fixUserBrithdate = data.setDate(userBirthdate.getDate() + 2)
      let birthdate = new Date(fixUserBrithdate).setFullYear(2022)

      if (birthdate > new Date(atualDay).getTime() && birthdate < birthdaysWeek) {
        birthdays.push(res)
      }
    })

    setPendingUser(pendingUser)
    setBirthdays(birthdays)
  }, [users])

  return (
    <main>
      <div className="list-user">
        <span>Usuários</span>
        <q>{Object.values(users).length}</q>
      </div>


      {pendingUser.length === 0 ? "" : (
        <div className="box sub-heading danger">
          <span className="text"> {pendingUser.length} Usuários com a matrícula vencida</span>
          <Link to="/user-manager?pendency=true" className="btn secondary-btn"> Ver usuários pendentes </Link>
        </div>
      )}

      <div className="box sub-heading primary">
        <span className="text"> Aniversáriantes da Semana:</span>

        {birthdays.map(user => (
          <span>
            * {new Date(user.birthdate)
              .toLocaleDateString('pt-br', { timeZone: "UTC", day: '2-digit', month: '2-digit' })}
            - {user.name}
          </span>
        ))}
      </div>
    </main>
  )
}
