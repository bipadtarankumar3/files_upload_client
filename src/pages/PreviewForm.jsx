
import React from 'react';

const PreviewForm = ({ fields, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 w-2/3 rounded max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Preview Form</h2>
        <form>
          {fields.map((f) => (
            <div key={f.id} className="mb-4">
              <label className="block font-semibold">{f.label}</label>
              {f.field_type === 'text' && <input className="border p-2 w-full" type="text" />}
              {f.field_type === 'number' && <input className="border p-2 w-full" type="number" />}
              {f.field_type === 'date' && <input className="border p-2 w-full" type="date" />}
              {f.field_type === 'select' && <select className="border p-2 w-full"><option>-- Select --</option></select>}
            </div>
          ))}
        </form>
        <div className="text-right">
          <button className="px-4 py-2 bg-gray-600 text-white" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default PreviewForm;
