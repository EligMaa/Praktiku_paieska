import React, { createContext, useContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState({ loggedIn: false });

    useEffect(() => {
        fetch(`${import.meta.env.VITE_SERVER_URL}/account`, { credentials: "include" })
            .then(r => r.json())
            .then(data => {
                setUser({ ...data, loggedIn: true });
            })
            .catch(() => setUser({ loggedIn: false }));
    }, []);

    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
    return useContext(UserContext);
}
