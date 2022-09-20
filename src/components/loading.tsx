import '../styles/components/loading.scss'

export default function Loading() {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading"></div>
        <div id="loading-text">loading</div>
      </div>
    </div>
  );
}
