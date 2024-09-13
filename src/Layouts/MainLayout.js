import React, { useContext, useEffect } from "react";
import Header from "../components/Header";
import _ from "lodash";
import { UserContext } from "../hooks/UserContext";
import "./mainLayout.css";
import Sidebar from "../components/sidebar/Sidebar";

const MainLayout = (props) => {
  const { children } = props;
  const [toggle, setToggle] = React.useState(true);
  const [result, setResult] = React.useState([]);

  let { user } = useContext(UserContext);

  function changeToggle() {
    setToggle(!toggle);
  }

    // create an event listener
    useEffect(() => {
        window.addEventListener("resize", resize)
    })

    const resize = () => {
        let currentHideNav = (window.innerWidth >= 1300);
        if (currentHideNav !== toggle) {
            changeToggle();
        }
    }

  useEffect(() => {
    if (!user) return;
    let tempresult = _(user.menu)
      .groupBy((x) => x.parent_name)
      .map((value, key) => ({
        parent_name: key,
        order_id: value[0].order_id,
        other: value,
      }))
      .value();
    let r = _.orderBy(tempresult, ['order_id', 'asc']);
    setResult(r);
  }, [user]);

  return (
    <React.Fragment>
        {user && result && result.length && (
            <Sidebar
                changeToggle={changeToggle}
                result={result}
                toggle={toggle}
                setToggle={setToggle}
                menu={user.menu}
                // mouseOn={mouseOn}
                // setMouseOn={setMouseOn}
                path={props.location.pathname}
            />
        )}
        <Header
            toggle={changeToggle}
            socket={props.socket}
            readChat={props.readChat}
        />
        <div style={{ width: "100%", position: "relative", zIndex: 1, display: 'flex', flex: 1, flexDirection: 'column' }}>
            <div
                className="main-content"
                style={{ marginLeft: toggle ? 300 : 0, backgroundColor: "#FFFFFF", height: '100%',padding: 5, backgroundColor: 'gray' }}
            >
                <>{children}</>
            </div>
        </div>
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "auto",
                backgroundColor: "#fff",
                height: "3.2rem"
            }}
        >
        <span style={{ padding: 20, color: "#160B3D", backgroundColor: '#fff', fontSize: 14, fontFamily: 'Roboto' }}>
          DATALAND TECHNOLOGY LLC @{new Date().getFullYear()} v1.0  #0904             <span style={{ "paddingLeft": 40 }}>Утас: 75077171 Имэйл: info@dataland.mn</span>
        </span>

        </div>
    </React.Fragment>
  );
};
export default MainLayout;
