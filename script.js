const materialesPorTipo = {
  laptop: { pesoBase: 2, metal_frac: 0.25, plast_frac: 0.45, vidrio_frac: 0.05 },
  desktop: { pesoBase: 7, metal_frac: 0.35, plast_frac: 0.35, vidrio_frac: 0.05 },
  celular: { pesoBase: 0.18, metal_frac: 0.20, plast_frac: 0.30, vidrio_frac: 0.30 },
  tablet: { pesoBase: 0.5, metal_frac: 0.20, plast_frac: 0.40, vidrio_frac: 0.20 }
};

const listaRecolectados = [];

function calcularImpacto() {
  const tipo = document.getElementById('tipo').value;
  const estado = document.getElementById('estado').value;
  let peso = parseFloat(document.getElementById('peso').value) || 0;
  const bateria = document.getElementById('bateria').value === 'si';

  if (peso <= 0) peso = materialesPorTipo[tipo].pesoBase;

  const fracs = materialesPorTipo[tipo];
  const metal = peso * fracs.metal_frac;
  const plastico = peso * fracs.plast_frac;
  const vidrio = peso * fracs.vidrio_frac;
  const ahorroCO2 = (metal + plastico + vidrio) * 2;

  const recomendacion = 
    estado === "funciona" ? "Donación o reutilización." :
    estado === "reparacion" ? "Reparación recomendada." :
    "Desmontaje para repuestos y reciclaje.";

  document.getElementById('resultado').innerHTML = `
    <h3>Impacto estimado</h3>
    <p>Peso: ${peso.toFixed(2)} kg • Ahorro CO₂: ${ahorroCO2.toFixed(2)} kg</p>
    <p>${recomendacion}</p>
    <button id="registrarBtn">Registrar dispositivo</button>
  `;

  document.getElementById('registrarBtn').addEventListener('click', () => {
    const id = Date.now();
    listaRecolectados.push({ id, tipo, estado, peso, bateria, ahorroCO2 });
    actualizarLista();
    alert("Dispositivo registrado.");
  });
}

function actualizarLista() {
  const ul = document.getElementById('lista');
  ul.innerHTML = '';
  listaRecolectados.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${item.tipo} — ${item.peso.toFixed(2)} kg — ${item.estado}
      <button onclick="generarEtiqueta(${item.id})">Etiqueta PDF</button>
    `;
    ul.appendChild(li);
  });
}

function generarEtiqueta(id) {
  const dispositivo = listaRecolectados.find(d => d.id === id);
  if (!dispositivo) return;

  const datosQR = `EcoCalc\nTipo: ${dispositivo.tipo}\nPeso: ${dispositivo.peso.toFixed(2)} kg\nEstado: ${dispositivo.estado}`;
  const qr = new QRious({
    element: document.getElementById('qrCanvas'),
    value: datosQR,
    size: 150
  });

  const imgData = document.getElementById('qrCanvas').toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  // Marco verde
  pdf.setDrawColor(46, 125, 50);
  pdf.setLineWidth(2);
  pdf.rect(5, 5, 200, 287);

  // Logo EcoCalc estilizado
  pdf.setFontSize(22);
  pdf.setTextColor(46, 125, 50);
  pdf.text("♻ EcoCalc", 105, 20, { align: "center" });

  // Subtítulo
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Etiqueta de Reciclaje Electrónico", 105, 30, { align: "center" });

  // Datos del dispositivo
  pdf.setFontSize(12);
  pdf.text(`Tipo: ${dispositivo.tipo}`, 20, 50);
  pdf.text(`Peso: ${dispositivo.peso.toFixed(2)} kg`, 20, 60);
  pdf.text(`Estado: ${dispositivo.estado}`, 20, 70);
  pdf.text(`Ahorro CO₂: ${dispositivo.ahorroCO2.toFixed(2)} kg`, 20, 80);
  pdf.text(dispositivo.bateria ? "Incluye batería (manejo especial)" : "Sin batería", 20, 90);

  // Insertar el código QR
  pdf.addImage(imgData, 'PNG', 130, 50, 60, 60);

  // Pie de página
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  pdf.text("Proyecto escolar de reciclaje de electrónicos – EcoCalc", 105, 280, { align: "center" });

  pdf.save(`Etiqueta_${dispositivo.tipo}_${id}.pdf`);
}

document.getElementById('calcularBtn').addEventListener('click', calcularImpacto);