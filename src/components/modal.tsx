export default function Modal(props: any) {

  function modalToggle() {
    const admin = document.querySelector(".admin");
    admin?.classList.toggle("open");
  }

  return (
    <div className="modal">
      <div className="modal-overlay" onClick={modalToggle}></div>
      <div className="slider-wrap">
        <span>{props.title}</span>

        {props.children}
      </div>
    </div>
  );
}
