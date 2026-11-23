import { createContext, useContext } from "react";

export const RouteContext = createContext("foundations");
export const useWorkshopRoute = () => useContext(RouteContext);
