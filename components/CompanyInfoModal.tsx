import React from 'react';
import { X } from 'lucide-react';

interface CompanyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const pizarroLogo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAYlSURBVHgB7Z1/bBVFGMd/50tLW4ptK4xt2MZiYyMmBlvYGE0gERPRxI9GjA9Gjf/QGPEjJv4g4gfqgxFfYCQaDDEmxmATwUZEbFAbG7vY2MZKW4oFCgX26d7cmc7O7N69e3fu+qG3c5fn/s/z3O4593y7hGEYhjEMSCmCUAoZlFIMmBQiKEUMyikGTEoRlFIMmBQiKEUMyikGTEoRlFIMmBQiKEUMyikGTEoRlFIMmBQiKEUMyikGTEoRlFIMmBQiKEUMyikGTEoRlFIMmBQiKEUMyikGTEoRlFIMmBQiKEUMyikGTEoRlFIMmBQiKEUMyikGTEoRlFIMmBQiKEUMyikGTEoRlFIMmBQiKEUMyikGTEoRlFIMmBQiKEUMyikGTEoRlFIMmBQiKEUMyikGTEoRlFIMmBQiKEUMyikGTEoRlFIMmBQiKEUMyikGzD4tIe2lT3pNe+l32ku3tIf+lD7odV8t/V976S/aR/8r/aX19fX+tV1X+l7e0h56Qnvoe1qV/wYn4Q15Q3vpV6XpLq1G5WfBQPha3tP+R3tpd+l32n1aifpT6SXtpf9Tq6Q+pB+0h97W6mR+LhiEj2gP/VVa3Z/uR+XF8M95W2f/P7W6Ufl3/p1e0R76TVrVmO5D5dvC+/T3pbf+Oa1uVP4eLMJH2kuvSdP76n6kfl04CO/pQ+2h76c1/Ufl1YCHpE+0l36VVrfv6n5kfl04yGdpL/1tWt2g6gfl44GHLGkPfaeH5T6qH5XjT5I+0R56WZpeV/dD5buR/5E+0x56RpreWfdD5buBhyxpD/2th+U+qh+V48+BhyxpD/2jh+U+qh+V42sCD0mf6X1p9QDVj8pRo8l7pM+0h1an1g1VPyjdDzxtT32oh+U+6o/KdR+BhyxpL/2Gh+U+qh+V41sCD0mf6H1peu9W/ag8R/4+j2gP/Syt7pbuR+W7kQe0l36dVvfP9SPynYh/pE+0l16VpreV/cj8p2IhyxpD/2wPXSvVvVj8jUeRpK+0h76d1rdv6oflWNHkI+0h/6YltZ/qv6kfEyYCOf1of/V6t7pH5SPhJnwVtpL32l1g6r6kTASfoE+0h56WZp/VvWj8hVhIDytD/2yPfSztLpP1Y/KV4SB8I7W0W/T6oGqH5VvCYfAV7SHftRe+l+t7l/1I/O1YCC8r3V0nza9t6ofla8JA+F/S0d/J/lPqv6E/B1hIPz8k/TRtrqr6kfC/w4Mwttae+mbtLpP1Y/CVYSB8D1aXb9e/S/Vj8JNhIFw/356c1jdpO6HyldCIHz1k/SQNn/V+hEpX4mB8E9L69/T6s7pDpTvREYhvaC1/0ut7tHuR+UnYyC8p4flPqqfke8GBrGkvfSNdLtW9SPz1RCIg/TQ17U6QNWPylcjIZCdpLf+LK3uz+pH5TsRDOlZ9X56o/pROQkIRF59vPq/uV8x/f6s4SgFHNgJIeiFDMoZRkwsIQilmLAppRhIIcOSlGGgZQjCQM5lqMMACmHMBRhYAcKQkEIFsJADgSBYAQM4EAQAoWAEAMBACgSAYAQIEAIBAEBAgYAgYDAAAMAAAAABAAAgAAIAAQAAIAAEACAADACAABABAQAgEAgBAgAAQAEgBAAgABAIAAQAgYAgEASAADACAABAAQAIEAIABAAgAAAQAAAIAAEACAYAQIEAwCBAAAQAAgABAACBAEAgIAQIEAQAEgAAQAAIAAAAAEAACAAAAgABAACAECAAEgAAAIEAEAIEAAQCAAACAAAABAAAQAAIAAQAAgQAgAAQAAIAQCAAQAAQIAAECAAEgABAAAIEAAAEAgABACAAQAAAIAAEAAAQAAEAACAAAAgAQCAAACAAAAQAEgABAAgAAIAAQIAACAECAIEAAAAgAAQAAIAAECAAEAIAAQAgQAIEAECAIEAQABAAIAAQAAgQAEAIABAAQAAAIAAECAAQAAAAgAQAgQAIEAEAAAAAAAACBAEAAAAAgABAAAAQAAIAAEAAAAACAAQAAAEAIEACAEAIECACAEgBAAQgQBAAQIEAgBAgAAQIEAAAAAgAAAgAAgABAAAAAQAAAIAQIAQAEAgAAQAEgAAQAAIAAQAAIAQAAgQAgAAQIEAEAACAAAAgAQAgABAAQAAIAAQAAIEAEAIABIAQAAIAACAAEACBAECAAAABAACAAEAgABACAAgAgQAIEACBAAABACAAQAAAAAgAAQAAIAAQAAgAQAgQAIAQIAAEAAAAAgBAACAAAAgAAQIEAAQAAgABAAAAAgQBAACAAQAAAAAEAACAAQAAAAQAgQAgAAgAAgAAQIAQAgQBAAAQAAgABAQAgAgQAIEAIAAIAAEAAAAAgAAQAAAEAIEAAAAgAQAgQBAAAAQAAgAQAAIAAAAEAIAAEACAEAgCBAAgQBAgABAIEAAAAAAACAECAAABAAIECAAgQBAgABAIAAAIAAEAAAIAACAAgAQIEAAAAQIAAAAAAAQIEQoZhGEYhiH/A6g+X9T8cPGyAAAAAElFTUTSuQmCC';

const CompanyInfoModal: React.FC<CompanyInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-8 text-center">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-6 h-6" />
          </button>

          <img
            src={pizarroLogo}
            alt="Pizarro Climatización Logo"
            className="mx-auto h-20 w-auto mb-4"
          />

          <h2 className="text-2xl font-bold text-gray-800">
            Pizarro Climatización
          </h2>
          <p className="mt-2 text-md text-gray-600">
            Líderes en soluciones de climatización.
          </p>

          <div className="mt-6 text-sm text-gray-500 text-left bg-gray-50 p-4 rounded-lg border">
            <p>
              Este dashboard analítico fue desarrollado para proveer insights sobre las operaciones de la empresa, permitiendo un análisis detallado de ventas, compras, gastos y más.
            </p>
            <p className="mt-2">
              <strong>Desarrollado por:</strong> Francisco Paz
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-pizarro-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-pizarro-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pizarro-blue-500 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoModal;