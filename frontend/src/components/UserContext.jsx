import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState({ loggedIn: false });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        fetch(`${import.meta.env.VITE_SERVER_URL}/account`, { credentials: "include" })
            .then(r => {
                if (r.status === 401) throw new Error('Unauthorized');
                return r.json();
            })
            .then(data => {
               
                if (data && Object.keys(data).length > 0 && (data.id || data.email)) {
                    setUser({ ...data, loggedIn: true });
                } else {
                    setUser({ loggedIn: false });
                }
            })
            .catch(() => setUser({ loggedIn: false }))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (user.loggedIn) {
            fetch(`${import.meta.env.VITE_SERVER_URL}/api/has-profile`, {
                method: 'GET',
                credentials: 'include',
            })
                .then(res => {
                    if (res.status === 401) return; 
                    return res.json();
                })
                        .then(data => {
                            if (data && !data.hasProfile) {
                                // netrugdti jei jau esame create-profile, signup ar login puslapyje
                                const path = window.location.pathname;
                                const skipRedirectPaths = ['/create-profile', '/signup', '/login'];
                                if (!skipRedirectPaths.includes(path)) {
                                    
                                    try {
                                        navigate('/create-profile', { replace: true });
                                    } catch (e) {
                                        // Fallback in case navigate isn't available for some reason
                                        window.location.href = '/create-profile';
                                    }
                                }
                            }
                        });
        }
        // Guests are never redirected
    }, [user.loggedIn]);

    return <UserContext.Provider value={{ user, setUser, loading }}>{children}</UserContext.Provider>;
}

export function useUser() {
    return useContext(UserContext);
}

