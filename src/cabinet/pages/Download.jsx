import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import windowsLogo from "../photos/windows.png";
import macLogo from "../photos/macos.png";
import linuxLogo from "../photos/linux.png";

const Download = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);

  const platforms = [
    {
      name: "Windows",
      file: "/installer-windows.exe",
      img: windowsLogo,
      color: "green-500",
      available: true,
    },
    {
      name: "macOS",
      img: macLogo,
      color: "gray-500",
      available: false,
    },
    {
      name: "Linux",
      img: linuxLogo,
      color: "gray-500",
      available: false,
    },
  ];

  // ✅ Load user activation status
  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;
      const ref = doc(db, "users", user.email);
      const snap = await getDoc(ref);
      if (snap.exists()) setUserData(snap.data());
    };
    fetchUser();
  }, [user]);

  if (!userData)
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading user data...
      </div>
    );

  const isActivated = userData.activated;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6">
      <h1 className="text-4xl font-bold text-green-400 mb-10">
        Download AIcontrib App
      </h1>

      {!isActivated && (
        <p className="text-red-400 text-center mb-8 text-lg">
          🚫 Your account is not activated. Please activate it before downloading.
        </p>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {platforms.map((platform) => (
          <div
            key={platform.name}
            className="bg-gray-900 border border-gray-800 shadow-lg rounded-2xl p-6 w-64 flex flex-col items-center text-center"
          >
            <img
              src={platform.img}
              alt={platform.name}
              className="w-20 h-20 mb-4"
            />
            <h2
              className={`text-2xl font-semibold ${
                platform.available ? "text-green-400" : "text-gray-500"
              } mb-2`}
            >
              {platform.name}
            </h2>

            {platform.available ? (
              <>
                <p className="text-gray-300 mb-4">
                  Download the installer for {platform.name}.
                </p>
                <a
                  href={isActivated ? platform.file : undefined}
                  download={isActivated ? true : undefined}
                  onClick={(e) => {
                    if (!isActivated) e.preventDefault();
                  }}
                  className={`${
                    isActivated
                      ? "bg-green-500 hover:bg-green-600 text-black"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  } font-semibold py-2 px-4 rounded-lg transition`}
                >
                  {isActivated ? "Download" : "Locked"}
                </a>
              </>
            ) : (
              <p className="text-gray-400 italic mt-4">Coming soon</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Download;
