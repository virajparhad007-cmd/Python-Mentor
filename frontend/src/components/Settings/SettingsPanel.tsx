import { useSettings } from '../../hooks/useSettings';
import { AVAILABLE_MODELS, FONT_SIZES } from '../../types';
import { Settings, Thermometer, Hash, Palette, Type } from 'lucide-react';

export function SettingsPanel() {
  const { settings, loading, updateSettings } = useSettings();

  if (loading) return <div className="settings-loading">Loading settings…</div>;

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <Settings size={24} />
        <h2>Settings</h2>
      </div>

      {/* Model */}
      <div className="setting-group">
        <label className="setting-label">
          <Hash size={16} />
          Model
        </label>
        <select
          className="setting-select"
          value={settings.model}
          onChange={e => updateSettings({ model: e.target.value })}
        >
          {AVAILABLE_MODELS.map(m => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Temperature */}
      <div className="setting-group">
        <label className="setting-label">
          <Thermometer size={16} />
          Temperature: <strong>{settings.temperature.toFixed(1)}</strong>
        </label>
        <input
          type="range"
          className="setting-range"
          min={0}
          max={2}
          step={0.1}
          value={settings.temperature}
          onChange={e => updateSettings({ temperature: parseFloat(e.target.value) })}
        />
        <div className="range-labels">
          <span>Precise (0.0)</span>
          <span>Creative (2.0)</span>
        </div>
      </div>

      {/* Max Tokens */}
      <div className="setting-group">
        <label className="setting-label">
          <Hash size={16} />
          Max Tokens: <strong>{settings.max_tokens}</strong>
        </label>
        <input
          type="range"
          className="setting-range"
          min={256}
          max={8192}
          step={256}
          value={settings.max_tokens}
          onChange={e => updateSettings({ max_tokens: parseInt(e.target.value) })}
        />
        <div className="range-labels">
          <span>256</span>
          <span>8192</span>
        </div>
      </div>

      {/* Font size */}
      <div className="setting-group">
        <label className="setting-label">
          <Type size={16} />
          Font Size
        </label>
        <div className="font-size-btns">
          {FONT_SIZES.map(f => (
            <button
              key={f.id}
              className={`font-size-btn ${settings.font_size === f.id ? 'font-size-btn--active' : ''}`}
              onClick={() => updateSettings({ font_size: f.id })}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="setting-group">
        <label className="setting-label">
          <Palette size={16} />
          Theme
        </label>
        <div className="font-size-btns">
          {['dark', 'light'].map(t => (
            <button
              key={t}
              className={`font-size-btn ${settings.theme === t ? 'font-size-btn--active' : ''}`}
              onClick={() => updateSettings({ theme: t })}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
