const fs = require('fs');
const path = require('path');

const files = [
    "src/pages/censo/columnsCenso.jsx",
    "src/pages/persona/columnsPersonas.jsx",
    "src/pages/seccion/columnsSeccion.jsx",
    "src/pages/docente/columnsDocente.jsx",
    "src/pages/anoAcademico/columnsAnos.jsx",
    "src/pages/matricula/columnsMatriculas.jsx",
    "src/pages/vocero/columnsVocero.jsx",
    "src/pages/sede/columnsSede.jsx",
    "src/pages/inventario/columnsInventario.jsx",
    "src/pages/lapso/columnsLapso.jsx",
    "src/pages/unidadCurricular/columnUnidadCurricular.jsx",
    "src/pages/trayecto/columnsTrayecto.jsx",
    "src/pages/usuario/columnsUser.jsx",
    "src/pages/pnf/columnsPnfs.jsx"
];

for (const p of files) {
    const fullPath = path.join('/home/alfreddy/Documentos/frontend_IV', p);
    try {
        if (!fs.existsSync(fullPath)) continue;
        let content = fs.readFileSync(fullPath, 'utf8');

        // We match the block from { id: "select" to enableHiding: false, }
        // including trailing commas and whitespace
        const regex = /\{\s*id:\s*['"]select['"][\s\S]*?enableHiding:\s*false,?\s*\},?\s*/;
        content = content.replace(regex, '');

        fs.writeFileSync(fullPath, content);
        console.log(`Cleaned ${p}`);
    } catch (err) {
        console.error(`Error processing ${p}:`, err.message);
    }
}
