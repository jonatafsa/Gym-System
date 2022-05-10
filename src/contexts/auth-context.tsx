//Hooks Nativos do React
import { createContext, ReactNode, useEffect, useState } from "react"
import { Navigate } from 'react-router-dom'
import Cookies from 'js-cookie'

//Import do firebase
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { toast } from "react-toastify"
import { app } from "../services/firebase";

//Definindo o tipo do usuário de contexto
type User = {
  uid: string
  email: string | null
  refreshToken: string
}

//Definindo o tipo do Contexto
type AuthContextType = {
  //user recebe a Tipagem 'User do usuário de contexto'
  user: User | undefined
  //signInWithGoogle recebe uma função de processamento assíncrona(Promise), sem retorno'<void>'
  signIn: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

//As propriedades do contexto(children) recebe o tipo ReactNode(JSX.Element), nativo do React
type AuthContextProviderProps = {
  children: ReactNode
}

//Exporta o contexto
//o contexto recebe como valor um objeto e esse objeto é do tipo 'AuthContextType'
export const AuthContext = createContext({} as AuthContextType)

//Exporta o Provider que é responsável por conter toda a lógica do contexto
export function AuthContextProvider(props: AuthContextProviderProps) {
  //Cria um estado que recebe os dados do usuário
  const [user, setUser] = useState<User>()

  //Hook nativo do react, responsável por verificar se o usuário já está autenticado
  useEffect(() => {
    const auth = getAuth(app);
    //Função que verifica se o usuário já esta autenticado
    const unsubscribe = onAuthStateChanged(auth, user => {

      //LÓGICA:
      //Se o useEffect achar um usuário(user)
      if (user) {
        //Cria uma constante contendo os seguintes dados a seguir
        const { refreshToken, email } = user;

        //Se dentro desse usuário(user), não houver os seguintes dados
        if (!refreshToken || !email) {
          //Apaga o Cookie que guarda o token de login
          Cookies.remove('token')
          //Retorna uma mensagem de erro
          throw new Error('Missing information from Google Account.');
        }

        setUser({
          uid: user.uid,
          email: user.email,
          refreshToken: user.refreshToken
        })

        //Cookie que guarda o token de login
        Cookies.set('token', user.refreshToken)
      }
    })

    //Retorna uma função do useEffect para fazer a limpeza
    return () => {
      unsubscribe()
    }
  }, [])

  //Função que tenta autenticar o usuário
  async function signIn(email: string, password: string) {
    const auth = getAuth(app);

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        setUser({
          uid: user.uid,
          email: user.email,
          refreshToken: user.refreshToken
        })

        //Redireciona o usuário para a página inicial
        // navigate('/')
      })
      .catch((error) => {
        console.log("meu Errp:" + error.code)

        if (error.code === "auth/wrong-password") {
          toast.error("Senha incorreta")
        }

        if (error.code === "auth/too-many-requests") {
          toast.error("Muitas tentativas e falha, aguarde um minuto antes de tentar logar novamente")
        }
      });
  }

  //Função que desloga o usuário
  async function logout() {

    const auth = getAuth(app);
    await signOut(auth).then(() => {
      Cookies.remove('token')
      setUser(undefined)
      toast.info('Você saiu do sistema!')

    }).catch(err => {
      console.log(err)
    })
  }

  //Retorno do contexto do Provider
  return (
    <AuthContext.Provider value={{ user, signIn, logout }}>
      {props.children}
    </AuthContext.Provider>
  )
}