import { use } from "react";

export const UserContext = createContext();

const Context = ({ Children}) => {
    const [vartotojas, setVartotojas] = useState( () => ({
        loggedIn: false,
    }));

    useEffect(() => {
        fetch(`${import.meta.env.VITE_SERVER_URL}/account`, {credentials: "include" })
        .then(r => r.json())
        .then(data => {
            console.log({...data});
            setVartotojas({...data});
        }) ;
    }, []); 

    // gaunam vartotojo duomenis is backend
    return <UserContext.Provider value={vartotojas}>{children}</UserContext.Provider>;
};

export default Context;
