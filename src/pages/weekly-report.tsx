import { get, getDatabase, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { UsersItem, ValueItems } from "../components/card-items";
import Header from "../components/header";
import Loading from "../components/loading";
import Navigation from "../components/navigation";
import { useAuth } from "../hooks/use-auth";
import { PriceMask } from "../services/masks";
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

import "../styles/reports.scss";

interface WeeklyValuesLabelsProps {
  name?: string
  userPayment?: number
  positive?: number
  negative?: number
  users?: number
}

export default function WeeklyReport() {

  const { user } = useAuth()

  const [weeklyValuesLabels, setWeeklyValuesLabels] = useState<WeeklyValuesLabelsProps[]>([])

  const [weeklyDate, setWeeklyDate] = useState<Date>(new Date());

  const [positiveValues, setPositiveValues] = useState<any[]>([])
  const [positiveValuesSum, setPositiveValuesSum] = useState(0)

  const [negativeValues, setNegativeValues] = useState<any[]>([])
  const [negativeValuesSum, setNegativeValuesSum] = useState(0)

  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    //Buscando dados do Firebase API
    getData()

    //Setando as datas referentes a semana atual
    const date = new Date()
    const weeklyDate = new Date(date.setDate(date.getDate() - 7))
    setWeeklyDate(weeklyDate)
  }, [user?.uid])

  //Função que busca os dados do firebase
  async function getData() {
    //Inicializando o banco de dados
    //Buscando a refencia dos dados no Firebase
    const db = getDatabase()
    const dbRef = ref(db, "gym_users/" + user?.uid)

    //Arrays vazios dos vaores positivo, negativos e array de todos os dados semanais aguardando inserção de dados pelo firebase
    let positive: any = []
    let negative: any = []
    let arrWeeklyValuesLabels: WeeklyValuesLabelsProps[] = weeklyValuesLabels

    //Array e variável dos valores positivo limpos agurdando tratamento dos dados vindo do firebase
    let arrPositive: any = []
    let positiveSum = 0

    //Array e variável dos valores negativos limpos agurdando tratamento dos dados vindo do firebase
    let arrNegative: any = []
    let negativeSum = 0

    //Buscando os dados
    onValue(dbRef, (snapshot) => {
      //Verificando se os dados existem
      if (snapshot.exists()) {
        //Setando os usuários
        setUsers(Object.values(snapshot.val().users))

        //Definindo os arrays com os dados dos valores positos e negativos dentro de um estado
        setPositiveValues(Object.entries(snapshot.val()['external-values'].positive))
        setNegativeValues(Object.entries(snapshot.val()['external-values'].negative))

        //Setando os valores positivos dentro da constante
        positive = (Object.entries(snapshot.val()['external-values'].positive))
        //Setando os valores negativos dentro da constante
        negative = (Object.entries(snapshot.val()['external-values'].negative))

        //Definindo os valores como um array
        Object.values(positive).forEach((value: any) => arrPositive.push(Number(value[1].newValue)))
        //Calculando a soma dos valores positivos
        arrPositive.forEach((e: number) => positiveSum += e)
        //Setando o valor da soma dos valores positivos
        setPositiveValuesSum(positiveSum)
        //guardando o total positivo dentro de uma array
        arrWeeklyValuesLabels.push({ positive: positiveSum })

        //Definindo os valores como um array
        Object.values(negative).forEach((value: any) => arrNegative.push(Number(value[1].newValue)))
        //Calculando a soma dos valores positivos
        arrNegative.forEach((e: number) => negativeSum += e)
        //Setando o valor da soma dos valores positivos
        setNegativeValuesSum(negativeSum)
        //guardando o total negativo dentro de uma array
        arrWeeklyValuesLabels.push({ negative: negativeSum })

        //Setando os valores da array semanal dentro do estado
        setWeeklyValuesLabels(arrWeeklyValuesLabels)
      }
    })


  }

  //Função que retorna a quantide de usuários registrados na data
  function getUsersCount() {
    //Variável que guardará os usuários para serem contados
    let usersCount: any = []
    //Laço que filtra os usuários pela data
    users.forEach((user, index) => user.registeredIn > weeklyDate && user.registeredIn < new Date() && usersCount.push(user))
    //Retorno da quantidade de usuários em número

    console.log(usersCount)

    return usersCount.length
  }

  //Soma de todos os pagamentos de um usuários
  // function getValuesOfPayments(payments: any) {
  //   let sum = 0
  //   console.log(Object.values(payments).forEach((e: any) => sum += Number(e)))
  //   return sum
  // }

  //Retorno dos valores e possível soma(se houver casos) de pagamentos de um usuário
  function getValuesOfPaymentsByDate(payments: any) {
    let userPayments = 0
    const paymentsArr: any = Object.values(payments)

    //Laço que faz a soma dos valores da lista de pagamento
    paymentsArr.forEach((item: any) => userPayments += Number(item))
    return userPayments
  }

  //Função que retorna a quantide de usuários registrados na data
  function getPaymentsCount() {
    //Variável que guardará os usuários para serem contados
    let arrCount: any = []
    let arrPayments: number = 0
    //Laço que filtra os usuários pela data
    users.forEach((user, index) => user.payment > weeklyDate && user.payment < new Date() && arrCount.push(user.paymentShedules))

    for (let i = 0; i < arrCount.length; i++) {
      arrPayments += getValuesOfPaymentsByDate(arrCount[i])
    }

    //Retorno da quantidade de usuários em número
    return arrPayments
  }

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
    maintainAspectRatio: false,
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

  const userOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
          // callback: function (value: any) {
          //   return PriceMask(value);
          // }
        }
      },
    }
  }

  const labels = [{
    name: 'data 1',
    usersPayment: 55474,
    positive: 49548,
    negative: 55012,
    users: 8,
  },
  {
    name: 'data 1',
    usersPayment: 55748,
    positive: 49525,
    negative: 50121,
    users: 12,
  }]

  const dataChart = {
    labels: ["Semana passada", "Semana Atual"],
    TData: labels[0],
    datasets: [
      {
        label: 'Entrada externa',
        data: Object.values(labels).map((label) => label.usersPayment),
        backgroundColor: '#319797',
        borderWidth: 2,
      },
      {
        label: 'Saída externa',
        data: labels.map((label) => label.positive),
        backgroundColor: '#b64d60',
        borderWidth: 2,
      },
      {
        label: 'Matrículas',
        data: labels.map((label) => label.negative),
        backgroundColor: 'rgba(120, 255, 104, 0.7)',
        borderWidth: 2,
      }
    ],
  };

  const userChart = {
    labels: ["Semana passada", "Semana Atual"],
    TData: labels[0],
    datasets: [
      {
        label: 'Usuários cadastrados na semana',
        data: Object.values(labels).map((label) => label.users),
        backgroundColor: '#ffd438',
        borderWidth: 2,
      }
    ],
  };

  return (
    <div>
      {!user?.uid && <Loading />}
      <Header />
      <Navigation />

      <main className="reports">
        <h1 className="sub-heading">
          Relatório Semanal referente aos útltimos 7 dias
          ({weeklyDate.toLocaleDateString()})
          a ({new Date().toLocaleDateString()})
        </h1>

        <div className="box-item positive">
          <h2>Entrada de valores</h2>
          <div className="box-values">
            {positiveValues.map((value, index) => (
              <ValueItems key={index} name={value[1].name} date={value[1].date} value={value[1].newValue} class={(index & 1 ? "impar" : "par")} />
            ))}
          </div>
          <div className="footer">{PriceMask(positiveValuesSum)}</div>
        </div>

        <div className="box-item negative">
          <h2>Saída de valores</h2>
          <div className="box-values">
            {negativeValues.map((value, index) => (
              value[0] > weeklyDate && value[0] < new Date() ? <ValueItems key={index} name={value[1].name} date={value[1].date} value={value[1].newValue} class={(index & 1 ? "impar" : "par")} /> : ""
            ))}
          </div>
          <div className="footer">{PriceMask(negativeValuesSum)} </div>
        </div>

        <div className="users-registered">
          <h2>Usuários cadastrados nos últimos 7 dias</h2>

          <div className="users-items">
            {users.map((user, index) => (
              user.registeredIn > weeklyDate && user.registeredIn < new Date() ? <UsersItem key={index} name={user.name} modalities={Object.keys(user.userModalities || [])} registeredIn={user.registeredIn} class={(index & 1 ? "impar" : "par")} /> : ""
            ))}
          </div>
          <div className="box-footer">
            {getUsersCount()} usuário(s) cadastrado(s)
          </div>
        </div>

        <div className="footer-content">
          <div className="box-item positive">
            <h2>Recebimentos de mensalidades</h2>

            <div className="box-values">
              {users.map((user, index) => (
                user.payment > weeklyDate && user.payment < new Date() &&
                <ValueItems
                  // class={bgColorOf()}
                  key={index}
                  name={user.name}
                  cpf={user.cpf}
                  date={new Date(user.payment).toLocaleDateString('pt-br', { month: 'long', day: 'numeric' })}
                  value={getValuesOfPaymentsByDate(user.paymentShedules)}
                />
              ))}
            </div>
            <div className="footer">{PriceMask(getPaymentsCount())}</div>
          </div>

          <div className="box-item">
            <h2>Gráfico de valores</h2>
            <Bar options={options} data={dataChart} className="chart" />
          </div>

          <div className="box-item">
            <h2>Gráfico de usuários</h2>
            <Bar options={userOptions} data={userChart} className="chart" />
          </div>
        </div>
      </main>
    </div>
  )
}