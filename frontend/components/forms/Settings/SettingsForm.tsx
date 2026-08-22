'use client';

import { useState } from 'react';
import { Save, Loader2, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import {
  SettingKey,
  SettingValueMap,
  SiteSetting,
  Branding,
  Seo,
  SocialNetworks,
  Footer,
  HomeBanner,
  Scripts,
  Reservation,
  ContactInfoItem,
  ScheduleItem,
} from '@/src/types/siteSettings';
import { updateSiteSetting } from '@/lib/api/siteSettings';

interface Props {
  initialSettings: SiteSetting[];
}

interface TabDef {
  key: SettingKey;
  label: string;
}

const TABS: TabDef[] = [
  { key: 'branding', label: 'Identidad' },
  { key: 'seo', label: 'Meta datos' },
  { key: 'contact_info', label: 'Contacto' },
  { key: 'schedule', label: 'Horarios' },
  { key: 'social_networks', label: 'Redes sociales' },
  { key: 'footer', label: 'Footer' },
  { key: 'scripts', label: 'Scripts/Analytics (para desarrolladores)' },
];

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

function buildInitialMap(initialSettings: SiteSetting[]): Partial<SettingValueMap> {
  // Cada `s` correlaciona su `setting_key` con su `setting_value`, pero TypeScript
  // no puede verificar esa correlación al escribir dinámicamente en un objeto con
  // claves de unión (limitación conocida de los "weak types" indexados). Se usa un
  // `Record` explícito con el tipo unión de todos los valores posibles en vez de
  // `any`, y se convierte a `Partial<SettingValueMap>` una sola vez al final.
  const map: Partial<Record<SettingKey, SettingValueMap[SettingKey]>> = {};
  for (const s of initialSettings) {
    map[s.setting_key] = s.setting_value;
  }
  return map as Partial<SettingValueMap>;
}

export default function SettingsForm({ initialSettings }: Props) {
  const [activeTab, setActiveTab] = useState<SettingKey>('branding');
  const [values, setValues] = useState<Partial<SettingValueMap>>(buildInitialMap(initialSettings));
  const [savingKey, setSavingKey] = useState<SettingKey | null>(null);
  const [savedKey, setSavedKey] = useState<SettingKey | null>(null);
  const [error, setError] = useState('');

  const setValue = <K extends SettingKey>(key: K, value: SettingValueMap[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: SettingKey) => {
    const value = values[key];
    if (!value) return;
    setSavingKey(key);
    setSavedKey(null);
    setError('');
    try {
      await updateSiteSetting(key, value);
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la configuración');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Tabs */}
      <div className="lg:w-56 flex-shrink-0">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium text-left whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido */}
      <div className="flex-1 bg-white rounded-lg shadow border border-gray-100 p-6">
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {activeTab === 'branding' && (
          <BrandingSection value={values.branding} onChange={(v) => setValue('branding', v)} />
        )}
        {activeTab === 'seo' && (
          <SeoSection value={values.seo} onChange={(v) => setValue('seo', v)} />
        )}
        {activeTab === 'contact_info' && (
          <ContactInfoSection value={values.contact_info} onChange={(v) => setValue('contact_info', v)} />
        )}
        {activeTab === 'schedule' && (
          <ScheduleSection value={values.schedule} onChange={(v) => setValue('schedule', v)} />
        )}
        {activeTab === 'social_networks' && (
          <SocialNetworksSection value={values.social_networks} onChange={(v) => setValue('social_networks', v)} />
        )}
        {activeTab === 'footer' && (
          <FooterSection value={values.footer} onChange={(v) => setValue('footer', v)} />
        )}
        {activeTab === 'home_banner' && (
          <HomeBannerSection value={values.home_banner} onChange={(v) => setValue('home_banner', v)} />
        )}
        {activeTab === 'scripts' && (
          <ScriptsSection value={values.scripts} onChange={(v) => setValue('scripts', v)} />
        )}
        {activeTab === 'reservation' && (
          <ReservationSection value={values.reservation} onChange={(v) => setValue('reservation', v)} />
        )}

        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-3">
          <button
            onClick={() => handleSave(activeTab)}
            disabled={savingKey === activeTab}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {savingKey === activeTab ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar cambios
          </button>
          {savedKey === activeTab && (
            <span className="inline-flex items-center gap-1 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" /> Guardado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Secciones con objeto plano (key/value simple) ----------

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {type === 'color' ? (
        <div className="flex items-center gap-2">
          <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 border border-gray-300 rounded" />
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
        </div>
      ) : type === 'textarea' ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={inputClass} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} />
      )}
    </div>
  );
}

function BrandingSection({ value, onChange }: { value?: Branding; onChange: (v: Branding) => void }) {
  const v: Branding = value ?? { site_name: '', logo_url: '', favicon_url: '', primary_color: '#2C5F2D', secondary_color: '#D4A373', typography: '' };
  const set = (field: keyof Branding, val: string) => onChange({ ...v, [field]: val });
  return (
    <div className="space-y-4">
      <Field label="Nombre del sitio" value={v.site_name} onChange={(val) => set('site_name', val)} />
      <Field label="URL del logotipo" value={v.logo_url} onChange={(val) => set('logo_url', val)} placeholder="/images/logo.png" />
      <Field label="URL del favicon" value={v.favicon_url} onChange={(val) => set('favicon_url', val)} placeholder="/favicon.ico" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Color primario" value={v.primary_color} onChange={(val) => set('primary_color', val)} type="color" />
        <Field label="Color secundario" value={v.secondary_color} onChange={(val) => set('secondary_color', val)} type="color" />
      </div>
      <Field label="Tipografía principal" value={v.typography} onChange={(val) => set('typography', val)} placeholder="Playfair Display" />
    </div>
  );
}

function SeoSection({ value, onChange }: { value?: Seo; onChange: (v: Seo) => void }) {
  const v: Seo = value ?? { meta_title: '', meta_description: '', og_image: '', keywords: '' };
  const set = (field: keyof Seo, val: string) => onChange({ ...v, [field]: val });
  return (
    <div className="space-y-4">
      <Field label="Meta título" value={v.meta_title} onChange={(val) => set('meta_title', val)} />
      <Field label="Meta descripción" value={v.meta_description} onChange={(val) => set('meta_description', val)} type="textarea" />
      <Field label="Imagen Open Graph" value={v.og_image} onChange={(val) => set('og_image', val)} placeholder="/images/og.jpg" />
      <Field label="Palabras clave" value={v.keywords} onChange={(val) => set('keywords', val)} placeholder="jardín, eventos, bodas" />
    </div>
  );
}

function SocialNetworksSection({ value, onChange }: { value?: SocialNetworks; onChange: (v: SocialNetworks) => void }) {
  const v: SocialNetworks = value ?? { facebook: '', instagram: '', tiktok: '', whatsapp: '' };
  const set = (field: keyof SocialNetworks, val: string) => onChange({ ...v, [field]: val });
  return (
    <div className="space-y-4">
      <Field label="Facebook" value={v.facebook} onChange={(val) => set('facebook', val)} />
      <Field label="Instagram" value={v.instagram} onChange={(val) => set('instagram', val)} />
      <Field label="TikTok" value={v.tiktok} onChange={(val) => set('tiktok', val)} />
      <Field label="WhatsApp" value={v.whatsapp} onChange={(val) => set('whatsapp', val)} placeholder="https://wa.me/521234567890" />
    </div>
  );
}

function FooterSection({ value, onChange }: { value?: Footer; onChange: (v: Footer) => void }) {
  const v: Footer = value ?? { copyright_text: '', developer_credit: '', extra_message: '' };
  const set = (field: keyof Footer, val: string) => onChange({ ...v, [field]: val });
  return (
    <div className="space-y-4">
      <Field label="Texto de copyright" value={v.copyright_text} onChange={(val) => set('copyright_text', val)} />
      <Field label="Crédito del desarrollador" value={v.developer_credit} onChange={(val) => set('developer_credit', val)} />
      <Field label="Mensaje extra" value={v.extra_message} onChange={(val) => set('extra_message', val)} />
    </div>
  );
}

function HomeBannerSection({ value, onChange }: { value?: HomeBanner; onChange: (v: HomeBanner) => void }) {
  const v: HomeBanner = value ?? { title: '', slogan: '', button_text: '', background_image: '' };
  const set = (field: keyof HomeBanner, val: string) => onChange({ ...v, [field]: val });
  return (
    <div className="space-y-4">
      <Field label="Título" value={v.title} onChange={(val) => set('title', val)} />
      <Field label="Eslogan" value={v.slogan} onChange={(val) => set('slogan', val)} />
      <Field label="Texto del botón" value={v.button_text} onChange={(val) => set('button_text', val)} />
      <Field label="Imagen de fondo" value={v.background_image} onChange={(val) => set('background_image', val)} placeholder="/images/banner.jpg" />
    </div>
  );
}

function ScriptsSection({ value, onChange }: { value?: Scripts; onChange: (v: Scripts) => void }) {
  const v: Scripts = value ?? { google_analytics_id: '', facebook_pixel_id: '', custom_head_code: '' };
  const set = (field: keyof Scripts, val: string) => onChange({ ...v, [field]: val });
  return (
    <div className="space-y-4">
      <Field label="Google Analytics ID" value={v.google_analytics_id} onChange={(val) => set('google_analytics_id', val)} placeholder="G-XXXXXXXXXX" />
      <Field label="Facebook Pixel ID" value={v.facebook_pixel_id} onChange={(val) => set('facebook_pixel_id', val)} />
      <Field label="Código personalizado para <head>" value={v.custom_head_code} onChange={(val) => set('custom_head_code', val)} type="textarea" />
      <p className="text-xs text-gray-400">
        El código personalizado se inyecta tal cual en el &lt;head&gt; del sitio público. Úsalo solo con código de confianza.
      </p>
    </div>
  );
}

function ReservationSection({ value, onChange }: { value?: Reservation; onChange: (v: Reservation) => void }) {
  const v: Reservation = value ?? { form_title: '', description: '', success_message: '' };
  const set = (field: keyof Reservation, val: string) => onChange({ ...v, [field]: val });
  return (
    <div className="space-y-4">
      <Field label="Título del formulario" value={v.form_title} onChange={(val) => set('form_title', val)} />
      <Field label="Descripción" value={v.description} onChange={(val) => set('description', val)} type="textarea" />
      <Field label="Mensaje de éxito" value={v.success_message} onChange={(val) => set('success_message', val)} />
    </div>
  );
}

// ---------- Secciones con lista de elementos ----------

function ContactInfoSection({ value, onChange }: { value?: ContactInfoItem[]; onChange: (v: ContactInfoItem[]) => void }) {
  const items = value ?? [];
  const update = (index: number, field: keyof ContactInfoItem, val: string) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: val } : item)));
  };
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));
  const add = () => onChange([...items, { title: '', value: '' }]);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          <input value={item.title} onChange={(e) => update(i, 'title', e.target.value)} placeholder="Título (ej. Dirección)" className={`${inputClass} flex-1`} />
          <input value={item.value} onChange={(e) => update(i, 'value', e.target.value)} placeholder="Valor" className={`${inputClass} flex-1`} />
          <button onClick={() => remove(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" aria-label="Eliminar">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={add} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
        <Plus className="w-4 h-4" /> Agregar medio de contacto
      </button>
    </div>
  );
}

function ScheduleSection({ value, onChange }: { value?: ScheduleItem[]; onChange: (v: ScheduleItem[]) => void }) {
  const items = value ?? [];
  const update = (index: number, field: keyof ScheduleItem, val: string) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: val } : item)));
  };
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));
  const add = () => onChange([...items, { days: '', time: '' }]);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          <input value={item.days} onChange={(e) => update(i, 'days', e.target.value)} placeholder="Días (ej. Lunes a viernes)" className={`${inputClass} flex-1`} />
          <input value={item.time} onChange={(e) => update(i, 'time', e.target.value)} placeholder="Horario (ej. 9:00 - 18:00)" className={`${inputClass} flex-1`} />
          <button onClick={() => remove(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" aria-label="Eliminar">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={add} className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
        <Plus className="w-4 h-4" /> Agregar horario
      </button>
    </div>
  );
}
