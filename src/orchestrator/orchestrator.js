import fs from "fs/promises";
        import yaml from "js-yaml";

        async function loadAll() {
          const txt = await fs?.readFile("out/registry.all.yaml", "utf8")?.catch(() => null);
          if (!txt) throw new Error("Registry non construit. Lance: npm run build:registry");
          return yaml?.load(txt);
        }

        function queryRules(all, q) {
          const s = q?.toLowerCase();
          return all?.filter(x =>
            (x?.title && x?.title?.toLowerCase()?.includes(s)) ||
            (x?.definition && x?.definition?.toLowerCase()?.includes(s)) ||
            (x?.rule && x?.rule?.toLowerCase()?.includes(s)) ||
            (Array.isArray(x?.tags) && x?.tags?.some(t => t?.toLowerCase()?.includes(s)))
          );
        }

        function pickForTask(all, task) {
          // Démo: si la tâche contient 'volatil' ou 'corrél', retourne concepts associés
          const s = task?.toLowerCase();
          if (s?.includes("volatil") || s?.includes("corrél")) {
            return all?.filter(x => /volatil|corrél|correl/i?.test([x?.title, x?.definition, x?.snippet]?.join(" ")));
          }
          // Sinon, renvoyer instruments+payoffs par défaut
          return all?.filter(x => /instrument|payoff/?.test(x?.type || ""));
        }

        (async () => {
          const all = await loadAll();

          const mode = process.argv?.[2] || "demo";
          if (mode === "query") {
            const q = process.argv?.slice(3)?.join(" ")?.trim() || "options";
            const res = queryRules(all, q)?.slice(0, 10);
            console.log(`🔎 Query: "${q}" → ${res?.length} résultat(s).`);
            console.table(res?.map(r => ({ id: r?.id, type: r?.type, title: r?.title })));
          } else if (mode === "select") {
            const task = process.argv?.slice(3)?.join(" ")?.trim() || "analyser volatilité/corrélation";
            const res = pickForTask(all, task)?.slice(0, 10);
            console.log(`🧠 Task: "${task}" → ${res?.length} règle(s) candidates:`);
            console.table(res?.map(r => ({ id: r?.id, type: r?.type, title: r?.title })));
          } else {
            console.log("🎬 Demo:");
            console.log("  node src/orchestrator/orchestrator.js query \"options\"");
            console.log("  node src/orchestrator/orchestrator.js select \"hedging volatilité\"");
            const res = pickForTask(all, "hedging volatilité");
            console.table(res?.map(r => ({ id: r?.id, type: r?.type, title: r?.title })));
          }
        })();