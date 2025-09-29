import fs from "fs/promises";
        import path from "path";
        import { glob } from "glob";
        import yaml from "js-yaml";

        // Heuristiques simples FR/EN pour options & dérivés (extensible)
        const PATTERNS = [
          {
            id: "option_call_definition",
            type: "instrument",
            test: /(option\s+call|call option)\s*(?:[:\-–]|est|is)\s/i,
            definition: "Contrat donnant le droit (non l'obligation) d'acheter le sous-jacent à un prix (strike) avant/à l'échéance."
          },
          {
            id: "option_put_definition",
            type: "instrument",
            test: /(option\s+put|put option)\s*(?:[:\-–]|est|is)\s/i,
            definition: "Contrat donnant le droit (non l'obligation) de vendre le sous-jacent à un prix (strike) avant/à l'échéance."
          },
          {
            id: "payoff_call_rule",
            type: "payoff",
            test: /(payoff|gain)\s+(call)|max\(\s*S\s*-\s*K/i,
            rule: "payoff_call = max(S - K, 0)"
          },
          {
            id: "payoff_put_rule",
            type: "payoff",
            test: /(payoff|gain)\s+(put)|max\(\s*K\s*-\s*S/i,
            rule: "payoff_put = max(K - S, 0)"
          },
          {
            id: "volatility_reference",
            type: "concept",
            test: /(volatilité implicite|implied volatility|smile)/i,
            definition: "La volatilité implicite est la volatilité attendue déduite du prix des options."
          },
          {
            id: "correlation_reference",
            type: "concept",
            test: /(corrélation|correlation)\s+(?:entre|between)/i,
            definition: "La corrélation mesure la co-variation entre deux actifs (ρ ∈ [-1,1])."
          },
          {
            id: "greeks_reference",
            type: "concept",
            test: /\b(delta|gamma|vega|theta|rho)\b/i,
            definition: "Les Greeks mesurent la sensibilité du prix d\'une option aux paramètres du marché."
          }
        ];

        function extractFacts(text) {
          const lines = text.split(/\n+/);
          const facts = [];
          for (const p of PATTERNS) {
            const hit = lines.find(l => p.test.test(l));
            if (hit) {
              facts.push({
                id: p.id,
                type: p.type,
                text_snippet: hit.trim().slice(0, 300),
                ...(p.definition ? { definition: p.definition } : {}),
                ...(p.rule ? { rule: p.rule } : {})
              });
            }
          }
          return facts;
        }

        async function processDoc(dir) {
          const raw = await fs.readFile(path.join(dir, "raw.txt"), "utf8");
          const meta = JSON.parse(await fs.readFile(path.join(dir, "meta.json"), "utf8"));
          const facts = extractFacts(raw);

          const yamlDoc = facts.map((f, idx) => ({
            id: `${meta.docId}__${f.id}__${idx + 1}`,
            source: meta.source,
            type: f.type,
            title: f.id.replace(/_/g, " "),
            definition: f.definition || null,
            rule: f.rule || null,
            snippet: f.text_snippet,
            tags: ["derivés", "options", "auto-extracted"],
            createdAt: new Date().toISOString()
          }));

          const outDir = path.join("registry", meta.docId);
          await fs.mkdir(outDir, { recursive: true });
          await fs.writeFile(path.join(outDir, "rules.yaml"), yaml.dump(yamlDoc, { noRefs: true, lineWidth: 120 }), "utf8");
          await fs.writeFile(path.join(outDir, "rules.json"), JSON.stringify(yamlDoc, null, 2), "utf8");
          console.log(`✅ Extraction: ${meta.docId} → ${outDir}/rules.yaml`);
        }

        import { glob } from "glob";
        (async () => {
          const dirs = await glob("workdir/*", { onlyDirectories: true });
          if (dirs.length === 0) { console.warn("ℹ️ Aucun document ingéré. Lance d'abord: npm run ingest"); return; }
          for (const d of dirs) {
            try { await processDoc(d); }
            catch (e) { console.error(`❌ Extraction échouée pour ${d}:`, e.message); }
          }
        })();