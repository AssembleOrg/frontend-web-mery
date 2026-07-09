'use client';

import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  Type,
  Mail,
  Phone,
  AlignLeft,
  ChevronDown,
  CircleDot,
  CheckSquare,
  ToggleLeft,
  Info,
  X,
} from 'lucide-react';
import { FormRenderer } from '@/components/forms/form-renderer';
import type { FormField, FormFieldType } from '@/lib/forms-api';

export interface FormBuilderValue {
  title: string;
  slug: string;
  description: string;
  fields: FormField[];
  successMessage: string;
  closedMessage: string;
  submitLabel: string;
}

interface FormBuilderProps {
  value: FormBuilderValue;
  onChange: (value: FormBuilderValue) => void;
}

const FIELD_TYPES: { type: FormFieldType; label: string; icon: typeof Type; hint: string }[] = [
  { type: 'text', label: 'Texto corto', icon: Type, hint: 'Nombre, profesión, etc.' },
  { type: 'email', label: 'Email', icon: Mail, hint: 'Con validación de formato' },
  { type: 'phone', label: 'Teléfono', icon: Phone, hint: 'Con banderas y código de país' },
  { type: 'textarea', label: 'Texto libre', icon: AlignLeft, hint: 'Respuestas largas' },
  { type: 'select', label: 'Desplegable', icon: ChevronDown, hint: 'Una opción de una lista' },
  { type: 'radio', label: 'Opción única', icon: CircleDot, hint: 'Elige solo una (ej: horarios)' },
  { type: 'checkbox', label: 'Opción múltiple', icon: CheckSquare, hint: 'Puede marcar varias' },
  { type: 'yesno', label: 'Sí / No', icon: ToggleLeft, hint: 'Con aclaración opcional' },
  { type: 'info', label: 'Bloque de info', icon: Info, hint: 'Texto fijo, no es pregunta' },
];

const HAS_OPTIONS: FormFieldType[] = ['select', 'radio', 'checkbox'];

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `f-${Math.random().toString(36).slice(2)}-${Date.now()}`;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const inputClasses =
  'w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f9bbc4] focus:border-transparent';

export function FormBuilder({ value, onChange }: FormBuilderProps) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');
  const [showPalette, setShowPalette] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const patch = (partial: Partial<FormBuilderValue>) => onChange({ ...value, ...partial });

  const patchField = (fieldId: string, partial: Partial<FormField>) => {
    patch({
      fields: value.fields.map((f) => (f.id === fieldId ? { ...f, ...partial } : f)),
    });
  };

  const addField = (type: FormFieldType) => {
    const typeInfo = FIELD_TYPES.find((t) => t.type === type)!;
    const newField: FormField = {
      id: uid(),
      type,
      label: type === 'info' ? '' : typeInfo.label,
      required: type !== 'info' && type !== 'textarea',
      ...(HAS_OPTIONS.includes(type) && {
        options: [
          { id: uid(), label: 'Opción 1' },
          { id: uid(), label: 'Opción 2' },
        ],
      }),
      ...(type === 'yesno' && { allowContext: true }),
    };
    patch({ fields: [...value.fields, newField] });
    setExpandedId(newField.id);
    setShowPalette(false);
  };

  const removeField = (fieldId: string) => {
    patch({ fields: value.fields.filter((f) => f.id !== fieldId) });
  };

  const duplicateField = (field: FormField) => {
    const copy: FormField = {
      ...field,
      id: uid(),
      options: field.options?.map((o) => ({ ...o, id: uid() })),
    };
    const idx = value.fields.findIndex((f) => f.id === field.id);
    const fields = [...value.fields];
    fields.splice(idx + 1, 0, copy);
    patch({ fields });
  };

  const moveField = (fieldId: string, direction: -1 | 1) => {
    const idx = value.fields.findIndex((f) => f.id === fieldId);
    const target = idx + direction;
    if (target < 0 || target >= value.fields.length) return;
    const fields = [...value.fields];
    [fields[idx], fields[target]] = [fields[target], fields[idx]];
    patch({ fields });
  };

  const previewFields = useMemo(
    () => value.fields.filter((f) => f.type === 'info' || f.label.trim() !== ''),
    [value.fields],
  );

  return (
    <div className='space-y-6'>
      {/* Tabs edición / preview */}
      <div className='flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit'>
        <button
          type='button'
          onClick={() => setTab('edit')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'edit' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Pencil className='w-3.5 h-3.5' />
          Edición
        </button>
        <button
          type='button'
          onClick={() => setTab('preview')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Eye className='w-3.5 h-3.5' />
          Vista previa
        </button>
      </div>

      {tab === 'preview' ? (
        <div className='bg-gradient-to-b from-[#fdf3f4] to-white rounded-2xl border border-[#f9bbc4]/30 p-4 sm:p-8'>
          <div className='max-w-2xl mx-auto bg-white rounded-2xl border border-[#f9bbc4]/30 shadow-sm overflow-hidden'>
            <div className='px-6 sm:px-8 pt-7 pb-5 border-b border-[#FBE8EA]'>
              <h2 className='text-xl sm:text-2xl font-semibold text-gray-900 leading-snug'>
                {value.title || 'Título del formulario'}
              </h2>
              {value.description && (
                <p className='mt-2 text-sm text-gray-600 whitespace-pre-line'>{value.description}</p>
              )}
            </div>
            <div className='px-6 sm:px-8 py-7'>
              <FormRenderer
                fields={previewFields}
                submitLabel={value.submitLabel}
                onSubmit={() => {}}
                preview
              />
            </div>
          </div>
          <p className='text-center text-xs text-gray-400 mt-4'>
            Vista previa — el envío está deshabilitado
          </p>
        </div>
      ) : (
        <>
          {/* Datos generales */}
          <section className='bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4'>
            <h2 className='text-sm font-semibold text-[#660e1b] uppercase tracking-wide'>
              Datos generales
            </h2>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>Título *</label>
              <input
                type='text'
                value={value.title}
                onChange={(e) => patch({ title: e.target.value })}
                placeholder='Ej: Mery García te invita a su primer Master Class…'
                className={inputClasses}
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Descripción / subtítulo
              </label>
              <textarea
                value={value.description}
                onChange={(e) => patch({ description: e.target.value })}
                placeholder='Texto que aparece debajo del título'
                rows={2}
                className={inputClasses + ' resize-y'}
              />
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Link público (slug)
                </label>
                <div className='flex items-center'>
                  <span className='px-3 py-2 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-sm text-gray-400'>
                    /f/
                  </span>
                  <input
                    type='text'
                    value={value.slug}
                    onChange={(e) => patch({ slug: slugify(e.target.value) || e.target.value })}
                    placeholder='se-genera-del-titulo'
                    className={inputClasses + ' rounded-l-none'}
                  />
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Texto del botón
                </label>
                <input
                  type='text'
                  value={value.submitLabel}
                  onChange={(e) => patch({ submitLabel: e.target.value })}
                  placeholder='Enviar'
                  className={inputClasses}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Mensaje de éxito
                </label>
                <textarea
                  value={value.successMessage}
                  onChange={(e) => patch({ successMessage: e.target.value })}
                  placeholder='¡Gracias! Recibimos tu respuesta.'
                  rows={2}
                  className={inputClasses + ' resize-y'}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Mensaje cuando esté cerrado
                </label>
                <textarea
                  value={value.closedMessage}
                  onChange={(e) => patch({ closedMessage: e.target.value })}
                  placeholder='Este formulario ya no acepta respuestas.'
                  rows={2}
                  className={inputClasses + ' resize-y'}
                />
              </div>
            </div>
          </section>

          {/* Campos */}
          <section className='space-y-3'>
            <h2 className='text-sm font-semibold text-[#660e1b] uppercase tracking-wide px-1'>
              Campos ({value.fields.length})
            </h2>

            {value.fields.length === 0 && (
              <div className='bg-white rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400'>
                Todavía no agregaste campos. Usá el botón de abajo para empezar.
              </div>
            )}

            {value.fields.map((field, index) => (
              <FieldCard
                key={field.id}
                field={field}
                index={index}
                total={value.fields.length}
                expanded={expandedId === field.id}
                onToggle={() => setExpandedId(expandedId === field.id ? null : field.id)}
                onPatch={(partial) => patchField(field.id, partial)}
                onRemove={() => removeField(field.id)}
                onDuplicate={() => duplicateField(field)}
                onMove={(dir) => moveField(field.id, dir)}
              />
            ))}

            {/* Agregar campo */}
            <div className='relative'>
              <button
                type='button'
                onClick={() => setShowPalette((s) => !s)}
                className='w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[#f9bbc4] text-[#660e1b] text-sm font-medium hover:bg-[#FBE8EA]/40 transition-colors'
              >
                {showPalette ? <X className='w-4 h-4' /> : <Plus className='w-4 h-4' />}
                {showPalette ? 'Cancelar' : 'Agregar campo'}
              </button>

              {showPalette && (
                <div className='mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2'>
                  {FIELD_TYPES.map(({ type, label, icon: Icon, hint }) => (
                    <button
                      key={type}
                      type='button'
                      onClick={() => addField(type)}
                      className='flex items-start gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:border-[#f9bbc4] hover:bg-[#FBE8EA]/30 transition-colors text-left'
                    >
                      <span className='w-8 h-8 rounded-lg bg-[#FBE8EA] flex items-center justify-center flex-shrink-0'>
                        <Icon className='w-4 h-4 text-[#660e1b]' />
                      </span>
                      <span>
                        <span className='block text-sm font-medium text-gray-800'>{label}</span>
                        <span className='block text-[11px] text-gray-400 leading-tight mt-0.5'>
                          {hint}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

// ============ Card de campo ============

function FieldCard({
  field,
  index,
  total,
  expanded,
  onToggle,
  onPatch,
  onRemove,
  onDuplicate,
  onMove,
}: {
  field: FormField;
  index: number;
  total: number;
  expanded: boolean;
  onToggle: () => void;
  onPatch: (partial: Partial<FormField>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const typeInfo = FIELD_TYPES.find((t) => t.type === field.type);
  const TypeIcon = typeInfo?.icon || Type;

  return (
    <div className='bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden'>
      {/* Header */}
      <div className='flex items-center gap-2 px-3 sm:px-4 py-3'>
        <GripVertical className='w-4 h-4 text-gray-300 flex-shrink-0 hidden sm:block' />
        <span className='w-7 h-7 rounded-lg bg-[#FBE8EA] flex items-center justify-center flex-shrink-0'>
          <TypeIcon className='w-3.5 h-3.5 text-[#660e1b]' />
        </span>

        <button type='button' onClick={onToggle} className='flex-1 min-w-0 text-left'>
          <p className='text-sm font-medium text-gray-800 truncate'>
            {field.label || <span className='text-gray-400 italic'>Sin título</span>}
          </p>
          <p className='text-[11px] text-gray-400'>
            {typeInfo?.label}
            {field.required && field.type !== 'info' ? ' · obligatorio' : ''}
          </p>
        </button>

        <div className='flex items-center gap-0.5 flex-shrink-0'>
          <IconBtn title='Subir' disabled={index === 0} onClick={() => onMove(-1)}>
            <ArrowUp className='w-4 h-4' />
          </IconBtn>
          <IconBtn title='Bajar' disabled={index === total - 1} onClick={() => onMove(1)}>
            <ArrowDown className='w-4 h-4' />
          </IconBtn>
          <IconBtn title='Duplicar' onClick={onDuplicate}>
            <Copy className='w-4 h-4' />
          </IconBtn>
          <IconBtn title='Eliminar' onClick={onRemove} danger>
            <Trash2 className='w-4 h-4' />
          </IconBtn>
          <button
            type='button'
            onClick={onToggle}
            className='p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors'
            title={expanded ? 'Contraer' : 'Editar'}
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Editor expandido */}
      {expanded && (
        <div className='border-t border-gray-100 px-4 sm:px-5 py-4 space-y-3.5 bg-gray-50/50'>
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              {field.type === 'info' ? 'Título del bloque (opcional)' : 'Pregunta / etiqueta *'}
            </label>
            <input
              type='text'
              value={field.label}
              onChange={(e) => onPatch({ label: e.target.value })}
              className={inputClasses}
            />
          </div>

          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              {field.type === 'info' ? 'Contenido del bloque' : 'Texto de ayuda (opcional)'}
            </label>
            <textarea
              value={field.description || ''}
              onChange={(e) => onPatch({ description: e.target.value })}
              rows={field.type === 'info' ? 3 : 2}
              placeholder={
                field.type === 'info'
                  ? 'Ej: 📅 Viernes 24/7\n📍 Cabildo 1985, CABA'
                  : 'Aparece debajo de la pregunta'
              }
              className={inputClasses + ' resize-y'}
            />
          </div>

          {['text', 'email', 'phone', 'textarea', 'select'].includes(field.type) && (
            <div>
              <label className='block text-xs font-medium text-gray-600 mb-1'>
                Placeholder (opcional)
              </label>
              <input
                type='text'
                value={field.placeholder || ''}
                onChange={(e) => onPatch({ placeholder: e.target.value })}
                className={inputClasses}
              />
            </div>
          )}

          {/* Opciones */}
          {HAS_OPTIONS.includes(field.type) && (
            <OptionsEditor
              options={field.options || []}
              onChange={(options) => onPatch({ options })}
            />
          )}

          {/* Config yesno */}
          {field.type === 'yesno' && (
            <div className='space-y-3'>
              <label className='flex items-center gap-2 text-sm text-gray-700 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={!!field.allowContext}
                  onChange={(e) => onPatch({ allowContext: e.target.checked })}
                  className='w-4 h-4 rounded border-gray-300 text-[#660e1b] focus:ring-[#f9bbc4]'
                />
                Permitir aclarar contexto en texto libre
              </label>
              {field.allowContext && (
                <div>
                  <label className='block text-xs font-medium text-gray-600 mb-1'>
                    Etiqueta del campo de contexto
                  </label>
                  <input
                    type='text'
                    value={field.contextLabel || ''}
                    onChange={(e) => onPatch({ contextLabel: e.target.value })}
                    placeholder='¿Querés contarnos más? (opcional)'
                    className={inputClasses}
                  />
                </div>
              )}
            </div>
          )}

          {field.type !== 'info' && (
            <label className='flex items-center gap-2 text-sm text-gray-700 cursor-pointer'>
              <input
                type='checkbox'
                checked={!!field.required}
                onChange={(e) => onPatch({ required: e.target.checked })}
                className='w-4 h-4 rounded border-gray-300 text-[#660e1b] focus:ring-[#f9bbc4]'
              />
              Campo obligatorio
            </label>
          )}
        </div>
      )}
    </div>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: { id: string; label: string }[];
  onChange: (options: { id: string; label: string }[]) => void;
}) {
  return (
    <div>
      <label className='block text-xs font-medium text-gray-600 mb-1.5'>Opciones</label>
      <div className='space-y-2'>
        {options.map((opt, i) => (
          <div key={opt.id} className='flex items-center gap-2'>
            <span className='text-xs text-gray-400 w-5 text-right flex-shrink-0'>{i + 1}.</span>
            <input
              type='text'
              value={opt.label}
              onChange={(e) =>
                onChange(options.map((o) => (o.id === opt.id ? { ...o, label: e.target.value } : o)))
              }
              className={inputClasses}
            />
            <button
              type='button'
              onClick={() => onChange(options.filter((o) => o.id !== opt.id))}
              disabled={options.length <= 1}
              className='p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:pointer-events-none transition-colors flex-shrink-0'
              title='Quitar opción'
            >
              <Trash2 className='w-4 h-4' />
            </button>
          </div>
        ))}
        <button
          type='button'
          onClick={() => onChange([...options, { id: uid(), label: `Opción ${options.length + 1}` }])}
          className='flex items-center gap-1.5 text-xs font-medium text-[#660e1b] hover:underline ml-7'
        >
          <Plus className='w-3.5 h-3.5' />
          Agregar opción
        </button>
      </div>
    </div>
  );
}

function IconBtn({
  title,
  onClick,
  disabled,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type='button'
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none ${
        danger
          ? 'text-gray-300 hover:text-red-500 hover:bg-red-50'
          : 'text-gray-300 hover:text-[#660e1b] hover:bg-[#FBE8EA]/60'
      }`}
    >
      {children}
    </button>
  );
}
