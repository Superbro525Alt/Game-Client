import {useEffect, useState} from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

// import tauri fs
import {BaseDirectory, createDir, writeBinaryFile, readTextFile, writeTextFile, removeDir, writeFile} from "@tauri-apps/api/fs";
import { open } from '@tauri-apps/api/shell';

// import git-clone
import clone from "git-clone";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, set, onValue, ref } from "firebase/database";
import { getStorage, ref as storageRef, getDownloadURL, getBytes } from "firebase/storage";
import {resourceDir} from "@tauri-apps/api/path";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-q04L_W-eoCOyxy9qcpCqPeBVWhf9gqw",
  authDomain: "vigilant-method-395410.firebaseapp.com",
  projectId: "vigilant-method-395410",
  storageBucket: "vigilant-method-395410.appspot.com",
  messagingSenderId: "668037054477",
  appId: "1:668037054477:web:525d9027276c9067d95544",
  measurementId: "G-2BPRRC2BNY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const storage = getStorage(app);







function App() {
  const [name, setName] = useState("");
  const [games, setGames] = useState("");
  const [_alreadySetGames, _setAlreadySetGames] = useState(false);
  const [game, setGame] = useState("");
  const [gameData, setGameData] = useState("");
  const [output, setOutput] = useState((<p>Loading...</p>));
  const [gameVersion, setGameVersion] = useState("");
  const [renderedGameMenu, setRenderedGameMenu] = useState(false);
  var _gameData = {};
  var loadedGameData = false;
  var version = "v1.0.0";

  const accessToken = "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";


  async function getGameData() {
    if (!loadedGameData) {
      loadedGameData = true;

      // await invoke("getGames").then((data) => {
      //   _gameData = JSON.parse(data);
      //   setGameData(_gameData);
      //
      // });

        readTextFile("games.json", {dir: BaseDirectory.Resource, recursive: true}).then((data) => {
            _gameData = JSON.parse(data);
            setGameData(_gameData);
        });

    }
  }

  async function run() {
      //gameData[game.name]
      // run the exe located at gameData[game.name].exeLocation
        // run the exe located at games/game.name/game.name.exe

      //invoke(BaseDirectory.Resource + "/games/" + game.name + "/" + game.name + ".exe", "start");

      var button = document.getElementById("install-button");
      button.innerHTML = "Running...";
        button.disabled = true;
        setTimeout(() => {
            button.innerHTML = "Run";
            button.disabled = false;
        }, 2000);
    var resourceDirPath = await resourceDir();
        //resourceDirPath = resourceDirPath.replace("\?\\", "")
          //    resourceDirPath = resourceDirPath.replace("\\", "")

        var path = resourceDirPath + "games/" + game.name + "/" + game.name + ".exe";
        path = path.replace("\\\\\\\\?\\\\", "")
      path = path.replace("\\\\?\\", "")
      await invoke("open_executable", {path: path});
  }



  function install() {
      // remove game files
      var button = document.getElementById("install-button");
      var info = document.getElementById("info");
      button.innerHTML = "Downloading...";
      button.disabled = true;
      onValue(ref(database, 'games/' + game.index + '/linkToLatest/raw'), async (snapshot) => {
          var url = snapshot.val();
          onValue(ref(database, 'games/' + game.index + '/latestVersion'), async (snapshot) => {

              // clone into games/game.name
              // clone using git-clone

              console.log(url)
              fetch(url, {
                  headers: {
                      Authorization: `Bearer ${accessToken}`
                  }
              })
                  .then(response => response.json())
                  .then(data => {
                      if (data.download_url) {
                          return fetch(data.download_url);
                      } else {
                          throw new Error('Download URL not found.');
                      }
                  })
                  .then(response => response.blob())
                  .then(blobData => {
                      // Handle the downloaded blobData here
                      const reader = new FileReader();

                      reader.onload = function (event) {

                          var gameEXE = event.target.result;
                          var new_gameData = gameData;
                          new_gameData[game.name].installed = true;
                          new_gameData[game.name].version = snapshot.val();
                          console.log(gameEXE);

                          button.innerHTML = "Installing...";
                          info.innerHTML = "The client may become unresponsive for a few seconds during installation";
                          //removeDir("games/" + game.name, {dir: BaseDirectory.Resource, recursive: true}).then(() => {
                          // download the game using url
                          resourceDir().then((resourceDirPath) => {
                              //resourceDirPath = resourceDirPath.replace("\?\\", "")
                              //    resourceDirPath = resourceDirPath.replace("\\", "")

                              var path = resourceDirPath;
                              path = path.replace("\\\\\\\\?\\\\", "")
                              path = path.replace("\\\\?\\", "")
                              console.log(path);
                              try {
                                  createDir(path + "games/").then(() => {
                                      createDir(path + "games/" + game.name)
                                          .then(() => {
                                              console.log("created dir");
                                              console.log()
                                              writeBinaryFile(path + "games/" + game.name + "/" + game.name + ".exe", gameEXE).then(() => {
                                                  setGameData(new_gameData);
                                                  console.log("wrote file");
                                                  //setFile("games.json", JSON.stringify(new_gameData));
                                                  writeTextFile(path + "games.json", JSON.stringify(new_gameData)).then(() => {
                                                      button.innerHTML = "Play";
                                                      getGameData();
                                                      setRenderedGameMenu(false);
                                                  });
                                              });
                                          });
                                  });
                              } catch (e) {
                                  try {
                                      createDir(path + "games/" + game.name)
                                          .then(() => {
                                              console.log("created dir");
                                              writeBinaryFile(path + "games/" + game.name + "/" + game.name + ".exe", gameEXE).then(() => {
                                                  setGameData(new_gameData);
                                                  console.log("wrote file");
                                                  //setFile("games.json", JSON.stringify(new_gameData));
                                                  writeTextFile(path + "games.json", JSON.stringify(new_gameData), {
                                                      dir: BaseDirectory.App,
                                                      recursive: true
                                                  }).then(() => {
                                                      button.innerHTML = "Play";
                                                      getGameData();
                                                      setRenderedGameMenu(false);
                                                  });
                                              });
                                          });
                                  } catch (e) {
                                      writeBinaryFile(path + "games/" + game.name + "/" + game.name + ".exe", gameEXE).then(() => {
                                          setGameData(new_gameData);
                                          console.log("wrote file");
                                          //setFile("games.json", JSON.stringify(new_gameData));
                                          writeTextFile(path + "games.json", JSON.stringify(new_gameData), {
                                              dir: BaseDirectory.App,
                                              recursive: true
                                          }).then(() => {
                                              button.innerHTML = "Play";
                                              getGameData();
                                              setRenderedGameMenu(false);
                                          });
                                      });

                                  }
                              }

                              //});
                          });
                      };

                      reader.readAsArrayBuffer(blobData);

                  });


          });
      });
  }

  function BackButton() {
      return (
          <div>
              <br/>
              <button className="back-button" onClick={() => {
                    setRenderedGameMenu(false);
                    loadedGameData = false;
                    setGame("");
                    setOutput((<p>Loading...</p>));
                    document.getElementById("gamesHolder").style.display = "block";
                    document.getElementById("gameHolder").style.display = "none";
                    getGameData();

              }}>Back</button>
              </div>
      )
  }
  function Game(props) {

    var setMenu = () => {
      if (!renderedGameMenu) {
        if (gameData != "") {
          // console.log(gameData[game.name].installed);
          // console.log(gameData);
          // console.log(game.name)
        }
        try {
          if (gameData[game.name].installed) {
              setRenderedGameMenu(true);
            onValue(ref(database, 'games/' + game.index + '/latestVersion'), (snapshot) => {
              const _version = snapshot.val();
              setGameVersion(_version);
                //console.log(_version, gameData[game.name].version, game);
              if (_version == gameData[game.name].version) {
                setOutput((
                    <div className="game">
                      <div className="header-holder">
                        <img src={props.image} className="logo" alt="logo"/>
                        <h1>{props.name}</h1>
                      </div>
                        <p id="info"></p>

                      <button className="play-button" id="install-button" onClick={() => {
                        run();
                      }}>Play
                      </button>
                        <BackButton/>
                    </div>
                ));
              } else {

                setOutput((
                    <div className="game">
                      <div className="header-holder">
                        <img src={props.image} className="logo" alt="logo"/>
                        <h1>{props.name}</h1>
                      </div>

                        <p id="info"></p>

                      <button className="update-button" id="install-button" onClick={() => {
                        install(this);
                      }}>Update
                      </button>
                        <BackButton/>
                    </div>
                ));
              }
            });
          } else if (!gameData[game.name].installed) {
              console.log("not installed");
                      setRenderedGameMenu(true);

            setOutput ((
                <div className="game">
                  <div className="header-holder">
                    <img src={props.image} className="logo" alt="logo"/>
                    <h1>{props.name}</h1>
                  </div>
                        <p id="info"></p>

                  <button className="install-button" id="install-button"  onClick={() => {
                      console.log("installing");
                      install();
                  }}>Install</button>
                    <BackButton/>
                </div>
            ));
          } else {
            setOutput((
                <div className="game">
                  <div className="header-holder">
                    <h1>Loading...</h1>
                  </div>
                    <BackButton/>
                </div>
            ));
          }


        } catch (e) {
          setTimeout(setMenu, 1000);
        }
      }

    }

    setMenu();


    return output;
  }




  function GameButton(props) {
    return (
        <button className="game-button" onClick={async () => {
          openGame(props);
          await getGameData();

        }}>
          <img src={props.image} className="logo" alt="logo"/>
          <p className="game-name">{props.name}</p>
        </button>
    );
  }

  async function setFile(name, text) {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    await invoke("replaceFile", {fileName: name, innerText: text}).then(() => {
        console.log("done");
    });

  }

  function openGame(gameData) {
    document.getElementById("gamesHolder").style.display = "none";
    document.getElementById("gameHolder").style.display = "block";


    setGame(gameData);
  }

  async function getGames() {
    if (!_alreadySetGames) {
      _setAlreadySetGames(true);

      onValue(ref(database, 'games'), (snapshot) => {
        var games = snapshot.val();
        setGames(games);
      });
    }
  }

  setTimeout(getGames, 0);

  useEffect(() => {

  }, []);
  //alert("Make sure to run in administrator mode!");
  return (
      <div className="container">
        <div className="gamesHolder" id="gamesHolder">
          <h1>Games</h1>
            <h3>Version: {version}</h3>
            <h3>Make sure to run in administrator mode</h3>
            <h5>Otherwise installation of games will not work</h5>
          {games ? games.map((key) => (<GameButton name={key.name} image={key.image} index={key.index}/>)) : <p>Loading...</p>}

        </div>

        <div id="gameHolder" className="gameHolder" style={{display: "none"}}>
          {game ? <Game name={game.name} image={game.image}/> : <p>Loading...</p>}
        </div>
      </div>
  );
}

export default App;
