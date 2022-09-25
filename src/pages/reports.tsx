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
import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";

interface WeeklyValuesLabelsProps {
  name?: string
  userPayment?: number
  positive?: number
  negative?: number
  users?: number
}

export default function WeeklyReport() {

  const { user } = useAuth()

  const [valuesLabels, setValuesLabels] = useState<any>({
    previousReport: {
      name: "Relatório Passado",
      payment: 0,
      positive: 0,
      negative: 0,
      users: 0
    },
    actualReport: {
      name: "Relatório Atual",
      payment: 0,
      positive: 0,
      negative: 0,
      users: 0
    }
  })

  //Estado que guardará os parametros vindo da minha URL
  const [params, setParams] = useState('')

  //Estado que guardará a data INCIAL que quero verificar nos meus relatórios
  const [reportDate, setReportDate] = useState(new Date());
  //Estado que guardará a data FINAL que quero verificar nos meus relatórios
  const [endReportDate, setEndReportDate] = useState(new Date())

  //Estado que guarda os PAGAMENTOS FEITOS
  const [paymentsCount, setPaymentsCount] = useState(0)

  const [positiveValues, setPositiveValues] = useState<any[]>([])
  const [positiveValuesSum, setPositiveValuesSum] = useState(0)

  const [negativeValues, setNegativeValues] = useState<any[]>([])
  const [negativeValuesSum, setNegativeValuesSum] = useState(0)

  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    //Buscando dados do Firebase API
    getData()

    //Pegando o parametro via URL
    const params = location.search.replace('?', '')
    setParams(params)

  }, [user?.uid])

  //Função que busca os dados do firebase
  async function getData() {
    //Inicializando o banco de dados
    //Buscando a refencia dos dados no Firebase
    const db = getDatabase()
    const dbRef = ref(db, "gym_users/" + user?.uid)

    // Iniciando a variável que guardará a data inicial
    let reportDate: Date
    //Iniciando a variável que guaradará a data de compraração a anterior
    let compairTimesDate: Date

    //Condicional que verifica se o parametro da URL é weekly(SEMANA)
    if (params === 'weekly') {
      //Definindo no estado a data do relatório
      setReportDate(new Date(new Date().setDate(new Date().getDate() - 7)))
      //Definindo dentro do escopo da função a data do relatório
      //Onde ele {reportDate} a data de hoje e subtrai 7 dias
      reportDate = new Date(new Date().setDate(new Date().getDate() - 7))
      //Definindo dentro do escopo da função a data de comparação
      //Onde ele {compairTimesDate} a data de hoje e subtrai 14 dias
      compairTimesDate = new Date(new Date().setDate(new Date().getDate() - 14))
    }

    //Condicional que verifica se o parametro da URL é montly(MENSAL)
    //Ou se se acaso os parametros estiverem vazios, seta como mensal os valores
    if (params === 'montly' || params === '') {
      //Definindo no estado a data do relatório
      setReportDate(new Date(new Date().setMonth(new Date().getMonth() - 1)))
      //Definindo dentro do escopo da função a data do relatório
      //Onde {reportDate} recebe a data de hoje e subtrai  mes
      reportDate = new Date(new Date().setMonth(new Date().getMonth() - 1))
      //Definindo dentro do escopo da função a data de comparação
      //Onde {compairTimesDate} recebe a data de hoje e subtrai 2 meses
      compairTimesDate = new Date(new Date().setMonth(new Date().getMonth() - 2))
    }

    //Condicional que verifica se o parametro da URL é yearly(ANUAL)
    //Ou se se acaso os parametros estiverem vazios, seta como mensal os valores
    if (params === 'yearly') {
      //Definindo no estado a data do relatório
      setReportDate(new Date(new Date().setFullYear(new Date().getFullYear() - 1)))
      //Definindo dentro do escopo da função a data do relatório
      //Onde {reportDate} recebe a data de hoje e subtrai  mes
      reportDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      //Definindo dentro do escopo da função a data de comparação
      //Onde {compairTimesDate} recebe a data de hoje e subtrai 2 meses
      compairTimesDate = new Date(new Date().setFullYear(new Date().getFullYear() - 2))
    }

    //Arrays vazios dos vaores positivo, negativos e array de todos os dados aguardando inserção de dados pelo firebase
    let positive: any = []
    let negative: any = []
    let valuesLabelsArr: any = valuesLabels

    //Vaiáveis dos valores positivo limpos agurdando tratamento dos dados vindo do firebase
    let PositiveSumPreviousDate = 0
    let positiveSum = 0

    //Vaiáveis dos valores negativos limpos agurdando tratamento dos dados vindo do firebase
    let lastWeekNegativeSum = 0
    let negativeSum = 0

    //Variável temporária que guarda os usuários cadastrados
    let usersCount: any = []
    let lastUsersCount: any = []

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

        //Calculando a soma dos valores positivos PELA DATA
        Object.values(positive).forEach((value: any) =>
          value[0] > reportDate && value[0] < endReportDate && (positiveSum += Number(value[1].newValue))
        )

        //Calculando a soma dos valores positivos da semana PASSADA
        //ESSE TENHO QUE REVISAR POIS PEGA DUAS DATAS DISTINTAS
        Object.values(positive).forEach((value: any) =>
          value[0] > compairTimesDate && value[0] < reportDate && (PositiveSumPreviousDate += Number(value[1].newValue))
        )



        //Setando o valor da soma dos valores positivos
        setPositiveValuesSum(positiveSum)
        //guardando o total positivo dessa semana dentro de uma array
        valuesLabelsArr.actualReport.positive = positiveSum
        //guardando o total positivo da semana PASSADA dentro de uma array
        valuesLabelsArr.previousReport.positive = PositiveSumPreviousDate

        //Calculando a soma dos valores negativos dessa smena
        Object.values(negative).forEach((value: any) =>
          value[0] > reportDate && value[0] < endReportDate && (negativeSum += Number(value[1].newValue))
        )


        //Calculando a soma dos valores negativos da semena PASSADA
        //ESSE EU TENHO QUE REVISAR POIS PEGA DUAS DUAS DATAS DISTINTAS
        Object.values(negative).forEach((value: any) =>
          value[0] > compairTimesDate && value[0] < reportDate && (lastWeekNegativeSum += Number(value[1].newValue))
        )


        //Setando o valor da soma dos valores negativos
        setNegativeValuesSum(negativeSum)
        //guardando o total negativo DESSA SEMANA dentro de uma array
        valuesLabelsArr.actualReport.negative = negativeSum
        //guardando o total negativo DA SEMANA PASSADA dentro de uma array
        valuesLabelsArr.previousReport.negative = lastWeekNegativeSum

        //Laço que filtra os usuários pela DESSA SEMANA
        Object.values(snapshot.val().users).forEach((user: any, index) => user.registeredIn > reportDate && user.registeredIn < endReportDate && usersCount.push(user))
        //Setando o valor da quantidade de usuários DESSA SEMANA no objeto temporário
        valuesLabelsArr.actualReport.users = usersCount.length


        //Laço que filtra os usuários pela DA SEMANA PASSADA
        //ESSE EU TENHO QUE REVISAR POIS PEGA DUAS DUAS DATAS DISTINTAS
        Object.values(snapshot.val().users).forEach((user: any, index) =>
          user.registeredIn > compairTimesDate && user.registeredIn < reportDate && lastUsersCount.push(user)
        )


        //Setando o valor da quantidade de usuários DESSA SEMANA no objeto temporário
        valuesLabelsArr.previousReport.users = lastUsersCount.length

        //Variáveis temporárias que guardam os valores positivos e negativos da semana passada
        //O valor é o resulto da função chamada onde a função recebe os valores e possível data
        let paymentSum = 0
        let lastWeekPaymentSum = 0

        //Laço que SOMA OS VALORES PAGOS EM MENSALIDADES DESSA SEMANA
        Object.values(snapshot.val().users).forEach((user: any, index) => {
          Object.entries(user.paymentShedules).forEach((value: any) => {
            // console.log(value[0])
            value[0] > reportDate && value[0] < endReportDate &&
              (paymentSum += Number(value[1]))
          })
        })

        //Laço que SOMA OS VALORES PAGOS EM MENSALIDADES DA SEMANA PASSADA
        //ESSE EU TENHO QUE REVISAR POIS PEGA DUAS DUAS DATAS DISTINTAS
        Object.values(snapshot.val().users).forEach((user: any, index) => {
          Object.entries(user.paymentShedules).forEach((value: any) => {
            // console.log(value[0])
            value[0] > compairTimesDate && value[0] < reportDate &&
              (lastWeekPaymentSum += Number(value[1]))
          })
        })
        //Setando o valor da soma dos PAGAMENTOS dessa semana
        valuesLabelsArr.actualReport.payment = paymentSum
        setPaymentsCount(paymentSum)
        //Setando o valor da soma dos PAGAMENTOS da semana passada
        valuesLabelsArr.previousReport.payment = lastWeekPaymentSum

        //Setando os valores da array semanal dentro do estado
        setValuesLabels(valuesLabelsArr)
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
      item[0] > reportDate && item[0] < endReportDate && (userPayments += Number(item[1]))
    })

    //retorna o valor a soma dos pagamentos
    return userPayments
  }

  function thisValuesExists(values: any) {
    const valuesArr: any = []
    Object.values(values).forEach((item: any) => {
      item[0] > reportDate && item[0] < endReportDate && valuesArr.push(item[0])
    })

    if (valuesArr.length === 0) {
      return (
        <div className="empty-values">
          Não há dados para os últimos 7 dias
        </div>
      )
    }
  }

  function editTimeforReports(e: any) {
    setParams(e.target.value)
    location.search = e.target.value
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
    labels: setDataChartLabels(),
    TData: Object.values(valuesLabels),
    datasets: [
      {
        label: 'Pagamentos',
        data: Object.values(valuesLabels).map((label: any) => label.payment),
        backgroundColor: '#319797',
      },
      {
        label: 'Entrada externa',
        data: Object.values(valuesLabels).map((label: any) => label.positive),
        backgroundColor: 'rgba(120, 255, 104, 0.7)',
      },
      {
        label: 'Saída Externa',
        data: Object.values(valuesLabels).map((label: any) => label.negative),
        backgroundColor: '#b64d60',
      }
    ],
  };

  const userChart = {
    labels: setDataChartLabels(),
    TData: Object.values(valuesLabels),
    datasets: [
      {
        label: 'Usuários cadastrados',
        data: Object.values(valuesLabels).map((label: any) => label.users),
        backgroundColor: '#ffd438',
        borderWidth: 2,
      }
    ],
  };

  //Função que retotna um array diferente para cada tipo de gráfico
  function setDataChartLabels() {
    let labels: any

    if (params === 'weekly') {
      labels = ["Semana Anterior", "Essa Semana"]
      return labels
    }

    if (params === 'montly' || params === '') {
      labels = ["Mês Anterior", "Esse mês"]
      return labels
    }

    if (params === 'yearly') {
      labels = ["12 meses Anteriores", "Últimos 12 meses"]
      return labels
    }
  }

  //Condicional que verifica se o usuário está autenticado
  if (typeof window !== 'undefined') {
    const token = Cookies.get('token')

    if (!token) {
      return <Navigate to="/login" replace />
    }
  }

  //Condicional que seta qual Option vai estar selecionada no relatório
  if (document.getElementById('timeList')) {
    //Cria uma constante que recebe o elemento select
    const select = (document.getElementById('timeList') as HTMLInputElement)
    //Verifica se os parametros vindo do estad está vazio ou não, 
    //Se estiver vazio ele selecionao o valor montly(MENSAL) como padrão
    params === '' ? select.value = 'montly' : select.value = params
  }

  return (
    <div>
      {!user?.uid && <Loading />}
      <Header />
      <Navigation />

      <main className="reports">
        <div className="reports-header">
          <h1 className="sub-heading">
            Relatório de
            ({reportDate.toLocaleDateString()})
            a ({endReportDate.toLocaleDateString()})
          </h1>

          <div className="header-item">
            <label htmlFor="selectTime">Relatório</label>
            <select id="timeList" onChange={editTimeforReports}>
              <option value="weekly">Semanal</option>
              <option value="montly">Mensal</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
        </div>

        <div className="box-item positive">
          <h2>Entrada de valores</h2>
          <div className="box-values">
            {positiveValues.map((value, index) => (
              value[0] > reportDate && value[0] < endReportDate && <ValueItems key={index} name={value[1].name} date={value[1].date} value={value[1].newValue} class={(index & 1 ? "impar" : "par")} />
            ))}
            {thisValuesExists(positiveValues)}
          </div>
          <div className="footer">{PriceMask(positiveValuesSum)}</div>
        </div>

        <div className="box-item negative">
          <h2>Saída de valores</h2>
          <div className="box-values">
            {negativeValues.map((value, index) => (
              value[0] > reportDate && value[0] < endReportDate ? <ValueItems key={index} name={value[1].name} date={value[1].date} value={value[1].newValue} class={(index & 1 ? "impar" : "par")} /> : ""
            ))}
            {thisValuesExists(negativeValues)}
          </div>
          <div className="footer">{PriceMask(negativeValuesSum)} </div>
        </div>

        <div className="users-registered">
          <h2>
            Usuários cadastrados
            {params === 'weekly' && 'nos últimos 7 dias'}
            {params === 'montly' && 'nos últimos 30 dias'}
            {params === '' && 'nos últimos 30 dias'}
            {params === 'yearly' && 'Nos período de 1 ano'}

          </h2>

          <div className="users-items">
            {users.map((user, index) => (
              user.registeredIn > reportDate && user.registeredIn < endReportDate && <UsersItem key={index} name={user.name} modalities={Object.keys(user.userModalities || [])} registeredIn={user.registeredIn} class={(index & 1 ? "impar" : "par")} />
            ))}
            {/* {thisValuesExists(users)} */}
          </div>
          <div className="box-footer">
            {valuesLabels.actualReport.users} usuário(s) cadastrado(s)
          </div>
        </div>

        <div className="footer-content">
          <div className="box-item positive">
            <h2>Recebimentos de mensalidades</h2>

            <div className="box-values">
              {users.map((user, index) => (
                user.payment > reportDate && user.payment < endReportDate &&
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
            <div className="footer">{PriceMask(paymentsCount)}</div>
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