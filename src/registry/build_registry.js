import fs from "fs/promises";
        
        import yaml from "js-yaml";
        import { glob } from "glob";

        (async () => {
          const files = await glob("registry/**/rules.yaml");
          let all = [];
          for (const f of files) {
            const doc = yaml?.load(await fs?.readFile(f, "utf8"));
            if (Array.isArray(doc)) all = all?.concat(doc);
          }
          // Index global + table des matières
          const index = {
            generatedAt: new Date()?.toISOString(),
            count: all?.length,
            items: all?.map(x => ({
              id: x?.id,
              type: x?.type,
              title: x?.title,
              source: x?.source,
              tags: x?.tags
            }))
          };
          await fs?.writeFile("out/registry.index.json", JSON.stringify(index, null, 2), "utf8");
          await fs?.writeFile("out/registry.all.yaml", yaml?.dump(all, { noRefs: true, lineWidth: 120 }), "utf8");
          console.log(`✅ Registry construit: out/registry.index.json (items: ${all?.length})`);
        })();