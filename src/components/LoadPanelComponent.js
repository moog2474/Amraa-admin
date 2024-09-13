import React from "react"
import { LoadPanel } from "devextreme-react/load-panel"
import loader from "../assets/imgs/tube-spinner.svg"
function LoadPanelComponent(props) {
  return (
    <LoadPanel
      position={props.position}
      visible={props.visible}
      wrapperAttr={{ class: "borderRound" }}
      message=""
      shadingColor="#f5f6fa4f"
      indicatorSrc={loader}
      showPane={false}
    />
  )
}

export default LoadPanelComponent
