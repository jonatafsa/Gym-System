import "./styles/global.scss";
import "react-toastify/dist/ReactToastify.css";

import { ToastContainer, Zoom } from "react-toastify";
import MyRoutes from "./routes";
import { AuthContextProvider } from "./contexts/auth-context";
import Cookies from "js-cookie";
import { ModalContextProvider } from "./contexts/modal-context";

function App() {
  if (Cookies.get("dark") === "true") {
    const app = document.querySelector(".container");
    app?.classList.add("dark");
  }

  return (
    <AuthContextProvider>
      <ModalContextProvider>
        <div className="container admin">
          <MyRoutes />

          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            transition={Zoom}
          />
        </div>
      </ModalContextProvider>
    </AuthContextProvider>
  );
}

export default App;
