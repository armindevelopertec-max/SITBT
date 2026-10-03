export default function PoliticaPrivacidadPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-6 sm:mb-8">Política de Privacidad</h1>

      <div className="prose prose-invert max-w-none">
        <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Última actualización: Enero 2026</p>

        <h2 className="text-lg sm:text-xl font-semibold text-gray-100 mt-6 sm:mt-8 mb-3 sm:mb-4">1. Responsable del tratamiento</h2>
        <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
          El Instituto Tecnológico Boliviano de Tecnología (ITBT), con domicilio en La Paz, Bolivia,
          es el responsable del tratamiento de sus datos personales.
        </p>

        <h2 className="text-lg sm:text-xl font-semibold text-gray-100 mt-6 sm:mt-8 mb-3 sm:mb-4">2. Datos personales que recopilamos</h2>
        <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
          Recopilamos los siguientes datos personales:
        </p>
        <ul className="list-disc pl-5 sm:pl-6 text-gray-400 mb-3 sm:mb-4 space-y-1 sm:space-y-2 text-sm sm:text-base">
          <li>Datos de identificación (nombre, CI, fecha de nacimiento, género)</li>
          <li>Datos de contacto (teléfono, correo electrónico, dirección)</li>
          <li>Datos académicos (carrera, calificaciones, certificados)</li>
          <li>Datos de facturación y pago</li>
        </ul>

        <h2 className="text-lg sm:text-xl font-semibold text-gray-100 mt-6 sm:mt-8 mb-3 sm:mb-4">3. Finalidad del tratamiento</h2>
        <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
          Sus datos personales serán utilizados para:
        </p>
        <ul className="list-disc pl-5 sm:pl-6 text-gray-400 mb-3 sm:mb-4 space-y-1 sm:space-y-2 text-sm sm:text-base">
          <li>Gestionar su proceso de admisión y matrícula</li>
          <li>Registrar su historial académico</li>
          <li>Emitir certificados y documentos oficiales</li>
          <li>Comunicar información institucional relevante</li>
        </ul>

        <h2 className="text-lg sm:text-xl font-semibold text-gray-100 mt-6 sm:mt-8 mb-3 sm:mb-4">4. Sus derechos</h2>
        <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
          Usted tiene derecho a:
        </p>
        <ul className="list-disc pl-5 sm:pl-6 text-gray-400 mb-3 sm:mb-4 space-y-1 sm:space-y-2 text-sm sm:text-base">
          <li>Acceder a sus datos personales</li>
          <li>Rectificar datos inexactos</li>
          <li>Solicitar la eliminación de sus datos</li>
          <li>Oponerse al tratamiento de sus datos</li>
        </ul>

        <h2 className="text-lg sm:text-xl font-semibold text-gray-100 mt-6 sm:mt-8 mb-3 sm:mb-4">5. Contacto</h2>
        <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
          Para ejercer sus derechos, puede contactarnos en:
        </p>
        <ul className="list-none text-gray-400 space-y-1 sm:space-y-2 text-sm sm:text-base">
          <li>Correo: privacidad@itbt.edu.bo</li>
          <li>Teléfono: +591 2 7525247</li>
        </ul>
      </div>
    </div>
  );
}
