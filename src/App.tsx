import React, { useState, useEffect } from 'react';
import { Copy, Moon, Sun, Sparkles, Image, MessageCircle, Briefcase, Check, RotateCcw, History, X, Clock } from 'lucide-react';

const PromptMaster = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState('imagen');
  const [formData, setFormData] = useState({
    imagen: {},
    conversacional: {},
    proyecto: {}
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [promptHistory, setPromptHistory] = useState([]);

  const categories = {
    imagen: {
      title: 'Imagen/Video',
      icon: Image,
      fields: [
        { key: 'descripcion', label: 'Descripción de la escena', placeholder: 'Una ciudad futurista al amanecer con rascacielos de cristal...' },
        { key: 'estilo', label: 'Estilo visual', placeholder: 'Cinemático, realista, anime, arte conceptual, fotografía...' },
        { key: 'elementos', label: 'Elementos clave a incluir', placeholder: 'Personajes, objetos, efectos especiales...' },
        { key: 'movimiento', label: 'Movimiento o animación deseada', placeholder: 'Cámara lenta, zoom dinámico, rotación suave...' },
        { key: 'luz', label: 'Luz y ambiente', placeholder: 'Luz dorada, ambiente místico, sombras dramáticas...' },
        { key: 'formato', label: 'Formato (resolución, proporción)', placeholder: '4K, 16:9, vertical, cuadrado...' },
        { key: 'consideraciones', label: 'Ten en cuenta que...', placeholder: 'Restricciones especiales, estilo particular, detalles importantes...' }
      ]
    },
    conversacional: {
      title: 'Consulta Conversacional',
      icon: MessageCircle,
      fields: [
        { key: 'rol', label: 'Actúa como...', placeholder: 'Experto en SEO, psicólogo, historiador, coach...' },
        { key: 'tema', label: 'Tema de la pregunta', placeholder: 'Estrategias de marketing digital, manejo del estrés...' },
        { key: 'tono', label: 'Tono deseado', placeholder: 'Formal, amigable, técnico, motivacional...' },
        { key: 'extension', label: 'Extensión de respuesta', placeholder: 'Corta y concisa, media, análisis profundo...' },
        { key: 'formato', label: 'Formato esperado', placeholder: 'Lista, resumen, explicación paso a paso...' },
        { key: 'consideraciones', label: 'Ten en cuenta que...', placeholder: 'Contexto específico, limitaciones, enfoque particular...' }
      ]
    },
    proyecto: {
      title: 'Proyecto Específico',
      icon: Briefcase,
      fields: [
        { key: 'tipo', label: 'Tipo de entrega', placeholder: 'Informe, análisis, guion, descripción de producto...' },
        { key: 'publico', label: 'Público objetivo', placeholder: 'Ejecutivos, estudiantes, clientes potenciales...' },
        { key: 'profundidad', label: 'Nivel de profundidad', placeholder: 'Básico, intermedio, avanzado, experto...' },
        { key: 'contexto', label: 'Contexto/objetivo del proyecto', placeholder: 'Lanzamiento de producto, investigación académica...' },
        { key: 'formato', label: 'Formato esperado', placeholder: 'Markdown, texto plano, presentación, JSON...' },
        { key: 'consideraciones', label: 'Ten en cuenta que...', placeholder: 'Requerimientos especiales, limitaciones, criterios específicos...' }
      ]
    }
  };

  // Load saved data on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('promptmaster-theme');
    const savedFormData = localStorage.getItem('promptmaster-formdata');
    const savedHistory = localStorage.getItem('promptmaster-history');
    
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
    if (savedFormData) {
      try {
        setFormData(JSON.parse(savedFormData));
      } catch (e) {
        console.error('Error loading form data:', e);
      }
    }
    if (savedHistory) {
      try {
        setPromptHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, []);

  // Save theme changes
  useEffect(() => {
    localStorage.setItem('promptmaster-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Save form data changes
  useEffect(() => {
    localStorage.setItem('promptmaster-formdata', JSON.stringify(formData));
  }, [formData]);

  // Save history changes
  useEffect(() => {
    localStorage.setItem('promptmaster-history', JSON.stringify(promptHistory));
  }, [promptHistory]);

  const generatePrompt = async () => {
    setIsGenerating(true);
    const currentFields = categories[activeCategory].fields;
    const currentFormData = formData[activeCategory];
    const filledData = currentFields
      .filter(field => currentFormData[field.key]?.trim())
      .map(field => ({
        label: field.label,
        value: currentFormData[field.key]
      }));

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Eres un experto en ingeniería de prompts. Tu tarea es crear un prompt profesional y optimizado basado en la siguiente información de categoría "${categories[activeCategory].title}":

${filledData.map(item => `${item.label}: ${item.value}`).join('\n')}

Genera un prompt completo, profesional y bien estructurado que incorpore toda esta información de manera coherente. El prompt debe ser claro, específico y optimizado para obtener los mejores resultados de IA.

IMPORTANTE: 
- Responde únicamente con el prompt generado, sin explicaciones adicionales
- El prompt debe estar completamente en español, a menos que se solicite específicamente otro idioma
- Usa un lenguaje claro y profesional en español`
          }]
        })
      });

      const data = await response.json();
      const prompt = data.content[0].text;
      setGeneratedPrompt(prompt);
      
      // Add to history
      const historyEntry = {
        id: Date.now(),
        category: activeCategory,
        categoryTitle: categories[activeCategory].title,
        prompt: prompt,
        timestamp: new Date().toLocaleString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      
      setPromptHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10
      
    } catch (error) {
      console.error('Error generating prompt:', error);
      setGeneratedPrompt('Error al generar el prompt. Por favor, inténtalo de nuevo.');
    }
    
    setIsGenerating(false);
  };

  const copyToClipboard = async (text = generatedPrompt) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [activeCategory]: {
        ...prev[activeCategory],
        [key]: value
      }
    }));
  };

  const resetCurrentCategory = () => {
    setFormData(prev => ({
      ...prev,
      [activeCategory]: {}
    }));
  };

  const restoreFromHistory = (prompt) => {
    setGeneratedPrompt(prompt);
    setShowHistory(false);
  };

  const isFormValid = () => {
    const currentFormData = formData[activeCategory];
    const currentFields = categories[activeCategory].fields;
    return currentFields.some(field => currentFormData?.[field.key]?.trim());
  };

  const HistoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden ${
        darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-xl'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Historial de Prompts
          </h3>
          <button
            onClick={() => setShowHistory(false)}
            className={`p-2 rounded-lg transition-colors ${
              darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[60vh] space-y-4">
          {promptHistory.length === 0 ? (
            <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No hay prompts en el historial aún
            </p>
          ) : (
            promptHistory.map((entry) => (
              <div key={entry.id} className={`p-4 rounded-xl border ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium px-2 py-1 rounded-lg ${
                      darkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {entry.categoryTitle}
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <Clock size={12} />
                      {entry.timestamp}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(entry.prompt)}
                      className={`p-1 rounded transition-colors ${
                        darkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
                      }`}
                      title="Copiar"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() => restoreFromHistory(entry.prompt)}
                      className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      title="Restaurar"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>
                <p className={`text-sm leading-relaxed ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {entry.prompt.length > 200 ? entry.prompt.substring(0, 200) + '...' : entry.prompt}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                PromptMaster
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Generador profesional de prompts para IA
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetCurrentCategory}
              className={`p-3 rounded-xl transition-colors ${
                darkMode 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
              }`}
              title="Reset categoría actual"
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-xl transition-colors ${
                darkMode 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
              }`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>

        {/* Category Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {Object.entries(categories).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeCategory === key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : darkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-white text-gray-600 hover:bg-gray-100 shadow-md'
                  }`}
                >
                  <Icon size={18} />
                  {category.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Fields */}
        <div className={`rounded-2xl p-6 mb-8 ${
          darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-md'
        }`}>
          <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {categories[activeCategory].title}
          </h2>
          
          <div className="space-y-6">
            {categories[activeCategory].fields.map((field) => (
              <div key={field.key}>
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {field.label}
                </label>
                <textarea
                  value={formData[activeCategory]?.[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={field.key === 'consideraciones' ? 2 : 3}
                  className={`w-full p-3 rounded-xl border transition-colors resize-none ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-8">
          <button
            onClick={generatePrompt}
            disabled={!isFormValid() || isGenerating}
            className={`px-8 py-4 rounded-xl font-semibold text-white transition-all ${
              !isFormValid() || isGenerating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:shadow-lg hover:scale-105 active:scale-95'
            }`}
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Sparkles size={20} />
                Redactar Prompt
              </div>
            )}
          </button>
        </div>

        {/* Generated Prompt */}
        {generatedPrompt && (
          <div className={`rounded-2xl p-6 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-md'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Prompt Generado
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowHistory(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <History size={16} />
                  Historial
                </button>
                <button
                  onClick={() => copyToClipboard()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>
            <textarea
              value={generatedPrompt}
              onChange={(e) => setGeneratedPrompt(e.target.value)}
              className={`w-full p-4 rounded-xl border transition-colors resize-none ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-purple-500/20`}
              rows={8}
            />
          </div>
        )}

        {/* History Modal */}
        {showHistory && <HistoryModal />}
      </div>
    </div>
  );
};

export default PromptMaster;