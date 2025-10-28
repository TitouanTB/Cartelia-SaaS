import { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../providers/AuthProvider';
import { Button } from '../ui/Button';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type CopilotPanelProps = {
  open: boolean;
  onClose: () => void;
};

export default function CopilotPanel({ open, onClose }: CopilotPanelProps) {
  const { selectedRestaurantId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Bonjour ! Je suis le Copilot Cartelia. Comment puis-je vous aider aujourd\'hui ?',
    },
  ]);
  const [input, setInput] = useState('');

  const copilotMutation = useMutation({
    mutationFn: (command: string) =>
      api.post<{ text?: string; action?: string }>('/copilot', {
        command,
        restaurantId: selectedRestaurantId,
      }),
    onSuccess: (data) => {
      const response = data.text ?? `Action: ${data.action ?? 'Aucune action détectée'}`;
      setMessages((prev) => [
        ...prev,
        { id: String(Date.now() + 1), role: 'assistant', content: response },
      ]);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { id: String(Date.now()), role: 'user', content: input }]);
    copilotMutation.mutate(input);
    setInput('');
  };

  if (!open) return null;

  return (
    <div
      className="slide-in-right card"
      style={{
        position: 'fixed',
        right: '1.5rem',
        bottom: '1.5rem',
        top: '6rem',
        width: '420px',
        maxWidth: 'calc(100vw - 3rem)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1500,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '1.25rem',
          borderBottom: '1px solid var(--color-border)',
          background: 'rgba(147, 23, 253, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Copilot Cartelia</h3>
        </div>
        <button onClick={onClose} style={{ opacity: 0.7 }}>
          <X size={18} />
        </button>
      </div>

      <div
        className="scrollbar-thin"
        style={{
          flex: 1,
          padding: '1.25rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
            }}
          >
            <div
              className="card"
              style={{
                padding: '0.85rem 1.1rem',
                background:
                  msg.role === 'user'
                    ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)'
                    : 'var(--color-bg-tertiary)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)',
                fontSize: '0.9rem',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {copilotMutation.isPending && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
            <div className="card skeleton" style={{ height: '48px', width: '100px' }} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-bg-secondary)',
          display: 'flex',
          gap: '0.75rem',
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez une question ou demandez une action..."
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            fontSize: '0.9rem',
          }}
        />
        <Button type="submit" disabled={!input.trim() || copilotMutation.isPending}>
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
}
