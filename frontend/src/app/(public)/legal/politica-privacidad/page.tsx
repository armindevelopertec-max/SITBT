export default function PoliticaPrivacidadPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidad</h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">Última actualización: Enero 2026</p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Responsable del tratamiento</h2>
        <p className="text-gray-600 mb-4">
          El Instituto Técnico Boliviano de Tecnología (SITBT), con domicilio en La Paz, Bolivia,
          es el responsable del tratamiento de sus datos personales.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Datos personales que recopilamos</h2>
        <p className="text-gray-600 mb-4">
          Recopilamos los siguientes datos personales:
        </p>
        <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
          <li>Datos de identificación (nombre, CI, fecha de nacimiento, género)</li>
          <li>Datos de contacto (teléfono, correo electrónico, dirección)</li>
          <li>Datos académicos (carrera, calificaciones, certificados)</li>
          <li>Datos de facturación y pago</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Finalidad del tratamiento</h2>
        <p className="text-gray-600 mb-4">
          Sus datos personales serán utilizados para:
        </p>
        <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
          <li>Gestionar su proceso de admisión y matrícula</li>
          <li>Registrar su historial académico</li>
          <li>Emitir certificados y documentos oficiales</li>
          <li>Comunicar información institucional relevante</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Sus derechos</h2>
        <p className="text-gray-600 mb-4">
          Usted tiene derecho a:
        </p>
        <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
          <li>Acceder a sus datos personales</li>
          <li>Rectificar datos inexactos</li>
          <li>Solicitar la eliminación de sus datos</li>
          <li>Oponerse al tratamiento de sus datos</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Contacto</h2>
        <p className="text-gray-600 mb-4">
          Para ejercer sus derechos o有任何疑问, puede contactarnos en:
        </p>
        <ul className="list-none text-gray-600 space-y-2">
          <li>Correo: privacidad@sitbt.edu.bo</li>
          <li>Teléfono: +591 2 1234567</li>
        </ul>
      </div>
    </div>
  );
}
