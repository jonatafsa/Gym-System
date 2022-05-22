import { get, getDatabase, onValue, ref, set, update } from "firebase/database"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
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
import faker from '@faker-js/faker';

import {
  UilUsersAlt,
  UilDollarAlt,
  UilDownloadAlt,
  UilTopArrowFromTop,
} from '@iconscout/react-unicons'
import { PriceMask } from "../services/masks";

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
      let month = new Date(new Date().setMonth(actualDate.getMonth() - (x + 1)))
        .toLocaleDateString('pt-br', { month: "short" })

      let year = new Date(new Date().setMonth(actualDate.getMonth() - (x + 1)))
        .toLocaleDateString('pt-br', { year: "numeric" })

      labelsArr.push({ name: month, year })
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
      let fixUserBrithdate = data.setDate(userBirthdate.getDate() + 2)
      let birthdate = new Date(fixUserBrithdate).setFullYear(2022)

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
        var month = lastMonts[x].name.replace(".", "")
        var year = lastMonts[x].year

        const positiveValues = Object.values(data["external-values"].positive[year][month] || [])
        const negativeValues = Object.values(data["external-values"].negative[year][month] || [])

        // console.log(positiveValues)

        if (!data["closed-months"][month]) {

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
              usersPayment,
              staffPayment,
              positive,
              negative
            }
          })
        }
      }

    })

    onValue(closedMontsRef, res => {
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
    })

    onValue(dbRef, res => {
      const data: any = Object.values(res.val().users)
      const dataLength:any = []
      const date = new Date()
      const setClosedMonth = new Date(date.setMonth(date.getMonth() - 1))
      const lastDay = new Date(setClosedMonth.getFullYear(), setClosedMonth.getMonth() + 1, 0);

      for(let x = 0; x < data.length; x++) {
        let registered = new Date(data[x].registeredIn)
                
        let month = registered.getDay()
        let day = registered.getMonth()
        let year = registered.getFullYear()

        const setNewDate = new Date(date.setDate(day))
        const setNewMonth = new Date(setNewDate.setMonth(month - 2))
        const finalDate = new Date(setNewMonth.setFullYear(year))

        // console.log("Data fechamento: " + lastDay)
        if(finalDate < lastDay) {
          dataLength.push(x)
        }
      }

      console.log(dataLength)

    })
  }, [lastMonts])

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      ResizeObserverSize
    },
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

  return (
    <main>

      <div className="top-painel">
        <div className="painel-header">
          <h1 className="sub-heading">Painel</h1>
          <input type="date" />
        </div>

        <div className="painel-content">
          <div className="cards">
            <div className="box">
              <div className="box-icon"><UilUsersAlt /></div>
              <span className="text">Clientes</span>
              <h2 className="text">{users.length}</h2>
              <div className="box-footer positive">
                <svg version="1.1" id="Capa_1" x="15px" y="15px"
                  viewBox="0 0 26.775 26.775">
                  <path d="M13.915,0.379l8.258,9.98c0,0,1.252,1.184-0.106,1.184c-1.363,0-4.653,0-4.653,0s0,0.801,0,2.025
                c0,3.514,0,9.9,0,12.498c0,0,0.184,0.709-0.885,0.709c-1.072,0-5.783,0-6.55,0c-0.765,0-0.749-0.592-0.749-0.592
                c0-2.531,0-9.133,0-12.527c0-1.102,0-1.816,0-1.816s-2.637,0-4.297,0c-1.654,0-0.408-1.24-0.408-1.24s7.025-9.325,8.001-10.305
                C13.24-0.414,13.915,0.379,13.915,0.379z"/>
                </svg>
                <p><strong>5,7%</strong> Desde o mês anterior</p>
              </div>
            </div>

            <div className="box">
              <div className="box-icon"><UilDollarAlt /></div>
              <span className="text">Receita mensal</span>
              <h2 className="text">
                {PriceMask(monthlyRevenue)}
              </h2>
              {Math.sign(+avenuePercent) === 1 ? (
                <div className="box-footer positive">
                  <svg version="1.1" id="Capa_1" x="15px" y="15px"
                    viewBox="0 0 26.775 26.775">
                    <path d="M13.915,0.379l8.258,9.98c0,0,1.252,1.184-0.106,1.184c-1.363,0-4.653,0-4.653,0s0,0.801,0,2.025
              c0,3.514,0,9.9,0,12.498c0,0,0.184,0.709-0.885,0.709c-1.072,0-5.783,0-6.55,0c-0.765,0-0.749-0.592-0.749-0.592
              c0-2.531,0-9.133,0-12.527c0-1.102,0-1.816,0-1.816s-2.637,0-4.297,0c-1.654,0-0.408-1.24-0.408-1.24s7.025-9.325,8.001-10.305
              C13.24-0.414,13.915,0.379,13.915,0.379z"/>
                  </svg>
                  <p><strong>{avenuePercent === 'Infinity' ? "100%" : (avenuePercent)}</strong> Desde o mês anterior</p>
                </div>
              ) : (
                <div className="box-footer negative">
                  <svg version="1.1" id="Capa_1" x="15px" y="15px"
                    viewBox="0 0 26.775 26.775">
                    <path d="M13.915,0.379l8.258,9.98c0,0,1.252,1.184-0.106,1.184c-1.363,0-4.653,0-4.653,0s0,0.801,0,2.025
                c0,3.514,0,9.9,0,12.498c0,0,0.184,0.709-0.885,0.709c-1.072,0-5.783,0-6.55,0c-0.765,0-0.749-0.592-0.749-0.592
                c0-2.531,0-9.133,0-12.527c0-1.102,0-1.816,0-1.816s-2.637,0-4.297,0c-1.654,0-0.408-1.24-0.408-1.24s7.025-9.325,8.001-10.305
                C13.24-0.414,13.915,0.379,13.915,0.379z"/>
                  </svg>
                  <p><strong>{avenuePercent}%</strong> Desde o mês anterior</p>
                </div>
              )}
            </div>

            <div className="box">
              <div className="box-icon"><UilDownloadAlt /></div>
              <span className="text">Entrada externa</span>
              <h2 className="text">{PriceMask(positiveExtra)}</h2>
              {Math.sign(+positivePercent) === 1 ? (
                <div className="box-footer positive">
                  <svg version="1.1" id="Capa_1" x="15px" y="15px"
                    viewBox="0 0 26.775 26.775">
                    <path d="M13.915,0.379l8.258,9.98c0,0,1.252,1.184-0.106,1.184c-1.363,0-4.653,0-4.653,0s0,0.801,0,2.025
              c0,3.514,0,9.9,0,12.498c0,0,0.184,0.709-0.885,0.709c-1.072,0-5.783,0-6.55,0c-0.765,0-0.749-0.592-0.749-0.592
              c0-2.531,0-9.133,0-12.527c0-1.102,0-1.816,0-1.816s-2.637,0-4.297,0c-1.654,0-0.408-1.24-0.408-1.24s7.025-9.325,8.001-10.305
              C13.24-0.414,13.915,0.379,13.915,0.379z"/>
                  </svg>
                  <p><strong>{positivePercent === 'Infinity' ? "100%" : (positivePercent)}</strong> Desde o mês anterior</p>
                </div>
              ) : (
                <div className="box-footer negative">
                  <svg version="1.1" id="Capa_1" x="15px" y="15px"
                    viewBox="0 0 26.775 26.775">
                    <path d="M13.915,0.379l8.258,9.98c0,0,1.252,1.184-0.106,1.184c-1.363,0-4.653,0-4.653,0s0,0.801,0,2.025
                c0,3.514,0,9.9,0,12.498c0,0,0.184,0.709-0.885,0.709c-1.072,0-5.783,0-6.55,0c-0.765,0-0.749-0.592-0.749-0.592
                c0-2.531,0-9.133,0-12.527c0-1.102,0-1.816,0-1.816s-2.637,0-4.297,0c-1.654,0-0.408-1.24-0.408-1.24s7.025-9.325,8.001-10.305
                C13.24-0.414,13.915,0.379,13.915,0.379z"/>
                  </svg>
                  <p><strong>{positivePercent}%</strong> Desde o mês anterior</p>
                </div>
              )}
            </div>

            <div className="box">
              <div className="box-icon"><UilTopArrowFromTop /></div>
              <span className="text">Saida externa</span>
              <h2 className="text">{PriceMask(negativeExtra)}</h2>
              {Math.sign(+negativePercent) === 1 ? (
                <div className="box-footer positive">
                  <svg version="1.1" id="Capa_1" x="15px" y="15px"
                    viewBox="0 0 26.775 26.775">
                    <path d="M13.915,0.379l8.258,9.98c0,0,1.252,1.184-0.106,1.184c-1.363,0-4.653,0-4.653,0s0,0.801,0,2.025
              c0,3.514,0,9.9,0,12.498c0,0,0.184,0.709-0.885,0.709c-1.072,0-5.783,0-6.55,0c-0.765,0-0.749-0.592-0.749-0.592
              c0-2.531,0-9.133,0-12.527c0-1.102,0-1.816,0-1.816s-2.637,0-4.297,0c-1.654,0-0.408-1.24-0.408-1.24s7.025-9.325,8.001-10.305
              C13.24-0.414,13.915,0.379,13.915,0.379z"/>
                  </svg>
                  <p><strong>{negativePercent === 'Infinity' ? "100%" : (negativePercent)}</strong> Desde o mês anterior</p>
                </div>
              ) : (
                <div className="box-footer negative">
                  <svg version="1.1" id="Capa_1" x="15px" y="15px"
                    viewBox="0 0 26.775 26.775">
                    <path d="M13.915,0.379l8.258,9.98c0,0,1.252,1.184-0.106,1.184c-1.363,0-4.653,0-4.653,0s0,0.801,0,2.025
                c0,3.514,0,9.9,0,12.498c0,0,0.184,0.709-0.885,0.709c-1.072,0-5.783,0-6.55,0c-0.765,0-0.749-0.592-0.749-0.592
                c0-2.531,0-9.133,0-12.527c0-1.102,0-1.816,0-1.816s-2.637,0-4.297,0c-1.654,0-0.408-1.24-0.408-1.24s7.025-9.325,8.001-10.305
                C13.24-0.414,13.915,0.379,13.915,0.379z"/>
                  </svg>
                  <p><strong>{negativePercent}%</strong> Desde o mês anterior</p>
                </div>
              )}
            </div>

          </div>

          <div className="graph box">
            <h2 className="text">Projeções mensais</h2>
            <Bar options={options} data={data} height={90} />
          </div>
        </div>
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



