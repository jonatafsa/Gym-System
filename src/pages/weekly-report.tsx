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

  const [weeklyValuesLabels, setWeeklyValuesLabels] = useState<any>({
    "Semana Passada": {
      name: "Semana Atual",
      payment: 0,
      positive: 0,
      negative: 0,
      users: 0
    },
    "Semana Atual": {
      name: "Semana Atual",
      payment: 0,
      positive: 0,
      negative: 0,
      users: 0
    }
  })

  const [weeklyDate, setWeeklyDate] = useState<Date>(new Date());
  const [weeklyCount, setWeeklyCount] = useState(0)

  const [positiveValues, setPositiveValues] = useState<any[]>([])
  const [positiveValuesSum, setPositiveValuesSum] = useState(0)

  const [negativeValues, setNegativeValues] = useState<any[]>([])
  const [negativeValuesSum, setNegativeValuesSum] = useState(0)

  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    //Buscando dados do Firebase API
    getData()

  }, [user?.uid])

  //Função que busca os dados do firebase
  async function getData() {
    //Inicializando o banco de dados
    //Buscando a refencia dos dados no Firebase
    const db = getDatabase()
    const dbRef = ref(db, "gym_users/" + user?.uid)

    //Setando as datas referentes a semana atual
    const date = new Date()
    const weeklyDate = new Date(date.setDate(date.getDate() - 7))
    setWeeklyDate(weeklyDate)

    //Setando as datas referentes a semana passada
    const lastWeek = new Date(date.setDate(date.getDate() - 14))

    //Arrays vazios dos vaores positivo, negativos e array de todos os dados semanais aguardando inserção de dados pelo firebase
    let positive: any = []
    let negative: any = []
    let weeklyValuesLabelsConst: any = weeklyValuesLabels

    //Vaiáveis dos valores positivo limpos agurdando tratamento dos dados vindo do firebase
    let lastWeekPositiveSum = 0
    let positiveSum = 0

    //Vaiáveis dos valores negativos limpos agurdando tratamento dos dados vindo do firebase
    let lastWeekNegativeSum = 0
    let negativeSum = 0

    //Variável temporária que guarda os usuários cadastrados nas semanas
    let usersCount: any = []
    let lastWeekUsersCount: any = []

    //Buscando os dados
    get(dbRef).then((snapshot) => {
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

        //Calculando a soma dos valores positivos dessa semana
        Object.values(positive).forEach((value: any) =>
          value[0] > weeklyDate && value[0] < new Date() && (positiveSum += Number(value[1].newValue))
        )
        //Calculando a soma dos valores positivos da semana PASSADA
        Object.values(positive).forEach((value: any) =>
          value[0] > lastWeek && value[0] < weeklyDate && (lastWeekPositiveSum += Number(value[1].newValue))
        )
        //Setando o valor da soma dos valores positivos
        setPositiveValuesSum(positiveSum)
        //guardando o total positivo dessa semana dentro de uma array
        weeklyValuesLabelsConst["Semana Atual"].positive = positiveSum
        //guardando o total positivo da semana PASSADA dentro de uma array
        weeklyValuesLabelsConst["Semana Passada"].positive = lastWeekPositiveSum

        //Calculando a soma dos valores negativos dessa smena
        Object.values(negative).forEach((value: any) =>
          value[0] > weeklyDate && value[0] < new Date() && (negativeSum += Number(value[1].newValue))
        )
        //Calculando a soma dos valores negativos da semena PASSADA
        Object.values(negative).forEach((value: any) =>
          value[0] > lastWeek && value[0] < weeklyDate && (lastWeekNegativeSum += Number(value[1].newValue))
        )
        //Setando o valor da soma dos valores negativos
        setNegativeValuesSum(negativeSum)
        //guardando o total negativo DESSA SEMANA dentro de uma array
        weeklyValuesLabelsConst["Semana Atual"].negative = negativeSum
        //guardando o total negativo DA SEMANA PASSADA dentro de uma array
        weeklyValuesLabelsConst["Semana Passada"].negative = lastWeekNegativeSum

        //Laço que filtra os usuários pela DESSA SEMANA
        Object.values(snapshot.val().users).forEach((user: any, index) => user.registeredIn > weeklyDate && user.registeredIn < new Date() && usersCount.push(user))
        //Setando o valor da quantidade de usuários DESSA SEMANA no objeto temporário
        weeklyValuesLabelsConst["Semana Atual"].users = usersCount.length
        //Laço que filtra os usuários pela DA SEMANA PASSADA
        Object.values(snapshot.val().users).forEach((user: any, index) =>
          user.registeredIn > lastWeek && user.registeredIn < weeklyDate && lastWeekUsersCount.push(user)
        )
        //Setando o valor da quantidade de usuários DESSA SEMANA no objeto temporário
        weeklyValuesLabelsConst["Semana Passada"].users = lastWeekUsersCount.length

        //Variáveis temporárias que guardam os valores positivos e negativos da semana passada
        //O valor é o resulto da função chamada onde a função recebe os valores e possível data
        let paymentSum = 0
        let lastWeekPaymentSum = 0

        //Laço que SOMA OS VALORES PAGOS EM MENSALIDADES DESSA SEMANA
        Object.values(snapshot.val().users).forEach((user: any, index) => {
          Object.entries(user.paymentShedules).forEach((value: any) => {
            // console.log(value[0])
            value[0] > weeklyDate && value[0] < new Date() &&
              (paymentSum += Number(value[1]))
          })
        })

        //Laço que SOMA OS VALORES PAGOS EM MENSALIDADES DA SEMANA QUE VEM
        Object.values(snapshot.val().users).forEach((user: any, index) => {
          Object.entries(user.paymentShedules).forEach((value: any) => {
            // console.log(value[0])
            value[0] > lastWeek && value[0] < weeklyDate &&
              (lastWeekPaymentSum += Number(value[1]))
          })
        })
        //Setando o valor da soma dos valores dessa semana
        weeklyValuesLabelsConst["Semana Atual"].payment = paymentSum
        setWeeklyCount(paymentSum)
        //Setando o valor da soma dos valores da semana passada
        weeklyValuesLabelsConst["Semana Passada"].payment = lastWeekPaymentSum

        //Setando os valores da array semanal dentro do estado
        setWeeklyValuesLabels(weeklyValuesLabelsConst)
      }
    })


  }

  //Retorno dos valores e possível soma(se houver casos) de pagamentos de um usuário
  function getValuesOfPaymentsByDate(payments: any) {
    let userPayments = 0
    const paymentsArr: any = Object.entries(payments)

    //Laço que faz a soma dos valores da lista de pagamento,
    //Ele filtra os pagamentos pela data recebida pelo Estado
    //E retorna a soma dos valores
    paymentsArr.forEach((item: any) => {
      item[0] > weeklyDate && item[0] < new Date() && (userPayments += Number(item[1]))
    })

    //retorna o valor a soma dos pagamentos
    return userPayments
  }

  //Inicializando a função que possibilita a criação do Chart
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  )

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    locale: 'pt-br',
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      ResizeObserverSize,
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';

            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += PriceMask(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          // Formatação para Real brasileior com o a Máscara
          callback: (value: any) => {
            return PriceMask(value);
          }
        }
      },
    },
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

  const dataChart = {
    labels: Object.keys(weeklyValuesLabels),
    TData: Object.values(weeklyValuesLabels),
    datasets: [
      {
        label: 'Pagamentos',
        data: Object.values(weeklyValuesLabels).map((label: any) => label.payment),
        backgroundColor: '#319797',
      },
      {
        label: 'Entrada externa',
        data: Object.values(weeklyValuesLabels).map((label: any) => label.positive),
        backgroundColor: 'rgba(120, 255, 104, 0.7)',
      },
      {
        label: 'Saída Externa',
        data: Object.values(weeklyValuesLabels).map((label: any) => label.negative),
        backgroundColor: '#b64d60',
      }
    ],
  };

  const userChart = {
    labels: Object.keys(weeklyValuesLabels),
    TData: Object.values(weeklyValuesLabels),
    datasets: [
      {
        label: 'Usuários cadastrados na semana',
        data: Object.values(weeklyValuesLabels).map((label: any) => label.users),
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
              value[0] > weeklyDate && value[0] < new Date() && <ValueItems key={index} name={value[1].name} date={value[1].date} value={value[1].newValue} class={(index & 1 ? "impar" : "par")} />
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
            {weeklyValuesLabels["Semana Atual"].users} usuário(s) cadastrado(s)
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
            <div className="footer">{PriceMask(weeklyCount)}</div>
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