import { ReactComponentElement } from "react"
import { ImArrowUp } from "react-icons/im"
import { CPFMask, PriceMask } from "../services/masks"

interface CardItemProps {
  icon: ReactComponentElement<any>
  title: string
  value: any
  footer?: any
  status: string
}

interface ValueItemsProps {
  name: string
  date: string
  value: number
  class?: string
  cpf?: string
}

interface UsersItemProps {
  name: string
  modalities?: any
  class?: string
  registeredIn: string
}

export default function CardItem(props: CardItemProps) {
  return (
    <div className="box">
      <div className="box-icon">{props.icon}</div>
      <span className="text">{props.title}</span>
      <h2 className="text">{props.value}</h2>
      <div className={`box-footer ${props.status}`}>
        <ImArrowUp size={20} className={props.status} />
        <p>{props.footer}</p>
      </div>
    </div>
  )
}

export function ValueItems(props: ValueItemsProps) {
  return (
    <div className={`value-item ${props.class}`}>
      <h4><strong>{props.cpf ? "Nome:" : "Descrição"}:</strong> {props.name} {props.cpf && ` - CPF: ${props.cpf?.substr(0, 3)} ***-***-${props.cpf?.slice(String(props.cpf).length - 3)} `}
      </h4>
      <p>{props.date}</p>
      <span>{PriceMask(props.value)}</span>
    </div>
  )
}

export function UsersItem(props: UsersItemProps) {
  return (
    <div className={`item ${props.class}`}>
      <p className="name">{props.name}</p>

      <div className="modalities">
        {props.modalities && props.modalities.map((modalities: string) => (
          <p key={modalities}>{modalities}</p>
        ))}
      </div>

      <p className="date">{new Date(props.registeredIn).toLocaleDateString('pt-br', { month: 'long', day: 'numeric' })}</p>
    </div>
  )
}