
import React, { useState } from 'react';

const FieldEditModal = ({ field, onSave, onClose }) => {
  const [localField, setLocalField] = useState(field);

  const handleChange = (key, value) => {
    setLocalField((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 w-1/2 rounded">
        <h3 className="text-lg font-bold mb-4">Edit Field</h3>
        <input
          className="border p-2 w-full mb-2"
          placeholder="Label"
          value={localField.label}
          onChange={(e) => handleChange('label', e.target.value)}
        />
        <label className="block mb-2">
          <input
            type="checkbox"
            checked={localField.is_required || false}
            onChange={(e) => handleChange('is_required', e.target.checked)}
          /> Required
        </label>
        <label className="block mb-2">
          <input
            type="checkbox"
            checked={localField.is_repeatable || false}
            onChange={(e) => handleChange('is_repeatable', e.target.checked)}
          /> Repeatable
        </label>

        {localField.field_type === 'select' && (
          <>
            <input className="border p-2 w-full mb-2" placeholder="Source Table" value={localField.source_table || ''} onChange={e => handleChange('source_table', e.target.value)} />
            <input className="border p-2 w-full mb-2" placeholder="Source Key" value={localField.source_key || ''} onChange={e => handleChange('source_key', e.target.value)} />
            <input className="border p-2 w-full mb-2" placeholder="Source Value" value={localField.source_value || ''} onChange={e => handleChange('source_value', e.target.value)} />
            <input className="border p-2 w-full mb-2" placeholder="Depends On (optional)" value={localField.depends_on || ''} onChange={e => handleChange('depends_on', e.target.value)} />
            <input className="border p-2 w-full mb-2" placeholder="Filter Column (optional)" value={localField.filter_column || ''} onChange={e => handleChange('filter_column', e.target.value)} />
          </>
        )}

        <input
          className="border p-2 w-full mb-2"
          placeholder="Group Key (optional)"
          value={localField.group_key || ''}
          onChange={(e) => handleChange('group_key', e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 bg-gray-400" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 bg-blue-600 text-white" onClick={() => onSave(localField)}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default FieldEditModal;
