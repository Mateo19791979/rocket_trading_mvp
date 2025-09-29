import fs from "fs/promises";
        
        import path from "path";
        import pdf from "pdf-parse";
        import { glob } from "glob";

        const INBOX = "books_inbox";
        const WORK = "workdir";

        async function ensureDir(p) { await fs?.mkdir(p, { recursive: true }); }

        async function ingestOne(pdfPath) {
          const buf = await fs?.readFile(pdfPath);
          const data = await pdf(buf);
          const docId = path?.basename(pdfPath)?.replace(/\.[Pp][Dd][Ff]$/, "");
          const outDir = path?.join(WORK, docId);
          await ensureDir(outDir);

          // Nettoyage texte simple
          const rawText = data?.text?.replace(/\u00A0/g, " ")?.replace(/[ \t]+\n/g, "\n")?.replace(/\n{3,}/g, "\n\n")?.trim();

          await fs?.writeFile(path?.join(outDir, "raw.txt"), rawText, "utf8");
          await fs?.writeFile(
            path?.join(outDir, "meta.json"),
            JSON.stringify({
              docId,
              source: pdfPath,
              pages: data?.numpages || null,
              info: data?.info || {},
              createdAt: new Date()?.toISOString()
            }, null, 2),
            "utf8"
          );
          console.log(`✅ Ingestion: ${pdfPath} → ${outDir}`);
        }

        (async () => {
          const files = await glob(`${INBOX}/**/*.pdf`);
          if (files?.length === 0) {
            console.warn(`ℹ️ Aucun PDF dans ${INBOX}/. Ajoute tes livres et relance.`);
            process.exit(0);
          }
          await ensureDir(WORK);
          for (const f of files) {
            try { await ingestOne(f); }
            catch (e) { console.error(`❌ Ingestion échouée: ${f}`, e?.message); }
          }
        })();