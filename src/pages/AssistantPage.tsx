import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  AlertTriangle,
  History,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { ChatWatermark } from '../components/brand/ChatWatermark';
import { FinTrackMark } from '../components/brand/FinTrackLogo';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useFinance } from '../context/FinanceContext';
import { useToast } from '../context/ToastContext';
import { aiService } from '../services/aiService';
import { ApiError, type ChatMessage } from '../types';
import { AI_SUGGESTION_PROMPTS } from '../utils/demoData';
import { formatTimeBR } from '../utils/format';

/**
 * Renderizador seguro (sem dangerouslySetInnerHTML) para listas e **negrito**
 * retornados pelo microserviço FinTrack IA, prevenindo XSS.
 */
function renderInlineBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    return <span key={idx}>{part}</span>;
  });
}

function SafeMarkdown({ content }: { content: string }) {
  const lines = content.split('\n').filter((line) => line.trim().length > 0);
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];

  function flushList(key: string) {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={key}>
        {listItems.map((item, idx) => (
          <li key={idx}>{renderInlineBold(item)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(trimmed.slice(2));
    } else {
      flushList(`list-${idx}`);
      blocks.push(<p key={`p-${idx}`}>{renderInlineBold(trimmed)}</p>);
    }
  });
  flushList('list-end');

  return <div className="chat-markdown">{blocks}</div>;
}

export function AssistantPage() {
  const { accounts, transactions } = useFinance();
  const { showToast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [health, setHealth] = useState<{
    checked: boolean;
    reachable: boolean;
    modelConfigured: boolean;
    model?: string;
  }>({
    checked: false,
    reachable: true,
    modelConfigured: true,
  });

  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const checkHealth = useCallback(async () => {
    const result = await aiService.health();
    setHealth({ checked: true, ...result });
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  async function submitMessage(rawText: string) {
    const text = rawText.trim();
    if (!text || isSending) return;

    setServiceError(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: formatTimeBR(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setDraft('');
    setIsSending(true);

    try {
      const response = await aiService.sendMessage(text, { accounts, transactions });
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: formatTimeBR(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      setDraft(text);

      if (err instanceof ApiError && err.status === 503) {
        setServiceError(
          'O assistente de IA está temporariamente indisponível (HTTP 503 — AI_API_KEY não configurada no servidor). Seu texto foi preservado abaixo.',
        );
      } else {
        setServiceError(
          err instanceof Error
            ? err.message
            : 'Não foi possível comunicar com o microserviço de IA.',
        );
      }
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    submitMessage(draft);
  }

  async function handleClearHistory() {
    setIsClearing(true);
    try {
      await aiService.clearHistory();
      setMessages([]);
      setServiceError(null);
      setClearOpen(false);
      showToast('Histórico da FinTrack IA limpo com sucesso.', 'success');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Erro ao limpar o histórico da IA.',
        'error',
      );
    } finally {
      setIsClearing(false);
    }
  }

  const isUnavailable = health.checked && (!health.reachable || !health.modelConfigured);

  return (
    <section className="chat-shell" aria-label="Chat com FinTrack IA">
      {/* Chat Header matching image_4.png */}
      <header className="chat-header">
        <div className="chat-header-id">
          <div className="chat-avatar-lg" aria-hidden="true">
            <FinTrackMark size={26} variant="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.06rem', fontWeight: 700, color: 'var(--color-purple-deep)' }}>
              FinTrack IA
            </h2>
            <div className="chat-status">
              <span
                className={`status-dot ${
                  !health.checked
                    ? 'status-dot-warning'
                    : isUnavailable
                      ? 'status-dot-offline'
                      : 'status-dot-online'
                }`}
              />
              <span>
                {!health.checked
                  ? 'Conectando...'
                  : !health.reachable
                    ? 'Serviço offline (:8082)'
                    : !health.modelConfigured
                      ? 'Modelo não configurado'
                      : 'Online'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <button
            type="button"
            className="icon-btn"
            onClick={checkHealth}
            title="Verificar status do microserviço de IA"
            aria-label="Atualizar status da IA"
          >
            <RefreshCw size={18} />
          </button>

          <button
            type="button"
            id="btn-clear-chat"
            className="icon-btn"
            onClick={() => setClearOpen(true)}
            disabled={messages.length === 0}
            title="Limpar histórico de conversa"
            aria-label="Limpar histórico de conversa"
          >
            <History size={19} />
          </button>

          {messages.length > 0 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm hide-sm"
              onClick={() => setClearOpen(true)}
              style={{ color: 'var(--color-expense)' }}
            >
              <Trash2 size={15} />
              Limpar histórico
            </button>
          )}
        </div>
      </header>

      {/* Chat Messages Area */}
      <div className="chat-body">
        <ChatWatermark />

        <div className="chat-messages-layer">
          {isUnavailable && (
            <div className="alert alert-warning" role="status">
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                {!health.reachable ? (
                  <>
                    Não foi possível alcançar o microserviço <strong>ai-service</strong> (
                    <code>GET /api/ai/health</code>). Verifique se ele está rodando na porta{' '}
                    <code>8082</code>.
                  </>
                ) : (
                  <>
                    O serviço está ativo, porém <code>modelConfigured</code> retornou{' '}
                    <strong>false</strong>. Configure <code>AI_API_KEY</code> no servidor para
                    habilitar respostas da IA.
                  </>
                )}
              </div>
            </div>
          )}

          {serviceError && (
            <div className="alert alert-error" role="alert">
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{serviceError}</span>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="chat-empty">
              <div
                className="chat-avatar-lg"
                style={{ width: 60, height: 60, margin: '0 auto' }}
                aria-hidden="true"
              >
                <FinTrackMark size={34} variant="white" />
              </div>
              <h3 className="chat-empty-title">Como posso ajudar no seu caminho financeiro?</h3>
              <p className="chat-empty-sub">
                Converse sobre orçamento, metas de economia e organização financeira. O histórico é
                mantido por usuário autenticado.
              </p>

              <div className="chat-chips">
                {AI_SUGGESTION_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="chat-chip"
                    onClick={() => submitMessage(prompt)}
                    disabled={isSending}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-row ${msg.role === 'user' ? 'chat-row-user' : 'chat-row-ai'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="chat-avatar-sm" aria-hidden="true">
                    <FinTrackMark size={17} variant="white" />
                  </div>
                )}

                <div
                  className={`chat-bubble ${
                    msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <SafeMarkdown content={msg.content} />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <span className="chat-time">{msg.timestamp}</span>
                </div>
              </div>
            ))
          )}

          {isSending && (
            <div className="chat-row chat-row-ai" aria-live="polite" aria-label="Assistente digitando">
              <div className="chat-avatar-sm" aria-hidden="true">
                <FinTrackMark size={17} variant="white" />
              </div>
              <div className="typing-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {/* Pill-shaped Composer Bar matching image_4.png */}
      <div className="chat-composer-wrap">
        <form className="chat-composer" onSubmit={handleFormSubmit}>
          <button
            type="button"
            className="icon-btn"
            style={{ width: 34, height: 34, color: 'var(--color-purple-tech)' }}
            title="Inserir sugestão de pergunta"
            aria-label="Inserir pergunta sugerida"
            onClick={() => {
              const suggestion =
                AI_SUGGESTION_PROMPTS[messages.length % AI_SUGGESTION_PROMPTS.length];
              setDraft(suggestion);
              inputRef.current?.focus();
            }}
          >
            <Sparkles size={18} />
          </button>

          <input
            ref={inputRef}
            id="chat-message-input"
            type="text"
            className="chat-input"
            placeholder="Digite sua mensagem..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={isSending}
            aria-label="Mensagem para a FinTrack IA"
          />

          <button
            type="submit"
            id="btn-chat-send"
            className="chat-send-btn"
            disabled={!draft.trim() || isSending}
            aria-label="Enviar mensagem"
          >
            <Send size={17} />
          </button>
        </form>
      </div>

      <ConfirmModal
        open={clearOpen}
        title="Limpar histórico do chat"
        description="Isso limpará a memória da sua conversa atual com a FinTrack IA (DELETE /api/ai/chat) e iniciará um novo atendimento."
        confirmLabel="Limpar histórico"
        isLoading={isClearing}
        onCancel={() => setClearOpen(false)}
        onConfirm={handleClearHistory}
      />
    </section>
  );
}
