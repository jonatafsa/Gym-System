//Hooks Nativos do React
import { createContext, ReactNode, useState } from "react"

//Definindo o tipo do usuário de contexto
type Modal = {
  title: string
  content: any
}

//Definindo o tipo do Contexto
type ModalContextType = {
  //user recebe a Tipagem 'User do usuário de contexto'
  modal: Modal | undefined
  //signInWithGoogle recebe uma função de processamento assíncrona(Promise), sem retorno'<void>'
  modalChange: (title: string, content: any) => Promise<void>
}

//As propriedades do contexto(children) recebe o tipo ReactNode(JSX.Element), nativo do React
type ModalContextProviderProps = {
  children: ReactNode
}

//Exporta o contexto
//o contexto recebe como valor um objeto e esse objeto é do tipo 'ModalContextType'
export const ModalContext = createContext({} as ModalContextType)

//Exporta o Provider que é responsável por conter toda a lógica do contexto
export function ModalContextProvider(props: ModalContextProviderProps) {
  //Cria um estado que recebe os dados do usuário
  const [modal, setModal] = useState<Modal>()

  //Função que tenta autenticar o usuário
  async function modalChange(title: string, content: any) {
    setModal({
      title,
      content
    })

    const admin = document.querySelector(".admin");
    admin?.classList.toggle("open")
  }

  //Retorno do contexto do Provider
  return (
    <ModalContext.Provider value={{ modal, modalChange }}>
      {props.children}
    </ModalContext.Provider>
  )
}