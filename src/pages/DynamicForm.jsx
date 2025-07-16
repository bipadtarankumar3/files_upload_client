
import React, { useEffect, useState } from 'react';
import Select from 'react-select';

const DynamicForm = ({ formName, submissionId }) => {
  const [formId, setFormId] = useState(null);
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [groupFields, setGroupFields] = useState({});
  const [dropdownOptions, setDropdownOptions] = useState({});

  useEffect(() => {
    // alert('formName', formName);
    fetch(`http://localhost:5000/api/form/${formName}`)
      .then(res => res.json())
      .then(data => {
        setFormId(data.form_id);
        setFields(data.fields);

        const groups = {};
        data.fields.filter(f => f.is_repeatable).forEach(f => {
          if (!groups[f.group_key]) groups[f.group_key] = [{}];
        });
        setGroupFields(groups);
      });

    if (submissionId) {
      fetch(`http://localhost:5000/api/submission/${submissionId}`)
        .then(res => res.json())
        .then(async data => {
          const flat = {};
          const groups = {};
          for (let key in data.submission) {
            if (Array.isArray(data.submission[key])) {
              groups[key] = data.submission[key];
            } else {
              flat[key] = data.submission[key];
            }
          }
          setFormData(flat);
          setGroupFields(groups);

          // Prefill cascading dropdowns for first row
          const location = groups?.LocationInfo?.[0] || {};
          if (location.State) {
            const dist = await fetch(`http://localhost:5000/api/options/District?parent_id=${location.State}`).then(r => r.json());
            const blk = location.District ? await fetch(`http://localhost:5000/api/options/Block?parent_id=${location.District}`).then(r => r.json()) : [];
            const vill = location.Block ? await fetch(`http://localhost:5000/api/options/Village?parent_id=${location.Block}`).then(r => r.json()) : [];
            setDropdownOptions(prev => ({
              ...prev,
              LocationInfo: {
                ...(prev.LocationInfo || {}),
                District: dist,
                Block: blk,
                Village: vill
              }
            }));
          }
        });
    }
  }, [formName, submissionId]);

  const handleChange = (label, value) => {
    setFormData(prev => ({ ...prev, [label]: value }));
  };

  const handleGroupChange = (groupKey, index, label, value) => {
    const updated = [...groupFields[groupKey]];
    updated[index][label] = value;
    setGroupFields(prev => ({ ...prev, [groupKey]: updated }));
  };

  const handleLocationChange = async (label, value, groupKey, index) => {
    handleGroupChange(groupKey, index, label, value);
    const next = { State: 'District', District: 'Block', Block: 'Village' }[label];
    if (next) {
      const res = await fetch(`http://localhost:5000/api/options/${next}?parent_id=${value}`);
      const data = await res.json();
      setDropdownOptions(prev => ({
        ...prev,
        [groupKey]: { ...(prev[groupKey] || {}), [next]: data }
      }));
    }
  };

  const addGroupRow = (groupKey) => {
    setGroupFields(prev => ({ ...prev, [groupKey]: [...prev[groupKey], {}] }));
  };

  const removeGroupRow = (groupKey, index) => {
    const updated = [...groupFields[groupKey]];
    updated.splice(index, 1);
    setGroupFields(prev => ({ ...prev, [groupKey]: updated }));
  };

  const handleSubmit = async () => {
    const submission = { ...formData, ...groupFields };
    const url = submissionId
      ? `http://localhost:5000/api/submission/${submissionId}`
      : `http://localhost:5000/api/form/${formId}/submit`;
    const method = submissionId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission })
    });
    const result = await res.json();
    alert(`Form ${submissionId ? 'updated' : 'submitted'} successfully!`);
  };

  const renderSelect = (field, value, onChange, groupKey, index) => {
    const options = dropdownOptions[groupKey]?.[field.label] || field.options || [];
    const selected = options.find(opt => opt.value === value) || null;

    const handleSelectChange = (selectedOption) => {
      const selectedValue = selectedOption ? selectedOption.value : '';
      if (['State', 'District', 'Block', 'Village'].includes(field.label)) {
        handleLocationChange(field.label, selectedValue, groupKey, index);
      } else {
        onChange(selectedValue);
      }
    };

    return (
      <Select
        value={selected}
        onChange={handleSelectChange}
        options={options}
        placeholder={`Select ${field.label}`}
      />
    );
  };

  const renderField = (field, value, onChange, groupKey = '', index = 0) => {
    if (field.field_type === 'select') {
      return renderSelect(field, value, onChange, groupKey, index);
    }

    return (
      <input
        type={field.field_type}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        required={field.is_required}
      />
    );
  };

  return (
    <form onSubmit={e => e.preventDefault()}>
      {fields.filter(f => !f.is_repeatable).map(field => (
        <div key={field.id} style={{ marginBottom: '12px' }}>
          <label>{field.label}</label>
          {renderField(field, formData[field.label], val => handleChange(field.label, val))}
        </div>
      ))}

      {Object.entries(groupFields).map(([groupKey, rows]) => (
        <div key={groupKey} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
          <h4>{groupKey.replace('_', ' ').toUpperCase()}</h4>
          {rows.map((row, idx) => (
            <div key={idx} style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
              {fields.filter(f => f.group_key === groupKey).map(field => (
                <div key={field.label}>
                  <label>{field.label}</label>
                  {renderField(field, row[field.label], val => handleGroupChange(groupKey, idx, field.label, val), groupKey, idx)}
                </div>
              ))}
              <button type="button" onClick={() => removeGroupRow(groupKey, idx)} style={{ marginTop: '10px' }}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addGroupRow(groupKey)}>+ Add More</button>
        </div>
      ))}

      <br />
      <button onClick={handleSubmit}>Submit</button>
    </form>
  );
};

export default DynamicForm;
