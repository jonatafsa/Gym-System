//Importa o contexto de autenticação
import { AuthContext } from '../contexts/auth-context'
//Importa a Api de contexto do React
import { useContext } from 'react'

//Exporta o a função(useAuth)
export function useAuth() {
  //define o valor de value com o contexto
  const value = useContext(AuthContext)

  //Retorna value
  return value
}