//Importa o contexto de autenticação
import { ModalContext } from '../contexts/modal-context'
//Importa a Api de contexto do React
import { useContext } from 'react'

//Exporta o a função(useAuth)
export function useModal() {
  //define o valor de value com o contexto
  const value = useContext(ModalContext)

  //Retorna value
  return value
}