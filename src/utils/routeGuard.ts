import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const seen: string[] = [];

export function useRouteDiagnostics() {
  const loc = useLocation();
  const navType = useNavigationType();
  const lastTs = useRef<number>(0);
  const lastPath = useRef<string>("");

  useEffect(() => {
    const now = performance.now();
    const path = loc.pathname + (loc.search || "");
    
    // Boucle de redirection (< 500 ms vers la même URL)
    if (lastPath.current === path && now - lastTs.current < 500) {
      console.warn("[ROUTE] Possible boucle de redirection:", path, "(delta", Math.round(now - lastTs.current), "ms)");
    }

    // 404 "silencieuse" si composant rend presque rien (heuristique)
    requestAnimationFrame(() => {
      const bodyLen = document.body.innerText.trim().length;
      if (bodyLen < 5) {
        console.warn("[ROUTE] Page potentiellement vide/404 silencieuse:", path);
      }
    });

    // Traces navigation
    console.info("[ROUTE]", navType, "→", path);
    seen.push(path);
    if (seen.length > 100) seen.shift();
    lastTs.current = now;
    lastPath.current = path;
  }, [loc, navType]);
}