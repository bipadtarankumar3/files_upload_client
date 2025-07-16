import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Input,
  Button,
  Modal,
  Select,
  Form,
  Typography,
  Divider,
  Card,
  Space,
  Row,
  Col,
  Checkbox,
} from 'antd';

const { Option } = Select;
const { Title } = Typography;

const fieldTypes = [
  { type: 'text', label: 'Text Input' },
  { type: 'number', label: 'Number Input' },
  { type: 'select', label: 'Select (Dropdown)', hasOptions: true },
  { type: 'multi-select', label: 'Multi-Select', hasOptions: true },
  { type: 'radio', label: 'Radio Buttons', hasOptions: true },
  { type: 'checkbox', label: 'Checkboxes', hasOptions: true },
  { type: 'date', label: 'Date Picker' },
  { type: 'location', label: 'Location Selector' },
];

const SortableField = ({ id, field, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
    marginBottom: 12,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        size="small"
        title={`${field.label || '(no label)'} (${field.field_type})`}
        extra={
          <Space>
            <Button size="small" onClick={() => onEdit(field)}>
              Edit
            </Button>
            <Button size="small" danger onClick={() => onDelete(field.id)}>
              Delete
            </Button>
          </Space>
        }
      />
    </div>
  );
};

const SectionEditor = ({
  section,
  onUpdateSection,
  onDeleteSection,
  onAddField,
  onEditField,
  onDeleteField,
  onAddSubsection,
  onUpdateFieldsOrder,
  onUpdateSubsectionsOrder,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Drag handlers for fields and subsections
  const handleFieldsDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = section.fields.findIndex((f) => f.id === active.id);
      const newIndex = section.fields.findIndex((f) => f.id === over.id);
      const newFields = arrayMove(section.fields, oldIndex, newIndex);
      onUpdateFieldsOrder(section.id, newFields);
    }
  };

  const handleSubsectionsDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = section.subsections.findIndex((s) => s.id === active.id);
      const newIndex = section.subsections.findIndex((s) => s.id === over.id);
      const newSubs = arrayMove(section.subsections, oldIndex, newIndex);
      onUpdateSubsectionsOrder(section.id, newSubs);
    }
  };

  return (
    <div
      style={{
        marginBottom: 32,
        padding: 16,
        border: '1px solid #ddd',
        borderRadius: 6,
        background: '#fafafa',
      }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col flex="auto">
          <Input
            value={section.title}
            onChange={(e) =>
              onUpdateSection(section.id, { ...section, title: e.target.value })
            }
            placeholder="Section Title"
            style={{ fontWeight: 'bold', fontSize: 16 }}
          />
        </Col>
        <Col>
          <Button danger onClick={() => onDeleteSection(section.id)}>
            Delete Section
          </Button>
        </Col>
      </Row>

      <Select
        placeholder="Add field"
        onChange={(type) => onAddField(section.id, type)}
        style={{ width: 250, marginBottom: 16, marginRight: 16 }}
        options={fieldTypes.map((ft) => ({
          label: ft.label,
          value: ft.type,
        }))}
      />

      <Button onClick={() => onAddSubsection(section.id)}>+ Add Subsection</Button>

      {/* Fields drag & drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleFieldsDragEnd}
      >
        <SortableContext
          items={section.fields.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          {section.fields.map((field) => (
            <SortableField
              key={field.id}
              id={field.id}
              field={field}
              onEdit={(f) => onEditField(section.id, f)}
              onDelete={(fieldId) => onDeleteField(section.id, fieldId)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Recursive subsections */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleSubsectionsDragEnd}
      >
        <SortableContext
          items={section.subsections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div style={{ marginLeft: 24, marginTop: 24 }}>
            {section.subsections.map((sub) => (
              <SectionEditor
                key={sub.id}
                section={sub}
                onUpdateSection={(id, updated) => {
                  const newSubsections = section.subsections.map((ss) =>
                    ss.id === id ? updated : ss
                  );
                  onUpdateSection(section.id, { ...section, subsections: newSubsections });
                }}
                onDeleteSection={(id) => {
                  const filteredSubs = section.subsections.filter((ss) => ss.id !== id);
                  onUpdateSection(section.id, { ...section, subsections: filteredSubs });
                }}
                onAddField={onAddField}
                onEditField={onEditField}
                onDeleteField={onDeleteField}
                onAddSubsection={onAddSubsection}
                onUpdateFieldsOrder={onUpdateFieldsOrder}
                onUpdateSubsectionsOrder={(parentId, newSubs) => {
                  const newSubsections = section.subsections.map((ss) =>
                    ss.id === parentId ? { ...ss, subsections: newSubs } : ss
                  );
                  onUpdateSection(section.id, { ...section, subsections: newSubsections });
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

const PreviewForm = ({ sections }) => {
  const renderSection = (section) => (
    <div key={section.id} style={{ marginBottom: 24 }}>
      <Title level={4}>{section.title}</Title>
      {section.fields.map((field) => {
        const commonProps = {
          label: field.label,
          required: field.required,
          key: field.id,
        };
        switch (field.field_type) {
          case 'text':
            return (
              <Form.Item {...commonProps}>
                <Input placeholder="Your answer" />
              </Form.Item>
            );
          case 'number':
            return (
              <Form.Item {...commonProps}>
                <Input type="number" placeholder="Enter number" />
              </Form.Item>
            );
          case 'select':
            return (
              <Form.Item {...commonProps}>
                <Select placeholder="Choose option">
                  {(field.options || []).map((opt, i) => (
                    <Option key={i} value={opt}>
                      {opt}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            );
          case 'multi-select':
            return (
              <Form.Item {...commonProps}>
                <Select mode="multiple" placeholder="Choose options">
                  {(field.options || []).map((opt, i) => (
                    <Option key={i} value={opt}>
                      {opt}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            );
          case 'radio':
            return (
              <Form.Item {...commonProps}>
                <Select placeholder="Choose option">
                  {(field.options || []).map((opt, i) => (
                    <Option key={i} value={opt}>
                      {opt}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            );
          case 'checkbox':
            return (
              <Form.Item {...commonProps}>
                <Checkbox.Group options={field.options || []} />
              </Form.Item>
            );
          case 'date':
            return (
              <Form.Item {...commonProps}>
                <Input type="date" />
              </Form.Item>
            );
          default:
            return null;
        }
      })}

      {/* Render subsections recursively */}
      {section.subsections.map(renderSection)}
    </div>
  );

  return (
    <Form layout="vertical">
      {sections.map(renderSection)}
      <Button type="primary">Submit</Button>
    </Form>
  );
};

export default function NestedFormBuilder() {
  const [formName, setFormName] = useState('');
  const [sections, setSections] = useState([
    {
      id: 'sec-1',
      title: 'Section 1',
      fields: [],
      subsections: [],
    },
  ]);

  const [modalField, setModalField] = useState(null);
  const [modalSectionId, setModalSectionId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Recursive helpers for sections and fields (unchanged)...

  const updateSectionRecursive = (list, id, updated) =>
    list.map((sec) => {
      if (sec.id === id) return updated;
      if (sec.subsections && sec.subsections.length > 0) {
        return { ...sec, subsections: updateSectionRecursive(sec.subsections, id, updated) };
      }
      return sec;
    });

  const deleteSectionRecursive = (list, id) =>
    list
      .filter((sec) => sec.id !== id)
      .map((sec) => ({
        ...sec,
        subsections: sec.subsections ? deleteSectionRecursive(sec.subsections, id) : [],
      }));

  const addSubsectionRecursive = (list, parentId, newSub) =>
    list.map((sec) => {
      if (sec.id === parentId) {
        return {
          ...sec,
          subsections: [...(sec.subsections || []), newSub],
        };
      }
      if (sec.subsections && sec.subsections.length > 0) {
        return {
          ...sec,
          subsections: addSubsectionRecursive(sec.subsections, parentId, newSub),
        };
      }
      return sec;
    });

  const addFieldRecursive = (list, sectionId, field) =>
    list.map((sec) => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          fields: [...sec.fields, field],
        };
      }
      if (sec.subsections && sec.subsections.length > 0) {
        return {
          ...sec,
          subsections: addFieldRecursive(sec.subsections, sectionId, field),
        };
      }
      return sec;
    });

  const editFieldRecursive = (list, fieldId, updatedField) =>
    list.map((sec) => ({
      ...sec,
      fields: sec.fields.map((f) => (f.id === fieldId ? updatedField : f)),
      subsections: sec.subsections ? editFieldRecursive(sec.subsections, fieldId, updatedField) : [],
    }));

  const deleteFieldRecursive = (list, fieldId) =>
    list.map((sec) => ({
      ...sec,
      fields: sec.fields.filter((f) => f.id !== fieldId),
      subsections: sec.subsections ? deleteFieldRecursive(sec.subsections, fieldId) : [],
    }));

  const updateFieldsOrderRecursive = (list, sectionId, newFields) =>
    list.map((sec) => {
      if (sec.id === sectionId) {
        return { ...sec, fields: newFields };
      }
      if (sec.subsections && sec.subsections.length > 0) {
        return {
          ...sec,
          subsections: updateFieldsOrderRecursive(sec.subsections, sectionId, newFields),
        };
      }
      return sec;
    });

  const updateSubsectionsOrderRecursive = (list, sectionId, newSubs) =>
    list.map((sec) => {
      if (sec.id === sectionId) {
        return { ...sec, subsections: newSubs };
      }
      if (sec.subsections && sec.subsections.length > 0) {
        return {
          ...sec,
          subsections: updateSubsectionsOrderRecursive(sec.subsections, sectionId, newSubs),
        };
      }
      return sec;
    });

  const handleAddSection = () => {
    const newSection = {
      id: `sec-${Date.now()}`,
      title: 'New Section',
      fields: [],
      subsections: [],
    };
    setSections([...sections, newSection]);
  };

  const handleAddSubsection = (parentId) => {
    const newSub = {
      id: `sec-${Date.now()}`,
      title: 'New Subsection',
      fields: [],
      subsections: [],
    };
    setSections(addSubsectionRecursive(sections, parentId, newSub));
  };

  const handleAddField = (sectionId, fieldType) => {
    // Create a new field with default props and empty options for types that need it
    let newField = {
      id: `field-${Date.now()}`,
      label: '',
      field_type: fieldType,
      required: false,
    };

    // Add empty options array for these types
    if (['select', 'multi-select', 'radio', 'checkbox'].includes(fieldType)) {
      newField.options = [];
    }

    setModalField(newField);
    setModalSectionId(sectionId);
  };

  const handleEditField = (sectionId, field) => {
    setModalField(field);
    setModalSectionId(sectionId);
  };

  const handleDeleteField = (sectionId, fieldId) => {
    setSections(deleteFieldRecursive(sections, fieldId));
  };

  const handleDeleteSection = (id) => {
    setSections(deleteSectionRecursive(sections, id));
  };

  const handleUpdateSection = (id, updated) => {
    setSections(updateSectionRecursive(sections, id, updated));
  };

  const handleFieldsOrderUpdate = (sectionId, newFields) => {
    setSections(updateFieldsOrderRecursive(sections, sectionId, newFields));
  };

  const handleSubsectionsOrderUpdate = (sectionId, newSubs) => {
    setSections(updateSubsectionsOrderRecursive(sections, sectionId, newSubs));
  };

  const handleModalOk = () => {
    // Validate modalField label and options if needed
    if (!modalField.label.trim()) {
      return; // Could add notification
    }

    // For fields that require options, remove empty options
    if (
      ['select', 'multi-select', 'radio', 'checkbox'].includes(modalField.field_type) &&
      modalField.options
    ) {
      modalField.options = modalField.options.filter((o) => o.trim() !== '');
      if (modalField.options.length === 0) {
        // Prevent saving field without options for these types
        return;
      }
    }

    // Update or add field in sections
    const isEditing = sections.some((sec) =>
      sec.fields.some((f) => f.id === modalField.id)
    );

    if (isEditing) {
      setSections(editFieldRecursive(sections, modalField.id, modalField));
    } else {
      setSections(addFieldRecursive(sections, modalSectionId, modalField));
    }
    setModalField(null);
    setModalSectionId(null);
  };

  const handleModalCancel = () => {
    setModalField(null);
    setModalSectionId(null);
  };

  // Modal form handlers for editing modalField state
  const onModalFieldChange = (fieldName, value) => {
    setModalField((prev) => ({ ...prev, [fieldName]: value }));
  };

  const onOptionChange = (index, value) => {
    if (!modalField.options) return;
    const newOptions = [...modalField.options];
    newOptions[index] = value;
    setModalField((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setModalField((prev) => ({
      ...prev,
      options: [...(prev.options || []), ''],
    }));
  };

  const removeOption = (index) => {
    if (!modalField.options) return;
    const newOptions = modalField.options.filter((_, i) => i !== index);
    setModalField((prev) => ({ ...prev, options: newOptions }));
  };

  return (
    <div style={{ padding: 24 }}>
      <Title>Nested Form Builder</Title>

      <Input
        placeholder="Form Name"
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        style={{ marginBottom: 24, width: 400 }}
      />

      {sections.map((section) => (
        <SectionEditor
          key={section.id}
          section={section}
          onUpdateSection={handleUpdateSection}
          onDeleteSection={handleDeleteSection}
          onAddField={handleAddField}
          onEditField={handleEditField}
          onDeleteField={handleDeleteField}
          onAddSubsection={handleAddSubsection}
          onUpdateFieldsOrder={handleFieldsOrderUpdate}
          onUpdateSubsectionsOrder={handleSubsectionsOrderUpdate}
        />
      ))}

      <Button type="dashed" onClick={handleAddSection} style={{ marginBottom: 24 }}>
        + Add Section
      </Button>

      <Divider />

      <Button type="primary" onClick={() => setShowPreview(true)} disabled={!formName}>
        Preview Form
      </Button>

      <Modal
        title={modalField ? (modalField.id.startsWith('field-') ? 'Edit Field' : 'Add Field') : ''}
        visible={!!modalField}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Save"
      >
        {modalField && (
          <Form layout="vertical">
            <Form.Item label="Label" required>
              <Input
                value={modalField.label}
                onChange={(e) => onModalFieldChange('label', e.target.value)}
              />
            </Form.Item>

            <Form.Item label="Field Type" required>
              <Select
                value={modalField.field_type}
                disabled
                options={fieldTypes.map((ft) => ({ label: ft.label, value: ft.type }))}
              />
            </Form.Item>

            <Form.Item>
              <Checkbox
                checked={modalField.required}
                onChange={(e) => onModalFieldChange('required', e.target.checked)}
              >
                Required
              </Checkbox>
            </Form.Item>

            {/* Options for fields that have options */}
            {['select', 'multi-select', 'radio', 'checkbox'].includes(modalField.field_type) && (
              <>
                <Divider />
                <Title level={5}>Options</Title>
                {(modalField.options || []).map((opt, i) => (
                  <Row key={i} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                    <Col flex="auto">
                      <Input
                        value={opt}
                        onChange={(e) => onOptionChange(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                      />
                    </Col>
                    <Col>
                      <Button danger onClick={() => removeOption(i)}>
                        Remove
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Button type="dashed" onClick={addOption} block>
                  + Add Option
                </Button>
              </>
            )}
          </Form>
        )}
      </Modal>

      <Modal
        title="Form Preview"
        visible={showPreview}
        onCancel={() => setShowPreview(false)}
        footer={null}
        width={700}
      >
        <PreviewForm sections={sections} />
      </Modal>
    </div>
  );
}
