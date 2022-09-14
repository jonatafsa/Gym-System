import { ReactComponentElement } from "react"
import { ImArrowUp } from "react-icons/im"

interface CardItemProps {
  icon: ReactComponentElement<any>
  title: string
  value: any
  footer?: any
  status: string
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