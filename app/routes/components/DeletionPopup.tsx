import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";

export default function ({ triggerComponent }) {
  <Popup trigger={triggerComponent} position='right center'>
    <div>Are you sure you want to delete collection</div>
  </Popup>;
}
