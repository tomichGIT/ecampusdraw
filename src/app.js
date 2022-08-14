import React, { useEffect, useState, useRef, useCallback } from "react";
import InitialData from "./initialData";

import {
    exportToCanvas,
    exportToSvg,
    exportToBlob,
    exportToClipboard,
    Excalidraw,
    useHandleLibrary,
    MIME_TYPES,
    sceneCoordsToViewportCoords,
    viewportCoordsToSceneCoords,
    restoreElements
  } from "@excalidraw/excalidraw";
//   import {
//     AppState,
//     BinaryFileData,
//     ExcalidrawImperativeAPI,
//     ExcalidrawInitialDataState,
//     Gesture,
//     PointerDownState as ExcalidrawPointerDownState
//   } from "@excalidraw/excalidraw/types/types";
  

//   import { ResolvablePromise } from "@excalidraw/excalidraw/types/utils";
//   import { ImportedLibraryData } from "@excalidraw/excalidraw/types/data/types";
//   import {
//     ExcalidrawElement,
//     NonDeletedExcalidrawElement
//   } from "@excalidraw/excalidraw/types/element/types";

const defaultLang = { code: "es-ES", label: "Español" };


export default function App() {
    const excalidrawRef = React.useRef(null);
    const [theme, setTheme] = useState("dark");
    const [viewModeEnabled, setViewModeEnabled] = useState(false);
    const [zenModeEnabled, setZenModeEnabled] = useState(false);
    const [gridModeEnabled, setGridModeEnabled] = useState(false);


    
    
    const [
        excalidrawAPI,
        setExcalidrawAPI
    ] = useState(null);


    
    // si tengo en el GET alguna librería cargada de "Explorar Bibliotecas" la agrego a mi libreria
    useHandleLibrary({ excalidrawAPI });

    useEffect(() => {
        if (!excalidrawAPI) {
          return;
        }
        console.log("ejecutando useEffect que no me acuerdo que es");

      }, [excalidrawAPI]);
    
      const renderTopRightUI = () => {
        return (
          <button className="footer-element"
            onClick={() => alert("Presiona F11 para verlo pantalla completa")}
            style={{ height: "2.5rem" }}
          >
            FullScreen
          </button>
        );
      };

      const ICONS = {
        SUN: (
          <svg width="512" height="512" className="rtl-mirror" viewBox="0 0 512 512">
            <path fill="currentColor" d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z"></path>
          </svg>
        ),
        MOON: (
          <svg width="512" height="512" className="rtl-mirror" viewBox="0 0 512 512">
            <path fill="currentColor" d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z"></path>
          </svg>
        ),
      };

   

      const renderFooter = () => {
        return (
          <>
            {/* <button className="footer-element" onClick={updateScene}>
                Actualizar Escena
            </button> */}
            <button className="footer-element" onClick={() => {
                excalidrawAPI?.resetScene(); }}> 
                Limpiar Escena
            </button>
            <label>
            <input type="checkbox" checked={viewModeEnabled}
                onChange={() => setViewModeEnabled(!viewModeEnabled)}
            />View mode &nbsp;
            </label> |
            <label className="zen-mode-off">
            <input type="checkbox" checked={zenModeEnabled}
                onChange={() => setZenModeEnabled(!zenModeEnabled)}
            />Zen mode &nbsp;
            </label> |
            <label>
            <input type="checkbox" checked={gridModeEnabled}
                onChange={() => setGridModeEnabled(!gridModeEnabled)}
            />Grid
            </label>
            <button className="themeIcon ToolIcon_type_button ToolIcon_size_small ToolIcon" onClick={() => {
                    let newTheme = (theme === "dark")?"light":"dark";
                    setTheme(newTheme);
                }}>
                <div className="ToolIcon__icon">{(theme === "dark")?ICONS.SUN:ICONS.MOON}</div>
            </button>


          </>
        );
      };
  
    const updateScene = () => {
        console.log("haciendo update de SCENE!");
      const sceneData = {
        elements: [
          {
            type: "rectangle",
            version: 141,
            versionNonce: 361174001,
            isDeleted: false,
            id: "oDVXy8D6rom3H1-LLH2-f",
            fillStyle: "hachure",
            strokeWidth: 1,
            strokeStyle: "solid",
            roughness: 1,
            opacity: 100,
            angle: 0,
            x: 100.50390625,
            y: 93.67578125,
            strokeColor: "#c92a2a",
            backgroundColor: "transparent",
            width: 186.47265625,
            height: 141.9765625,
            seed: 1968410350,
            groupIds: [],
          },
        ],
        appState: {
          viewBackgroundColor: "#edf2ff",
        },
      };
      //excalidrawRef.current.updateScene(sceneData);
      excalidrawAPI?.updateScene(sceneData);
    };

  
    return (
    
    <div>
      
      <div className="excalidraw-wrapper" ref={excalidrawRef}>

      <Excalidraw 
        ref={(api) => setExcalidrawAPI(api)}
        initialData={InitialData}
        autoFocus={true}
        UIOptions={{ canvasActions: { loadScene: true, theme:true } }}
        onChange= {(elements, state) => { 
        console.log("Elements :", elements, "State : ", state) }}
        //onPointerUpdate= {(payload) => console.log(payload) }
        langCode={defaultLang.code}
        //handleKeyboardGlobally={true}
        theme={theme}
        //onCollabButtonClick= {() => window.alert("You clicked on collab button") }
        viewModeEnabled= {viewModeEnabled}
        zenModeEnabled= {zenModeEnabled}
        gridModeEnabled= {gridModeEnabled}
        //renderTopRightUI={renderTopRightUI}
        renderFooter={renderFooter}
      />
      </div>
    </div>
    );
   
}