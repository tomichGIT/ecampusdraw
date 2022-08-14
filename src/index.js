
import { createRoot } from 'react-dom/client';
/*eslint-disable */
import "./styles.css";

import App from "./app";

const excalidrawWrapper = document.getElementById("app");

const root = createRoot(excalidrawWrapper);
root.render(<App />);