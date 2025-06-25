export default function Clients() {
  return (
    <>
      <div className="move-up">
        <strong className="page-title">내담자 관리</strong>
        <div className="switch-wrap">
          <label>
            <span>개인정보 보호</span>
            <input role="switch" name="switch" type="checkbox" defaultChecked />
          </label>
        </div>
      </div>
      <div>내담자 관리</div>
    </>
  );
}
