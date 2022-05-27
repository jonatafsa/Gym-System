import { FaBars } from 'react-icons/fa'

export default function Header() {
    function toogleNavigation() {
        const menu = document.querySelector("nav")
        menu?.classList.toggle("hide")
    }

    return <header>
        <FaBars size={22} onClick={toogleNavigation} className="btn-toogle" />
    </header>
}