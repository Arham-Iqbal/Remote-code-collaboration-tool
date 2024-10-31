import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";
import toast from "react-hot-toast";
import Avatar from "react-avatar";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/clike/clike";
import "codemirror/theme/dracula.css";
import io from "socket.io-client";

const socket = io("http://localhost:4000");
const Editor = () => {
  const location = useLocation();
  const { username, roomid } = location.state || {};
  const navigate = useNavigate();
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setuser] = useState([]);
  const [coderun, setcoderun] = useState("Run");

  useEffect(() => {
    if (username && roomid) {
      socket.emit("join-room", { username, roomid });
    }
  }, [username, roomid]);

  useEffect(() => {
    socket.on("user-joined", (data) => {
      setuser((prevuser) => [...prevuser, data]);
      toast.success(`${data.username} joined the room `);
    });
    socket.on("user-left", (data) => {
      setuser((prevUsers) =>
        prevUsers.filter((user) => user.socketId !== data.socketId)
      );
      toast.success(`${data.username} left the room`);
    });
    socket.on("room-users", (existingUsers) => {
      setuser(existingUsers);
    });
    return () => {
      socket.off("user-joined");
      socket.off("user-left");
    };
  }, []);

  useEffect(() => {
    socket.on("receive-code", (updatedcode) => {
      setCode(updatedcode);
    });
  }, [code]);
  useEffect(() => {
    if (output) {
      socket.emit("output-change", { output, roomid });
    }
  }, [output, roomid]);
  useEffect(() => {
    socket.on("receive-output", (updatedoutput) => {
      setOutput(updatedoutput);
    });
    return () => {
      socket.off("receive-output");
    };
  }, []);
  useEffect(() => {
    if (coderun === "Running") {
      socket.emit("btn-run", { coderun, roomid });
    }
  }, [coderun, roomid]);
  useEffect(() => {
    socket.on("btn-running", () => {
      setcoderun("Running");
    });
    socket.on("code-run-completed", () => {
      setcoderun("Run");
    });

    return () => {
      socket.off("btn-running");
      socket.off("code-run-completed");
    };
  }, []);
  useEffect(() => {
    if (!loading) {
      setcoderun("Run");
      socket.emit("code-run-completed", { roomid });
    }
  }, [loading, roomid]);
  useEffect(() => {
    socket.emit("change-language", { language, roomid });
    socket.on("languagechanged", (lang) => {
      setLanguage(lang);
    });
  }, [language, roomid]);

  function copyid() {
    toast.success("Room ID copied to clipboard!");
  }

  const Leaveroom = () => {
    socket.disconnect();
    navigate("/");
    toast.success("Left the room");
  };
  function handleRunClick() {
    setcoderun("Running");
    callapi();
  }

  const languageIds = {
    javascript: 63,
    python: 71,
    "text/x-csrc": 50, // C
    "text/x-c++src": 54, // C++
    "text/typescript": 74, // TypeScript
  };

  const callapi = async () => {
    setLoading(true);
    setOutput("");

    const url =
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false&fields=*";
    const options = {
      method: "POST",
      headers: {
        "x-rapidapi-key": "YOUR_API_KEY",
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language_id: languageIds[language],
        source_code: btoa(code),
        stdin: "",
      }),
    };

    try {
      const response = await fetch(url, options);
      if (!response.ok)
        throw new Error("Submission failed, check API key or limits.");
      const data = await response.json();

      const token = data.token;
      if (token) {
        await getsubmission(token);
      } else {
        setOutput("Error: No token received. Unable to process submission.");
      }
    } catch (e) {
      console.error(`Error received: ${e}`);
      setOutput(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getsubmission = async (token) => {
    const url = `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true&fields=*`;
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": "YOUR_API_KEY",
        "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
      },
    };

    try {
      let completed = false;
      let pollCount = 0;
      const maxPollCount = 10;

      while (!completed && pollCount < maxPollCount) {
        const response = await fetch(url, options);
        const result = await response.json();

        if (result.status && result.status.id <= 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          pollCount++;
        } else {
          completed = true;

          if (result.stdout) {
            setOutput(atob(result.stdout));
          } else if (result.stderr) {
            setOutput(`Error: ${atob(result.stderr)}`);
          } else if (result.compile_output) {
            setOutput(`Compilation Error: ${atob(result.compile_output)}`);
          } else {
            setOutput("No output received.");
          }
        }
      }

      if (pollCount >= maxPollCount) {
        setOutput("Error: Timed out while waiting for code execution result.");
      }
    } catch (error) {
      console.error(error);
      setOutput("Error: Unable to retrieve code execution result.");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#1c1e29] text-white">
      {/* Sidebar - User Info and Controls */}
      <div className="w-1/4 p-5 flex flex-col items-center border-r border-gray-700">
        <img
          src="/Images/codecast.png"
          alt="Codecast Logo"
          className="mb-6 w-24"
        />
        <h2 className="text-xl font-semibold mb-4">Members</h2>
        {user.map((user, index) => (
          <div key={index} className="mb-2">
            <Avatar
              name={user.username}
              size={100}
              maxInitials={2}
              round={true}
            />
            <h3 className="text-lg font-medium">{user.username}</h3>
          </div>
        ))}
        <CopyToClipboard text={roomid} onCopy={copyid}>
          <button className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition mb-4">
            Copy Room ID
          </button>
        </CopyToClipboard>

        <button
          onClick={Leaveroom}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Leave Room
        </button>
      </div>

      {/* Main Editor Section */}
      <div className="w-3/4 p-5">
        <div className="mb-4">
          <label htmlFor="language" className="block mb-2 font-medium">
            Choose Language
          </label>
          <select
            id="language"
            onChange={(e) => setLanguage(e.target.value)}
            value={language}
            className="w-full bg-[#2e2f3e] text-white p-2 rounded outline-none border border-gray-700"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="text/x-csrc">C</option>
            <option value="text/x-c++src">C++</option>
            <option value="text/typescript">TypeScript</option>
          </select>
        </div>

        <CodeMirror
          value={code}
          onBeforeChange={(editor, data, value) => {
            setCode(value);
            socket.emit("code-change", { roomid, code: value });
          }}
          options={{
            theme: "dracula",
            lineNumbers: true,
            mode: language,
            extraKeys: { "Ctrl-Space": "autocomplete" },
            matchBrackets: true,
          }}
          className="border border-gray-700 rounded mb-4"
        />
        <button
          onClick={handleRunClick}
          className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition mb-4"
        >
          {loading ? "Running" : coderun}
        </button>

        <div className="bg-[#2e2f3e] p-4 rounded mt-4">
          <h3 className="text-lg font-semibold mb-2">Output:</h3>
          <pre>{output}</pre>
        </div>
      </div>
    </div>
  );
};

export default Editor;
