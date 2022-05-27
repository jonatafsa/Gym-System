import { UilBars } from '@iconscout/react-unicons'

export default function Header() {
    function toogleNavigation() {
        const menu = document.querySelector("nav")
        menu?.classList.toggle("hide")
    }

    return <header>
        <UilBars onClick={toogleNavigation} className="btn-toogle" />
    </header>
}