import React, { createContext, useContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState({ loggedIn: false });

    useEffect(() => {
        fetch(`${import.meta.env.VITE_SERVER_URL}/account`, { credentials: "include" })
            .then(r => {
                if (r.status === 401) throw new Error('Unauthorized');
                return r.json();
            })
            .then(data => {
                // Only set loggedIn if user data exists
                if (data && Object.keys(data).length > 0 && (data.id || data.email)) {
                    setUser({ ...data, loggedIn: true });
                } else {
                    setUser({ loggedIn: false });
                }
            })
            .catch(() => setUser({ loggedIn: false }));
    }, []);

    useEffect(() => {
        if (user.loggedIn) {
            fetch(`${import.meta.env.VITE_SERVER_URL}/api/has-profile`, {
                method: 'GET',
                credentials: 'include',
            })
                .then(res => {
                    if (res.status === 401) return; // Don't redirect if unauthorized
                    return res.json();
                })
                .then(data => {
                    if (data && !data.hasProfile) {
                        if (window.location.pathname !== '/create-profile') {
                            window.location.href = "/create-profile";
                        }
                    }
                });
        }
        // Guests are never redirected
    }, [user.loggedIn]);

    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
    return useContext(UserContext);
}

