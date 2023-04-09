import React, { useEffect, useState, useRef, useCallback } from "react";

// tal vez no hace falta instalar un router para obtener lso params, voy a probar con vanilla
//import { useParams } from "react-router-dom";
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
    restoreElements,
    // nuevos items v0.14
    Footer,
    Button,
    LiveCollaborationTrigger,
    MainMenu,
    Sidebar,
    WelcomeScreen,
    useDevice
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
    const [theme, setTheme] = useState("light"); // light o dark
    const [viewModeEnabled, setViewModeEnabled] = useState(false);
    const [zenModeEnabled, setZenModeEnabled] = useState(false);
    const [gridModeEnabled, setGridModeEnabled] = useState(false);

    // elementos en pantalla, los uso para intiaulData caundo cargo un archivo desde mi DB
    const [elements, setElements] = useState([]);

    // lo puedo usar para cuando hago exportToCanvas me genera un canvas virtual y luego una URL de la imagen creada
    const [canvasUrl, setCanvasUrl] = useState("");

    // cuento la cantidad de elementos NO borrados
    const [cantElements, setCantElementos]= useState(0);
    
    
    const [
        excalidrawAPI,
        setExcalidrawAPI
    ] = useState(null);


    
    // si tengo en el GET alguna librería cargada de "Explorar Bibliotecas" la agrego a mi libreria
    useHandleLibrary({ excalidrawAPI });

    

    // misitio.com/eCampusDraw/idGrupo/idItem
    // desde la URL que elegi cargo el archivo de la escena
    useEffect(() => {
      openFromDB(); // This function will be executed ONLY ONCE after Excalidraw gets loaded
    }, [excalidrawAPI]); // Empty dependency array
    

    useEffect(() => {
        if (!excalidrawAPI) {
          return;
        }
        console.log("ejecutando useEffect que no me acuerdo que es");

      }, [excalidrawAPI]);



    
      const renderTopRightUI = (isMobile) => {
        //const device = useDevice();


        if (isMobile) {
          return null;
        }
        return (
          <Button
            onClick={() => alert("Presiona F11 para verlo pantalla completa")}
            style={{ width: "100px", height:"40px" }}
          >
            FullScreen
          </Button>
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


      //  ----------------------------- INI Funciones para interactar con eCampus -----------------------------
      
      // usar esta funcion para obtener únicamente los parametros del final
      const getUrlParameters = (url) => {
        // http://ecampusDraw.com/25?item_id=19&id=95
        const siteUrl = window.location.search;
        //console.log("site url es: ",siteUrl); // ?item_id=9&id=95
        const urlParams = new URLSearchParams(siteUrl);
        urlParams.forEach((value, key) => {
          console.log(key + ': ' + value);
        });
      }

      // obtener idGrupo de la URL para el API (tambien mirar getUrlParameters() de arriba que es para los parametros)
      const getGroupAndIdFromUrl = () => {
        // Get the full URL
        // http://localhost:5173/ecampusdraw/25/99/512/?item_id=9#token=w0wa9EtHaMpzNzqNcDpk8
        // 0: "http:"
        // 1: ""
        // 2: "localhost:5173"
        // 3: "ecampusdraw"
        // 4: "25"
        // 5: "99"
        // 6: "512" <-- el último es el que me interesa
        // 7: "?item_id=9#token=w0wa9EtHaMpzNzqNcDpk8"

        // Get the last part of the URL without parameters or fragments

        const url = window.location.href;
        const urlParts = url.split('/');
        //console.log("partes: ",urlParts);
        const lastPart = urlParts[urlParts.length - 1];
        const secondToLastPart = urlParts[urlParts.length - 2];
        const thirdToLastPart = urlParts[urlParts.length - 3];
        let idGrupo = 0; // puede valer 0 si es casillero 
        let idItem = 0; // puede valer 0 si es nuevo

        // if que funciona para ambos casos:
        // The following 2 URLs are the same site (with and without params)
        // http://mysite.com/96/25
        // http://mysite.com/96/25/?item_id=12#room=9
        if (lastPart !== '') {
          idItem = lastPart;
          idGrupo = secondToLastPart;
        } else if (secondToLastPart !== '') {
          idItem = secondToLastPart;
          idGrupo = thirdToLastPart;
        }
        idGrupo = parseInt(idGrupo);
        idItem = parseInt(idItem);
        //console.log(idGrupo); // should output "25" for both examples

        return {
          idGrupo:idGrupo,
          idItem:idItem
        };
      }

      // intentando duplicar el JSON que se genera al gaurdar un archivo en tu PC
      const createArchivo = () => {
        if (!excalidrawAPI) { return }
        const elements = excalidrawAPI.getSceneElements();
        const all_elements = excalidrawAPI.getSceneElementsIncludingDeleted();
        //const nonDeletedElements = elements2.filter(element => !element.isDeleted); //solo los no eliminados

        if (!elements || !elements.length) { return }

        return {

          type: "excalidraw",
          version: 2,
          source: "https://ecampus.com.ar/ecampusdraw/",
          //all_elements, //incluye borrados
          elements,     // solo visibles
          appState: {
           // ...initialData.appState,
            "gridSize": null,
            "viewBackgroundColor": "#ffffff",
            exportWithDarkMode: false,
          },
          files: excalidrawAPI.getFiles(),
          //getDimensions: () => { return {width: 350, height: 350}}
        }
      }

      const openFromDB = () => {
        const params = getGroupAndIdFromUrl(); // obtengo el idGrupo de la URL para el API, puede valer 0 para casillero:  https://ecampus.com.ar/plugins/ecampusDraw/25/0/ o https://ecampus.com.ar/plugins/ecampusDraw/0/18/
        // idGrupo e idItem SI pueden valer 0 si es casillero personal, lo que no puedo valer es NULL
        if(isNaN(params.idGrupo) || params.idGrupo == null || params.idGrupo == undefined){ return };  // no especifique ningun grupo
        if(isNaN(params.idItem) || params.idItem == null || params.idItem == undefined){ return };    // no espeicifique ningun item
              
        
        //fetch('http://localhost/ecampus/public_html/API/v1/ecampusDraw/'+params.idGrupo+'/'+params.idItem, {
        fetch('../../../API/v1/ecampusDraw/'+params.idGrupo+'/'+params.idItem, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if(data.status == '404'){
              alert("Canvas no encontrado, tienes bien la URL?");
              console.log("no se encontró el elemento cambiar la URL al elemento que corresponda");
              return;
            }
            console.log("datos obtenidos: ", data.data.titulo);
            const sceneData=JSON.parse(data.data.extra);
            console.log("sceneData es:", sceneData);
            excalidrawAPI?.updateScene(sceneData);
            // cargar en el canvas data.data.extra con json_decode

        })
        .catch(error => {
            console.error(error);
        });
      }

  

      // Guarda datos en la base de datos (requiere enviar un IdGrupo y que sea POST)
      const saveToDB = () => {
        //const canvasData = JSON.stringify(excalidrawAPI.getSceneElements());
       // const canvasData ="";//exportToCanvas();

        //  if (!excalidrawAPI) { return }
        // const elements = excalidrawAPI.getSceneElements();
        // if (!elements || !elements.length) { return }
        // const canvas = await exportToCanvas({
        //   elements,
        //   appState: {
        //    // ...initialData.appState,
        //     exportWithDarkMode: false,
        //   },
        //   files: excalidrawAPI.getFiles(),
        //   getDimensions: () => { return {width: 350, height: 350}}
        // });

        const jsonForStorage = createArchivo();

        //console.log("canvasDatos es: ",jsonForStorage);

        // dibujo en el nuevo canvas...
        //const ctx = canvas.getContext("2d");
        //ctx.font = "30px Virgil";
        //ctx.strokeText("My custom text", 50, 60);

        // si tuviera un elemento HTML sería así:
        // <div className="export export-canvas">
        //   <img src={canvasUrl} alt="" />
        // </div>
        // setCanvasUrl(canvas.toDataURL());



        // devuelve {idGrupo: 25, idItem: 99} // grupo 25,  item 99
        // devuelve {idGrupo: 0, idItem: 14}  // casillero, item 14
        // devuelve {idGrupo: 0, idItem: 0}   // casillero, item nuevo
        // devuelve {idGrupo: 6, idItem: 14}  // grupo 6,   item 14
        const params = getGroupAndIdFromUrl(); // obtengo el idGrupo de la URL para el API, puede valer 0 para casillero:  https://ecampus.com.ar/plugins/ecampusDraw/25/0/ o https://ecampus.com.ar/plugins/ecampusDraw/0/18/
        // idGrupo e idItem SI pueden valer 0 si es casillero personal, lo que no puedo valer es NULL
        if(params.idGrupo === null || params.idGrupo === undefined){ return };  // no especifique ningun grupo
        if(params.idItem === null || params.idItem === undefined){ return };    // no espeicifique ningun item
              
        //fetch('http://localhost/ecampus/public_html/API/v1/ecampusDraw/'+params.idGrupo+'/'+params.idItem, {
        fetch('../../../API/v1/ecampusDraw/'+params.idGrupo+'/'+params.idItem, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonForStorage)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            console.log("si funcinó debería hacer un reload de la página con la nueva URL que incluye el id del item!!!");

        })
        .catch(error => {
            console.error(error);
        });
      }
      
    

      //  ----------------------------- FIN Funciones para interactar con eCampus -----------------------------

   
      const renderWelcome = () => {

        // console.log("es Mobile: ",isMobile);
        // if (isMobile) {
        //   return null;
        // }
        
        
        return (
              <>
              {/* <WelcomeScreen.Hints.ToolbarHint>
                  <p> texto personalizado ¡Elije una herramienta y empieza a dibujar! </p>
              </WelcomeScreen.Hints.ToolbarHint> */}
              {/* textos por defecto */}
              <WelcomeScreen>
                <WelcomeScreen.Hints.ToolbarHint />
                <WelcomeScreen.Hints.MenuHint />
                <WelcomeScreen.Hints.HelpHint />

                  <WelcomeScreen.Center>
                    {/* <WelcomeScreen.Center.Logo /> */}
                    <WelcomeScreen.Center.Logo>
                      <img src="https://ecampus.com.ar/img/logo_edge.png"  style={{width:"300px"}}/>
                    </WelcomeScreen.Center.Logo>
                    <WelcomeScreen.Center.Heading>
                      Herramienta de dibujo eCampusDraw (Beta)
                    </WelcomeScreen.Center.Heading>

                    <WelcomeScreen.Center.Menu>
                      <WelcomeScreen.Center.MenuItemLoadScene />
                      <WelcomeScreen.Center.MenuItemHelp />

                      <WelcomeScreen.Center.MenuItemLink 
                        href="https://ecampus.com.ar/ecampusdraw" shortcut={null} //icon={ICONS.SUN}
                      >eCampusDraw Link
                      </WelcomeScreen.Center.MenuItemLink>

                      <WelcomeScreen.Center.MenuItemLink 
                        href="https://ecampus.com.ar/" shortcut={null} //icon={ICONS.SUN}
                      >eCampus.com.ar
                      </WelcomeScreen.Center.MenuItemLink>
                    </WelcomeScreen.Center.Menu>

                  </WelcomeScreen.Center>
                </WelcomeScreen>
              </>
        );
      }


      const renderFooter = () => {
        return (
          <>
            {/* <button className="footer-element" onClick={updateScene}>
                Actualizar Escena
            </button> */}
            {/* <button className="footer-element" onClick={() => {
                excalidrawAPI?.resetScene(); }}> 
                Limpiar Escena
            </button> */}
            
            <Button
                style={{ width: "150px", height:"40px", marginLeft: "1rem", marginRight: "1rem" }}
                onClick={() => {
                  excalidrawAPI?.resetScene(); }}>
                Limpiar Escena
            </Button>

            <label>
            <input type="checkbox" checked={viewModeEnabled}
                onChange={() => setViewModeEnabled(!viewModeEnabled)}
            />Presentación &nbsp;
            </label> |
            <label className="zen-mode-off">
            <input type="checkbox" checked={zenModeEnabled}
                onChange={() => setZenModeEnabled(!zenModeEnabled)}
            />Modo Zen &nbsp;
            </label> |
            <label>
            <input type="checkbox" checked={gridModeEnabled}
                onChange={() => setGridModeEnabled(!gridModeEnabled)}
            />Cuadrícula
            </label>

            {/* <Button onClick={() => { let newTheme = (theme === "dark")?"light":"dark"; setTheme(newTheme); }}>
              <div className="ToolIcon__icon">{(theme === "dark")?ICONS.SUN:ICONS.MOON}</div>
            </Button> */}

            <button className="themeIcon ToolIcon_type_button ToolIcon_size_small ToolIcon" 
              style={{ marginLeft: "1rem" }}
              onClick={() => {
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
      // que raro qeu se llame a sí misma esta funcion? o tal vez updateScene es un método del API y mi función también se llama updateScene
      //excalidrawRef.current.updateScene(sceneData);
      excalidrawAPI?.updateScene(sceneData);
    };


   

    //const device=useDevice();


    return (
    
    <div>
      
      <div className="excalidraw-wrapper" ref={excalidrawRef}>

      <Excalidraw 
        ref={(api) => setExcalidrawAPI(api)}
        // no uso initialData porque uso WelcomeScreen
        // initialData={InitialData}
        autoFocus={true}
        UIOptions={{ canvasActions: { loadScene: true, theme:true } }}
        onChange= {(elements, state) => { 
                    //console.log("Elements :", elements, "State : ", state) 
                    //console.log("State : ", state);
                    //console.log("Elements es: ",elements);

                    const count = elements.filter((obj) => obj.isDeleted != true).length;
                    //const cantElementos=elements.length; // borrados y sin borrar..
                    //console.log("cant elemntos Activos es: ",count);
                    setCantElementos(count);
                  }
                  }
        //onPointerUpdate= {(payload) => console.log(payload) }
        langCode={defaultLang.code}
        //handleKeyboardGlobally={true}
        theme={theme}
        //onCollabButtonClick= {() => window.alert("You clicked on collab button") }
        viewModeEnabled= {viewModeEnabled}
        zenModeEnabled= {zenModeEnabled}
        gridModeEnabled= {gridModeEnabled}
        
        renderTopRightUI={renderTopRightUI}
        //renderWelcomeScreen={renderWelcome}
      >


        {/*  puedo armarme un MainMenu personalizado, pero se borra el original.*/}
        
        <MainMenu>
          
              <MainMenu.DefaultItems.LoadScene />
              <MainMenu.DefaultItems.Export />
              <MainMenu.DefaultItems.SaveToActiveFile />
              <MainMenu.DefaultItems.SaveAsImage />
              <MainMenu.DefaultItems.Help />
              <MainMenu.DefaultItems.ToggleTheme />
              <MainMenu.DefaultItems.ClearCanvas />
              
            <MainMenu.Separator />
            {/* <MainMenu.ItemCustom>
              <div style={{ width: "100%", height:"1px", backgroundColor: "#d6d6d6", margin: "0.5rem 0px"}}> 
                  eCampus
              </div>
            </MainMenu.ItemCustom> */}
              
            <MainMenu.Group title="Opciones de eCampus">
              <MainMenu.Item onSelect={() => window.alert("Prox.")}>
                Abrir Galeria
              </MainMenu.Item>
              <MainMenu.Item onSelect={saveToDB}>
                Enviar a Casillero
              </MainMenu.Item>
              <MainMenu.Item onSelect={openFromDB}>
                Abrir mi TP
              </MainMenu.Item>
            </MainMenu.Group>
            
              <MainMenu.Separator />
            <MainMenu.DefaultItems.ChangeCanvasBackground />
              

        </MainMenu> 
          

          {!cantElements ?
            (renderWelcome()) :("")
          }

          
          {/* {renderWelcome()} */}

           

        <Footer>
          {renderFooter()}
        </Footer>        

      </Excalidraw>
      </div>
    </div>
    );
   
}