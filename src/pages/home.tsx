import { get, getDatabase, onValue, ref, set, update } from "firebase/database"
import { useEffect, useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { useAuth } from "../hooks/use-auth"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import {
  FiUsers,
  FiDollarSign,
  FiArrowDown,
  FiArrowUp
} from 'react-icons/fi'
import { PriceMask } from "../services/masks";
import Navigation from "../components/navigation";
import Header from "../components/header";
import Cookies from "js-cookie";
import CardItem from "../components/card-items";
import { ImArrowUp } from "react-icons/im";
import { FcComboChart, FcLineChart } from "react-icons/fc";

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
  const [lastMonts, setLastMonts] = useState<any[]>([])
  const [labels, setLabels] = useState<any[]>([])
  const [positiveExtra, setPositiveExtra] = useState(0)
  const [negativeExtra, setNegativeExtra] = useState(0)
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [avenuePercent, setAvenuePercent] = useState("")
  const [positivePercent, setPositivePercent] = useState("")
  const [negativePercent, setNegativePercent] = useState("")
  const [registeredUsers, setRegisteredUsers] = useState("")

  useEffect(() => {
    const db = getDatabase()
    const usersRef = ref(db, "gym_users/" + user?.uid + "/users")

    onValue(usersRef, res => {
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

    const labelsArr: any = []
    const actualDate = new Date()

    for (let x = 0; x < 6; x++) {
      let shortMonth = new Date(new Date().setMonth(actualDate.getMonth() - (x + 1)))
        .toLocaleDateString('pt-br', { month: "short" })

      let longMonth = new Date(new Date().setMonth(actualDate.getMonth() - (x + 1)))
        .toLocaleDateString('pt-br', { month: "long" })

      let year = new Date(new Date().setMonth(actualDate.getMonth() - (x + 1)))
        .toLocaleDateString('pt-br', { year: "numeric" })

      labelsArr.push({ shortName: shortMonth, year, name: longMonth })
    }

    setLastMonts(labelsArr)
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
      // let fixUserBrithdate = data.setDate(userBirthdate.getDate() + 2)
      let birthdate = new Date(userBirthdate).setFullYear(2022)

      if (birthdate > new Date(atualDay).getTime() && birthdate < birthdaysWeek) {
        birthdays.push(res)
      }
    })


    setPendingUser(pendingUser)
    setBirthdays(birthdays)
  }, [users])

  useEffect(() => {
    const db = getDatabase()
    const dbRef = ref(db, "gym_users/" + user?.uid)
    const closedMontsRef = ref(db, "gym_users/" + user?.uid + "/closed-months")

    get(dbRef).then(res => {
      const data = res.val()
      const users = Object.values(data.users)
      const staff = Object.values(data.staff)

      for (let x = 0; x < lastMonts.length; x++) {
        var month = lastMonts[x].shortName.replace(".", "")
        var year = lastMonts[x].year

        const positiveValues = Object.values(data["external-values"].positive[year][month] || [])
        const negativeValues = Object.values(data["external-values"].negative[year][month] || [])

        if (!data["closed-months"][year][month]) {
          console.log("Rodei essa merda ?")

          const usersPayment = users.map((user: any) => {
            if (user.paymentShedules[year] === undefined) {
              return 0
            } else {
              return +user.paymentShedules[year][month] || 0
            }
          }).reduce((prev, curr) => prev + curr, 0)

          const staffPayment = staff.map((staff: any) => {
            if (staff.remuneration === undefined) {
              return 0
            } else {
              return +staff.remuneration || 0
            }
          }).reduce((prev, curr) => prev + curr, 0)

          const positive = positiveValues.map((value: any) => {
            if (value.newValue === undefined) {
              return 0
            } else {
              return +value.newValue || 0
            }
          }).reduce((prev, curr) => prev + curr, 0)

          const negative = negativeValues.map((value: any) => {
            if (value.newValue === undefined) {
              return 0
            } else {
              return +value.newValue || 0
            }
          }).reduce((prev, curr) => prev + curr, 0)

          // console.log(staffPayment)

          // console.log([month] + " => " + usersPayment)

          update(closedMontsRef, {
            [month]: {
              [year]: {
                usersPayment,
                staffPayment,
                positive,
                negative
              }
            }
          })
        }
      }

    })

    get(closedMontsRef).then(res => {
      const data = res.val()
      const date = new Date()
      const setClosedMonth = date.setMonth(date.getMonth() - 1)
      const setReferencedMonth = date.setMonth(date.getMonth() - 1)
      const closedMonth = new Date(setClosedMonth).toLocaleDateString('pt-br', { month: 'short' }).replace('.', '')
      const referenceMonth = new Date(setReferencedMonth).toLocaleDateString('pt-br', { month: 'short' }).replace('.', '')

      const referenceAvenue = data[referenceMonth].positive + data[referenceMonth].usersPayment
        - data[referenceMonth].negative - data[referenceMonth].staffPayment

      const actualAvenue = data[closedMonth].positive + data[closedMonth].usersPayment
        - data[closedMonth].negative - data[closedMonth].staffPayment

      const avenuePercent = ((actualAvenue - referenceAvenue) / referenceAvenue * 100).toFixed(2)
      const positivePercent = ((data[closedMonth].positive - data[referenceMonth].positive) / data[referenceMonth].positive * 100).toFixed(2)
      const negativePercent = ((data[closedMonth].negative - data[referenceMonth].negative) / data[referenceMonth].negative * 100).toFixed(2)

      setAvenuePercent(avenuePercent)
      setMonthlyRevenue(actualAvenue || 0)
      setNegativeExtra(data[closedMonth].negative)
      setPositiveExtra(data[closedMonth].positive)
      setPositivePercent(positivePercent)
      setNegativePercent(negativePercent)
      setLabels(data)
      console.log(data)
    })

    get(dbRef).then(res => {
      const data: any = Object.values(res.val().users)
      const dataLength: any = []
      const referenceLength: any = []
      const date = new Date()
      const setClosedMonth = new Date(date.setMonth(date.getMonth() - 1))
      const setReferenceMonth = new Date(date.setMonth(date.getMonth() - 2))
      const lastDay = new Date(setClosedMonth.getFullYear(), setClosedMonth.getMonth() + 1, 0)
      const referencetDay = new Date(setReferenceMonth.getFullYear(), setReferenceMonth.getMonth() + 1, 0)

      for (let x = 0; x < data.length; x++) {
        let registered = new Date(data[x].registeredIn)

        let month = registered.getDay()
        let day = registered.getMonth()
        let year = registered.getFullYear()

        const setNewDate = new Date(date.setDate(day))
        const setNewMonth = new Date(setNewDate.setMonth(month - 2))
        const finalDate = new Date(setNewMonth.setFullYear(year))

        // console.log("Data fechamento: " + lastDay)
        if (finalDate < lastDay) {
          dataLength.push(x)
        }

        if (finalDate < referencetDay) {
          referenceLength.push(x)
        }
      }

      const usersPercent = ((dataLength.length - referenceLength.length) / referenceLength.length * 100).toFixed(2)

      setRegisteredUsers(usersPercent)

    })
  }, [lastMonts])

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  )

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      ResizeObserverSize
    },
    scales: {
      y: {
        ticks: {
          // Formatação para Real brasileior com o a Máscara
          callback: function (value: any) {
            return PriceMask(value);
          }
        }
      },
    }
  }

  const data = {
    labels: Object.keys(labels),
    TData: "labels.name",
    datasets: [
      {
        label: 'Matrículas',
        data: Object.values(labels).map((label) => label.usersPayment),
        backgroundColor: 'rgba(0, 255, 34, 0.5)',
        borderWidth: 2,
      },
      {
        label: 'Entrada externa',
        data: Object.values(labels).map((label) => label.positive),
        backgroundColor: 'rgba(27, 122, 39, 0.5)',
        borderWidth: 2,
      },
      {
        label: 'Saída externa',
        data: Object.values(labels).map((label) => label.negative),
        backgroundColor: 'rgba(233, 22, 22, 0.5)',
        borderWidth: 2,
      },
      {
        label: 'Pagamentos',
        data: Object.values(labels).map((label) => label.staffPayment),
        backgroundColor: 'rgba(75, 13, 13, 0.5)',
        borderWidth: 2,
      },
    ],
  };

  //Condicional que verifica se o usuário está autenticado
  if (typeof window !== 'undefined') {
    const token = Cookies.get('token')

    if (!token) {
      return <Navigate to="/login" replace />
    }
  }

  return (
    <div className="container" >
      <Navigation />
      <Header />

      <main>
        <div className="top-painel">
          <div className="painel-header">
            <h1 className="sub-heading">Painel</h1>
            <select>
              {lastMonts.map(month => (
                <option value={month.name}>{month.name}</option>
              ))}
            </select>
          </div>

          <div className="painel-content">
            <div className="graph box">
              <h2 className="text">Projeções mensais</h2>
              <Bar options={options} data={data} height={90} />
            </div>

            <div className="cards">
              <CardItem
                icon={<FiUsers />}
                title="Clientes"
                value={users.length}
                status="positive"
                footer={<p><strong>{registeredUsers}%</strong> Desde o mês anterior</p>}
              />

              <CardItem
                icon={<FiDollarSign />}
                title="Receita mensal"
                value={PriceMask(monthlyRevenue)}
                status={Math.sign(+avenuePercent) === 1 ? "positive" : "negative"}
                footer={Math.sign(+avenuePercent) === 1 ?
                  <p><strong>{avenuePercent === 'Infinity' ? "100%" : (avenuePercent)}</strong> Desde o mês anterior</p>
                  :
                  <p><strong>{avenuePercent}%</strong> Desde o mês anterior</p>
                }
              />

              <CardItem
                icon={<FcLineChart />}
                title="*"
                value="Relatório Semanal"
                status="hide"
                footer={<Link to="./reports?weekly">Consultar</Link>}
              />

              <CardItem
                icon={<FcComboChart />}
                title="*"
                value="Relatório Mensal"
                status="hide"
                footer={<Link to="./relatório-mensal">Consultar</Link>}
              />

            </div>
          </div>
        </div>

        <div className="bottom-painel">

          <h1 className="sub-heading">Área de notificações</h1>

          {birthdays.length === 0 ? "" : (
            <div className="box sub-heading">
              <span className="text"> Aniversáriantes da Semana:</span>

              {birthdays.map(user => (
                <span>
                  * {new Date(user.birthdate)
                    .toLocaleDateString('pt-br', { timeZone: "UTC", day: '2-digit', month: '2-digit' })}
                  - {user.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {pendingUser.length === 0 ? "" : (
          <div className="box sub-heading danger">
            <span className="text"> {pendingUser.length} Usuários com a matrícula vencida</span>
            <Link to="/user-manager?pendency=true" className="btn secondary-btn"> Ver usuários pendentes </Link>
          </div>
        )}

      </main>
    </div >
  )
}



