import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  BotMessageSquare,
  User,
  Shield,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Info,
  Building,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { ChatMessage, UserProfileType } from '../types/adminbelgique';

interface AiAssistantViewProps {
  userProfile: UserProfileType;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ userProfile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      content: `Bonjour ! Je suis l'Assistant IA Administratif d'**AdminBelgique.com**.

Je suis spécialisé dans les démarches administratives, fiscales et juridiques belges :
- **SPF Finances :** Avertissement-extrait de rôle, déclaration IPP/ISOC, TVA, communications structurées.
- **BCE & Entreprises :** Inscription, guichet d'entreprise, modification d'activités NACE-BEL, statuts de SRL.
- **ONSS & Inasti :** Cotisations d'indépendants, dispenses, lois sociales.
- **Immobilier & Baux :** Indexation officielle selon l'indice santé Statbel, baux régionaux (Bruxelles/Wallonie/Flandre), réglementation PEB.

Posez votre question ou utilisez une démarche type ci-dessous. Vos données privées (NISS, IBAN, BCE) sont automatiquement protégées grâce à notre filtre d'anonymisation breveté.`,
      timestamp: new Date().toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' }),
      engine: 'AdminBelgique IA Belge (Gemini 3.8 Flash)',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [enableAnonymizer, setEnableAnonymizer] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Comment calculer légalement l\'indexation d\'un bail d\'habitation à Bruxelles ?',
    'Quelles sont les démarches pour s\'inscrire comme indépendant en personne physique ?',
    'Comment contester un avis d\'imposition ou avertissement-extrait de rôle du SPF Finances ?',
    'Quelles sont les règles de facturation et mentions TVA obligatoires en Belgique ?',
    'Quel est le montant minimum des cotisations sociales Inasti pour un début d\'activité ?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.sender, content: m.content })),
          userProfile,
          applyAnonymization: enableAnonymizer,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          content: data.reply || 'Désolé, aucune réponse n\'a pu être obtenue.',
          timestamp: new Date().toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' }),
          engine: data.engine || 'Gemini 3.8 Flash',
          anonymizationNotice: data.anonymization?.redactedItemsCount
            ? `${data.anonymization.redactedItemsCount} information(s) sensible(s) (NISS/BCE/IBAN) masquée(s) avant traitement`
            : undefined,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }
      throw new Error('Backend chat unavailable');
    } catch {
      // Fallback to client-side AI knowledge base
      const { clientGenerateBelgianAiResponse } = await import('../utils/belgianAlgorithms');
      const fallbackReply = clientGenerateBelgianAiResponse(messageText, userProfile);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' }),
        engine: 'AdminBelgique Assistant (Mode Autonome)',
        anonymizationNotice: enableAnonymizer ? "Filtre d'anonymisation APD activé" : undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-msg',
        sender: 'assistant',
        content: 'Historique de discussion réinitialisé. Comment puis-je vous assister dans vos démarches administratives belges aujourd\'hui ?',
        timestamp: new Date().toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' }),
        engine: 'AdminBelgique Assistant',
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
      {/* Assistant Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
            <BotMessageSquare className="w-5 h-5" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white">Assistant IA Administratif Belge</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20">
                Législation & Fiscalité BE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Modèle optimisé droit belge • SPF Finances, BCE, ONSS, Décrets régionaux
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Anonymization Toggle */}
          <button
            onClick={() => setEnableAnonymizer(!enableAnonymizer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              enableAnonymizer
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Active le masquage automatique des NISS, BCE, IBAN et adresses belges avant analyse"
          >
            {enableAnonymizer ? <ShieldCheck className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {enableAnonymizer ? 'Anonymisation Active (RGPD)' : 'Anonymisation Désactivée'}
            </span>
          </button>

          {/* Clear history */}
          <button
            onClick={handleClearChat}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Effacer la conversation"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white border border-blue-400/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <BotMessageSquare className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] sm:max-w-2xl space-y-1.5`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/10'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700/80 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Micro meta details */}
                <div
                  className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                    isUser ? 'justify-end' : 'justify-between'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <div className="flex items-center gap-2">
                      {msg.engine && (
                        <span className="text-slate-400">{msg.engine}</span>
                      )}
                      {msg.anonymizationNotice && (
                        <span className="text-emerald-400 flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" /> {msg.anonymizationNotice}
                        </span>
                      )}
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="text-slate-400 hover:text-slate-200 p-0.5 transition-colors cursor-pointer"
                        title="Copier le texte"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <BotMessageSquare className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]"></div>
              <span className="text-slate-400 text-xs pl-2">
                Consultation de la doctrine et des textes légaux belges...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested quick inquiries */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto flex items-center space-x-2 scrollbar-none">
        <span className="text-[10px] text-slate-400 font-semibold uppercase shrink-0">
          Suggestions Belges :
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors shrink-0 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question administrative ou juridique belge (SPF Finances, bail, TVA, BCE, ONSS)..."
              disabled={loading}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl flex items-center space-x-1.5 shadow-md shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Envoyer</span>
          </button>
        </form>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400" />
            Assistance IA privée indépendante • Ne constitue pas une consultation d'avocat.
          </span>
          <span className="text-emerald-400">RGPD Conforme</span>
        </div>
      </div>
    </div>
  );
};
